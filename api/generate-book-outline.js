import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
    const { title, description, genre, targetAudience, numChapters } = req.body;

    // Validation
    if (!title || typeof title !== 'string') {
      return res.status(400).json({ error: 'Title is required' });
    }

    if (!description || typeof description !== 'string') {
      return res.status(400).json({ error: 'Description is required' });
    }

    if (!numChapters || numChapters < 6 || numChapters > 15) {
      return res.status(400).json({ error: 'Number of chapters must be between 6 and 15' });
    }

    // Generate outline using GPT-4o-mini for cost efficiency
    const prompt = `You are an expert book outline creator. Create a detailed ${numChapters}-chapter outline for an ebook.

Book Details:
- Title: ${title}
- Description: ${description}
${genre ? `- Genre: ${genre}` : ''}
${targetAudience ? `- Target Audience: ${targetAudience}` : ''}

Create a compelling ${numChapters}-chapter outline that:
1. Has a clear narrative or educational flow
2. Each chapter builds on the previous one
3. Each chapter has an engaging title (3-8 words)
4. Each chapter has a detailed description (2-3 sentences) explaining what will be covered
5. The outline should feel complete and cover the topic comprehensively

Return ONLY a JSON array with this exact structure (no markdown, no code blocks, just raw JSON):
[
  {
    "order": 1,
    "title": "Chapter title here",
    "description": "Detailed description of what this chapter covers and why it's important."
  },
  ...
]`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert book outline creator. You create structured, engaging chapter outlines that flow naturally. Always return valid JSON only, no markdown formatting.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8, // Slightly creative but structured
      max_tokens: 2000,
    });

    let outlineText = completion.choices[0].message.content.trim();
    
    // Remove markdown code blocks if present
    outlineText = outlineText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Parse the JSON outline
    let outline;
    try {
      outline = JSON.parse(outlineText);
    } catch (parseError) {
      console.error('Failed to parse outline JSON:', outlineText);
      return res.status(500).json({ 
        error: 'Failed to generate valid outline. Please try again.',
        details: parseError.message 
      });
    }

    // Validate outline structure
    if (!Array.isArray(outline) || outline.length !== numChapters) {
      return res.status(500).json({ 
        error: `Expected ${numChapters} chapters but got ${outline.length}. Please try again.` 
      });
    }

    // Validate each chapter has required fields
    for (const chapter of outline) {
      if (!chapter.title || !chapter.description || typeof chapter.order !== 'number') {
        return res.status(500).json({ 
          error: 'Invalid outline format. Please try again.' 
        });
      }
    }

    return res.status(200).json({ 
      outline,
      tokensUsed: completion.usage.total_tokens 
    });

  } catch (error) {
    console.error('Error generating outline:', error);
    
    if (error.code === 'insufficient_quota') {
      return res.status(500).json({ 
        error: 'API quota exceeded. Please try again later.' 
      });
    }
    
    return res.status(500).json({ 
      error: 'Failed to generate outline. Please try again.',
      details: error.message 
    });
  }
}
