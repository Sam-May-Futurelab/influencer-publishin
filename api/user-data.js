// GDPR User Data Management Endpoint
// Handles both data export and deletion
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

export default async function handler(req, res) {
  // Handle CORS
  setCorsHeaders(req, res);
  if (handleCorsPreFlight(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action } = req.query; // 'export' or 'delete'

  if (action === 'export') {
    return handleExport(req, res);
  } else if (action === 'delete') {
    return handleDelete(req, res);
  } else {
    return res.status(400).json({ error: 'Invalid action. Use ?action=export or ?action=delete' });
  }
}

async function handleExport(req, res) {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    console.log(`📦 Starting data export for user: ${userId}`);

    const exportData = {
      exportDate: new Date().toISOString(),
      userId: userId,
      data: {}
    };

    // Get user profile
    const userDoc = await db.collection('users').doc(userId).get();
    if (userDoc.exists) {
      exportData.data.profile = {
        ...userDoc.data(),
        createdAt: userDoc.data().createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: userDoc.data().updatedAt?.toDate?.()?.toISOString() || null,
        lastLoginAt: userDoc.data().lastLoginAt?.toDate?.()?.toISOString() || null,
        subscriptionStartedAt: userDoc.data().subscriptionStartedAt?.toDate?.()?.toISOString() || null,
      };
    }

    // Get user's projects
    const projectsSnapshot = await db.collection('users').doc(userId).collection('projects').get();
    exportData.data.projects = projectsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
      };
    });

    // Get user's snippets
    const snippetsSnapshot = await db.collection('snippets').where('userId', '==', userId).get();
    exportData.data.snippets = snippetsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
      };
    });

    // Get usage tracking data
    try {
      const usageDoc = await db.collection('usage').doc(userId).get();
      if (usageDoc.exists) {
        const usageData = usageDoc.data();
        exportData.data.usage = {
          ...usageData,
          lastReset: usageData.lastReset?.toDate?.()?.toISOString() || null,
        };
      }
    } catch (error) {
      console.warn(`⚠️ Usage data unavailable for export: ${userId}`, error);
      exportData.data.usage = null;
    }

    exportData.summary = {
      totalProjects: exportData.data.projects.length,
      totalSnippets: exportData.data.snippets.length,
      accountStatus: exportData.data.profile?.isPremium ? 'Premium' : 'Free',
    };

    console.log(`✅ Data export completed for user: ${userId}`);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="inkfluenceai-data-export-${userId}-${Date.now()}.json"`);
    
    return res.status(200).json(exportData);

  } catch (error) {
    console.error('❌ Data export error:', error);
    return res.status(500).json({ 
      error: 'Failed to export user data',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

async function handleDelete(req, res) {
  try {
    const { userId, confirmationText } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

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

    // Delete user's snippets
    const snippetsSnapshot = await db.collection('snippets').where('userId', '==', userId).get();
    const snippetDeletePromises = snippetsSnapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(snippetDeletePromises);

    // Delete usage tracking data
    try {
      await db.collection('usage').doc(userId).delete();
    } catch (error) {
      console.warn(`ℹ️ No usage document to delete for user: ${userId}`, error);
    }

    // Delete user profile
    await db.collection('users').doc(userId).delete();

    // Log the deletion for compliance
    await db.collection('deletion_logs').add({
      userId,
      deletedAt: admin.firestore.FieldValue.serverTimestamp(),
      deletedData: {
        projects: projectsSnapshot.size,
        snippets: snippetsSnapshot.size,
        userProfile: true,
      }
    });

    console.log(`✅ Data deletion completed for user: ${userId}`);

    return res.status(200).json({ 
      success: true,
      message: 'All your data has been permanently deleted',
      deletedData: {
        projects: projectsSnapshot.size,
        snippets: snippetsSnapshot.size,
      }
    });

  } catch (error) {
    console.error('❌ Data deletion error:', error);
    return res.status(500).json({ 
      error: 'Failed to delete user data',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
