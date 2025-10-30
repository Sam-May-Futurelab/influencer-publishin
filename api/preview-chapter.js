// Simple in-memory rate limiting (resets on server restart)
// For production, use Vercel KV, Redis, or Upstash
const rateLimitMap = new Map();

// Clean up old entries every hour
setInterval(() => {
  const now = Date.now();
  const oneDayAgo = now - (24 * 60 * 60 * 1000);
  
  for (const [ip, timestamp] of rateLimitMap.entries()) {
    if (timestamp < oneDayAgo) {
      rateLimitMap.delete(ip);
    }
  }
}, 60 * 60 * 1000);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { title } = req.body;

    if (!title || typeof title !== 'string') {
      return res.status(400).json({ error: 'Title is required' });
    }

    // Get IP address for rate limiting
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || 
               req.headers['x-real-ip'] || 
               req.socket.remoteAddress || 
               'unknown';

    // Check rate limit (1 per IP per day)
    const lastRequest = rateLimitMap.get(ip);
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);

    if (lastRequest && lastRequest > oneDayAgo) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded',
        message: 'You can only generate one preview per day. Sign up for unlimited access!',
        retryAfter: Math.ceil((lastRequest + (24 * 60 * 60 * 1000) - now) / 1000)
      });
    }

    // Validate OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY not configured');
      return res.status(500).json({ error: 'AI service not configured' });
    }

    // Generate preview chapter with OpenAI
    const prompt = `Write an engaging first chapter (approximately 500-750 words) for a book titled "${title}".

The chapter should:
- Introduce the main topic or theme
- Hook the reader's interest
- Set a professional, informative tone
- Be well-structured with clear paragraph breaks
- Use regular hyphens (-) instead of em dashes (—)
- Not include "Chapter 1" or any headers (we'll add those)

Write naturally and engagingly, as if this is a real published book. Use double line breaks between paragraphs for clear separation.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Cheap and fast
        messages: [
          {
            role: 'system',
            content: 'You are an expert book writer who creates engaging, professional content. Write clear, accessible prose that captures readers\' attention. Always use regular hyphens (-) not em dashes (—). Separate paragraphs with double line breaks.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      return res.status(500).json({ 
        error: 'Failed to generate content',
        details: errorData.error?.message || 'Unknown error'
      });
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      return res.status(500).json({ error: 'No content generated' });
    }

    // Clean up content: replace em dashes with regular hyphens
    const cleanedContent = content.trim().replace(/—/g, '-');

    // Update rate limit
    rateLimitMap.set(ip, now);

    // Return success
    return res.status(200).json({
      success: true,
      content: cleanedContent,
      wordCount: cleanedContent.split(/\s+/).length,
      isPreview: true,
    });

  } catch (error) {
    console.error('Preview generation error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate preview',
      details: error.message 
    });
  }
}
