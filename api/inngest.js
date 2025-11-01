import { serve } from 'inngest/next';
import { Inngest } from 'inngest';
import OpenAI from 'openai';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

// Initialize Inngest client with proper configuration
const inngest = new Inngest({ 
  id: 'inkfluence-ai',
  name: 'Inkfluence AI',
  eventKey: process.env.INNGEST_EVENT_KEY, // Required for production
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

const parseEnvInt = (value, fallback) => {
  const parsed = value ? Number.parseInt(value, 10) : Number.NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const CHUNK_CHAR_LIMIT = parseEnvInt(process.env.AUDIOBOOK_CHUNK_CHAR_LIMIT, 1500);
const PARALLEL_TTS_LIMIT = parseEnvInt(process.env.AUDIOBOOK_MAX_PARALLEL_TTS, 4);

// Helper functions
function splitIntoChunks(text, maxLength = CHUNK_CHAR_LIMIT) {
  const normalized = (text || '').replace(/\s+/g, ' ').trim();
  if (!normalized) return [];
  if (normalized.length <= maxLength) return [normalized];

  const chunks = [];
  let currentChunk = '';
  const sentences = normalized.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [normalized];

  const pushCurrent = () => {
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
      currentChunk = '';
    }
  };

  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    if (!trimmedSentence) continue;

    const candidate = `${currentChunk} ${trimmedSentence}`.trim();
    if (candidate.length <= maxLength) {
      currentChunk = candidate;
      continue;
    }

    if (trimmedSentence.length > maxLength) {
      pushCurrent();
      for (let i = 0; i < trimmedSentence.length; i += maxLength) {
        const slice = trimmedSentence.slice(i, i + maxLength).trim();
        if (slice.length) {
          chunks.push(slice);
        }
      }
      currentChunk = '';
    } else {
      pushCurrent();
      currentChunk = trimmedSentence;
    }
  }

  pushCurrent();
  return chunks;
}

function cleanTextForTTS(text) {
  return (text || '')
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

async function synthesizeChunksConcurrently(chunks, { model, voice, concurrency }) {
  const workerCount = Math.max(1, Math.min(concurrency, chunks.length));
  const results = new Array(chunks.length);
  let nextIndex = 0;

  const workers = Array.from({ length: workerCount }, (_, workerIndex) =>
    (async () => {
      while (true) {
        const currentIndex = nextIndex++;
        if (currentIndex >= chunks.length) break;

        const chunk = chunks[currentIndex];
        const buffer = await synthesizeChunk(chunk, {
          model,
          voice,
          chunkIndex: currentIndex,
          totalChunks: chunks.length,
          workerIndex,
        });

        results[currentIndex] = buffer;
      }
    })()
  );

  await Promise.all(workers);
  return results;
}

async function synthesizeChunk(chunk, context) {
  const { model, voice, chunkIndex, totalChunks, workerIndex } = context;
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const attemptStart = Date.now();
      console.log(
        `[Inngest] [Worker ${workerIndex + 1}] Synthesizing chunk ${chunkIndex + 1}/${totalChunks} (attempt ${attempt}, ${chunk.length} chars)`
      );

      const response = await openai.audio.speech.create({
        model,
        voice,
        input: chunk,
      });

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      console.log(
        `[Inngest] [Worker ${workerIndex + 1}] Completed chunk ${chunkIndex + 1}/${totalChunks} in ${Date.now() - attemptStart}ms, size: ${buffer.length} bytes`
      );
      return buffer;
    } catch (error) {
      console.error(
        `[Inngest] [Worker ${workerIndex + 1}] Failed chunk ${chunkIndex + 1}/${totalChunks} on attempt ${attempt}:`,
        error
      );

      if (attempt === maxAttempts) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
    }
  }

  throw new Error('Failed to synthesize audio chunk after retries.');
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

    const adminDb = getFirestore();
    const adminStorage = getStorage();
    const audioRef = adminDb.collection('audiobooks').doc(`${projectId}_${chapterId}`);

    try {
      await audioRef.set({
        status: 'processing',
        userId,
        projectId,
        projectTitle,
        chapterId,
        chapterTitle,
        queuedAt: new Date().toISOString(),
      }, { merge: true });

      const cleanedText = await step.run('clean-text', async () => {
        const cleaned = cleanTextForTTS(text);
        console.log(`[Inngest] Cleaned text length: ${cleaned.length}`);
        return cleaned;
      });

      if (!cleanedText) {
        throw new Error('No text available after cleaning for TTS synthesis.');
      }

      const audioUrl = await step.run('generate-and-upload-audio', async () => {
        const textChunks = splitIntoChunks(cleanedText);
        console.log(`[Inngest] Split into ${textChunks.length} chunk(s)`);

        if (textChunks.length === 0) {
          throw new Error('Unable to split text into chunks for synthesis.');
        }

        const model = quality === 'premium' || quality === 'hd' ? 'tts-1-hd' : 'tts-1';
        console.log(`[Inngest] Using model ${model} with concurrency ${PARALLEL_TTS_LIMIT}`);

        const audioBuffers = await synthesizeChunksConcurrently(textChunks, {
          model,
          voice,
          concurrency: PARALLEL_TTS_LIMIT,
        });

        const finalAudio = audioBuffers.length === 1 ? audioBuffers[0] : Buffer.concat(audioBuffers);
        console.log(`[Inngest] Final audio size: ${finalAudio.length} bytes`);

        const fileName = `audiobooks/${userId}/${projectId}/${chapterId}.mp3`;
        const bucket = adminStorage.bucket();
        const file = bucket.file(fileName);
        const uploadStart = Date.now();

        await file.save(finalAudio, {
          contentType: 'audio/mpeg',
          public: true,
          resumable: false,
          metadata: {
            metadata: {
              chapterId,
              chapterTitle,
              projectId,
              projectTitle,
              userId,
            },
          },
        });

        const downloadUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
        console.log(`[Inngest] Upload complete in ${Date.now() - uploadStart}ms: ${downloadUrl}`);

        return { downloadUrl, audioSize: finalAudio.length };
      });

      await step.run('update-usage-and-save', async () => {
        const userRef = adminDb.collection('users').doc(userId);
        await userRef.set({
          audiobookChaptersUsed: FieldValue.increment(1),
        }, { merge: true });

        await audioRef.set({
          status: 'completed',
          audioUrl: audioUrl.downloadUrl,
          audioSize: audioUrl.audioSize,
          chapterId,
          chapterTitle,
          projectId,
          projectTitle,
          userId,
          completedAt: new Date().toISOString(),
        }, { merge: true });
      });

      console.log(`[Inngest] ✅ Generation complete for chapter: ${chapterTitle}`);

      return {
        success: true,
        audioUrl: audioUrl.downloadUrl,
        chapterId,
        chapterTitle,
        audioSize: audioUrl.audioSize,
      };
    } catch (error) {
      console.error(`[Inngest] ❌ Generation failed for chapter: ${chapterTitle}`, error);

      await audioRef.set({
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        completedAt: new Date().toISOString(),
      }, { merge: true });

      throw error;
    }
  }
);

// Serve the Inngest API endpoint with signing key
export default serve({
  client: inngest,
  functions: [
    generateAudiobook,
  ],
  signingKey: process.env.INNGEST_SIGNING_KEY, // Required for production to verify requests
  servePath: '/api/inngest', // Explicitly set the path
});
