import Stripe from 'stripe';
import admin from 'firebase-admin';

// Initialize Firebase Admin
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

// Tier limits for cover generation (per month)
const TIER_LIMITS = {
  free: 1,
  creator: 10,
  premium: 50,
};

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, style = 'realistic', includeText = false, userId } = req.body;

    if (!prompt || !userId) {
      return res.status(400).json({ error: 'Missing required fields: prompt, userId' });
    }

    // Get user data from Firebase
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    const subscriptionStatus = userData.subscriptionStatus || 'free';
    const coverGenerationsUsed = userData.coverGenerationsUsed || 0;
    const lastCoverGenerationReset = userData.lastCoverGenerationReset?.toDate() || new Date(0);

    // Check if we need to reset monthly usage
    const now = new Date();
    const monthsSinceReset = 
      (now.getFullYear() - lastCoverGenerationReset.getFullYear()) * 12 +
      (now.getMonth() - lastCoverGenerationReset.getMonth());

    let currentUsage = coverGenerationsUsed;
    if (monthsSinceReset >= 1) {
      // Reset usage for new month
      currentUsage = 0;
      await userRef.update({
        coverGenerationsUsed: 0,
        lastCoverGenerationReset: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    // Check tier limit
    const tierLimit = TIER_LIMITS[subscriptionStatus] || TIER_LIMITS.free;
    if (currentUsage >= tierLimit) {
      return res.status(403).json({
        error: 'Monthly cover generation limit reached',
        limit: tierLimit,
        used: currentUsage,
        resetDate: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString(),
      });
    }

    // Validate OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY not configured');
      return res.status(500).json({ error: 'AI service not configured' });
    }

    // Build the DALL-E prompt based on style
    const stylePrompts = {
      realistic: 'photorealistic, professional photography, high detail, cinematic lighting',
      artistic: 'artistic painting, expressive brushstrokes, vibrant colors, fine art style',
      minimalist: 'minimalist design, clean lines, simple composition, modern aesthetic',
      dramatic: 'dramatic lighting, high contrast, moody atmosphere, cinematic',
      watercolor: 'watercolor painting, soft edges, pastel colors, artistic illustration',
      vintage: 'vintage aesthetic, retro design, aged texture',
    };

    const styleModifier = stylePrompts[style] || stylePrompts.realistic;
    
    // Simplified prompt - avoid mentioning "book" or "cover" to prevent DALL-E from drawing books
    let fullPrompt = `Create a portrait-oriented illustration: ${prompt}. `;
    fullPrompt += `Style: ${styleModifier}. `;
    
    if (includeText) {
      fullPrompt += 'Include decorative title text in the design. ';
    } else {
      fullPrompt += 'Pure visual artwork with NO text, NO words, NO letters whatsoever. ';
    }
    
    // Key constraints - be explicit about what NOT to show
    fullPrompt += 'DO NOT show books, book spines, or 3D objects. ';
    fullPrompt += 'DO NOT show human faces or people unless specifically requested. ';
    fullPrompt += 'Create flat 2D artwork perfect as a background image. ';
    fullPrompt += 'Focus on: scenery, abstract patterns, objects, or symbols. Professional quality.';

    // Call OpenAI DALL-E 3 API
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: fullPrompt,
        n: 1,
        size: '1024x1792', // Portrait ratio for book covers
        quality: 'standard',
        response_format: 'b64_json', // Get base64 directly from OpenAI
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      return res.status(500).json({ 
        error: 'Failed to generate cover image',
        details: errorData.error?.message || 'Unknown error'
      });
    }

    const data = await response.json();
    const base64Data = data.data[0]?.b64_json;

    if (!base64Data) {
      return res.status(500).json({ error: 'No image generated' });
    }

    const base64Image = `data:image/png;base64,${base64Data}`;

    // Increment usage counter
    await userRef.update({
      coverGenerationsUsed: admin.firestore.FieldValue.increment(1),
    });

    // Return success with base64 image
    return res.status(200).json({
      success: true,
      imageUrl: base64Image,
      used: currentUsage + 1,
      limit: tierLimit,
      remaining: tierLimit - (currentUsage + 1),
    });

  } catch (error) {
    console.error('Cover generation error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate cover',
      details: error.message 
    });
  }
}
