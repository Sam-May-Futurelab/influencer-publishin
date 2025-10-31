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

  const { type } = req.query; // content, outline, cover

  try {
    // Route to appropriate handler
    switch (type) {
      case 'content':
        return await handleContentGeneration(req, res);
      case 'outline':
        return await handleOutlineGeneration(req, res);
      case 'cover':
        return await handleCoverGeneration(req, res);
      default:
        return res.status(400).json({ error: 'Invalid type. Must be: content, outline, or cover. For audiobooks, use /api/audiobook-queue' });
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

  // Length mapping - aligned with frontend values
  const lengthTokens = {
    'brief': { min: 150, max: 250, tokens: 500 },
    'standard': { min: 300, max: 500, tokens: 1000 },
    'detailed': { min: 500, max: 800, tokens: 1500 }
  };

  const targetLength = lengthTokens[length] || lengthTokens.standard;

  try {
    const prompt = contentType === 'chapter' 
      ? `Write a complete, well-structured ebook chapter.

TOPIC: ${keywords.join(', ')}
CHAPTER TITLE: ${chapterTitle}
GENRE: ${genre}
TONE: ${tone}
REQUIRED LENGTH: ${targetLength.min}-${targetLength.max} words (STRICT - count your words!)

INSTRUCTIONS:
- Write EXACTLY ${targetLength.min}-${targetLength.max} words
- Create a FULL chapter with multiple substantial paragraphs
- ${format === 'narrative' ? 'Use engaging storytelling with concrete examples' : format === 'bullets' ? 'Use bullet points and organized lists' : format === 'steps' ? 'Use clear step-by-step instructions' : 'Use well-structured content'}
- ${tone === 'professional' ? 'Professional, authoritative voice' : tone === 'motivational' ? 'Inspiring, energetic voice' : tone === 'direct' ? 'Clear, concise voice' : 'Friendly, conversational voice'}
- Include specific, actionable examples
- Target audience: ${context.targetAudience || 'general readers'}
- Use double line breaks between paragraphs for readability

Write the complete chapter now (${targetLength.min}-${targetLength.max} words):`
      : `Generate ${length} content suggestions for: "${keywords || chapterTitle}".

Context: ${genre} genre, ${tone} tone, for ${context.targetAudience || 'general audience'}

Provide 3-5 practical, actionable ideas with brief descriptions.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert ebook author. Write complete, valuable chapter content that meets the requested word count. Use natural paragraph breaks (\\n\\n). 

IMPORTANT: 
- DO NOT include word counts in your output
- DO NOT add meta notes or revisions offers
- DO NOT add headers like "# Chapter Title"
- Just write the chapter content itself`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: targetLength.tokens,
      temperature: 0.8,
    });

    let content = completion.choices[0]?.message?.content || '';
    
    // Clean up AI output - remove word counts, notes, and meta comments
    content = content
      .replace(/\(Word count:.*?\)/gi, '') // Remove "(Word count: 504)"
      .replace(/\*Note:.*?\*/gs, '') // Remove "*Note: ...*"
      .replace(/---\s*$/g, '') // Remove trailing "---"
      .replace(/^\s*#/gm, '') // Remove markdown headers AI might add
      .trim();
    
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

    // Download the image and convert to data URL to avoid CORS issues
    try {
      const imageResponse = await fetch(imageUrl);
      const arrayBuffer = await imageResponse.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = buffer.toString('base64');
      const dataUrl = `data:image/png;base64,${base64}`;
      
      return res.status(200).json({ imageUrl: dataUrl });
    } catch (fetchError) {
      console.error('Failed to download image, returning URL:', fetchError);
      // Fallback to original URL if download fails
      return res.status(200).json({ imageUrl });
    }

  } catch (error) {
    console.error('Cover generation error:', error);
    return res.status(500).json({ error: 'Failed to generate cover' });
  }
}
