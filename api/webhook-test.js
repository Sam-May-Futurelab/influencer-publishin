// Simple webhook test endpoint to verify Stripe can reach our server
export default async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, stripe-signature');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const timestamp = new Date().toISOString();
  
  console.log(`Webhook test endpoint hit at ${timestamp}`);
  console.log('Method:', req.method);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  
  if (req.method === 'GET') {
    return res.status(200).json({
      message: 'Webhook endpoint is accessible',
      timestamp,
      method: req.method,
      url: req.url,
      environment: process.env.NODE_ENV || 'development'
    });
  }
  
  if (req.method === 'POST') {
    const hasStripeSignature = !!req.headers['stripe-signature'];
    
    return res.status(200).json({
      message: 'POST request received',
      timestamp,
      hasStripeSignature,
      contentType: req.headers['content-type'],
      userAgent: req.headers['user-agent']
    });
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
};