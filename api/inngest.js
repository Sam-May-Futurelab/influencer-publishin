import { serve } from 'inngest/next';
import { Inngest } from 'inngest';
import OpenAI from 'openai';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

// Initialize Inngest client
const inngest = new Inngest({ 
  id: 'inkfluence-ai',
  name: 'Inkfluence AI'
});

// Initialize Firebase Admin
if (getApps().length === 0) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : undefined;

  if (serviceAccount) {
    initializeApp({
      credential: cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
  }
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper functions
function splitIntoChunks(text, maxLength = 3800) {
  if (text.length <= maxLength) return [text];
  
  const chunks = [];
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  let currentChunk = '';
  
  for (const sentence of sentences) {
    if ((currentChunk + sentence).length <= maxLength) {
      currentChunk += sentence;
    } else {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = sentence;
    }
  }
  
  if (currentChunk) chunks.push(currentChunk.trim());
  return chunks;
}

function cleanTextForTTS(text) {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

// Audiobook generation function
const generateAudiobook = inngest.createFunction(
  {
    id: 'audiobook-generation',
    name: 'Generate Audiobook Chapter',
  },
  { event: 'audiobook/generate.requested' },
  async ({ event, step }) => {
    const { userId, projectId, projectTitle, chapterId, chapterTitle, text, voice, quality = 'standard' } = event.data;

    console.log(`[Inngest] Starting audiobook generation for chapter: ${chapterTitle}`);

    const cleanedText = await step.run('clean-text', async () => {
      return cleanTextForTTS(text);
    });

    const audioUrl = await step.run('generate-and-upload-audio', async () => {
      const textChunks = splitIntoChunks(cleanedText);
      console.log(`[Inngest] Split into ${textChunks.length} chunk(s)`);
      
      const audioBuffers = [];
      for (let i = 0; i < textChunks.length; i++) {
        const response = await openai.audio.speech.create({
          model: quality === 'premium' ? 'tts-1-hd' : 'tts-1',
          voice: voice,
          input: textChunks[i],
        });

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        audioBuffers.push(buffer);
      }
      
      const finalAudio = audioBuffers.length === 1 
        ? audioBuffers[0] 
        : Buffer.concat(audioBuffers);
      
      // Upload to Firebase Storage
      const adminDb = getFirestore();
      const adminStorage = getStorage();
      const fileName = `audiobooks/${userId}/${projectId}/${chapterId}.mp3`;
      const bucket = adminStorage.bucket();
      const file = bucket.file(fileName);
      
      await file.save(finalAudio, {
        contentType: 'audio/mpeg',
      });
      
      await file.makePublic();
      
      const downloadUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
      
      // Save to Firestore
      await adminDb.collection('audiobooks').doc(`${projectId}_${chapterId}`).set({
        audioUrl: downloadUrl,
        audioSize: finalAudio.length,
        chapterId,
        chapterTitle,
        projectId,
        projectTitle,
        userId,
        completedAt: new Date().toISOString(),
      });
      
      // Update usage
      const userRef = adminDb.collection('users').doc(userId);
      const userDoc = await userRef.get();
      const currentUsage = userDoc.data()?.audiobookChaptersUsed || 0;
      await userRef.update({
        audiobookChaptersUsed: currentUsage + 1,
      });
      
      return { downloadUrl, audioSize: finalAudio.length };
    });

    return {
      success: true,
      audioUrl: audioUrl.downloadUrl,
      chapterId,
      chapterTitle,
      audioSize: audioUrl.audioSize,
    };
  }
);

// Serve the Inngest API endpoint
export default serve({
  client: inngest,
  functions: [
    generateAudiobook,
  ],
});
