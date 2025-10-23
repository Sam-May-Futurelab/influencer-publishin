# 📥 Document Import Feature

## Overview
The new import feature allows users to import their existing documents from Google Docs, Microsoft Word, or plain text files directly into InkFluence AI projects.

## Features

### Supported Formats
- **.docx** - Microsoft Word & Google Docs exports
- **.txt** - Plain text files with chapter markers

### Automatic Chapter Detection
The importer automatically detects chapters from your document structure:

#### For .docx files:
- **Heading 1** → New Chapter
- **Heading 2/3** → Subheadings within chapters
- Regular text → Chapter content

#### For .txt files:
The following patterns trigger new chapters:
- `Chapter 1: Title`
- `# Title` (Markdown style)
- `1. Title` (Numbered list style)

### Formatting Preservation
The importer preserves:
- **Bold** text
- *Italic* text
- Bullet lists
- Numbered lists
- Paragraphs
- Line breaks

## How to Use

### For Users:

1. **Go to Dashboard** - Navigate to your main dashboard
2. **Click "Import Document"** - Find the Import File card in Quick Actions
3. **Select Your File** - Choose a .docx or .txt file
4. **Automatic Processing** - The system will:
   - Parse the document structure
   - Detect chapters from headings
   - Preserve formatting
   - Create a new project with all chapters

5. **Start Editing** - The imported project opens automatically, ready to edit

### From Google Docs:

1. **Open your Google Doc**
2. **File → Download → Microsoft Word (.docx)**
3. **Use the Import Feature** in InkFluence AI
4. **Your document is imported** with all chapters detected!

### Tips for Best Results:

✅ **DO:**
- Use **Heading 1** for chapter titles
- Use **Heading 2/3** for subheadings
- Keep consistent formatting
- Export as .docx from Google Docs

❌ **DON'T:**
- Use manual font sizing instead of heading styles
- Mix different chapter title formats
- Forget to use heading styles

## Technical Details

### Implementation Files:
- `src/lib/import.ts` - Core import logic
- `src/components/Dashboard.tsx` - UI components
- `src/App.tsx` - Integration with project management

### Dependencies:
- `mammoth` - .docx parsing library (zero cost, open source)

### Chapter Detection Algorithm:
1. Parse HTML from .docx using mammoth
2. Scan for H1 tags (Heading 1 styles)
3. Collect content between H1 tags
4. Create chapter objects with title + content
5. Preserve inline formatting (bold, italic, lists)

### Error Handling:
- Validates file type before processing
- Shows clear error messages for unsupported files
- Provides fallback for documents without headings
- Creates single chapter if no structure detected

## Examples

### Example 1: Standard Document
```
Heading 1: Introduction to Marketing
This is the introduction content...

Heading 1: Social Media Strategy  
Content about social media...

Heading 1: Email Marketing
Email marketing content...
```

**Result:** 3 chapters created automatically

### Example 2: Plain Text with Markers
```
Chapter 1: Getting Started
Welcome to this book...

Chapter 2: Advanced Techniques
Now let's dive deeper...
```

**Result:** 2 chapters with titles extracted

## Future Enhancements

### Phase 2 (Potential):
- Direct Google Docs API integration (no download needed)
- Google Drive file picker
- Markdown (.md) import
- HTML import
- Real-time sync with Google Docs
- Import from URL (public Google Docs)

## Testing

To test the feature:

1. Create a test .docx file with:
   - A title (Heading 1)
   - Some content
   - Another title (Heading 1)
   - More content

2. Export from Google Docs or save from Word

3. Import via the Dashboard

4. Verify:
   - ✅ Chapters are created correctly
   - ✅ Titles match heading text
   - ✅ Content is preserved
   - ✅ Formatting works (bold, italic)

## Support

Common issues and solutions:

**Q: My chapters aren't detected**
- A: Make sure you're using Heading 1 style, not just large text

**Q: Formatting looks weird**
- A: Complex Word formatting may not transfer perfectly. Use basic styles.

**Q: Can I import from Google Docs directly?**
- A: Currently, download as .docx first. Direct integration coming in Phase 2.

**Q: File upload fails**
- A: Check file size (should be under 10MB) and format (.docx or .txt only)
