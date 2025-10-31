// Audiobook Management Endpoint
// Handles audiobook generation queuing and status checking
import { inngest } from '../src/lib/inngest-client';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import Cors from 'cors';

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

const cors = Cors({
  methods: ['POST', 'GET', 'HEAD', 'OPTIONS'],
  origin: true,
  credentials: true,
});

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { action } = req.query; // 'queue' or 'status'

  if (action === 'queue' && req.method === 'POST') {
    return handleQueue(req, res);
  } else if (action === 'status' && req.method === 'GET') {
    return handleStatus(req, res);
  } else {
    return res.status(400).json({ error: 'Invalid action. Use ?action=queue (POST) or ?action=status (GET)' });
  }
}

async function handleQueue(req, res) {
  try {
    const { userId, projectId, chapterId, chapterTitle, text, voice, quality } = req.body;

    if (!userId || !projectId || !chapterId || !text || !voice) {
      return res.status(400).json({ 
        error: 'Missing required fields: userId, projectId, chapterId, text, voice' 
      });
    }

    console.log(`[Audiobook Queue] Triggering generation for chapter: ${chapterTitle}`);

    // Send event to Inngest - this returns immediately
    const { ids } = await inngest.send({
      name: 'audiobook/generate.requested',
      data: {
        userId,
        projectId,
        chapterId,
        chapterTitle,
        text,
        voice,
        quality: quality || 'standard',
      },
    });

    console.log(`[Audiobook Queue] Job queued with ID: ${ids[0]}`);

    // Return immediately with job ID
    res.status(202).json({
      success: true,
      jobId: ids[0],
      message: 'Audiobook generation started',
    });

  } catch (error) {
    console.error('[Audiobook Queue] Error:', error);
    res.status(500).json({ 
      error: 'Failed to queue audiobook generation',
      details: error.message 
    });
  }
}

async function handleStatus(req, res) {
  try {
    const { projectId, chapterId } = req.query;

    if (!projectId || !chapterId) {
      return res.status(400).json({ 
        error: 'Missing required query params: projectId, chapterId' 
      });
    }

    // Check Firestore for audio URL (set by Inngest function when complete)
    const db = getFirestore();
    const audioRef = db.collection('audiobooks').doc(`${projectId}_${chapterId}`);
    const audioDoc = await audioRef.get();

    if (!audioDoc.exists) {
      return res.status(200).json({
        status: 'processing',
        message: 'Audiobook generation in progress',
      });
    }

    const data = audioDoc.data();
    
    if (data.audioUrl) {
      return res.status(200).json({
        status: 'completed',
        audioUrl: data.audioUrl,
        audioSize: data.audioSize,
        completedAt: data.completedAt,
      });
    }

    if (data.error) {
      return res.status(200).json({
        status: 'failed',
        error: data.error,
      });
    }

    return res.status(200).json({
      status: 'processing',
    });

  } catch (error) {
    console.error('[Audiobook Status] Error:', error);
    res.status(500).json({ 
      error: 'Failed to check audiobook status',
      details: error.message 
    });
  }
}
