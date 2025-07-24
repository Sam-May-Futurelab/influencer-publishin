import { EbookProject } from '@/lib/types';

export async function exportToPDF(project: EbookProject): Promise<void> {
  try {
    const doc = generateHTML(project);
    
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
    console.error('Export failed:', error);
    throw error;
  }
}

function generateHTML(project: EbookProject): string {
  const sortedChapters = [...project.chapters].sort((a, b) => a.order - b.order);
  const brand = project.brandConfig;
  
  // Generate cover background based on style
  const getCoverStyle = () => {
    switch (brand?.coverStyle) {
      case 'gradient':
        return `background: linear-gradient(135deg, ${brand.primaryColor} 0%, ${brand.secondaryColor} 100%);`;
      case 'image':
        return brand.coverImageUrl 
          ? `background: url('${brand.coverImageUrl}') center/cover no-repeat;` 
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
      <title>${project.title}</title>
      <style>
        ${fontUrl ? `@import url('${fontUrl}');` : ''}
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: ${fontFamily};
          line-height: 1.6;
          color: #2c2c2c;
          background: white;
          font-size: 14px;
        }
        
        .container {
          max-width: 8.5in;
          margin: 0 auto;
          padding: 1in;
          min-height: 11in;
        }
        
        .title-page {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          min-height: 9in;
          text-align: center;
          ${getCoverStyle()}
          color: white;
          border-radius: 20px;
          margin: -1in;
          margin-bottom: 0;
          padding: 2in;
          page-break-after: always;
          position: relative;
          overflow: hidden;
        }
        
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
        
        .title-page-content {
          position: relative;
          z-index: 2;
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
          margin-top: 1in;
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
        
        .chapter-number {
          font-size: 1em;
          color: ${brand?.secondaryColor || '#A78BFA'};
          font-weight: 600;
          margin-bottom: 0.5em;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .chapter-content {
          font-size: 1.1em;
          line-height: 1.8;
          text-align: justify;
          color: #374151;
        }
        
        .chapter-content p {
          margin-bottom: 1.2em;
        }
        
        .chapter-content p:first-child::first-letter {
          font-size: 3em;
          font-weight: 700;
          color: ${brand?.primaryColor || '#8B5CF6'};
          float: left;
          line-height: 1;
          margin-right: 8px;
          margin-top: 4px;
        }
        
        .footer {
          position: fixed;
          bottom: 0.5in;
          left: 0;
          right: 0;
          text-align: center;
          font-size: 0.9em;
          color: #9ca3af;
          background: white;
          padding: 10px 0;
        }
        
        .page-number {
          position: fixed;
          bottom: 0.5in;
          right: 1in;
          font-size: 0.9em;
          color: ${brand?.primaryColor || '#8B5CF6'};
          font-weight: 500;
        }
        
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          
          .container {
            margin: 0;
            padding: 0.75in;
          }
          
          .title-page {
            margin: -0.75in;
            margin-bottom: 0;
          }
          
          .content-page {
            margin-top: 0;
          }
          
          .chapter {
            page-break-inside: avoid;
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
        </div>
        
        <div class="content-page">
          ${sortedChapters.map((chapter, index) => `
            <div class="chapter">
              <div class="chapter-number">Chapter ${index + 1}</div>
              <h2 class="chapter-title">${escapeHtml(chapter.title)}</h2>
              <div class="chapter-content">
                ${formatContent(chapter.content)}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      
      <div class="footer">
        Generated with EbookCrafter • ${new Date().toLocaleDateString()}
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
  
  return content
    .split('\n\n')
    .filter(paragraph => paragraph.trim())
    .map(paragraph => `<p>${escapeHtml(paragraph.trim())}</p>`)
    .join('');
}

function getTotalWordCount(project: EbookProject): number {
  return project.chapters.reduce((total, chapter) => {
    return total + (chapter.content?.split(/\s+/).filter(word => word.length > 0).length || 0);
  }, 0);
}