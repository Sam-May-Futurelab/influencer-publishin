// Merge Audiobooks API
// Combines multiple MP3 files into one (Premium feature)
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { setCorsHeaders, handleCorsPreFlight } from './_cors.js';

// Initialize Firebase Admin
if (getApps().length === 0) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : undefined;

  if (serviceAccount) {
    initializeApp({
      credential: cert(serviceAccount),
    });
  } else {
    initializeApp();
  }
}

export default async function handler(req, res) {
  setCorsHeaders(req, res);
  
  if (req.method === 'OPTIONS') {
    return handleCorsPreFlight(req, res);
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, projectId, chapterIds, title } = req.body;

    if (!userId || !projectId || !chapterIds || !Array.isArray(chapterIds) || chapterIds.length < 2) {
      return res.status(400).json({ 
        error: 'Missing required fields or need at least 2 chapters to merge' 
      });
    }

    // Verify user is premium
    const adminDb = getFirestore();
    const userDoc = await adminDb.collection('users').doc(userId).get();
    const userData = userDoc.data();
    
    if (!userData?.isPremium && userData?.subscriptionStatus !== 'premium') {
      return res.status(403).json({ error: 'Premium subscription required to merge audiobooks' });
    }

    // Fetch all audiobook files
    const adminStorage = getStorage();
    const bucket = adminStorage.bucket();
    const audioBuffers = [];

    for (const chapterId of chapterIds) {
      const fileName = `audiobooks/${userId}/${projectId}/${chapterId}.mp3`;
      const file = bucket.file(fileName);
      
      const [exists] = await file.exists();
      if (!exists) {
        return res.status(404).json({ error: `Audio file not found for chapter: ${chapterId}` });
      }

      const [buffer] = await file.download();
      audioBuffers.push(buffer);
    }

    // Merge buffers
    const mergedBuffer = Buffer.concat(audioBuffers);

    // Upload merged file
    const mergedFileName = `audiobooks/${userId}/${projectId}/merged-${Date.now()}.mp3`;
    const mergedFile = bucket.file(mergedFileName);
    
    await mergedFile.save(mergedBuffer, {
      contentType: 'audio/mpeg',
    });

    await mergedFile.makePublic();

    const downloadUrl = `https://storage.googleapis.com/${bucket.name}/${mergedFileName}`;

    // Save merged audiobook to Firestore
    const mergedId = `${projectId}_merged_${Date.now()}`;
    await adminDb.collection('audiobooks').doc(mergedId).set({
      audioUrl: downloadUrl,
      audioSize: mergedBuffer.length,
      chapterId: mergedId,
      chapterTitle: title || 'Merged Audiobook',
      projectId,
      userId,
      isMerged: true,
      mergedChapters: chapterIds,
      completedAt: new Date().toISOString(),
    });

    return res.status(200).json({
      success: true,
      audioUrl: downloadUrl,
      audioSize: mergedBuffer.length,
      mergedId
    });

  } catch (error) {
    console.error('[Merge Audiobooks] Error:', error);
    return res.status(500).json({ 
      error: 'Failed to merge audiobooks',
      details: error.message 
    });
  }
}
