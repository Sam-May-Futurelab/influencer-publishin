// Contact Form Submission Handler
// For now, this will format and log the message. 
// You can integrate with services like Resend, SendGrid, or Nodemailer later.

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

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

    // Format the message for logging/email service
    const formattedMessage = {
      timestamp: new Date().toISOString(),
      name,
      email,
      subject,
      category,
      message,
      userAgent: req.headers['user-agent'],
      ip: req.headers['x-forwarded-for'] || req.connection?.remoteAddress,
    };

    // Log the contact form submission
    console.log('📧 New Contact Form Submission:', JSON.stringify(formattedMessage, null, 2));

    // TODO: Integrate with email service
    // Examples:
    // - Resend: await resend.emails.send({ to: 'support@inkfluenceai.com', ... })
    // - SendGrid: await sgMail.send({ to: 'support@inkfluenceai.com', ... })
    // - Nodemailer with Gmail/SMTP
    
    // For now, we'll just return success
    // The logs will be available in Vercel dashboard for you to see submissions
    
    res.status(200).json({ 
      success: true, 
      message: 'Contact form submitted successfully',
      id: `contact_${Date.now()}`
    });

  } catch (error) {
    console.error('❌ Contact form submission error:', error);
    res.status(500).json({ 
      error: 'Failed to submit contact form', 
      details: error.message 
    });
  }
}