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

export default async (req, res) => {
  // Enable CORS for webhook endpoint
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  
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

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    console.log('✅ Webhook signature verified for event:', event.type);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
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
          paymentStatus: session.payment_status
        });

        if (!userId) {
          console.error('❌ No firebaseUserId in session metadata');
          console.log('Session metadata:', JSON.stringify(session.metadata, null, 2));
          break;
        }

        try {
          const updateData = {
            isPremium: true,
            subscriptionStatus: 'premium',
            stripeCustomerId: session.customer,
            stripeSubscriptionId: session.subscription,
            subscriptionStartedAt: admin.firestore.FieldValue.serverTimestamp(),
            maxPages: -1, // Unlimited for premium
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          };

          await db.collection('users').doc(userId).set(updateData, { merge: true });

          console.log(`✅ User ${userId} upgraded to premium successfully`);
          console.log('Update data:', updateData);
        } catch (error) {
          console.error(`❌ Failed to upgrade user ${userId}:`, error);
          throw error; // Re-throw to trigger webhook retry
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const userId = subscription.metadata.firebaseUserId;

        if (userId) {
          const isActive = subscription.status === 'active';
          await db.collection('users').doc(userId).set({
            isPremium: isActive,
            subscriptionStatus: isActive ? 'premium' : subscription.status,
            stripeSubscriptionId: subscription.id,
          }, { merge: true });

          console.log(`📝 User ${userId} subscription updated: ${subscription.status}`);
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
