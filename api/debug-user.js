// Manual user profile refresh endpoint for debugging payment issues
import admin from 'firebase-admin';

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
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId parameter required' });
    }

    try {
      // Get user profile from Firestore
      const userDoc = await db.collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userData = userDoc.data();
      
      return res.status(200).json({
        userId: userId,
        profile: userData,
        isPremium: userData.isPremium,
        subscriptionStatus: userData.subscriptionStatus,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'POST') {
    const { userId, forcePremium } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId required' });
    }

    try {
      if (forcePremium) {
        // Manually upgrade user to premium (for debugging)
        await db.collection('users').doc(userId).set({
          isPremium: true,
          subscriptionStatus: 'premium',
          maxPages: -1,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });

        return res.status(200).json({
          message: 'User manually upgraded to premium',
          userId: userId,
          timestamp: new Date().toISOString()
        });
      }

      return res.status(400).json({ error: 'No action specified' });
    } catch (error) {
      console.error('Error updating user:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};