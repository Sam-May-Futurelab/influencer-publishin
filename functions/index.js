const functions = require('firebase-functions');
const admin = require('firebase-admin');
const OpenAI = require('openai');

admin.initializeApp();

// Initialize OpenAI with API key from environment config
const openai = new OpenAI({
  apiKey: functions.config().openai.key,
});

/**
 * Generate AI content suggestions based on keywords and chapter title
 * This endpoint is secured - only authenticated users can call it
 */
exports.generateAIContent = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to generate AI content'
    );
  }

  const { keywords, chapterTitle, contentType = 'suggestions' } = data;

  // Validate input
  if (!keywords || keywords.length === 0) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Keywords are required'
    );
  }

  if (!chapterTitle) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Chapter title is required'
    );
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

    // Log usage for monitoring
    functions.logger.info('AI Content Generated', {
      userId: context.auth.uid,
      contentType,
      tokensUsed: completion.usage?.total_tokens || 0,
    });

    return {
      success: true,
      content: contentType === 'suggestions' ? JSON.parse(content) : content,
      tokensUsed: completion.usage?.total_tokens || 0,
    };

  } catch (error) {
    functions.logger.error('AI Generation Error', {
      userId: context.auth.uid,
      error: error.message,
    });

    // Return user-friendly error
    if (error.code === 'insufficient_quota') {
      throw new functions.https.HttpsError(
        'resource-exhausted',
        'AI service quota exceeded. Please try again later.'
      );
    }

    throw new functions.https.HttpsError(
      'internal',
      'Failed to generate AI content. Please try again.'
    );
  }
});

/**
 * Health check endpoint for monitoring
 */
exports.healthCheck = functions.https.onRequest((req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'InkFluence AI Functions',
  });
});
