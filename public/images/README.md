# Images Folder

This folder contains all static images for the InkfluenceAI platform.

## Logo Files

- **InkfluenceAILogo.png** - Main logo used in the header navigation
  - Recommended size: 200x200px or larger (square)
  - Format: PNG with transparency

## Favicon Files

Place your favicon files here with the following names:

- **favicon.ico** - Standard ICO format (16x16, 32x32, 48x48)
- **favicon-16x16.png** - 16x16 PNG favicon
- **favicon-32x32.png** - 32x32 PNG favicon  
- **apple-touch-icon.png** - 180x180 PNG for iOS devices

## Usage

All files in the `public` folder are served at the root level, so reference them as:
- `/images/InkfluenceAILogo.png`
- `/images/favicon-32x32.png`
- etc.

## Adding New Images

1. Place image files in this `/public/images` folder
2. Reference them in your components using `/images/filename.ext`
3. Images will be served as-is without processing by Vite
