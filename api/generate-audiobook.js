// Vercel Serverless Function for Audiobook Generation
// Converts text to speech using OpenAI TTS API
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

// Check audiobook generation limits
async function checkAudiobookLimit(userId, characterCount) {
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
    
    // Free users can't generate audiobooks
    if (subscriptionStatus === 'free') {
      return { 
        allowed: false, 
        error: 'Audiobooks are a premium feature. Upgrade to Creator or Premium.' 
      };
    }

    // Get character limits based on tier
    const characterLimits = {
      creator: 100000,  // 100K characters/month
      premium: 500000,  // 500K characters/month
    };

    const limit = characterLimits[subscriptionStatus];
    if (!limit) {
      return { allowed: false, error: 'Invalid subscription status' };
    }

    // Check if we need to reset monthly usage
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const lastReset = userData.lastAudiobookCharactersReset;
    const needsReset = !lastReset || !lastReset.startsWith(currentMonth);

    let charactersUsed = needsReset ? 0 : (userData.audiobookCharactersUsed || 0);
    const charactersRemaining = limit - charactersUsed;

    // Check if user has enough allowance
    if (characterCount > charactersRemaining) {
      return {
        allowed: false,
        error: `Not enough character allowance. You need ${characterCount.toLocaleString()} but only have ${charactersRemaining.toLocaleString()} remaining this month.`
      };
    }

    // Update usage
    await userRef.update({
      audiobookCharactersUsed: needsReset ? characterCount : charactersUsed + characterCount,
      lastAudiobookCharactersReset: currentMonth,
    });

    return { allowed: true, charactersUsed: charactersUsed + characterCount, limit };
  } catch (error) {
    console.error('Error checking audiobook limit:', error);
    return { allowed: false, error: 'Failed to check usage limits' };
  }
}

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return handleCorsPreFlight(req, res);
  }

  // Set CORS headers
  setCorsHeaders(res);

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, voice, quality, chapterId, chapterTitle, userId } = req.body;

    // Validate required fields
    if (!text || !voice) {
      return res.status(400).json({ 
        error: 'Missing required fields: text and voice are required' 
      });
    }

    // Validate voice
    const validVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
    if (!validVoices.includes(voice)) {
      return res.status(400).json({ 
        error: `Invalid voice. Must be one of: ${validVoices.join(', ')}` 
      });
    }

    // Validate quality
    const selectedQuality = quality || 'standard';
    if (!['standard', 'hd'].includes(selectedQuality)) {
      return res.status(400).json({ 
        error: 'Invalid quality. Must be "standard" or "hd"' 
      });
    }

    const characterCount = text.length;

    // Check usage limits
    const limitCheck = await checkAudiobookLimit(userId, characterCount);
    if (!limitCheck.allowed) {
      return res.status(403).json({ error: limitCheck.error });
    }

    // Generate speech using OpenAI TTS
    const model = selectedQuality === 'hd' ? 'tts-1-hd' : 'tts-1';
    
    const mp3 = await openai.audio.speech.create({
      model: model,
      voice: voice,
      input: text,
      response_format: 'mp3',
    });

    // Convert response to buffer
    const buffer = Buffer.from(await mp3.arrayBuffer());

    // Set appropriate headers for audio file
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', `attachment; filename="${chapterTitle || chapterId || 'chapter'}.mp3"`);
    res.setHeader('Content-Length', buffer.length);

    // Send the audio file
    return res.status(200).send(buffer);

  } catch (error) {
    console.error('Audiobook generation error:', error);

    // Handle specific OpenAI errors
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.error?.message || 'OpenAI API error';

      if (status === 429) {
        return res.status(429).json({ 
          error: 'Rate limit exceeded. Please try again in a moment.' 
        });
      }

      if (status === 401) {
        return res.status(500).json({ 
          error: 'API configuration error. Please contact support.' 
        });
      }

      return res.status(status).json({ error: message });
    }

    // Generic error response
    return res.status(500).json({ 
      error: 'Failed to generate audiobook. Please try again.' 
    });
  }
}
