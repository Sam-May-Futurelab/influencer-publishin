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

    // Dynamic token allocation based on length parameter
    const tokenLimits = {
      brief: 800,
      standard: 1500,
      detailed: 2500,
      comprehensive: 3500
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
      const wordCountTargets = {
        brief: { min: 100, max: 150, description: '100-150 words' },
        standard: { min: 200, max: 300, description: '200-300 words' },
        detailed: { min: 300, max: 400, description: '300-400 words' },
        comprehensive: { min: 500, max: 700, description: '500-700 words' }
      };
      const wordTarget = wordCountTargets[length] || wordCountTargets.standard;
      
      // Build a natural, effective prompt
      const genreContext = genre && genre !== 'general' ? ` for a ${genre} ebook` : '';
      const audienceContext = context.targetAudience ? ` targeting ${context.targetAudience}` : '';
      
      prompt = `You are a professional ebook content writer${genreContext}${audienceContext}.

Chapter: "${chapterTitle}"
Topics: ${keywords.join(', ')}

CRITICAL REQUIREMENT: Each piece MUST be between ${wordTarget.min}-${wordTarget.max} words. This is MANDATORY. Count your words carefully.

Generate 4 content pieces:

1. Chapter Introduction (${wordTarget.description})
   - Hook the reader immediately
   - Set clear expectations
   - Make them want to continue reading
   
2. Main Explanation (${wordTarget.description})
   - Detailed coverage of key concepts
   - Include 2-3 specific examples
   - Break down complex ideas
   
3. Practical Tips (${wordTarget.description})
   - 3-5 actionable tips readers can use today
   - Specific, not generic advice
   - Real-world application examples
   
4. Conclusion (${wordTarget.description})
   - Reinforce key takeaways
   - Motivate action
   - Connect to next steps

Style: ${toneDescriptors[tone] || 'engaging, conversational'}

IMPORTANT: 
- Each piece must be AT LEAST ${wordTarget.min} words
- Each piece should be close to ${wordTarget.max} words
- Be specific and detailed, not brief or generic
- Use multiple paragraphs for longer pieces

Return ONLY a JSON array of 4 strings. Each string must be ${wordTarget.description}.`;
      
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
      model: 'gpt-3.5-turbo',
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
      content: contentType === 'suggestions' ? JSON.parse(content) : content,
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
