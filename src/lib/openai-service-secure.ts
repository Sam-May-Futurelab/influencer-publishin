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
    chapterNumber?: number;
    totalChapters?: number;
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

    // Now returns 1 suggestion per API call with timestamp
    const timestamp = new Date();
    const suggestions: ContentSuggestion[] = data.content.map((content: string, index: number) => ({
      id: `suggestion-${Date.now()}-${index}`,
      title: `Generated ${timestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`,
      content,
      type: 'introduction'
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
    
    console.log('[DEBUG openai-service] enhanceContent called');
    console.log('[DEBUG openai-service] Endpoint:', endpoint);
    console.log('[DEBUG openai-service] Request body:', {
      keywords: [originalContent],
      chapterTitle,
      contentType: 'enhance',
      genre: options?.genre || 'general',
      tone: options?.tone || 'friendly',
      length: options?.length || 'standard',
      format: options?.format || 'narrative',
      context: options?.context || {},
    });
    
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

    console.log('[DEBUG openai-service] Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[DEBUG openai-service] Error response:', errorText);
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('[DEBUG openai-service] Response data:', data);

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
      title: 'Content Suggestion',
      content: `In this chapter on ${chapterTitle}, we'll explore ${keywords} and discover how these concepts can transform your understanding. Whether you're just starting out or looking to deepen your knowledge, you'll find practical insights and actionable strategies. Understanding ${keywords} requires examining both theory and practice. Through specific examples and detailed explanations, we'll help you build a comprehensive understanding that you can apply in your own context.`,
      type: 'introduction'
    }
  ];
}
