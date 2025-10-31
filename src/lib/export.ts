import { EbookProject } from '@/lib/types';
import { getCoverImageData } from '@/lib/cover-generator';

export type ExportFormat = 'pdf' | 'epub' | 'docx';
export type ChapterNumberStyle = 'numeric' | 'roman' | 'none';
export type CopyrightPosition = 'beginning' | 'end';

export interface ExportOptions {
  isPremium?: boolean;
  customWatermark?: string;
  authorName?: string;
  authorBio?: string;
  authorWebsite?: string;
  
  // New formatting options
  includeTOC?: boolean;
  includeCopyright?: boolean;
  copyrightPosition?: CopyrightPosition;
  chapterNumberStyle?: ChapterNumberStyle;
}

// Helper function to format chapter numbers
function formatChapterNumber(index: number, style: ChapterNumberStyle = 'numeric'): string {
  switch (style) {
    case 'roman':
      return toRoman(index + 1);
    case 'none':
      return '';
    case 'numeric':
    default:
      return (index + 1).toString();
  }
}

// Convert number to Roman numerals
function toRoman(num: number): string {
  const romanNumerals: [number, string][] = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
  ];
  
  let result = '';
  for (const [value, numeral] of romanNumerals) {
    while (num >= value) {
      result += numeral;
      num -= value;
    }
  }
  return result;
}

export async function exportToFormat(project: EbookProject, format: ExportFormat, options?: ExportOptions): Promise<void> {
  try {
    switch (format) {
      case 'pdf':
        return await exportToPDF(project, options);
      case 'epub':
        return await exportToEPUB(project, options);
      case 'docx':
        return await exportToDocx(project, options);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  } catch (error) {
    console.error(`Export to ${format} failed:`, error);
    throw error;
  }
}

export async function exportToPDF(project: EbookProject, options?: ExportOptions): Promise<void> {
  try {
    // Generate cover image if we have cover design
    let coverImageData: string | undefined;
    if (project.coverDesign) {
      coverImageData = await getCoverImageData(project.coverDesign);
    }
    
    // Create a modified project with the generated cover image
    const projectWithCover = coverImageData ? {
      ...project,
      coverDesign: project.coverDesign ? {
        ...project.coverDesign,
        coverImageData
      } : undefined
    } : project;
    
    const doc = generateHTML(projectWithCover, options);
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Could not open print window');
    }

    printWindow.document.write(doc);
    printWindow.document.close();
    
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
    
  } catch (error) {
    console.error('PDF export failed:', error);
    throw error;
  }
}

export async function exportToEPUB(project: EbookProject, options?: ExportOptions): Promise<void> {
  try {
    const epubContent = generateEPUBContent(project, options);
    downloadFile(epubContent, `${project.title}.epub`, 'application/epub+zip');
  } catch (error) {
    console.error('EPUB export failed:', error);
    throw error;
  }
}

