// Contact Form Submission Handler with Resend Email Integration
import { Resend } from 'resend';
import { setCorsHeaders, handleCorsPreFlight } from './_cors.js';

export default async function handler(req, res) {
  // Handle CORS
  setCorsHeaders(req, res);
  if (handleCorsPreFlight(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, subject, category, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !category || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Get category emoji
    const categoryEmojis = {
      general: '💬',
      support: '🔧',
      feedback: '💡',
      business: '💼',
      feature: '✨',
      bug: '🐛'
    };
    const categoryEmoji = categoryEmojis[category] || '📧';

    // Initialize Resend (only if API key exists)
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);

      // Send email notification
      await resend.emails.send({
        from: 'InkFluence AI <noreply@send.inkfluenceai.com>',
        to: process.env.CONTACT_EMAIL || 'hello@inkfluenceai.com',
        replyTo: email,
        subject: `${categoryEmoji} Contact Form: ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7a5f96; border-bottom: 2px solid #9b87b8; padding-bottom: 10px;">
              ${categoryEmoji} New Contact Form Submission
            </h2>
            
            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Category:</strong> ${category.charAt(0).toUpperCase() + category.slice(1)}</p>
              <p><strong>From:</strong> ${name}</p>
              <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
              <p><strong>Subject:</strong> ${subject}</p>
            </div>

            <div style="background: white; padding: 20px; border-left: 4px solid #9b87b8; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #333;">Message:</h3>
              <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
            </div>

            <div style="background: #f0f0f0; padding: 15px; border-radius: 8px; font-size: 12px; color: #666;">
              <p style="margin: 5px 0;"><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
              <p style="margin: 5px 0;"><strong>User Agent:</strong> ${req.headers['user-agent'] || 'Unknown'}</p>
              <p style="margin: 5px 0;"><strong>IP:</strong> ${req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'Unknown'}</p>
            </div>

            <p style="text-align: center; color: #999; font-size: 12px; margin-top: 30px;">
              Sent via InkFluence AI Contact Form
            </p>
          </div>
        `,
      });

      console.log(`✅ Contact form email sent: ${name} (${email}) - ${subject}`);
    } else {
      // Fallback: Just log if no API key (for local development)
      console.log('📧 Contact Form Submission (no email sent - missing RESEND_API_KEY):', {
        name,
        email,
        subject,
        category,
        message,
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Thank you for contacting us! We\'ll get back to you soon.',
    });

  } catch (error) {
    console.error('❌ Contact form error:', error);
    res.status(500).json({ 
      error: 'Failed to submit contact form. Please try again later.',
    });
  }
}