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

    // Transform the suggestions array into ContentSuggestion format (now 3 blocks instead of 4)
    const suggestions: ContentSuggestion[] = data.content.slice(0, 3).map((content: string, index: number) => ({
      id: `suggestion-${Date.now()}-${index}`,
      title: index === 0 ? 'Opening Section' :
             index === 1 ? 'Core Content' :
             'Practical Takeaways',
      content,
      type: index === 0 ? 'introduction' :
            index === 1 ? 'outline' :
            'tips'
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
      title: 'Opening Section',
      content: `In this chapter, we'll explore ${keywords} and discover how these concepts can transform your understanding of ${chapterTitle}. Whether you're just starting out or looking to deepen your knowledge, you'll find practical insights and actionable strategies that you can apply immediately. Let's dive into the key principles that will help you master this important topic and see how they apply to real-world situations.`,
      type: 'introduction'
    },
    {
      id: 'fallback-2',
      title: 'Core Content',
      content: `Understanding ${keywords} requires examining both theory and practice. Let's break down the essential elements: First, ${keywords} forms the foundation of ${chapterTitle} by providing a framework for understanding key concepts. Consider how these ideas connect to your existing knowledge and experience. Through specific examples and detailed explanations, we'll explore different aspects of ${keywords}, helping you build a comprehensive understanding. By examining various perspectives and applications, you'll develop practical skills you can implement immediately in your own context.`,
      type: 'outline'
    },
    {
      id: 'fallback-3',
      title: 'Practical Takeaways',
      content: `Let's focus on actionable insights you can implement right away. Start by identifying which aspects of ${keywords} resonate most with your situation. Practice applying these concepts in small, manageable steps rather than trying to master everything at once. Track your progress and adjust based on what works for you. Connect with others exploring ${keywords}—their experiences provide valuable perspective. Remember that mastery develops through consistent practice. Be patient as you build your skills, and celebrate small wins along the way.`,
      type: 'tips'
    }
  ];
}
