// Newsletter Signup Handler with Resend Email Integration
import { Resend } from 'resend';
import validator from 'validator';
import { setCorsHeaders, handleCorsPreFlight } from './_cors.js';

export default async function handler(req, res) {
  // Handle CORS
  setCorsHeaders(req, res);
  if (handleCorsPreFlight(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, wantsLeadMagnet, recaptchaToken } = req.body;

    // Validate required fields
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Sanitize inputs
    const sanitizedName = name ? validator.escape(name.trim()) : '';
    const sanitizedEmail = validator.normalizeEmail(email.trim()) || email.trim();

    // Validate email format using validator
    if (!validator.isEmail(sanitizedEmail)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Length validation
    if (sanitizedName.length > 100) {
      return res.status(400).json({ error: 'Name exceeds maximum length' });
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

    const subscriberName = sanitizedName || 'Valued Reader';

    // Initialize Resend (only if API key exists)
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);

      // Send notification to admin
      await resend.emails.send({
        from: 'InkFluence AI <noreply@inkfluenceai.com>',
        to: process.env.CONTACT_EMAIL || 'hello@inkfluenceai.com',
        replyTo: sanitizedEmail,
        subject: `📬 New Newsletter Subscriber${wantsLeadMagnet ? ' + Lead Magnet Request' : ''}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7a5f96; border-bottom: 2px solid #9b87b8; padding-bottom: 10px;">
              📬 New Newsletter Subscriber
            </h2>
            
            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Name:</strong> ${subscriberName}</p>
              <p><strong>Email:</strong> <a href="mailto:${sanitizedEmail}">${sanitizedEmail}</a></p>
              <p><strong>Lead Magnet Requested:</strong> ${wantsLeadMagnet ? 'Yes ✅' : 'No'}</p>
              <p><strong>Subscribed:</strong> ${new Date().toLocaleString()}</p>
            </div>

            ${wantsLeadMagnet ? `
            <div style="background: #fff9e6; border-left: 4px solid #9b87b8; padding: 15px; margin: 20px 0;">
              <p style="margin: 0;"><strong>🎁 Action Required:</strong> Send the free ebook template to this subscriber.</p>
            </div>
            ` : ''}

            <p style="text-align: center; color: #999; font-size: 12px; margin-top: 30px;">
              Newsletter Signup via InkFluence AI
            </p>
          </div>
        `,
      });

      // Send welcome email to subscriber
      const welcomeResult = await resend.emails.send({
        from: 'InkFluence AI <hello@inkfluenceai.com>',
        to: sanitizedEmail,
        subject: wantsLeadMagnet 
          ? '🎉 Welcome to InkFluence AI + Your Free Ebook Template!'
          : '🎉 Welcome to InkFluence AI Newsletter!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #7a5f96; margin: 0;">InkFluence AI</h1>
              <p style="color: #666; margin-top: 5px;">AI-Powered Book Writing Platform</p>
            </div>

            <div style="background: linear-gradient(135deg, #f0e8f8 0%, #e2d1f0 100%); border-radius: 12px; padding: 30px; text-align: center; margin-bottom: 30px;">
              <h2 style="color: #7a5f96; margin-top: 0; font-size: 28px;">Welcome, ${subscriberName}! 🎉</h2>
              <p style="color: #333; font-size: 16px; line-height: 1.6;">
                Thank you for joining our community of aspiring authors and content creators!
              </p>
            </div>

            ${wantsLeadMagnet ? `
            <div style="background: #fff; border: 2px solid #9b87b8; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
              <h3 style="color: #7a5f96; margin-top: 0; display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 24px;">🎁</span> Your Free Ebook Template
              </h3>
              <p style="color: #333; margin-bottom: 20px;">
                We're preparing your free professional ebook template package! You'll receive a follow-up email shortly with:
              </p>
              <ul style="color: #333; line-height: 2;">
                <li>Professional ebook template (Word + Google Docs)</li>
                <li>50+ AI prompts for ebook writing</li>
                <li>Quick start guide</li>
              </ul>
              <p style="background: #f0e8f8; padding: 15px; border-radius: 8px; margin-top: 20px; color: #555;">
                <strong>⏱️ Coming soon:</strong> Check your inbox in the next few minutes for your download links!
              </p>
            </div>
            ` : ''}

            <div style="background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
              <h3 style="color: #333; margin-top: 0; font-size: 18px;">📚 What to Expect</h3>
              <div style="color: #666; line-height: 1.8;">
                <p><strong style="color: #7a5f96;">Weekly Tips:</strong> AI-powered writing strategies, ebook creation guides, and publishing insights</p>
                <p><strong style="color: #7a5f96;">Exclusive Content:</strong> Early access to new features and insider tips</p>
                <p><strong style="color: #7a5f96;">Success Stories:</strong> Learn from authors who've published with InkFluence AI</p>
              </div>
            </div>

            <div style="text-align: center; margin-bottom: 30px;">
              <p style="color: #666; margin-bottom: 15px;">Ready to start writing your book?</p>
              <a href="https://www.inkfluenceai.com/dashboard" style="display: inline-block; background: linear-gradient(135deg, #9b87b8 0%, #b89ed6 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Start Writing Free</a>
            </div>

            <div style="background: #f9f9f9; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
              <p style="color: #666; margin: 0; font-size: 14px; text-align: center;">
                <strong>Quick Links:</strong>
                <a href="https://www.inkfluenceai.com/blog" style="color: #9b87b8; margin: 0 10px;">Blog</a> •
                <a href="https://www.inkfluenceai.com/help" style="color: #9b87b8; margin: 0 10px;">Help Center</a> •
                <a href="https://www.inkfluenceai.com/templates" style="color: #9b87b8; margin: 0 10px;">Templates</a>
              </p>
            </div>

            <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; text-align: center; color: #999; font-size: 12px;">
              <p>You're receiving this because you subscribed to InkFluence AI newsletter.</p>
              <p>Not interested anymore? <a href="mailto:hello@inkfluenceai.com?subject=Unsubscribe" style="color: #9b87b8;">Unsubscribe here</a></p>
              <p style="margin-top: 20px;">© 2025 InkFluence AI. All rights reserved.</p>
            </div>
          </div>
        `,
      });

      if (welcomeResult.error) {
        console.error('❌ Resend API Error:', welcomeResult.error);
        throw new Error(`Resend API error: ${welcomeResult.error.message || 'Unknown error'}`);
      }

      console.log(`✅ Newsletter signup processed: ${email} | Lead Magnet: ${wantsLeadMagnet}`);
    } else {
      // Fallback: Just log if no API key (for local development)
      console.warn('⚠️ RESEND_API_KEY not found - email not sent');
      console.log('📬 Newsletter Signup:', {
        name: subscriberName,
        email,
        wantsLeadMagnet,
      });
    }

    res.status(200).json({ 
      success: true, 
      message: wantsLeadMagnet 
        ? 'Welcome! Check your email for your free ebook template.'
        : 'Welcome! You\'ve been added to our newsletter.',
    });

  } catch (error) {
    console.error('❌ Newsletter signup error:', error);
    res.status(500).json({ 
      error: 'Failed to process signup. Please try again later.',
    });
  }
}
