// Vercel Serverless Function for AI Content Generation
// This keeps your OpenAI API key secure on the server
import OpenAI from 'openai';
import admin from 'firebase-admin';
import { setCorsHeaders, handleCorsPreFlight } from './_cors.js';

// Initialize OpenAI with API key from environment variable
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

// Persistent rate limiting using Firestore
// Survives cold starts and server restarts
async function checkRateLimit(userId) {
  const now = Date.now();
  const userKey = userId || 'anonymous';
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  try {
    const rateLimitRef = db.collection('rateLimits').doc(userKey);
    const rateLimitDoc = await rateLimitRef.get();
    
    let userData = rateLimitDoc.exists ? rateLimitDoc.data() : null;
    
    // Reset if new day or first time
    if (!userData || userData.date !== today) {
      userData = {
        count: 0,
        date: today,
        resetAt: new Date(today).getTime() + 86400000 // End of today
      };
    }
    
    // Check limits based on tier (default to free tier)
    // Matches pricing page: Free = 3/day, Premium = 50/day
    const limits = {
      free: parseInt(process.env.AI_RATE_LIMIT_FREE_TIER) || 3,
      premium: parseInt(process.env.AI_RATE_LIMIT_PREMIUM_TIER) || 50,
    };
    
    // Check user's actual tier from Firebase
    let userLimit = limits.free; // Default to free
    if (userId && userId !== 'anonymous') {
      try {
        const userDoc = await db.collection('users').doc(userId).get();
        if (userDoc.exists) {
          const userDocData = userDoc.data();
          if (userDocData.isPremium || userDocData.subscriptionStatus === 'premium') {
            userLimit = limits.premium;
          }
        }
      } catch (error) {
        console.error('Error checking user tier:', error);
        // On error, default to free tier (safe fallback)
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
    
    // Increment count and save to Firestore
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
    // On error, allow the request (fail open for better UX)
    return {
      allowed: true,
      remaining: 3,
      resetAt: now + 86400000,
      limit: 3
    };
  }
}

// Format content with proper paragraph breaks
function formatWithParagraphBreaks(text) {
  // If text already has double line breaks, return as-is
  if (text.includes('\n\n')) {
    return text;
  }

  // Split by single line breaks or periods followed by space and capital letter
  const sentences = text.split(/(?<=[.!?])\s+(?=[A-Z])/);
  
  let formattedText = '';
  let currentParagraph = '';
  let sentenceCount = 0;
  
  for (const sentence of sentences) {
    currentParagraph += sentence + ' ';
    sentenceCount++;
    
    // Create new paragraph every 3-4 sentences or after 400 characters
    if (sentenceCount >= 3 && currentParagraph.length > 200 || currentParagraph.length > 400) {
      formattedText += currentParagraph.trim() + '\n\n';
      currentParagraph = '';
      sentenceCount = 0;
    }
  }
  
  // Add remaining content
  if (currentParagraph.trim()) {
    formattedText += currentParagraph.trim();
  }
  
  return formattedText.trim();
}

export default async function handler(req, res) {
  // Handle CORS
  setCorsHeaders(req, res);
  if (handleCorsPreFlight(req, res)) return;

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get data from request
  const { 
    keywords, 
    chapterTitle, 
    contentType = 'suggestions', 
    userId,
    // New enhancement parameters
    genre = 'general',
    tone = 'friendly',
    length = 'standard',
    format = 'narrative',
    context = {}
  } = req.body;

  // Check rate limit BEFORE processing (async now)
  const rateLimit = await checkRateLimit(userId);
  if (!rateLimit.allowed) {
    const resetDate = new Date(rateLimit.resetAt).toLocaleTimeString();
    return res.status(429).json({ 
      error: `AI generation limit reached. You've used ${rateLimit.limit} generations today. Resets at ${resetDate}. Upgrade to Premium for unlimited access.`,
      limit: rateLimit.limit,
      remaining: 0,
      resetAt: rateLimit.resetAt
    });
  }

  // Add rate limit headers
  res.setHeader('X-RateLimit-Limit', rateLimit.limit);
  res.setHeader('X-RateLimit-Remaining', rateLimit.remaining);
  res.setHeader('X-RateLimit-Reset', rateLimit.resetAt);

  // Basic validation
  if (!keywords || keywords.length === 0) {
    return res.status(400).json({ error: 'Keywords are required' });
  }

  if (!chapterTitle) {
    return res.status(400).json({ error: 'Chapter title is required' });
  }

  try {
    let prompt = '';
    let maxTokens = 2000;

    // Faster generation with 1 block per request
    const tokenLimits = {
      brief: 400,    // ~100 words
      standard: 600,  // ~150 words
      detailed: 800, // ~200 words
      comprehensive: 1200  // ~300 words
    };

    // Build context string from metadata
    const contextInfo = [];
    if (genre && genre !== 'general') {
      contextInfo.push(`Genre: ${genre}`);
    }
    if (context.targetAudience) {
      contextInfo.push(`Target Audience: ${context.targetAudience}`);
    }
    if (context.bookDescription) {
      contextInfo.push(`Book Description: ${context.bookDescription}`);
    }
    const contextString = contextInfo.length > 0 
      ? `\n\nContext:\n${contextInfo.join('\n')}` 
      : '';

    // Tone descriptors for better prompts
    const toneDescriptors = {
      friendly: 'warm, conversational, and approachable',
      professional: 'clear, authoritative, and polished',
      motivational: 'inspiring, energetic, and empowering',
      direct: 'concise, straightforward, and action-oriented'
    };

    // Format-specific instructions
    const formatInstructions = {
      intro: 'Write an engaging introduction that hooks the reader and sets up the chapter topic.',
      bullets: 'Use bullet points for clarity. Each point should be actionable and specific.',
      steps: 'Present information as a numbered step-by-step guide that readers can follow easily.',
      qa: 'Structure content as questions and answers to address common reader concerns.',
      narrative: 'Use storytelling and narrative flow to make the content engaging and memorable.'
    };

    if (contentType === 'suggestions') {
      // Determine word count based on length setting
      // Generate 1 block per request - faster, cheaper, won't timeout
      const targetWords = length === 'comprehensive' ? 300
        : length === 'detailed' ? 200
        : length === 'standard' ? 150
        : 100;
      
      const genreContext = genre && genre !== 'general' ? ` ${genre}` : '';
      const audienceContext = context.targetAudience ? ` for ${context.targetAudience}` : '';
      
      // Simple chapter guidance - only special case for Chapter 1
      const chapterNumber = context.chapterNumber || null;
      let chapterGuidance = '';
      
      if (chapterNumber === 1) {
        chapterGuidance = '\n\nNote: This is Chapter 1 - introduce the topic, hook the reader, and set clear expectations.';
      }
      
      prompt = `Write engaging content about "${keywords.join(', ')}" for the chapter "${chapterTitle}"${genreContext}${audienceContext}.${chapterGuidance}

Style: ${toneDescriptors[tone] || 'engaging, conversational'}
Target length: ${targetWords} words

Write a complete, well-developed paragraph or section with:
- Clear explanation of the topic
- Specific examples or details
- Practical insights readers can use

IMPORTANT: Return ONLY a JSON array with 1 string. No markdown, no code blocks.
Example format: ["Your content text here..."]

Make it substantial and valuable - around ${targetWords} words.`;
      
      maxTokens = tokenLimits[length] || 1500;
      
    } else if (contentType === 'enhance') {
      const toneDesc = toneDescriptors[tone] || 'engaging and helpful';
      const formatInstr = formatInstructions[format] || 'Make it engaging and valuable.';
      const lengthGuide = {
        brief: '150-250 words',
        standard: '300-500 words',
        detailed: '500-800 words',
        comprehensive: '800-1200 words'
      };
      const targetLength = lengthGuide[length] || '300-500 words';
      
      prompt = `You are a professional ebook editor specializing in ${genre} content.${contextString}

Write with a ${toneDesc} tone that resonates with readers.

Chapter: "${chapterTitle}"
Original Content: ${keywords.join(' ')}

Improve and expand this content with these guidelines:
- Target length: ${targetLength}
- Tone: ${toneDesc}
- Format: ${formatInstr}
- Enhance clarity and readability
- Add engaging examples or anecdotes where appropriate
- Improve flow and structure
- Keep the author's voice and intent
- Make it valuable for the target audience

Return ONLY the enhanced content as plain text, no JSON or markdown formatting.`;
      
      maxTokens = tokenLimits[length] || 1500;
    }

    let completion;
    try {
      completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a professional ebook writing assistant specializing in ${genre} content. Write in a ${toneDescriptors[tone] || 'engaging'} tone. 

IMPORTANT: Format all content with proper paragraph breaks. Create a new paragraph every 3-4 sentences or after 250-400 characters. Use double line breaks (\\n\\n) between paragraphs to ensure readability. Never create walls of text - break content into digestible chunks.

Provide helpful, creative, and engaging content suggestions that match the specified format and length.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: maxTokens,
        temperature: 0.8,
      });
    } catch (apiError) {
      console.error('OpenAI API Error:', apiError);
      
      // Handle different error types
      if (apiError.status === 429) {
        return res.status(503).json({ 
          error: 'AI service is temporarily overloaded. Please try again in a moment.',
          retryAfter: 60
        });
      }
      
      if (apiError.status === 401) {
        console.error('OpenAI API key invalid or missing');
        return res.status(500).json({ 
          error: 'AI service configuration error. Please contact support.'
        });
      }
      
      if (apiError.code === 'ECONNREFUSED' || apiError.code === 'ETIMEDOUT') {
        return res.status(503).json({ 
          error: 'Unable to connect to AI service. Please try again later.'
        });
      }
      
      // Generic error fallback
      return res.status(500).json({ 
        error: 'Failed to generate content. Please try again.'
      });
    }

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      console.error('OpenAI returned empty content');
      return res.status(500).json({ 
        error: 'AI service returned empty response. Please try again.'
      });
    }

    // Clean up em-dashes and other problematic characters
    let cleanedContent = content
      .replace(/—/g, '-')  // Replace em-dash with hyphen
      .replace(/–/g, '-')  // Replace en-dash with hyphen  
      .replace(/"/g, '"')  // Replace smart quotes
      .replace(/"/g, '"')
      .replace(/'/g, "'")
      .replace(/'/g, "'")
      .replace(/…/g, '...'); // Replace ellipsis

    // Add paragraph breaks to prevent walls of text
    // Split long paragraphs (more than 500 chars) into smaller ones
    if (contentType === 'enhance' || contentType === 'content') {
      cleanedContent = formatWithParagraphBreaks(cleanedContent);
    }

    // Parse JSON response with better error handling
    let parsedContent = cleanedContent;
    if (contentType === 'suggestions') {
      try {
        // Remove markdown code blocks if present
        const cleanContent = cleanedContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        parsedContent = JSON.parse(cleanContent);
        
        if (!Array.isArray(parsedContent)) {
          throw new Error('Response is not an array');
        }
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.error('Raw content:', cleanedContent);
        throw new Error('Failed to parse AI response as JSON');
      }
    }

    // Log usage for monitoring (optional)
    console.log('AI Content Generated', {
      userId: userId || 'anonymous',
      contentType,
      genre,
      tone,
      length,
      format,
      tokensUsed: completion.usage?.total_tokens || 0,
      timestamp: new Date().toISOString(),
    });

    return res.status(200).json({
      success: true,
      content: parsedContent,
      tokensUsed: completion.usage?.total_tokens || 0,
    });

  } catch (error) {
    console.error('AI Generation Error:', error);

    // Return user-friendly error
    if (error.code === 'insufficient_quota') {
      return res.status(429).json({
        error: 'AI service quota exceeded. Please try again later.',
      });
    }

    return res.status(500).json({
      error: 'Failed to generate AI content. Please try again.',
    });
  }
}
