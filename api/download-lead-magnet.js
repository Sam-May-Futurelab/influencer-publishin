// API endpoint to serve the lead magnet (free ebook template)

import { setCorsHeaders, handleCorsPreFlight } from './_cors.js';

export default async function handler(req, res) {
  // Handle CORS
  setCorsHeaders(req, res);
  if (handleCorsPreFlight(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Redirect to the actual PDF file
    res.redirect(307, '/templates/Ultimate-Ebook-Writing-Template.pdf');
  } catch (error) {
    console.error('Lead magnet error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
}