export async function exportToDocx(project: EbookProject, options?: ExportOptions): Promise<void> {
  try {
    const docxContent = generateDocxContent(project, options);
    downloadFile(docxContent, `${project.title}.docx`, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  } catch (error) {
    console.error('DOCX export failed:', error);
    throw error;
  }
}

function generateHTML(project: EbookProject, options?: ExportOptions): string {
  const sortedChapters = [...project.chapters].sort((a, b) => a.order - b.order);
  const brand = project.brandConfig;
  
  // Default export options
  const includeTOC = options?.includeTOC !== false; // default true
  const includeCopyright = options?.includeCopyright !== false; // default true
  const copyrightPosition = options?.copyrightPosition || 'end'; // default end
  const chapterNumberStyle = options?.chapterNumberStyle || 'numeric'; // default numeric
  
  // Generate copyright page HTML
  const getCopyrightPage = () => {
    if (!includeCopyright) return '';
    
    return `
      <div class="copyright-page">
        <p class="copyright-title">${escapeHtml(project.title)}</p>
        ${project.author ? `<p class="copyright-content">by ${escapeHtml(project.author)}</p>` : ''}
        
        <div class="copyright-content">
          <p>Copyright © ${new Date().getFullYear()} ${escapeHtml(project.author || 'Author')}</p>
          <p>All rights reserved.</p>
        </div>
        
        <div class="copyright-content">
          <p>No part of this book may be reproduced in any form or by any electronic or mechanical means, including information storage and retrieval systems, without written permission from the author, except for the use of brief quotations in a book review.</p>
        </div>
        
        ${options?.authorWebsite ? `
          <div class="copyright-content">
            <p><strong>Website:</strong> ${escapeHtml(options.authorWebsite)}</p>
          </div>
        ` : ''}
        
        <div class="copyright-notice">
          <p><strong>First Edition:</strong> ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          <p>Created with Inkfluence AI</p>
        </div>
      </div>
    `;
  };
  
  // Generate cover background based on cover design or brand style
  const getCoverStyle = () => {
    // Use custom cover design if available
    if (project.coverDesign?.coverImageData) {
      return `background-image: url('${project.coverDesign.coverImageData}'); background-size: cover; background-position: center; background-repeat: no-repeat;`;
    }
    
    // Fall back to brand cover style
    switch (brand?.coverStyle) {
      case 'gradient':
        return `background: linear-gradient(135deg, ${brand.primaryColor} 0%, ${brand.secondaryColor} 100%);`;
      case 'image':
        return brand.coverImageUrl 
          ? `background-image: url('${brand.coverImageUrl}'); background-size: cover; background-position: center; background-repeat: no-repeat;` 
          : `background: ${brand?.primaryColor || '#8B5CF6'};`;
      case 'minimal':
      default:
        return `background: ${brand?.primaryColor || '#8B5CF6'};`;
    }
  };

  const fontFamily = brand?.fontFamily || 'Inter, sans-serif';
  const fontUrl = getFontUrl(fontFamily);
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${escapeHtml(project.title)} - Inkfluence AI</title>
      <link rel="icon" type="image/svg+xml" href="/favicon.svg">
      <link rel="apple-touch-icon" href="/apple-touch-icon.png">
      <style>
        ${fontUrl ? `@import url('${fontUrl}');` : ''}
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        @page {
          size: letter;
          margin: 0;
        }
        
        @page :first {
          margin: 0;
        }
        
        body {
          font-family: ${fontFamily};
          line-height: 1.6;
          color: #2c2c2c;
          background: white;
          font-size: 14px;
          margin: 0;
          padding: 0;
        }
        
        .container {
          max-width: 100%;
          margin: 0 auto;
        }
        
        .title-page {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          width: 100%;
          min-height: 100vh;
          text-align: center;
          ${getCoverStyle()}
          color: white;
          margin: 0;
          padding: 2rem;
          page-break-after: always;
          position: relative;
          overflow: hidden;
        }
        
        ${!project.coverDesign?.coverImageData ? `
        .title-page::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.3);
          z-index: 1;
        }
        ` : ''}
        
        .title-page-content {
          position: relative;
          z-index: 2;
        }
        
        /* Copyright Page Styles */
        .copyright-page {
          page-break-after: always;
          padding: 3rem 1.5rem;
          font-size: 0.95em;
          color: #6b7280;
          line-height: 1.8;
          min-height: 100vh;
        }
        
        .copyright-title {
          font-weight: 600;
          font-size: 1.1em;
          margin-bottom: 0.5em;
          color: #374151;
        }
        
        .copyright-content {
          margin-bottom: 1.5em;
        }
        
        .copyright-notice {
          margin-top: 2em;
          padding-top: 1em;
          border-top: 1px solid #e5e7eb;
          font-size: 0.85em;
        }
        
        .logo {
          max-width: 120px;
          max-height: 80px;
          margin-bottom: 2em;
          filter: brightness(0) invert(1);
        }
        
        .main-title {
          font-size: 3.5em;
          font-weight: 800;
          margin-bottom: 0.5em;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
          line-height: 1.1;
        }
        
        .author {
          font-size: 1.4em;
          font-weight: 300;
          margin-bottom: 1em;
          opacity: 0.9;
        }
        
        .description {
          font-size: 1.2em;
          margin-bottom: 2em;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
          opacity: 0.95;
          line-height: 1.5;
        }
        
        .stats {
          font-size: 1em;
          opacity: 0.8;
          font-weight: 300;
        }
        
        .content-page {
          margin-top: 0;
          padding: 2rem 1.5rem;
        }
        
        .chapter {
          margin-bottom: 3em;
          page-break-inside: avoid;
        }
        
        .chapter-title {
          font-size: 2.2em;
          font-weight: 700;
          margin-bottom: 1em;
          color: ${brand?.primaryColor || '#8B5CF6'};
          border-bottom: 3px solid ${brand?.accentColor || '#C4B5FD'};
          padding-bottom: 0.5em;
          page-break-after: avoid;
        }
        
        /* Table of Contents Styles */
        .table-of-contents {
          page-break-after: always;
          margin-bottom: 3em;
          padding: 2em 0;
        }
        
        .toc-title {
          font-size: 2.5em;
          font-weight: 700;
          color: ${brand?.primaryColor || '#8B5CF6'};
          margin-bottom: 1.5em;
          text-align: center;
          border-bottom: 3px solid ${brand?.accentColor || '#C4B5FD'};
          padding-bottom: 0.5em;
        }
        
        .toc-list {
          list-style: none;
        }
        
        .toc-item {
          margin-bottom: 0.8em;
          padding: 0.5em 0;
          border-bottom: 1px dotted #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: baseline;
        }
        
        .toc-item:hover {
          background: ${brand?.primaryColor || '#8B5CF6'}05;
          padding-left: 0.5em;
          margin-left: -0.5em;
          transition: all 0.2s;
        }
        
        .toc-chapter-number {
          font-size: 0.9em;
          color: ${brand?.secondaryColor || '#A78BFA'};
          font-weight: 600;
          margin-right: 0.5em;
        }
        
        .toc-chapter-title {
          font-size: 1.1em;
          font-weight: 500;
          color: #374151;
          flex: 1;
        }
        
        .toc-link {
          text-decoration: none;
          color: inherit;
          display: flex;
          flex: 1;
          align-items: baseline;
        }
        
        .toc-link:hover .toc-chapter-title {
          color: ${brand?.primaryColor || '#8B5CF6'};
        }
        
        .toc-dots {
          flex: 1;
          border-bottom: 2px dotted #d1d5db;
          margin: 0 0.5em 0.3em 0.5em;
          min-width: 1em;
        }
        
        .toc-page {
          font-size: 0.9em;
          color: ${brand?.primaryColor || '#8B5CF6'};
          font-weight: 600;
        }
        
        .chapter-number {
          font-size: 1em;
          color: ${brand?.secondaryColor || '#A78BFA'};
          font-weight: 600;
          margin-bottom: 0.5em;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .chapter-content {
          font-size: 1.15em;
          line-height: 1.9;
          text-align: justify;
          color: #374151;
          hyphens: auto;
          word-spacing: 0.05em;
        }
        
        .chapter-content p {
          margin-bottom: 1.5em;
          text-indent: 1.5em;
        }
        
        .chapter-content p:first-of-type {
          text-indent: 0;
        }
        
        .chapter-content p:first-child::first-letter {
          font-size: 3.5em;
          font-weight: 700;
          color: ${brand?.primaryColor || '#8B5CF6'};
          float: left;
          line-height: 0.9;
          margin-right: 0.1em;
          margin-top: 0.1em;
        }
        
        .about-author {
          margin-top: 4em;
          padding: 2em;
          background: linear-gradient(135deg, ${brand?.primaryColor || '#8B5CF6'}15, ${brand?.secondaryColor || '#A78BFA'}15);
          border-radius: 12px;
          border-left: 4px solid ${brand?.primaryColor || '#8B5CF6'};
          page-break-inside: avoid;
        }
        
        .about-author-title {
          font-size: 1.8em;
          font-weight: 700;
          color: ${brand?.primaryColor || '#8B5CF6'};
          margin-bottom: 0.8em;
        }
        
        .about-author-content {
          font-size: 1.05em;
          line-height: 1.8;
          color: #374151;
          margin-bottom: 1em;
        }
        
        .about-author-website {
          font-size: 1em;
          color: ${brand?.primaryColor || '#8B5CF6'};
          font-weight: 600;
          word-break: break-all;
        }
        
        /* Desktop/Tablet - use proper page dimensions */
        @media screen and (min-width: 768px) {
          .container {
            max-width: 8.5in;
          }
          
          .title-page {
            width: 8.5in;
            height: 11in;
            padding: 2in;
          }
          
          .copyright-page {
            padding: 3in 1.5in;
          }
          
          .content-page {
            padding: 1.25in;
          }
        }
        
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
            margin: 0;
            padding: 0;
          }
          
          /* Page setup - remove default headers/footers */
          @page {
            size: letter;
            margin: 0;
          }
          
          @page :first {
            margin: 0;
          }
          
          /* Custom page numbers and headers for content pages */
          @page content {
            margin: 0.75in;
            
            @bottom-center {
              content: counter(page);
              font-size: 10pt;
              color: ${brand?.primaryColor || '#8B5CF6'};
              font-weight: 600;
            }
          }
          
          .container {
            margin: 0;
            padding: 0;
            max-width: 8.5in;
          }
          
          .title-page {
            margin: 0;
            padding: 2in;
            width: 8.5in;
            height: 11in;
          }
          
          .content-page {
            margin-top: 0;
            padding: 1.25in;
            page: content;
          }
          
          .copyright-page {
            page-break-after: always;
            padding: 3in 1.5in;
          }
            margin: 0;
          }
          
          .table-of-contents {
            page-break-after: always;
          }
          
          .chapter {
            page-break-before: always;
            page-break-inside: avoid;
          }
          
          .chapter:first-of-type {
            page-break-before: auto;
          }
          
          .chapter-title {
            page-break-after: avoid;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="title-page">
          ${!project.coverDesign?.coverImageData ? `
          <div class="title-page-content">
            ${brand?.logoUrl ? `<img src="${brand.logoUrl}" alt="Logo" class="logo" />` : ''}
            <h1 class="main-title">${escapeHtml(project.title)}</h1>
            ${project.author ? `<p class="author">by ${escapeHtml(project.author)}</p>` : ''}
            ${project.description ? `<p class="description">${escapeHtml(project.description)}</p>` : ''}
            <div class="stats">
              ${sortedChapters.length} Chapter${sortedChapters.length !== 1 ? 's' : ''} • 
              ${getTotalWordCount(project).toLocaleString()} Words • 
              ~${Math.ceil(getTotalWordCount(project) / 250)} Pages
            </div>
          </div>
          ` : '<!-- Custom cover design applied -->'}
        </div>
        
        ${copyrightPosition === 'beginning' ? getCopyrightPage() : ''}
        
        <div class="content-page">
          <!-- Table of Contents -->
          ${includeTOC ? `
          <div class="table-of-contents">
            <h2 class="toc-title">Table of Contents</h2>
            <ul class="toc-list">
              ${sortedChapters.map((chapter, index) => {
                const chapterNumber = formatChapterNumber(index, chapterNumberStyle);
                return `
                <li class="toc-item">
                  <a href="#chapter-${index + 1}" class="toc-link">
                    ${chapterNumber ? `<span class="toc-chapter-number">Chapter ${chapterNumber}</span>` : ''}
                    <span class="toc-chapter-title">${escapeHtml(chapter.title)}</span>
                    <span class="toc-dots"></span>
                  </a>
                  <span class="toc-page">${index + 2}</span>
                </li>
              `;
              }).join('')}
            </ul>
          </div>
          ` : ''}
          
          <!-- Chapters -->
          ${sortedChapters.map((chapter, index) => {
            const chapterNumber = formatChapterNumber(index, chapterNumberStyle);
            return `
            <div class="chapter" id="chapter-${index + 1}">
              ${chapterNumber ? `<div class="chapter-number">Chapter ${chapterNumber}</div>` : ''}
              <h2 class="chapter-title">${escapeHtml(chapter.title)}</h2>
              <div class="chapter-content">
                ${formatContent(chapter.content)}
              </div>
            </div>
          `;
          }).join('')}
          
          ${(options?.authorName || options?.authorBio || options?.authorWebsite) ? `
            <div class="about-author">
              <h3 class="about-author-title">About the Author</h3>
              ${options.authorName ? `<p class="about-author-content"><strong>${escapeHtml(options.authorName)}</strong></p>` : ''}
              ${options.authorBio ? `<p class="about-author-content">${escapeHtml(options.authorBio)}</p>` : ''}
              ${options.authorWebsite ? `<p class="about-author-website">🌐 ${escapeHtml(options.authorWebsite)}</p>` : ''}
            </div>
          ` : ''}
          
          ${copyrightPosition === 'end' ? getCopyrightPage() : ''}
        </div>
      </div>
      
      <div class="footer">
        ${options?.isPremium 
          ? (options?.customWatermark || '') 
          : `Generated with Inkfluence AI • ${new Date().toLocaleDateString()}`
        }
      </div>
    </body>
    </html>
  `;
}

function getFontUrl(fontFamily: string): string | null {
  const fontMap: Record<string, string> = {
    'Inter, sans-serif': 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
    'Roboto, sans-serif': 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap',
    'Open Sans, sans-serif': 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700&display=swap',
    'Lato, sans-serif': 'https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap',
    'Montserrat, sans-serif': 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap',
    'Playfair Display, serif': 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap',
    'Merriweather, serif': 'https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700&display=swap',
  };
  
  return fontMap[fontFamily] || null;
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatContent(content: string): string {
  if (!content) return '<p><em>No content yet...</em></p>';
  
  // If content is already HTML (has paragraph tags), return as-is
  if (content.includes('<p>') || content.includes('<div>') || content.includes('<h1>')) {
    return content;
  }
  
  // Convert plain text with \n\n to paragraphs (must check before markdown)
  if (!content.includes('**') && !content.includes('##') && content.includes('\n\n')) {
    const paragraphs = content
      .split('\n\n')
      .map(para => para.trim())
      .filter(para => para.length > 0)
      .map(para => `<p>${para.replace(/\n/g, ' ')}</p>`)
      .join('');
    return paragraphs || content;
  }
  
  // Check if content is markdown (contains markdown syntax)
  const isMarkdown = content.includes('**') || content.includes('##') || content.includes('- ') || content.includes('# ');
  
  if (isMarkdown) {
    // Convert markdown to HTML
    let html = content;
    
    // Headers
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    
    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    
    // Italic
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    
    // Unordered lists (bullet points)
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
    // Fix nested ul tags
    html = html.replace(/<\/ul>\s*<ul>/g, '');
    
    // Ordered lists (numbered)
    html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
    // For numbered lists, wrap in ol instead of ul
    html = html.replace(/(<li>\d+\. .*<\/li>)/gs, (match) => {
      return match.replace(/<li>(\d+)\. /g, '<li>');
    });
    
    // Checkboxes
    html = html.replace(/- \[ \] (.+)/g, '<li>☐ $1</li>');
    html = html.replace(/- \[x\] (.+)/gi, '<li>☑ $1</li>');
    
    // Paragraphs (lines separated by blank lines)
    html = html.replace(/\n\n/g, '</p><p>');
    html = html.replace(/^(?!<[hul])/gm, '<p>');
    html = html.replace(/(?<![>])$/gm, '</p>');
    
    // Clean up extra p tags around headers and lists
    html = html.replace(/<p>(<h[1-6]>)/g, '$1');
    html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1');
    html = html.replace(/<p>(<ul>)/g, '$1');
    html = html.replace(/(<\/ul>)<\/p>/g, '$1');
    html = html.replace(/<p>(<ol>)/g, '$1');
    html = html.replace(/(<\/ol>)<\/p>/g, '$1');
    html = html.replace(/<p><\/p>/g, '');
    
    return html;
  }
  
  // Content is already HTML from the rich text editor
  return content;
}

function getTotalWordCount(project: EbookProject): number {
  return project.chapters.reduce((total, chapter) => {
    if (!chapter.content) return total;
    
    // Strip HTML tags for accurate word count
    const textContent = chapter.content.replace(/<[^>]*>/g, ' ');
    const wordCount = textContent.split(/\s+/).filter(word => word.length > 0).length;
    
    return total + wordCount;
  }, 0);
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

function generateEPUBContent(project: EbookProject, options?: ExportOptions): string {
  const sortedChapters = [...project.chapters].sort((a, b) => a.order - b.order);
  const brand = project.brandConfig;
  
  // Generate EPUB-compatible HTML structure
  const content = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
  <title>${escapeHtml(project.title)}</title>
  <style type="text/css">
    body {
      font-family: ${brand?.fontFamily || 'serif'};
      line-height: 1.6;
      color: #2c2c2c;
      margin: 1em;
    }
    
    .title-page {
      text-align: center;
      margin: 2em 0;
      page-break-after: always;
    }
    
    .main-title {
      font-size: 2.5em;
      font-weight: bold;
      margin-bottom: 0.5em;
      color: ${brand?.primaryColor || '#8B5CF6'};
    }
    
    .author {
      font-size: 1.2em;
      margin-bottom: 1em;
      font-style: italic;
    }
    
    .description {
      font-size: 1em;
      margin-bottom: 2em;
      text-align: justify;
    }
    
    .chapter {
      margin-bottom: 2em;
      page-break-before: always;
    }
    
    .chapter-title {
      font-size: 1.8em;
      font-weight: bold;
      margin-bottom: 1em;
      color: ${brand?.primaryColor || '#8B5CF6'};
      border-bottom: 2px solid ${brand?.accentColor || '#C4B5FD'};
      padding-bottom: 0.5em;
    }
    
    .chapter-number {
      font-size: 0.9em;
      color: ${brand?.secondaryColor || '#A78BFA'};
      font-weight: bold;
      margin-bottom: 0.5em;
      text-transform: uppercase;
    }
    
    .chapter-content {
      text-align: justify;
      line-height: 1.7;
    }
    
    .chapter-content p {
      margin-bottom: 1em;
      text-indent: 1.5em;
    }
    
    .chapter-content p:first-child {
      text-indent: 0;
    }
  </style>
</head>
<body>
  <div class="title-page">
    <h1 class="main-title">${escapeHtml(project.title)}</h1>
    ${project.author ? `<p class="author">by ${escapeHtml(project.author)}</p>` : ''}
    ${project.description ? `<div class="description">${escapeHtml(project.description)}</div>` : ''}
  </div>
  
  ${sortedChapters.map((chapter, index) => `
    <div class="chapter">
      <div class="chapter-number">Chapter ${index + 1}</div>
      <h2 class="chapter-title">${escapeHtml(chapter.title)}</h2>
      <div class="chapter-content">
        ${formatContentForEPUB(chapter.content)}
      </div>
    </div>
  `).join('')}
</body>
</html>`;

  return content;
}

function generateDocxContent(project: EbookProject, options?: ExportOptions): string {
  const sortedChapters = [...project.chapters].sort((a, b) => a.order - b.order);
  const brand = project.brandConfig;
  
  // Generate simplified HTML that can be saved as .docx (will be opened in Word)
  const content = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(project.title)}</title>
  <style>
    body {
      font-family: ${brand?.fontFamily || 'serif'};
      line-height: 1.6;
      color: #2c2c2c;
      margin: 1in;
      font-size: 12pt;
    }
    
    .title-page {
      text-align: center;
      margin-bottom: 3em;
      page-break-after: always;
    }
    
    .main-title {
      font-size: 24pt;
      font-weight: bold;
      margin-bottom: 0.5em;
      color: ${brand?.primaryColor || '#8B5CF6'};
    }
    
    .author {
      font-size: 14pt;
      margin-bottom: 1em;
      font-style: italic;
    }
    
    .description {
      font-size: 12pt;
      margin-bottom: 2em;
      text-align: justify;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }
    
    .stats {
      font-size: 10pt;
      color: #666;
    }
    
    .chapter {
      margin-bottom: 2em;
      page-break-before: always;
    }
    
    .chapter:first-child {
      page-break-before: auto;
    }
    
    .chapter-title {
      font-size: 18pt;
      font-weight: bold;
      margin-bottom: 0.5em;
      color: ${brand?.primaryColor || '#8B5CF6'};
      border-bottom: 2pt solid ${brand?.accentColor || '#C4B5FD'};
      padding-bottom: 0.25em;
    }
    
    .chapter-number {
      font-size: 10pt;
      color: ${brand?.secondaryColor || '#A78BFA'};
      font-weight: bold;
      margin-bottom: 0.5em;
      text-transform: uppercase;
    }
    
    .chapter-content {
      text-align: justify;
      line-height: 1.7;
      font-size: 12pt;
    }
    
    .chapter-content p {
      margin-bottom: 12pt;
      text-indent: 0.5in;
    }
    
    .chapter-content p:first-child {
      text-indent: 0;
    }
    
    @page {
      margin: 1in;
      size: letter;
    }
  </style>
</head>
<body>
  <div class="title-page">
    <h1 class="main-title">${escapeHtml(project.title)}</h1>
    ${project.author ? `<p class="author">by ${escapeHtml(project.author)}</p>` : ''}
    ${project.description ? `<div class="description">${escapeHtml(project.description)}</div>` : ''}
    <div class="stats">
      ${sortedChapters.length} Chapter${sortedChapters.length !== 1 ? 's' : ''} • 
      ${getTotalWordCount(project).toLocaleString()} Words
    </div>
  </div>
  
  ${sortedChapters.map((chapter, index) => `
    <div class="chapter">
      <div class="chapter-number">Chapter ${index + 1}</div>
      <h2 class="chapter-title">${escapeHtml(chapter.title)}</h2>
      <div class="chapter-content">
        ${formatContentForWord(chapter.content)}
      </div>
    </div>
  `).join('')}
</body>
</html>`;

  return content;
}

function formatContentForEPUB(content: string): string {
  if (!content) return '<p><em>No content yet...</em></p>';
  
  // Content is already HTML from the rich text editor, so return as-is
  return content;
}

function formatContentForWord(content: string): string {
  if (!content) return '<p><em>No content yet...</em></p>';
  
  // Content is already HTML from the rich text editor, so return as-is
  return content;
}