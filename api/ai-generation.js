// Unified AI Generation Endpoint
// Handles: content, outline, cover, audiobook
import OpenAI from 'openai';
import admin from 'firebase-admin';
import { setCorsHeaders, handleCorsPreFlight } from './_cors.js';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

// Rate limiting for AI content generation
async function checkRateLimit(userId) {
  const now = Date.now();
  const userKey = userId || 'anonymous';
  const today = new Date().toISOString().split('T')[0];
  
  try {
    const rateLimitRef = db.collection('rateLimits').doc(userKey);
    const rateLimitDoc = await rateLimitRef.get();
    
    let userData = rateLimitDoc.exists ? rateLimitDoc.data() : null;
    
    if (!userData || userData.date !== today) {
      userData = {
        count: 0,
        date: today,
        resetAt: new Date(today).getTime() + 86400000
      };
    }
    
    const limits = {
      free: parseInt(process.env.AI_RATE_LIMIT_FREE_TIER) || 100,
      creator: parseInt(process.env.AI_RATE_LIMIT_CREATOR_TIER) || 150,
      premium: parseInt(process.env.AI_RATE_LIMIT_PREMIUM_TIER) || 500,
    };
    
    let userLimit = limits.free;
    if (userId && userId !== 'anonymous') {
      try {
        const userDoc = await db.collection('users').doc(userId).get();
        if (userDoc.exists) {
          const userDocData = userDoc.data();
          if (userDocData.isPremium || userDocData.subscriptionStatus === 'premium') {
            userLimit = limits.premium;
          } else if (userDocData.subscriptionStatus === 'creator') {
            userLimit = limits.creator;
          }
        }
      } catch (error) {
        console.error('Error checking user tier:', error);
      }
    }
    
    if (userData.count >= userLimit) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: userData.resetAt,
        limit: userLimit
      };
    }
    
    userData.count++;
    await rateLimitRef.set(userData);
    
    return {
      allowed: true,
      remaining: userLimit - userData.count,
      resetAt: userData.resetAt,
      limit: userLimit
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    return {
      allowed: true,
      remaining: 3,
      resetAt: now + 86400000,
      limit: 3
    };
  }
}

// Check audiobook chapter limits
async function checkAudiobookLimit(userId, chapterCount) {
  if (!userId) {
    return { allowed: false, error: 'Authentication required' };
  }

  try {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return { allowed: false, error: 'User not found' };
    }

    const userData = userDoc.data();
    const subscriptionStatus = userData.subscriptionStatus || 'free';
    
    if (subscriptionStatus === 'free') {
      return { 
        allowed: false, 
        error: 'Audiobooks are available on Creator and Premium plans.' 
      };
    }

    const chapterLimits = {
      creator: 25,
      premium: 50,
    };

    const limit = chapterLimits[subscriptionStatus];
    if (!limit) {
      return { allowed: false, error: 'Invalid subscription status' };
    }

    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const lastReset = userData.lastAudiobookCharactersReset;
    const needsReset = !lastReset || !lastReset.startsWith(currentMonth);

    let chaptersUsed = needsReset ? 0 : (userData.audiobookCharactersUsed || 0);
    const chaptersRemaining = limit - chaptersUsed;

    if (chapterCount > chaptersRemaining) {
      return {
        allowed: false,
        error: `Not enough chapter allowance. You need ${chapterCount} chapters but only have ${chaptersRemaining} remaining this month.`
      };
    }

    await userRef.update({
      audiobookCharactersUsed: needsReset ? chapterCount : chaptersUsed + chapterCount,
      lastAudiobookCharactersReset: currentMonth,
    });

    return { allowed: true, charactersUsed: charactersUsed + characterCount, limit };
  } catch (error) {
    console.error('Error checking audiobook limit:', error);
    return { allowed: false, error: 'Failed to check usage limits' };
  }
}

