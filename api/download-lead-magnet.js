// API endpoint to serve the lead magnet (free ebook template)

import { setCorsHeaders, handleCorsPreFlight } from './_cors.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function handler(req, res) {
  // Handle CORS
  setCorsHeaders(req, res);
  if (handleCorsPreFlight(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Serve the PDF file directly
    const pdfPath = path.join(__dirname, 'Ultimate-Ebook-Writing-Template.pdf');
    const pdfBuffer = fs.readFileSync(pdfPath);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="Ultimate-Ebook-Writing-Template.pdf"');
    res.setHeader('Content-Length', pdfBuffer.length);
    res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error('Lead magnet error:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
}
