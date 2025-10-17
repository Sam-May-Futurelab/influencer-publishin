// Secure AI Service - Calls serverless function to keep API key safe
// This works with Vercel/Netlify serverless functions (100% FREE)

export interface ContentSuggestion {
  id: string;
  title: string;
  content: string;
  type: 'outline' | 'introduction' | 'tips' | 'conclusion';
}

export type Tone = 'friendly' | 'professional' | 'motivational' | 'direct';
export type Length = 'brief' | 'standard' | 'detailed' | 'comprehensive';
export type Format = 'intro' | 'bullets' | 'steps' | 'qa' | 'narrative';

export interface AIContentOptions {
  keywords: string;
  chapterTitle: string;
  genre?: string;
  tone?: Tone;
  length?: Length;
  format?: Format;
  context?: {
    targetAudience?: string;
    bookDescription?: string;
  };
}

// Get the API endpoint based on environment
const getApiEndpoint = () => {
  // In production (Vercel), use /api route
  if (import.meta.env.PROD) {
    return '/api/generate-ai-content';
  }
  // In development, use Vercel dev server or fallback
  return import.meta.env.VITE_API_ENDPOINT || 'http://localhost:3000/api/generate-ai-content';
};

/**
 * Generate AI content suggestions via secure serverless function
 * This keeps the OpenAI API key secure on the server
 */
export async function generateAIContent(
  options: AIContentOptions | string, // Support legacy string parameter
  chapterTitle?: string,
  ebookCategory?: string
): Promise<ContentSuggestion[]> {
  // Support both new object API and legacy string API
  let requestOptions: AIContentOptions;
  
  if (typeof options === 'string') {
    // Legacy API: generateAIContent(keywords, chapterTitle, ebookCategory)
    requestOptions = {
      keywords: options,
      chapterTitle: chapterTitle || '',
      genre: ebookCategory || 'general',
    };
  } else {
    // New API: generateAIContent({ keywords, chapterTitle, tone, length, ... })
    requestOptions = options;
  }

  try {
    const endpoint = getApiEndpoint();
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        keywords: requestOptions.keywords.split(',').map(k => k.trim()),
        chapterTitle: requestOptions.chapterTitle,
        contentType: 'suggestions',
        genre: requestOptions.genre || 'general',
        tone: requestOptions.tone || 'friendly',
        length: requestOptions.length || 'standard',
        format: requestOptions.format || 'narrative',
        context: requestOptions.context || {},
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success || !data.content) {
      throw new Error('Failed to generate AI content');
    }

    // Transform the suggestions array into ContentSuggestion format
    const suggestions: ContentSuggestion[] = data.content.slice(0, 4).map((content: string, index: number) => ({
      id: `suggestion-${Date.now()}-${index}`,
      title: index === 0 ? 'Chapter Outline' :
             index === 1 ? 'Engaging Introduction' :
             index === 2 ? 'Key Points & Tips' :
             'Compelling Conclusion',
      content,
      type: index === 0 ? 'outline' :
            index === 1 ? 'introduction' :
            index === 2 ? 'tips' :
            'conclusion'
    }));

    return suggestions;

  } catch (error: any) {
    console.error('AI Content Generation Error:', error);

    // Return fallback suggestions
    return getFallbackSuggestions(requestOptions.keywords, requestOptions.chapterTitle);
  }
}

/**
 * Enhance existing content via secure serverless function
 */
export async function enhanceContent(
  originalContent: string,
  chapterTitle: string,
  options?: {
    genre?: string;
    tone?: Tone;
    length?: Length;
    format?: Format;
    context?: {
      targetAudience?: string;
      bookDescription?: string;
    };
  }
): Promise<string> {
  try {
    const endpoint = getApiEndpoint();
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        keywords: [originalContent],
        chapterTitle,
        contentType: 'enhance',
        genre: options?.genre || 'general',
        tone: options?.tone || 'friendly',
        length: options?.length || 'standard',
        format: options?.format || 'narrative',
        context: options?.context || {},
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success || !data.content) {
      throw new Error('Failed to enhance content');
    }

    return data.content;

  } catch (error: any) {
    console.error('Content Enhancement Error:', error);

    // Return original content if enhancement fails
    return originalContent;
  }
}

/**
 * Fallback suggestions when AI service is unavailable
 */
function getFallbackSuggestions(keywords: string, chapterTitle: string): ContentSuggestion[] {
  return [
    {
      id: 'fallback-1',
      title: 'Chapter Outline',
      content: `Structure your chapter "${chapterTitle}" with these elements:\n\n1. Opening Hook: Start with a compelling question or statement about ${keywords}\n2. Main Points: Develop 3-5 key concepts related to your topic\n3. Supporting Examples: Include real-world applications or case studies\n4. Actionable Takeaways: End with practical steps readers can implement\n5. Transition: Connect to your next chapter smoothly`,
      type: 'outline'
    },
    {
      id: 'fallback-2',
      title: 'Engaging Introduction',
      content: `In this chapter, we'll explore ${keywords} and discover how these concepts can transform your understanding of ${chapterTitle}. Whether you're just starting out or looking to deepen your knowledge, you'll find practical insights and actionable strategies that you can apply immediately. Let's dive into the key principles that will help you master this important topic.`,
      type: 'introduction'
    },
    {
      id: 'fallback-3',
      title: 'Key Points & Tips',
      content: `Essential insights for ${chapterTitle}:\n\n• Start with the fundamentals and build progressively\n• Focus on ${keywords} as your core foundation\n• Practice regularly to reinforce your learning\n• Learn from mistakes and iterate on your approach\n• Connect theory with real-world applications\n• Share your knowledge with others to deepen understanding\n• Stay curious and keep exploring beyond the basics`,
      type: 'tips'
    },
    {
      id: 'fallback-4',
      title: 'Compelling Conclusion',
      content: `As we conclude this chapter on ${chapterTitle}, remember that mastering ${keywords} is a journey, not a destination. The concepts we've covered provide a strong foundation, but the real transformation happens when you put these ideas into practice. Take what you've learned, experiment with different approaches, and don't be afraid to make it your own. Your success story starts with the first step you take today.`,
      type: 'conclusion'
    }
  ];
}
