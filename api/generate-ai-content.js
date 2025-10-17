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
  const { keywords, chapterTitle, contentType = 'suggestions', userId } = req.body;

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

    if (contentType === 'suggestions') {
      prompt = `You are a professional ebook writer assistant. Based on the following keywords and chapter context, generate 5-7 creative and engaging content suggestions that would be perfect for this chapter.

Chapter: "${chapterTitle}"
Keywords: ${keywords.join(', ')}

For each suggestion:
- Make it specific and actionable
- Keep it between 20-40 words
- Focus on valuable insights or engaging storytelling
- Vary the types of content (tips, stories, examples, explanations)

Return ONLY a JSON array of strings, no other text. Example format:
["Suggestion 1 text here", "Suggestion 2 text here", ...]`;
      
    } else if (contentType === 'enhance') {
      prompt = `You are a professional ebook editor. Improve and expand the following chapter content while maintaining its core message and style.

Chapter: "${chapterTitle}"
Original Content: ${keywords.join(' ')}

Guidelines:
- Enhance clarity and readability
- Add engaging examples or anecdotes where appropriate
- Improve flow and structure
- Keep the author's voice and intent
- Expand to approximately 300-500 words
- Use proper paragraphs and formatting

Return ONLY the enhanced content as plain text, no JSON or markdown formatting.`;
      maxTokens = 1500;
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a professional ebook writing assistant. Provide helpful, creative, and engaging content suggestions.',
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
