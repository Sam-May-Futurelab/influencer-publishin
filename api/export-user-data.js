// GDPR Data Export Endpoint
// Allows users to download all their personal data in JSON format
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

  try {
    const { userId } = req.body;

    // Validation
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    console.log(`📦 Starting data export for user: ${userId}`);

    // Collect all user data
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
        // Convert timestamps to readable format
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
      console.log('⚠️ No usage data found');
      exportData.data.usage = null;
    }

    // Add summary
    exportData.summary = {
      totalProjects: exportData.data.projects.length,
      totalSnippets: exportData.data.snippets.length,
      accountStatus: exportData.data.profile?.isPremium ? 'Premium' : 'Free',
    };

    console.log(`✅ Data export completed for user: ${userId}`);
    console.log(`   - Projects: ${exportData.summary.totalProjects}`);
    console.log(`   - Snippets: ${exportData.summary.totalSnippets}`);

    // Return as downloadable JSON
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="inkfluenceai-data-export-${userId}-${Date.now()}.json"`);
    
    return res.status(200).json(exportData);

  } catch (error) {
    console.error('❌ Data export error:', error);
    return res.status(500).json({ 
      error: 'Failed to export user data. Please contact support.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
