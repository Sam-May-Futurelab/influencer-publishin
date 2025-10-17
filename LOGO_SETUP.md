# Logo & Favicon Setup Instructions

## 📁 File Locations

All your images should be placed in: `/public/images/`

## 🎨 Required Files

### 1. Main Logo
- **File**: `InkfluenceAILogo.png`
- **Location**: `/public/images/InkfluenceAILogo.png`
- **Recommended Size**: 200x200px (square) or larger
- **Format**: PNG with transparent background
- **Usage**: Displays in the header navigation

### 2. Favicons (Browser Tab Icons)

#### Standard Favicons
- **favicon.ico** - Place in `/public/favicon.ico` (root of public folder)
  - Multi-resolution ICO file (16x16, 32x32, 48x48)
  
- **favicon-16x16.png** - `/public/images/favicon-16x16.png`
  - 16x16 PNG
  
- **favicon-32x32.png** - `/public/images/favicon-32x32.png`
  - 32x32 PNG

#### Apple Touch Icon
- **apple-touch-icon.png** - `/public/images/apple-touch-icon.png`
  - 180x180 PNG
  - Used when users add your site to iOS home screen

## 📝 Steps to Add Your Images

1. **Copy your logo file** to:
   ```
   /public/images/InkfluenceAILogo.png
   ```

2. **Copy your favicon files** to:
   ```
   /public/favicon.ico
   /public/images/favicon-16x16.png
   /public/images/favicon-32x32.png
   /public/images/apple-touch-icon.png
   ```

3. **Restart your dev server** (if running) to see the changes

## ✅ What's Already Configured

- ✅ Header component updated to use your logo
- ✅ HTML updated with favicon links
- ✅ Public folder structure created
- ✅ Proper file paths configured

## 🔄 After Adding Files

The changes will be visible immediately:
- **Logo**: In the top-left corner of the header
- **Favicon**: In browser tabs, bookmarks, and history

## 💡 Tips

- Use PNG format with transparency for the logo
- Ensure favicons are crisp at small sizes
- Test on both light and dark themes
- Consider using a favicon generator tool if needed

## 🛠️ Favicon Generator Tools

If you need to create favicons from your logo:
- [Favicon.io](https://favicon.io/)
- [RealFaviconGenerator](https://realfavicongenerator.net/)

These tools can generate all required sizes from a single image.
