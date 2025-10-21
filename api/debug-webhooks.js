// Debug webhook endpoint to check if webhooks are being received
export default async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    // Return recent webhook events from environment or a simple status
    return res.status(200).json({
      message: 'Webhook debug endpoint active',
      timestamp: new Date().toISOString(),
      environment: {
        hasStripeSecret: !!process.env.STRIPE_SECRET_KEY,
        hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
        hasFirebaseConfig: !!(process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL),
      }
    });
  }

  // Log all webhook attempts
  console.log('=== WEBHOOK DEBUG ===');
  console.log('Method:', req.method);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body type:', typeof req.body);
  console.log('Body length:', req.body ? req.body.length || Object.keys(req.body).length : 0);
  
  if (req.method === 'POST') {
    try {
      // Try to parse as webhook event
      const sig = req.headers['stripe-signature'];
      console.log('Stripe signature present:', !!sig);
      
      if (sig) {
        console.log('This appears to be a Stripe webhook');
      } else {
        console.log('No Stripe signature - not a webhook');
      }
      
      res.status(200).json({ 
        received: true, 
        timestamp: new Date().toISOString(),
        hasSignature: !!sig
      });
    } catch (error) {
      console.error('Webhook debug error:', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};