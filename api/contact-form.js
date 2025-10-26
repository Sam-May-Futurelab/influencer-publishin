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
    const { name, email, subject, category, message, recaptchaToken } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !category || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Verify reCAPTCHA if token provided and secret key configured
    if (recaptchaToken && process.env.RECAPTCHA_SECRET_KEY) {
      const verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';
      const verifyResponse = await fetch(verifyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`,
      });

      const verifyData = await verifyResponse.json();
      
      if (!verifyData.success || verifyData.score < 0.5) {
        console.warn('⚠️ reCAPTCHA verification failed:', verifyData);
        return res.status(400).json({ error: 'reCAPTCHA verification failed. Please try again.' });
      }
      
      console.log(`✅ reCAPTCHA verified: score ${verifyData.score}`);
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
      const result = await resend.emails.send({
        from: 'InkFluence AI <noreply@inkfluenceai.com>',
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

      if (result.error) {
        console.error('❌ Resend API Error:', result.error);
        throw new Error(`Resend API error: ${result.error.message || 'Unknown error'}`);
      }

      // Send confirmation email to customer
      const ticketId = `INK-${Date.now().toString(36).toUpperCase()}`;
      const confirmationResult = await resend.emails.send({
        from: 'InkFluence AI <hello@inkfluenceai.com>',
        to: email,
        subject: `✅ We received your message - ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #7a5f96; margin: 0;">InkFluence AI</h1>
              <p style="color: #666; margin-top: 5px;">AI-Powered Book Writing Platform</p>
            </div>

            <div style="background: #f0e8f8; border-left: 4px solid #9b87b8; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
              <h2 style="color: #7a5f96; margin-top: 0;">Message Received!</h2>
              <p style="color: #333; margin-bottom: 0;">
                Thank you for contacting us, <strong>${name}</strong>. We've received your message and will respond within 24 hours.
              </p>
            </div>

            <div style="background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
              <h3 style="color: #333; margin-top: 0; font-size: 16px;">Ticket Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666; font-size: 14px;">Reference Number:</td>
                  <td style="padding: 8px 0; color: #333; font-weight: bold; font-size: 14px;">${ticketId}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-size: 14px;">Category:</td>
                  <td style="padding: 8px 0; color: #333; font-size: 14px;">${category.charAt(0).toUpperCase() + category.slice(1)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-size: 14px;">Subject:</td>
                  <td style="padding: 8px 0; color: #333; font-size: 14px;">${subject}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-size: 14px;">Submitted:</td>
                  <td style="padding: 8px 0; color: #333; font-size: 14px;">${new Date().toLocaleString()}</td>
                </tr>
              </table>
            </div>

            <div style="background: #fff9e6; border: 1px solid #ffe066; border-radius: 8px; padding: 15px; margin-bottom: 30px;">
              <p style="margin: 0; color: #666; font-size: 14px;">
                <strong>💡 Tip:</strong> Keep this reference number handy if you need to follow up on your request.
              </p>
            </div>

            <div style="text-align: center; margin-bottom: 30px;">
              <p style="color: #666; margin-bottom: 15px;">In the meantime, check out our resources:</p>
              <a href="https://www.inkfluenceai.com/help" style="display: inline-block; background: #9b87b8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 5px;">Help Center</a>
              <a href="https://www.inkfluenceai.com/faq" style="display: inline-block; background: #7a5f96; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 5px;">FAQ</a>
            </div>

            <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; text-align: center; color: #999; font-size: 12px;">
              <p>This is an automated confirmation. Please do not reply to this email.</p>
              <p>Need immediate help? Email us at <a href="mailto:hello@inkfluenceai.com" style="color: #9b87b8;">hello@inkfluenceai.com</a></p>
              <p style="margin-top: 20px;">© 2025 InkFluence AI. All rights reserved.</p>
            </div>
          </div>
        `,
      });

      console.log(`✅ Contact form processed: ${ticketId} | To: ${email}`);
    } else {
      // Fallback: Just log if no API key (for local development)
      console.warn('⚠️ RESEND_API_KEY not found - email not sent');
      console.log('📧 Contact Form Submission:', {
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