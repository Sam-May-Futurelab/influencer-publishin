import OpenAI from 'openai';

// Initialize OpenAI client with API key from environment
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Only for client-side apps - in production, use server-side
});

export interface ContentSuggestion {
  id: string;
  title: string;
  content: string;
  type: 'outline' | 'introduction' | 'tips' | 'conclusion';
}

export async function generateAIContent(
  keywords: string,
  chapterTitle: string,
  ebookCategory: string = 'general'
): Promise<ContentSuggestion[]> {
  try {
    // Validate API key
    if (!import.meta.env.VITE_OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your .env file.');
    }

    const prompt = `
You are an expert content creator helping to write an engaging chapter for an ebook.

Chapter Title: ${chapterTitle}
Ebook Category: ${ebookCategory}
Keywords/Topics: ${keywords}

Please generate 4 different content suggestions. Each suggestion should be substantial (100-300 words), well-structured, and directly relevant to the keywords provided. Make the content actionable, insightful, and engaging for readers interested in ${ebookCategory}.

IMPORTANT: You must respond with valid JSON only. No additional text or formatting.

Format your response as a JSON array with objects containing:
- id: unique identifier (string)
- title: descriptive title for the suggestion (string)
- content: the actual content text (string, 100-300 words)
- type: one of "outline", "introduction", "tips", "conclusion" (string)

Generate these 4 types:
1. A detailed chapter outline with main points and subpoints (type: "outline")
2. An engaging introduction paragraph that hooks the reader (type: "introduction")  
3. A list of 5-7 practical tips or key insights related to the keywords (type: "tips")
4. A compelling conclusion that summarizes and motivates action (type: "conclusion")
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a professional content writer specializing in creating engaging, actionable content for ebooks. Always respond with valid JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });

    const responseContent = completion.choices[0]?.message?.content;
    
    if (!responseContent) {
      throw new Error('No content received from OpenAI');
    }

    // Parse JSON response
    let suggestions: ContentSuggestion[];
    try {
      // Clean the response - remove markdown code blocks if present
      let cleanedResponse = responseContent.trim();
      
      // Remove ```json and ``` markers if present
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      suggestions = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', responseContent);
      throw new Error('Invalid JSON response from AI service');
    }

    // Validate the structure
    if (!Array.isArray(suggestions) || suggestions.length === 0) {
      throw new Error('Invalid suggestions format from AI service');
    }

    // Ensure all suggestions have required fields
    const validSuggestions = suggestions.filter(s => 
      s.id && s.title && s.content && s.type
    );

    if (validSuggestions.length === 0) {
      throw new Error('No valid suggestions received from AI service');
    }

    return validSuggestions;

  } catch (error) {
    console.error('OpenAI API Error:', error);
    
    // Provide fallback content if API fails
    const keywordList = keywords.split(',').map(k => k.trim()).filter(k => k);
    const mainKeyword = keywordList[0] || 'your topic';
    
    return [
      {
        id: 'fallback-intro',
        title: 'Chapter Introduction',
        content: `Welcome to this chapter on ${mainKeyword}. In this section, we'll explore the fundamental concepts and practical applications that will help you understand and implement ${mainKeyword} effectively. Whether you're a beginner or looking to deepen your knowledge, this chapter provides valuable insights and actionable strategies you can apply immediately. Let's begin this journey together and unlock the potential of ${mainKeyword} in your life.`,
        type: 'introduction'
      },
      {
        id: 'fallback-outline',
        title: 'Chapter Outline',
        content: `Chapter Outline:\n\n1. Introduction to ${mainKeyword}\n   • Definition and core concepts\n   • Why ${mainKeyword} matters\n   • Common misconceptions\n\n2. Getting Started\n   • Essential prerequisites\n   • Basic principles\n   • First steps\n\n3. Practical Application\n   • Real-world examples\n   • Step-by-step implementation\n   • Common challenges and solutions\n\n4. Advanced Strategies\n   • Expert tips and techniques\n   • Optimization methods\n   • Best practices\n\n5. Next Steps\n   • Continuing your journey\n   • Additional resources\n   • Key takeaways`,
        type: 'outline'
      },
      {
        id: 'fallback-tips',
        title: 'Key Tips & Insights',
        content: `Essential Tips for ${mainKeyword}:\n\n• Start with the fundamentals: Build a solid foundation before moving to advanced concepts\n• Practice consistently: Regular application leads to better results and deeper understanding\n• Learn from examples: Study real-world applications and case studies\n• Stay curious: Ask questions and explore different perspectives\n• Track your progress: Monitor your development and celebrate small wins\n• Connect with others: Join communities and learn from peers\n• Be patient: Mastery takes time, so embrace the learning process`,
        type: 'tips'
      },
      {
        id: 'fallback-conclusion',
        title: 'Chapter Conclusion',
        content: `As we conclude this chapter on ${mainKeyword}, remember that knowledge without action is merely potential. The concepts and strategies we've explored are tools waiting to be used. Take what resonates with you and begin implementing it today, even in small ways. Every expert was once a beginner, and every master was once a disaster. Your journey with ${mainKeyword} is unique, and the key is to start where you are, use what you have, and do what you can. The next chapter awaits, but the real transformation happens when you close this book and begin applying what you've learned.`,
        type: 'conclusion'
      }
    ];
  }
}

export async function enhanceContent(
  content: string,
  chapterTitle: string,
  ebookCategory: string = 'general'
): Promise<string> {
  try {
    if (!import.meta.env.VITE_OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `
Please enhance and expand the following content to be more detailed, engaging, and actionable.
Keep the same structure but add more depth, examples, and practical insights.
Target length: 300-500 words.

Original content:
${content}

Chapter context: ${chapterTitle}
Category: ${ebookCategory}

Make it more compelling and valuable for readers. Return only the enhanced content, no additional formatting or explanations.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a professional content editor specializing in enhancing ebook content. Make content more engaging, detailed, and actionable while maintaining the original structure."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.7,
    });

    const enhancedContent = completion.choices[0]?.message?.content;
    
    if (!enhancedContent || enhancedContent.trim() === '') {
      throw new Error('No enhanced content received from OpenAI');
    }

    return enhancedContent.trim();

  } catch (error) {
    console.error('Content enhancement failed:', error);
    throw error;
  }
}
