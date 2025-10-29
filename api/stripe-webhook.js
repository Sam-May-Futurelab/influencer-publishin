// Stripe Webhook Handler
// This handles Stripe events and updates Firebase accordingly

import Stripe from 'stripe';
import admin from 'firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

// Disable automatic body parsing for Stripe webhooks
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper to get raw body
async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => {
      data += chunk;
    });
    req.on('end', () => {
      resolve(Buffer.from(data));
    });
    req.on('error', err => {
      reject(err);
    });
  });
}

export default async (req, res) => {
  // Enable CORS for webhook endpoint
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Log all webhook attempts for debugging
  console.log('=== STRIPE WEBHOOK RECEIVED ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Headers:', JSON.stringify(req.headers, null, 2));

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not configured');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  if (!sig) {
    console.error('No stripe-signature header found');
    return res.status(400).json({ error: 'Missing stripe-signature header' });
  }

  let event;
  let body;

  try {
    // Get raw body for Stripe signature verification
    body = await getRawBody(req);
    
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    console.log('✅ Webhook signature verified for event:', event.type);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    console.error('Body type:', typeof body, 'Length:', body ? body.length : 0);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.firebaseUserId;

        console.log('Processing checkout.session.completed:', {
          sessionId: session.id,
          userId: userId,
          customer: session.customer,
          subscription: session.subscription,
          mode: session.mode,
          paymentStatus: session.payment_status,
          metadata: session.metadata
        });

        if (!userId) {
          console.error('❌ No firebaseUserId in session metadata');
          console.log('Session metadata:', JSON.stringify(session.metadata, null, 2));
          return res.status(400).json({ error: 'No firebaseUserId in session metadata' });
        }

        try {
          // Test Firebase connection first
          console.log('Testing Firebase connection...');
          const testDoc = db.collection('test').doc('connection');
          await testDoc.get();
          console.log('✅ Firebase connection OK');

          // Get subscription details to determine tier
          let subscriptionStatus = 'premium';
          let maxPages = -1; // Unlimited for premium
          
          if (session.subscription) {
            const subscription = await stripe.subscriptions.retrieve(session.subscription);
            const priceId = subscription.items.data[0]?.price.id;
            
            // Check if it's Creator tier
            const creatorMonthlyPriceId = process.env.VITE_STRIPE_CREATOR_MONTHLY_PRICE_ID;
            const creatorYearlyPriceId = process.env.VITE_STRIPE_CREATOR_YEARLY_PRICE_ID;
            
            if (priceId === creatorMonthlyPriceId || priceId === creatorYearlyPriceId) {
              subscriptionStatus = 'creator';
              maxPages = 20;
              console.log('✅ Detected Creator tier subscription');
            } else {
              console.log('✅ Detected Premium tier subscription');
            }
          }

          const updateData = {
            isPremium: subscriptionStatus === 'premium' || subscriptionStatus === 'creator',
            subscriptionStatus: subscriptionStatus,
            stripeCustomerId: session.customer,
            stripeSubscriptionId: session.subscription,
            subscriptionStartedAt: admin.firestore.FieldValue.serverTimestamp(),
            maxPages: maxPages,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          };

          console.log(`Updating user ${userId} with data:`, updateData);
          await db.collection('users').doc(userId).set(updateData, { merge: true });

          console.log(`✅ User ${userId} upgraded to ${subscriptionStatus} successfully`);
        } catch (error) {
          console.error(`❌ Failed to upgrade user ${userId}:`, error);
          console.error('Error details:', {
            name: error.name,
            message: error.message,
            code: error.code,
            stack: error.stack
          });
          return res.status(500).json({ 
            error: 'Failed to upgrade user', 
            details: error.message,
            userId: userId 
          });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const userId = subscription.metadata.firebaseUserId;

        if (userId) {
          const isActive = subscription.status === 'active';
          const priceId = subscription.items.data[0]?.price.id;
          
          // Determine tier based on price ID
          let subscriptionStatus = 'premium';
          let maxPages = -1;
          
          const creatorMonthlyPriceId = process.env.VITE_STRIPE_CREATOR_MONTHLY_PRICE_ID;
          const creatorYearlyPriceId = process.env.VITE_STRIPE_CREATOR_YEARLY_PRICE_ID;
          
          if (priceId === creatorMonthlyPriceId || priceId === creatorYearlyPriceId) {
            subscriptionStatus = 'creator';
            maxPages = 20;
          }
          
          await db.collection('users').doc(userId).set({
            isPremium: isActive && (subscriptionStatus === 'premium' || subscriptionStatus === 'creator'),
            subscriptionStatus: isActive ? subscriptionStatus : 'free',
            stripeSubscriptionId: subscription.id,
            maxPages: isActive ? maxPages : 4,
          }, { merge: true });

          console.log(`📝 User ${userId} subscription updated: ${subscription.status} (${subscriptionStatus})`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const userId = subscription.metadata.firebaseUserId;

        if (userId) {
          await db.collection('users').doc(userId).set({
            isPremium: false,
            subscriptionStatus: 'free',
            subscriptionEndedAt: admin.firestore.FieldValue.serverTimestamp(),
          }, { merge: true });

          console.log(`❌ User ${userId} subscription canceled`);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        console.log(`💰 Payment succeeded for customer ${invoice.customer}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        console.log(`❌ Payment failed for customer ${invoice.customer}`);
        // Could send email notification here
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({ error: 'Webhook handler failed', details: error.message });
  }
};
