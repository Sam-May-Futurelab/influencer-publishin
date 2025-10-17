import { getFunctions, httpsCallable } from 'firebase/functions';
import app from './firebase';

const functions = getFunctions(app);

export interface ContentSuggestion {
  id: string;
  title: string;
  content: string;
  type: 'outline' | 'introduction' | 'tips' | 'conclusion';
}

/**
 * Generate AI content suggestions via secure Cloud Function
 * This keeps the OpenAI API key secure on the server
 */
export async function generateAIContent(
  keywords: string,
  chapterTitle: string,
  ebookCategory: string = 'general'
): Promise<ContentSuggestion[]> {
  try {
    // Call the secure Cloud Function
    const generateContent = httpsCallable(functions, 'generateAIContent');
    
    const result = await generateContent({
      keywords: keywords.split(',').map(k => k.trim()),
      chapterTitle,
      contentType: 'suggestions'
    });

    const data = result.data as { success: boolean; content: string[]; tokensUsed: number };

    if (!data.success || !data.content) {
      throw new Error('Failed to generate AI content');
    }

    // Transform the suggestions array into ContentSuggestion format
    const suggestions: ContentSuggestion[] = data.content.slice(0, 4).map((content, index) => ({
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

    // Handle specific Firebase errors
    if (error.code === 'unauthenticated') {
      throw new Error('You must be signed in to use AI content generation');
    }

    if (error.code === 'resource-exhausted') {
      throw new Error('AI service quota exceeded. Please try again later.');
    }

    // Return fallback suggestions
    return getFallbackSuggestions(keywords, chapterTitle);
  }
}

/**
 * Enhance existing content via secure Cloud Function
 */
export async function enhanceContent(
  originalContent: string,
  chapterTitle: string
): Promise<string> {
  try {
    const generateContent = httpsCallable(functions, 'generateAIContent');
    
    const result = await generateContent({
      keywords: [originalContent],
      chapterTitle,
      contentType: 'enhance'
    });

    const data = result.data as { success: boolean; content: string; tokensUsed: number };

    if (!data.success || !data.content) {
      throw new Error('Failed to enhance content');
    }

    return data.content;

  } catch (error: any) {
    console.error('Content Enhancement Error:', error);

    if (error.code === 'unauthenticated') {
      throw new Error('You must be signed in to use AI content enhancement');
    }

    if (error.code === 'resource-exhausted') {
      throw new Error('AI service quota exceeded. Please try again later.');
    }

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
