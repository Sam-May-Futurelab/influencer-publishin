/**
 * Compress an image to reduce file size for storage
 * Converts large images to optimized format suitable for Firestore
 */
export async function compressImage(
  dataUrl: string,
  maxWidth: number = 1600,
  maxHeight: number = 2560,
  quality: number = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      // Create canvas for compression
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }
      
      // Calculate new dimensions while maintaining aspect ratio
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }
      
      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to compressed JPEG (much smaller than PNG)
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      
      resolve(compressedDataUrl);
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = dataUrl;
  });
}

/**
 * Get the size of a base64 data URL in KB
 */
export function getDataUrlSize(dataUrl: string): number {
  // Remove data URL prefix to get just the base64 string
  const base64 = dataUrl.split(',')[1] || dataUrl;
  // Base64 encoding increases size by ~33%, so actual size is about 75% of string length
  const sizeInBytes = (base64.length * 3) / 4;
  return sizeInBytes / 1024; // Return size in KB
}

/**
 * Check if a data URL is within Firestore size limits
 * Firestore has a 1MB document limit, but we want to stay well under it
 */
export function isWithinSizeLimit(dataUrl: string, maxSizeKB: number = 400): boolean {
  return getDataUrlSize(dataUrl) <= maxSizeKB;
}

/**
 * Compress image until it's under the size limit
 * Progressively reduces quality if needed
 */
export async function compressToLimit(
  dataUrl: string,
  maxSizeKB: number = 400,
  minQuality: number = 0.5
): Promise<{ dataUrl: string; size: number; quality: number }> {
  let quality = 0.8;
  let compressed = dataUrl;
  let size = getDataUrlSize(dataUrl);
  
  // If already under limit, just ensure it's optimized
  if (size <= maxSizeKB) {
    compressed = await compressImage(dataUrl, 1600, 2560, quality);
    size = getDataUrlSize(compressed);
    
    if (size <= maxSizeKB) {
      return { dataUrl: compressed, size, quality };
    }
  }
  
  // Progressively reduce quality until under limit
  while (quality >= minQuality && size > maxSizeKB) {
    quality -= 0.1;
    compressed = await compressImage(dataUrl, 1600, 2560, quality);
    size = getDataUrlSize(compressed);
  }
  
  // If still too large, reduce dimensions
  if (size > maxSizeKB) {
    compressed = await compressImage(dataUrl, 1200, 1920, minQuality);
    size = getDataUrlSize(compressed);
  }
  
  return { dataUrl: compressed, size, quality };
}
