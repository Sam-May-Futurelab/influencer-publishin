import { CoverDesign } from './types';

/**
 * Generate a cover image from design parameters
 * This is used to create cover images on-the-fly without storing large base64 data
 */
export async function generateCoverImage(design: CoverDesign): Promise<string> {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context not available');

    // Set canvas dimensions (standard ebook cover: 1600x2560)
    canvas.width = 1600;
    canvas.height = 2560;

    // Draw background
    if (design.backgroundType === 'gradient') {
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, design.gradientStart);
      gradient.addColorStop(1, design.gradientEnd);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (design.backgroundType === 'image' && design.backgroundImage) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = design.backgroundImage;
      
      await new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = () => {
          console.error('Failed to load background image, using fallback');
          resolve(null);
        };
      });
      
      if (img.complete && img.naturalHeight !== 0) {
        // Calculate image position based on alignment
        const imagePosition = design.imagePosition || 'cover';
        const imageAlignment = design.imageAlignment || 'center';
        
        let sx = 0, sy = 0, sw = img.width, sh = img.height;
        let dx = 0, dy = 0, dw = canvas.width, dh = canvas.height;
        
        if (imagePosition === 'cover') {
          // Scale to cover, then position based on alignment
          const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
          sw = canvas.width / scale;
          sh = canvas.height / scale;
          
          // Calculate source position based on alignment
          switch (imageAlignment) {
            case 'top':
            case 'top-left':
            case 'top-right':
              sy = 0;
              break;
            case 'bottom':
            case 'bottom-left':
            case 'bottom-right':
              sy = img.height - sh;
              break;
            default:
              sy = (img.height - sh) / 2;
          }
          
          switch (imageAlignment) {
            case 'left':
            case 'top-left':
            case 'bottom-left':
              sx = 0;
              break;
            case 'right':
            case 'top-right':
            case 'bottom-right':
              sx = img.width - sw;
              break;
            default:
              sx = (img.width - sw) / 2;
          }
        } else if (imagePosition === 'contain') {
          // Scale to fit inside, then position based on alignment
          const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
          dw = img.width * scale;
          dh = img.height * scale;
          
          // Calculate destination position based on alignment
          switch (imageAlignment) {
            case 'top':
            case 'top-left':
            case 'top-right':
              dy = 0;
              break;
            case 'bottom':
            case 'bottom-left':
            case 'bottom-right':
              dy = canvas.height - dh;
              break;
            default:
              dy = (canvas.height - dh) / 2;
          }
          
          switch (imageAlignment) {
            case 'left':
            case 'top-left':
            case 'bottom-left':
              dx = 0;
              break;
            case 'right':
            case 'top-right':
            case 'bottom-right':
              dx = canvas.width - dw;
              break;
            default:
              dx = (canvas.width - dw) / 2;
          }
        }
        // For 'fill', use default full canvas dimensions
        
        ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
      } else {
        // Fallback to gradient if image fails
        ctx.fillStyle = design.gradientStart || '#667eea';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      // Add overlay if enabled
      if (design.overlay) {
        ctx.fillStyle = `rgba(0, 0, 0, ${design.overlayOpacity / 100})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    } else {
      ctx.fillStyle = design.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Helper function to draw text with word wrapping
    const drawText = (
      text: string,
      font: string,
      size: number,
      color: string,
      y: number,
      align: 'center' | 'left' | 'right' = 'center',
      maxWidth?: number
    ) => {
      ctx.fillStyle = color;
      ctx.font = `${size * 3}px ${font}`;
      ctx.textAlign = align;
      const x = align === 'center' ? canvas.width / 2 : align === 'left' ? 100 : canvas.width - 100;
      
      const actualMaxWidth = maxWidth || canvas.width - 200;
      if (ctx.measureText(text).width <= actualMaxWidth) {
        ctx.fillText(text, x, y);
        return;
      }
      
      // Word wrap for long text
      const words = text.split(' ');
      const lines: string[] = [];
      let currentLine = words[0];
      
      for (let i = 1; i < words.length; i++) {
        const testLine = currentLine + ' ' + words[i];
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > actualMaxWidth) {
          lines.push(currentLine);
          currentLine = words[i];
        } else {
          currentLine = testLine;
        }
      }
      lines.push(currentLine);
      
      // Draw each line
      const lineHeight = size * 3.5;
      const startY = y - ((lines.length - 1) * lineHeight) / 2;
      
      lines.forEach((line, index) => {
        ctx.fillText(line, x, startY + (index * lineHeight));
      });
    };

    // Draw title, subtitle, and author
    drawText(design.title, design.titleFont, design.titleSize, design.titleColor, canvas.height * 0.4, 'center', canvas.width * 0.8);
    drawText(design.subtitle, design.subtitleFont, design.subtitleSize, design.subtitleColor, canvas.height * 0.5, 'center', canvas.width * 0.8);
    drawText(design.authorName, design.authorFont, design.authorSize, design.authorColor, canvas.height * 0.85, 'center', canvas.width * 0.8);

    // Return base64 data URL
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error generating cover image:', error);
    throw error;
  }
}

/**
 * Get cover image data for a project
 * Priority: uploaded image > existing generated image > generate new from design
 */
export async function getCoverImageData(coverDesign?: CoverDesign): Promise<string | undefined> {
  if (!coverDesign) return undefined;
  
  // Priority 1: If we have uploaded/stored cover image data, use it
  if (coverDesign.coverImageData) {
    return coverDesign.coverImageData;
  }
  
  // Priority 2: If user uploaded a full cover (usePreMadeCover), don't generate
  if (coverDesign.usePreMadeCover) {
    return undefined; // Let the default title page show
  }
  
  // Priority 3: Generate from design parameters
  try {
    return await generateCoverImage(coverDesign);
  } catch (error) {
    console.error('Failed to generate cover image:', error);
    return undefined;
  }
}
