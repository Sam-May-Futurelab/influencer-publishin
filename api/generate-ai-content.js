// Vercel Serverless Function for AI Content Generation
// This keeps your OpenAI API key secure on the server
import OpenAI from 'openai';

// Initialize OpenAI with API key from environment variable
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
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

    // Reduced token limits to avoid Vercel timeout (10 seconds)
    const tokenLimits = {
      brief: 600,    // ~225 words total
      standard: 900,  // ~300 words total
      detailed: 1200, // ~450 words total
      comprehensive: 1800  // ~600 words total
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
      // Realistic word counts that won't timeout on Vercel (10 second limit)
      const targetWords = length === 'comprehensive' ? 200  // 600 words total
        : length === 'detailed' ? 150  // 450 words total
        : length === 'standard' ? 100  // 300 words total
        : 75;  // 225 words total
      
      const genreContext = genre && genre !== 'general' ? ` ${genre}` : '';
      const audienceContext = context.targetAudience ? ` for ${context.targetAudience}` : '';
      
      prompt = `Write 3 content blocks about "${keywords.join(', ')}" for the chapter "${chapterTitle}"${genreContext}${audienceContext}.

Style: ${toneDescriptors[tone] || 'engaging, conversational'}

Each block should be approximately ${targetWords} words. Write substantial, detailed content.

1. Opening section - Introduce the topic and hook the reader
2. Core content - Explain key concepts with specific examples and details
3. Practical takeaways - Actionable insights the reader can use

IMPORTANT: Return ONLY a valid JSON array of 3 strings. No markdown, no code blocks, just the raw JSON array.
Example format: ["first block text here...", "second block text here...", "third block text here..."]

Make each block around ${targetWords} words with real substance.`;
      
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

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a professional ebook writing assistant specializing in ${genre} content. Write in a ${toneDescriptors[tone] || 'engaging'} tone. Provide helpful, creative, and engaging content suggestions that match the specified format and length.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: maxTokens,
      temperature: 0.8,
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content generated from OpenAI');
    }

    // Parse JSON response with better error handling
    let parsedContent = content;
    if (contentType === 'suggestions') {
      try {
        // Remove markdown code blocks if present
        const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        parsedContent = JSON.parse(cleanContent);
        
        if (!Array.isArray(parsedContent)) {
          throw new Error('Response is not an array');
        }
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.error('Raw content:', content);
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
