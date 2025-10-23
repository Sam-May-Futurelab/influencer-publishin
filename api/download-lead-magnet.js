// API endpoint to serve the lead magnet (free ebook template)
// This is a placeholder - you'll want to generate/store actual templates

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // For now, return a JSON response with instructions
    // In production, you'd serve an actual file or redirect to a storage URL
    const leadMagnetInfo = {
      title: 'Free Ebook Template & AI Prompts Pack',
      description: 'Your free resources have been sent to your email!',
      files: [
        {
          name: 'Professional Ebook Template.docx',
          type: 'Word Document',
          downloadUrl: '/templates/ebook-template.docx' // Update with actual URL
        },
        {
          name: 'Professional Ebook Template (Google Docs)',
          type: 'Google Docs',
          downloadUrl: 'https://docs.google.com/document/d/YOUR_TEMPLATE_ID/copy' // Update with actual URL
        },
        {
          name: '50 AI Writing Prompts.pdf',
          type: 'PDF Guide',
          downloadUrl: '/templates/ai-prompts.pdf' // Update with actual URL
        }
      ],
      message: 'Check your email for download links to all resources!'
    };

    res.status(200).json(leadMagnetInfo);
  } catch (error) {
    console.error('Lead magnet error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
}
