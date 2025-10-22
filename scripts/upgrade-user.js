// Manual user upgrade script for Firebase
const admin = require('firebase-admin');

// Initialize Firebase Admin with your credentials
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function upgradeUser(userId) {
  try {
    const updateData = {
      isPremium: true,
      subscriptionStatus: 'premium',
      maxPages: -1, // Unlimited for premium
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      manualUpgrade: true, // Flag to indicate this was manually upgraded
    };

    await db.collection('users').doc(userId).set(updateData, { merge: true });
    
    console.log(`✅ User ${userId} upgraded to premium successfully!`);
    console.log('Update data:', updateData);
    
    // Verify the update
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    console.log('Updated user data:', userData);
    
  } catch (error) {
    console.error('❌ Error upgrading user:', error);
  }
  
  process.exit(0);
}

// Your Firebase user ID
const userId = 'FxpvbfOVfyM7zKVEdw8Ur2xD0Yq1';
upgradeUser(userId);