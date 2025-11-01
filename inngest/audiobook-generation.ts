import { inngest } from '../src/lib/inngest-client';
import OpenAI from 'openai';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb, adminStorage } from './firebase-admin';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const parseEnvInt = (value: string | undefined, fallback: number): number => {
  const parsed = value ? Number.parseInt(value, 10) : Number.NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const CHUNK_CHAR_LIMIT = parseEnvInt(process.env.AUDIOBOOK_CHUNK_CHAR_LIMIT, 1500);
const PARALLEL_TTS_LIMIT = parseEnvInt(process.env.AUDIOBOOK_MAX_PARALLEL_TTS, 4);

// Helper to split long text into chunks at sentence boundaries
function splitIntoChunks(text: string, maxLength: number = CHUNK_CHAR_LIMIT): string[] {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (!normalized) return [];
  if (normalized.length <= maxLength) return [normalized];

  const chunks: string[] = [];
  let currentChunk = '';

  const sentences = normalized.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [normalized];

  const pushCurrent = () => {
    if (currentChunk.trim().length > 0) {
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
        if (slice.length > 0) {
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

// Helper to clean text for TTS
function cleanTextForTTS(text: string): string {
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

interface AudiobookJobData {
  userId: string;
  projectId: string;
  chapterId: string;
  chapterTitle: string;
  text: string;
  voice: string;
  quality?: string;
}

export const generateAudiobook = inngest.createFunction(
  {
    id: 'audiobook-generation',
    name: 'Generate Audiobook Chapter',
  },
  { event: 'audiobook/generate.requested' },
  async ({ event, step }) => {
    const data = event.data as AudiobookJobData;
    const { userId, projectId, chapterId, chapterTitle, text, voice, quality = 'standard' } = data;

    console.log(`[Inngest] Starting audiobook generation for chapter: ${chapterTitle}`);
    console.log(`[Inngest] Text length: ${text.length}, Voice: ${voice}, Quality: ${quality}`);
    const audioRef = adminDb.collection('audiobooks').doc(`${projectId}_${chapterId}`);

    try {
      await audioRef.set(
        {
          status: 'processing',
          userId,
          projectId,
          chapterId,
          chapterTitle,
          queuedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      // Step 1: Clean and prepare text
      const cleanedText = await step.run('clean-text', async () => {
        const cleaned = cleanTextForTTS(text);
        console.log(`[Inngest] Cleaned text length: ${cleaned.length}`);
        return cleaned;
      });

      if (!cleanedText) {
        throw new Error('No text available after cleaning for TTS synthesis.');
      }

      // Step 2: Generate and upload audio
      const audioUrl = await step.run('generate-and-upload-audio', async () => {
        const textChunks = splitIntoChunks(cleanedText);
        console.log(`[Inngest] Split into ${textChunks.length} chunk(s)`);

        if (textChunks.length === 0) {
          throw new Error('Unable to split text into chunks for synthesis.');
        }

        const model = quality === 'hd' || quality === 'premium' ? 'tts-1-hd' : 'tts-1';
        console.log(`[Inngest] Using model ${model} with concurrency ${PARALLEL_TTS_LIMIT}`);

        const audioBuffers = await synthesizeChunksConcurrently(textChunks, {
          model,
          voice,
          concurrency: PARALLEL_TTS_LIMIT,
        });

        const finalAudio = audioBuffers.length === 1 ? audioBuffers[0] : Buffer.concat(audioBuffers);
        console.log(`[Inngest] Final audio size: ${finalAudio.length} bytes`);

        console.log('[Inngest] Uploading to Firebase Storage...');
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
              userId,
            },
          },
        });

        const downloadUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
        console.log(
          `[Inngest] Upload complete in ${Date.now() - uploadStart}ms: ${downloadUrl}`
        );

        return { downloadUrl, audioSize: finalAudio.length };
      });

      // Step 3: Update user's audiobook usage count and save result
      await step.run('update-usage-and-save', async () => {
        console.log(`[Inngest] Updating usage count for user ${userId}`);

        const userRef = adminDb.collection('users').doc(userId);
        await userRef.set(
          {
            audiobookChaptersUsed: FieldValue.increment(1),
          },
          { merge: true }
        );

        await audioRef.set(
          {
            status: 'completed',
            audioUrl: audioUrl.downloadUrl,
            audioSize: audioUrl.audioSize,
            chapterId,
            chapterTitle,
            projectId,
            userId,
            completedAt: new Date().toISOString(),
          },
          { merge: true }
        );

        console.log('[Inngest] Result saved to Firestore');
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

      await audioRef.set(
        {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
          completedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      throw error;
    }
  }
);

interface SynthesizeOptions {
  model: string;
  voice: string;
  concurrency: number;
}

async function synthesizeChunksConcurrently(chunks: string[], options: SynthesizeOptions): Promise<Buffer[]> {
  const { model, voice } = options;
  const concurrency = Math.max(1, Math.min(options.concurrency, chunks.length));
  const results: Buffer[] = new Array(chunks.length);

  let nextIndex = 0;

  const workers = Array.from({ length: concurrency }, (_, workerIndex) =>
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

interface ChunkContext {
  model: string;
  voice: string;
  chunkIndex: number;
  totalChunks: number;
  workerIndex: number;
}

async function synthesizeChunk(chunk: string, context: ChunkContext): Promise<Buffer> {
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
        voice: voice as any,
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

      const backoffMs = 500 * attempt;
      await new Promise((resolve) => setTimeout(resolve, backoffMs));
    }
  }

  throw new Error('Failed to synthesize audio chunk after retries.');
}