// Format content with paragraph breaks
function formatWithParagraphBreaks(text) {
  if (text.includes('\n\n')) {
    return text;
  }

  const sentences = text.split(/(?<=[.!?])\s+(?=[A-Z])/);
  
  let formattedText = '';
  let currentParagraph = '';
  let sentenceCount = 0;
  
  for (const sentence of sentences) {
    currentParagraph += sentence + ' ';
    sentenceCount++;
    
    if ((sentenceCount >= 3 && currentParagraph.length > 200) || currentParagraph.length > 300) {
      formattedText += currentParagraph.trim() + '\n\n';
      currentParagraph = '';
      sentenceCount = 0;
    }
  }
  
  if (currentParagraph.trim()) {
    formattedText += currentParagraph.trim();
  }
  
  return formattedText.trim();
}

export default async function handler(req, res) {
  setCorsHeaders(req, res);
  if (handleCorsPreFlight(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type } = req.query; // content, outline, cover, audiobook

  try {
    // Route to appropriate handler
    switch (type) {
      case 'content':
        return await handleContentGeneration(req, res);
      case 'outline':
        return await handleOutlineGeneration(req, res);
      case 'cover':
        return await handleCoverGeneration(req, res);
      case 'audiobook':
        return await handleAudiobookGeneration(req, res);
      default:
        return res.status(400).json({ error: 'Invalid type. Must be: content, outline, cover, or audiobook' });
    }
  } catch (error) {
    console.error('AI Generation error:', error);
    return res.status(500).json({ error: 'AI generation failed' });
  }
}

// Handler for AI content generation
async function handleContentGeneration(req, res) {
  const { 
    keywords, 
    chapterTitle, 
    contentType = 'suggestions', 
    userId,
    genre = 'general',
    tone = 'friendly',
    length = 'standard',
    format = 'narrative',
    context = {}
  } = req.body;

  const rateLimit = await checkRateLimit(userId);
  
  if (!rateLimit.allowed) {
    const resetDate = new Date(rateLimit.resetAt).toLocaleTimeString();
    return res.status(429).json({ 
      error: `AI generation limit reached. Resets at ${resetDate}.`,
      limit: rateLimit.limit,
      remaining: 0,
      resetAt: rateLimit.resetAt
    });
  }

  res.setHeader('X-RateLimit-Limit', rateLimit.limit);
  res.setHeader('X-RateLimit-Remaining', rateLimit.remaining);

  // Validate inputs
  if (!keywords && !chapterTitle) {
    return res.status(400).json({ 
      error: 'Missing required field: keywords or chapterTitle' 
    });
  }

  // Length mapping
  const lengthTokens = {
    'short': { min: 100, max: 200 },
    'standard': { min: 150, max: 300 },
    'long': { min: 200, max: 400 }
  };

  const targetLength = lengthTokens[length] || lengthTokens.standard;

  try {
    const prompt = contentType === 'chapter' 
      ? `Write a compelling ${length} ebook chapter about "${chapterTitle || keywords}".

Style: ${tone} tone, ${format} format, ${genre} genre
Length: ${targetLength.min}-${targetLength.max} words

Requirements:
- Well-structured with ${format === 'narrative' ? 'engaging storytelling' : 'clear sections'}
- Natural paragraph breaks (use double line breaks between paragraphs)
- ${tone === 'professional' ? 'Formal and authoritative' : tone === 'casual' ? 'Conversational and relatable' : 'Balanced and accessible'} tone
- Appropriate for ${context.targetAudience || 'general'} audience
- Keep reader engaged throughout

Write the content now:`
      : `Generate ${length} content suggestions for: "${keywords || chapterTitle}".

Context: ${genre} genre, ${tone} tone, for ${context.targetAudience || 'general audience'}

Provide 3-5 practical, actionable ideas with brief descriptions.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert content writer. Create engaging, well-structured content with natural paragraph breaks. Use double line breaks (\\n\\n) between paragraphs for proper formatting.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: targetLength.max * 1.5,
      temperature: 0.7,
    });

    let content = completion.choices[0]?.message?.content || '';
    
    // Ensure proper paragraph formatting
    content = formatWithParagraphBreaks(content);

    return res.status(200).json({
      content,
      usage: completion.usage,
      rateLimitRemaining: rateLimit.remaining
    });

  } catch (error) {
    console.error('Content generation error:', error);
    
    if (error.response?.status === 429) {
      return res.status(429).json({ 
        error: 'OpenAI rate limit. Please try again in a moment.' 
      });
    }

    return res.status(500).json({ 
      error: 'Failed to generate content. Please try again.' 
    });
  }
}

// Handler for book outline generation
async function handleOutlineGeneration(req, res) {
  const { title, description, genre, targetAudience, numChapters } = req.body;

  if (!title || typeof title !== 'string') {
    return res.status(400).json({ error: 'Title is required' });
  }

  if (!description || typeof description !== 'string') {
    return res.status(400).json({ error: 'Description is required' });
  }

  if (!numChapters || numChapters < 6 || numChapters > 15) {
    return res.status(400).json({ error: 'Number of chapters must be between 6 and 15' });
  }

  try {
    const prompt = `You are an expert book outline creator. Create a detailed ${numChapters}-chapter outline for an ebook.

Book Details:
- Title: ${title}
- Description: ${description}
${genre ? `- Genre: ${genre}` : ''}
${targetAudience ? `- Target Audience: ${targetAudience}` : ''}

Generate exactly ${numChapters} chapter titles with brief descriptions. Return as JSON array:
[{"title": "Chapter Title", "description": "Brief description", "order": 1}, ...]`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert book outline creator. Always return valid JSON arrays.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const responseText = completion.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(responseText);
    const outline = parsed.chapters || parsed.outline || [];

    if (!Array.isArray(outline) || outline.length === 0) {
      throw new Error('Invalid outline format');
    }

    return res.status(200).json({ outline });

  } catch (error) {
    console.error('Outline generation error:', error);
    return res.status(500).json({ error: 'Failed to generate outline' });
  }
}

// Handler for cover generation
async function handleCoverGeneration(req, res) {
  const { prompt, userId } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const rateLimit = await checkRateLimit(userId);
  if (!rateLimit.allowed) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }

  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Book cover design: ${prompt}. Professional, eye-catching, high-quality.`,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    const imageUrl = response.data[0]?.url;
    if (!imageUrl) {
      throw new Error('No image generated');
    }

    return res.status(200).json({ imageUrl });

  } catch (error) {
    console.error('Cover generation error:', error);
    return res.status(500).json({ error: 'Failed to generate cover' });
  }
}

// Handler for audiobook generation
async function handleAudiobookGeneration(req, res) {
  const { text, voice, quality, chapterId, chapterTitle, userId, chapterCount } = req.body;

  if (!text || !voice) {
    return res.status(400).json({ 
      error: 'Missing required fields: text and voice are required' 
    });
  }

  const validVoices = ['alloy', 'ash', 'coral', 'echo', 'fable', 'nova', 'onyx', 'sage', 'shimmer'];
  if (!validVoices.includes(voice)) {
    return res.status(400).json({ 
      error: `Invalid voice. Must be one of: ${validVoices.join(', ')}` 
    });
  }

  const selectedQuality = quality || 'standard';
  if (!['standard', 'hd'].includes(selectedQuality)) {
    return res.status(400).json({ 
      error: 'Invalid quality. Must be "standard" or "hd"' 
    });
  }

  // Use chapterCount for limit checking (only check on first chapter)
  if (chapterCount) {
    const limitCheck = await checkAudiobookLimit(userId, chapterCount);
    if (!limitCheck.allowed) {
      return res.status(403).json({ error: limitCheck.error });
    }
  }

  try {
    const model = selectedQuality === 'hd' ? 'tts-1-hd' : 'tts-1';
    
    const mp3 = await openai.audio.speech.create({
      model: model,
      voice: voice,
      input: text,
      response_format: 'mp3',
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', `attachment; filename="${chapterTitle || chapterId || 'chapter'}.mp3"`);
    res.setHeader('Content-Length', buffer.length);

    return res.status(200).send(buffer);

  } catch (error) {
    console.error('Audiobook generation error:', error);

    if (error.response?.status === 429) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded. Please try again in a moment.' 
      });
    }

    return res.status(500).json({ 
      error: 'Failed to generate audiobook. Please try again.' 
    });
  }
}
