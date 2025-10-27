// API endpoint to serve the lead magnet (free ebook template)
// This is a placeholder - you'll want to generate/store actual templates

import { setCorsHeaders, handleCorsPreFlight } from './_cors.js';

export default async function handler(req, res) {
  // Handle CORS
  setCorsHeaders(req, res);
  if (handleCorsPreFlight(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const leadMagnetInfo = {
      title: 'Ultimate Ebook Writing Template',
      description: 'Your free ebook template is ready to download!',
      files: [
        {
          name: 'Ultimate Ebook Writing Template.pdf',
          type: 'PDF Template',
          downloadUrl: '/templates/Ultimate-Ebook-Writing-Template.pdf'
        }
      ],
      message: 'Download your professionally designed ebook template below!'
    };

    res.status(200).json(leadMagnetInfo);
  } catch (error) {
    console.error('Lead magnet error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
}
