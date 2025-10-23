import mammoth from 'mammoth';
import { Chapter, EbookProject, BrandConfig } from './types';

export interface ImportResult {
  success: boolean;
  project?: Partial<EbookProject>;
  chapters?: Chapter[];
  error?: string;
}

/**
 * Import a .docx file and parse it into chapters
 * Headings 1 become chapter titles, content goes into chapters
 */
export async function importDocx(file: File): Promise<ImportResult> {
  try {
    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Convert .docx to HTML using mammoth
    const result = await mammoth.convertToHtml({ arrayBuffer }, {
      styleMap: [
        // Preserve basic formatting
        "p[style-name='Heading 1'] => h1:fresh",
        "p[style-name='Heading 2'] => h2:fresh",
        "p[style-name='Heading 3'] => h3:fresh",
        "b => strong",
        "i => em",
      ]
    });

    const html = result.value;
    const messages = result.messages;

    // Log any warnings from mammoth
    if (messages.length > 0) {
      console.warn('Import warnings:', messages);
    }

    // Parse HTML into chapters
    const chapters = parseHTMLIntoChapters(html);

    if (chapters.length === 0) {
      return {
        success: false,
        error: 'No content found in document. Make sure to use Heading 1 for chapter titles.'
      };
    }

    // Extract title from filename (remove .docx extension)
    const title = file.name.replace(/\.docx?$/i, '').trim();

    return {
      success: true,
      project: {
        title: title || 'Imported Book',
        description: `Imported from ${file.name}`,
      },
      chapters
    };

  } catch (error) {
    console.error('Error importing .docx:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to import document'
    };
  }
}

/**
 * Parse HTML content into chapters
 * Uses H1 tags as chapter boundaries
 */
function parseHTMLIntoChapters(html: string): Chapter[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  const chapters: Chapter[] = [];
  let currentChapterTitle: string | null = null;
  let contentBuffer: string[] = [];
  
  // Process all body elements
  const bodyElements = Array.from(doc.body.children);
  
  bodyElements.forEach((element, index) => {
    const tagName = element.tagName.toLowerCase();
    
    // H1 = New chapter
    if (tagName === 'h1') {
      // Save previous chapter if exists
      if (currentChapterTitle) {
        chapters.push({
          id: generateId(),
          title: currentChapterTitle,
          content: contentBuffer.join('\n'),
          order: chapters.length,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        contentBuffer = [];
      }
      
      // Start new chapter
      currentChapterTitle = element.textContent?.trim() || `Chapter ${chapters.length + 1}`;
    }
    // H2 = Subheading (include in content)
    else if (tagName === 'h2' || tagName === 'h3') {
      if (currentChapterTitle) {
        contentBuffer.push(element.outerHTML);
      } else {
        // If we haven't started a chapter yet, create one
        currentChapterTitle = element.textContent?.trim() || 'Introduction';
      }
    }
    // Regular content
    else if (element.textContent?.trim()) {
      // If no chapter started yet, create a default one
      if (!currentChapterTitle) {
        currentChapterTitle = 'Introduction';
      }
      contentBuffer.push(element.outerHTML);
    }
  });
  
  // Save last chapter
  if (currentChapterTitle) {
    chapters.push({
      id: generateId(),
      title: currentChapterTitle,
      content: contentBuffer.join('\n'),
      order: chapters.length,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
  
  // If no chapters were created (no headings), create one chapter with all content
  if (chapters.length === 0 && doc.body.textContent?.trim()) {
    chapters.push({
      id: generateId(),
      title: 'Chapter 1',
      content: html,
      order: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
  
  return chapters;
}

/**
 * Generate a unique ID for chapters
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Import from Google Docs paste (HTML cleanup)
 * Detects Google Docs HTML and cleans it
 */
export function cleanGoogleDocsHTML(html: string): string {
  // Remove Google Docs specific styles and spans
  let cleaned = html
    .replace(/<span[^>]*>/gi, '')
    .replace(/<\/span>/gi, '')
    .replace(/style="[^"]*"/gi, '')
    .replace(/class="[^"]*"/gi, '')
    .replace(/<b style="font-weight:normal;">/gi, '')
    .replace(/<div[^>]*>/gi, '<p>')
    .replace(/<\/div>/gi, '</p>');
  
  return cleaned;
}

/**
 * Detect if pasted HTML is from Google Docs
 */
export function isGoogleDocsContent(html: string): boolean {
  return html.includes('docs-internal-guid') || 
         html.includes('google-docs') ||
         html.includes('id="docs-');
}

/**
 * Import from plain text with optional chapter markers
 * Looks for patterns like "Chapter 1:", "# Chapter Title", etc.
 */
export function importPlainText(text: string, title: string = 'Imported Document'): ImportResult {
  const lines = text.split('\n');
  const chapters: Chapter[] = [];
  let currentChapterTitle: string | null = null;
  let contentBuffer: string[] = [];
  
  // Patterns that indicate chapter boundaries
  const chapterPatterns = [
    /^Chapter\s+\d+:?\s*(.*)$/i,
    /^#\s+(.+)$/,
    /^\d+\.\s+(.+)$/,
  ];
  
  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    
    if (!trimmedLine) {
      contentBuffer.push('<br>');
      return;
    }
    
    // Check if line matches chapter pattern
    let isChapterStart = false;
    for (const pattern of chapterPatterns) {
      const match = trimmedLine.match(pattern);
      if (match) {
        // Save previous chapter
        if (currentChapterTitle) {
          chapters.push({
            id: generateId(),
            title: currentChapterTitle,
            content: contentBuffer.join('\n'),
            order: chapters.length,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          contentBuffer = [];
        }
        
        // Start new chapter
        currentChapterTitle = match[1]?.trim() || trimmedLine;
        isChapterStart = true;
        break;
      }
    }
    
    if (!isChapterStart) {
      // Regular content
      if (!currentChapterTitle) {
        currentChapterTitle = 'Chapter 1';
      }
      contentBuffer.push(`<p>${trimmedLine}</p>`);
    }
  });
  
  // Save last chapter
  if (currentChapterTitle) {
    chapters.push({
      id: generateId(),
      title: currentChapterTitle,
      content: contentBuffer.join('\n'),
      order: chapters.length,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
  
  // If no chapters, create one with all content
  if (chapters.length === 0) {
    chapters.push({
      id: generateId(),
      title: 'Chapter 1',
      content: lines.map(line => `<p>${line}</p>`).join('\n'),
      order: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
  
  return {
    success: true,
    project: {
      title,
      description: 'Imported from text file'
    },
    chapters
  };
}

/**
 * Get file extension and validate it's supported
 */
export function getFileType(file: File): 'docx' | 'txt' | 'unsupported' {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  if (extension === 'docx' || extension === 'doc') {
    return 'docx';
  }
  
  if (extension === 'txt') {
    return 'txt';
  }
  
  return 'unsupported';
}

/**
 * Main import function that handles different file types
 */
export async function importFile(file: File): Promise<ImportResult> {
  const fileType = getFileType(file);
  
  switch (fileType) {
    case 'docx':
      return await importDocx(file);
      
    case 'txt':
      const text = await file.text();
      const title = file.name.replace(/\.txt$/i, '').trim();
      return importPlainText(text, title);
      
    case 'unsupported':
    default:
      return {
        success: false,
        error: `Unsupported file type. Please use .docx or .txt files.`
      };
  }
}
