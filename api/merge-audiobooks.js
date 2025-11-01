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
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET
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
    const { userId, projectId, chapterIds, title, projectTitle } = req.body;

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

    // Determine canonical chapter order so merged audio plays correctly
    let orderedChapterIds = [...chapterIds];
    const selectionOrder = [...chapterIds];
    let resolvedProjectTitle = typeof projectTitle === 'string' && projectTitle.trim() ? projectTitle.trim() : '';
    let projectData = null;
    try {
      const projectSnap = await adminDb
        .collection('users')
        .doc(userId)
        .collection('projects')
        .doc(projectId)
        .get();

      if (projectSnap.exists) {
        projectData = projectSnap.data() || {};
        const chapters = Array.isArray(projectData.chapters) ? projectData.chapters : [];
        const orderMap = new Map();

        chapters.forEach((chapter, index) => {
          if (!chapter?.id) return;
          const orderValue = typeof chapter.order === 'number' ? chapter.order : index;
          orderMap.set(chapter.id, orderValue);
        });

        orderedChapterIds.sort((a, b) => {
          const orderA = orderMap.has(a) ? orderMap.get(a) : Number.MAX_SAFE_INTEGER;
          const orderB = orderMap.has(b) ? orderMap.get(b) : Number.MAX_SAFE_INTEGER;

          if (orderA === orderB) {
            return selectionOrder.indexOf(a) - selectionOrder.indexOf(b);
          }

          return orderA - orderB;
        });

        if (!resolvedProjectTitle) {
          const docTitle = typeof projectData.title === 'string' ? projectData.title.trim() : '';
          if (docTitle) {
            resolvedProjectTitle = docTitle;
          }
        }
      }
    } catch (orderError) {
      console.warn('[Merge] Failed to resolve chapter order, using selection order.', orderError);
    }

    const finalTitle = typeof title === 'string' && title.trim().length > 0
      ? title.trim()
      : (resolvedProjectTitle ? `${resolvedProjectTitle} - Full Audiobook` : 'Merged Audiobook');

    // Fetch all audiobook files
    const adminStorage = getStorage();
    const bucket = adminStorage.bucket();
    
    console.log('[Merge] Starting merge for project:', projectId);
    console.log('[Merge] Chapter IDs (requested):', chapterIds);
    console.log('[Merge] Chapter IDs (ordered):', orderedChapterIds);
    console.log('[Merge] Final title:', finalTitle);
    
    const audioBuffers = [];

    for (const chapterId of orderedChapterIds) {
      const fileName = `audiobooks/${userId}/${projectId}/${chapterId}.mp3`;
      console.log('[Merge] Fetching file:', fileName);
      const file = bucket.file(fileName);
      
      const [exists] = await file.exists();
      if (!exists) {
        console.error('[Merge] File not found:', fileName);
        return res.status(404).json({ error: `Audio file not found for chapter: ${chapterId}` });
      }

      const [buffer] = await file.download();
      console.log('[Merge] Downloaded:', fileName, 'Size:', buffer.length);
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
    const storedProjectTitle = resolvedProjectTitle || (projectData && typeof projectData.title === 'string' ? projectData.title : undefined);

    await adminDb.collection('audiobooks').doc(mergedId).set({
      audioUrl: downloadUrl,
      audioSize: mergedBuffer.length,
      chapterId: mergedId,
      chapterTitle: finalTitle,
      projectId,
      userId,
      isMerged: true,
      mergedChapters: orderedChapterIds,
      projectTitle: storedProjectTitle || null,
      completedAt: new Date().toISOString(),
    });

    return res.status(200).json({
      success: true,
      audioUrl: downloadUrl,
      audioSize: mergedBuffer.length,
      mergedId,
      title: finalTitle,
      projectTitle: storedProjectTitle || null,
    });

  } catch (error) {
    console.error('[Merge Audiobooks] Error:', error);
    return res.status(500).json({ 
      error: 'Failed to merge audiobooks',
      details: error.message 
    });
  }
}
