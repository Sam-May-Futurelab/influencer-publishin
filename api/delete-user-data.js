// GDPR Data Deletion Endpoint
// Allows users to delete all their personal data from the platform
import admin from 'firebase-admin';
import { setCorsHeaders, handleCorsPreFlight } from './_cors.js';

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
const auth = admin.auth();

export default async function handler(req, res) {
  // Handle CORS
  setCorsHeaders(req, res);
  if (handleCorsPreFlight(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, confirmationText } = req.body;

    // Validation
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Security check: require explicit confirmation
    if (confirmationText !== 'DELETE MY DATA') {
      return res.status(400).json({ 
        error: 'Please type "DELETE MY DATA" to confirm deletion' 
      });
    }

    console.log(`🗑️ Starting data deletion for user: ${userId}`);

    // Delete user's projects
    const projectsSnapshot = await db.collection('users').doc(userId).collection('projects').get();
    const projectDeletePromises = projectsSnapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(projectDeletePromises);
    console.log(`✅ Deleted ${projectsSnapshot.size} projects`);

    // Delete user's snippets
    const snippetsSnapshot = await db.collection('snippets').where('userId', '==', userId).get();
    const snippetDeletePromises = snippetsSnapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(snippetDeletePromises);
    console.log(`✅ Deleted ${snippetsSnapshot.size} snippets`);

    // Delete usage tracking data
    try {
      await db.collection('usage').doc(userId).delete();
      console.log('✅ Deleted usage tracking data');
    } catch (error) {
      console.log('⚠️ No usage data to delete');
    }

    // Delete user profile
    await db.collection('users').doc(userId).delete();
    console.log('✅ Deleted user profile');

    // Delete Firebase Auth account
    try {
      await auth.deleteUser(userId);
      console.log('✅ Deleted Firebase Auth account');
    } catch (error) {
      console.error('⚠️ Error deleting auth account:', error.message);
      // Continue even if auth deletion fails (user might be already deleted)
    }

    // Log the deletion for compliance records (retain for legal purposes)
    await db.collection('deletion_logs').add({
      userId,
      deletedAt: admin.firestore.FieldValue.serverTimestamp(),
      deletedData: {
        projects: projectsSnapshot.size,
        snippets: snippetsSnapshot.size,
        userProfile: true,
        authAccount: true
      }
    });

    console.log(`✅ Data deletion completed for user: ${userId}`);

    return res.status(200).json({ 
      success: true,
      message: 'All your data has been permanently deleted from our systems.',
      deletedData: {
        projects: projectsSnapshot.size,
        snippets: snippetsSnapshot.size,
        userProfile: true
      }
    });

  } catch (error) {
    console.error('❌ Data deletion error:', error);
    return res.status(500).json({ 
      error: 'Failed to delete user data. Please contact support.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
