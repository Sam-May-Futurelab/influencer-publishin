import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

// Initialize Firebase Admin (serverless-friendly - only once)
if (getApps().length === 0) {
  // For Vercel, we'll use the JSON credentials from environment variable
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : undefined;

  if (serviceAccount) {
    initializeApp({
      credential: cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
  } else {
    // Fallback for local development or if using default credentials
    initializeApp({
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
  }
}

export const adminDb = getFirestore();
export const adminStorage = getStorage();
