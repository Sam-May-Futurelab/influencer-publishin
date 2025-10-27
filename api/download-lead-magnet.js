// API endpoint to serve the lead magnet (free ebook template)

import { setCorsHeaders, handleCorsPreFlight } from './_cors.js';
import path from 'path';
import fs from 'fs';

export default async function handler(req, res) {
  // Handle CORS
  setCorsHeaders(req, res);
  if (handleCorsPreFlight(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Simple approach: just send a success page with download link
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Download Your Free Template</title>
        <meta charset="utf-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #f0e8f8 0%, #e2d1f0 100%);
          }
          .container {
            text-align: center;
            padding: 40px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            max-width: 500px;
          }
          h1 { color: #7a5f96; margin-bottom: 10px; }
          p { color: #666; margin-bottom: 30px; }
          .download-btn {
            display: inline-block;
            background: linear-gradient(135deg, #9b87b8 0%, #b89ed6 100%);
            color: white;
            padding: 16px 40px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            font-size: 18px;
            box-shadow: 0 4px 12px rgba(155, 135, 184, 0.3);
          }
          .download-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(155, 135, 184, 0.4);
          }
        </style>
        <script>
          // Auto-download after 1 second
          setTimeout(() => {
            window.location.href = '/templates/Ultimate-Ebook-Writing-Template.pdf';
          }, 1000);
        </script>
      </head>
      <body>
        <div class="container">
          <h1>🎉 Success!</h1>
          <p>Your download should start automatically. If it doesn't:</p>
          <a href="/templates/Ultimate-Ebook-Writing-Template.pdf" class="download-btn" download>
            📥 Click Here to Download
          </a>
          <p style="margin-top: 30px; font-size: 14px;">
            Check your email for the download link and welcome message!
          </p>
        </div>
      </body>
      </html>
    `;
    
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  } catch (error) {
    console.error('Lead magnet error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
}
