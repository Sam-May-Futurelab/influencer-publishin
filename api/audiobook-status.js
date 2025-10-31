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

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { projectId, chapterId } = req.query;

    if (!projectId || !chapterId) {
      return res.status(400).json({ 
        error: 'Missing required query params: projectId, chapterId' 
      });
    }

    // Check Firestore for audio URL (will be set by Inngest function when complete)
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
