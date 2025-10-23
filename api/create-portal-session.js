// Stripe Customer Portal Session
// This creates a session for users to manage their subscription

import Stripe from 'stripe';
import { setCorsHeaders, handleCorsPreFlight } from './_cors.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async (req, res) => {
  // Handle CORS
  setCorsHeaders(req, res);
  if (handleCorsPreFlight(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    // Find customer by Firebase user ID
    const customers = await stripe.customers.list({
      limit: 1,
      metadata: {
        firebaseUserId: userId
      }
    });

    if (customers.data.length === 0) {
      return res.status(404).json({ error: 'No subscription found' });
    }

    const customer = customers.data[0];

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: `${process.env.FRONTEND_URL || req.headers.origin}/app`,
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe portal error:', error);
    res.status(500).json({ 
      error: 'Failed to create portal session',
      details: error.message 
    });
  }
};
