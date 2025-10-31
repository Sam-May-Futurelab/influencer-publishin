import { inngest } from '../src/lib/inngest-client';
import OpenAI from 'openai';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, doc, updateDoc, increment, setDoc } from 'firebase/firestore';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper to split long text into chunks at sentence boundaries
function splitIntoChunks(text: string, maxLength: number = 3800): string[] {
  if (text.length <= maxLength) return [text];
  
  const chunks: string[] = [];
  let currentChunk = '';
  
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  
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

    // Step 1: Clean and prepare text
    const cleanedText = await step.run('clean-text', async () => {
      const cleaned = cleanTextForTTS(text);
      console.log(`[Inngest] Cleaned text length: ${cleaned.length}`);
      return cleaned;
    });

    // Step 2: Split into chunks if needed
    const chunks = await step.run('split-chunks', async () => {
      const textChunks = splitIntoChunks(cleanedText);
      console.log(`[Inngest] Split into ${textChunks.length} chunk(s)`);
      return textChunks;
    });

    // Step 3: Generate audio for each chunk (with retries built-in)
    const audioBuffers: Uint8Array[] = [];
    for (let i = 0; i < chunks.length; i++) {
      const buffer = await step.run(`generate-audio-chunk-${i}`, async () => {
        console.log(`[Inngest] Generating audio for chunk ${i + 1}/${chunks.length}...`);
        
        const response = await openai.audio.speech.create({
          model: quality === 'premium' ? 'tts-1-hd' : 'tts-1',
          voice: voice as any,
          input: chunks[i],
        });

        const arrayBuffer = await response.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);
        
        console.log(`[Inngest] Chunk ${i + 1} generated, size: ${buffer.length} bytes`);
        return buffer;
      });
      
      audioBuffers.push(buffer);
    }

    // Step 4: Merge chunks if multiple
    const finalAudio = await step.run('merge-audio', async () => {
      if (audioBuffers.length === 1) {
        return audioBuffers[0];
      }
      
      console.log(`[Inngest] Merging ${audioBuffers.length} audio chunks...`);
      const totalLength = audioBuffers.reduce((acc, buf) => acc + buf.length, 0);
      const merged = new Uint8Array(totalLength);
      
      let offset = 0;
      for (const buffer of audioBuffers) {
        merged.set(buffer, offset);
        offset += buffer.length;
      }
      
      console.log(`[Inngest] Merged audio size: ${merged.length} bytes`);
      return merged;
    });

    // Step 5: Upload to Firebase Storage
    const audioUrl = await step.run('upload-to-storage', async () => {
      console.log(`[Inngest] Uploading to Firebase Storage...`);
      
      // Initialize Firebase Storage (assuming Firebase is already initialized)
      const storage = getStorage();
      const fileName = `audiobooks/${userId}/${projectId}/${chapterId}.mp3`;
      const storageRef = ref(storage, fileName);
      
      // Upload the audio file
      await uploadBytes(storageRef, finalAudio, {
        contentType: 'audio/mpeg',
      });
      
      // Get download URL
      const downloadUrl = await getDownloadURL(storageRef);
      console.log(`[Inngest] Upload complete: ${downloadUrl}`);
      
      return downloadUrl;
    });

    // Step 6: Update user's audiobook usage count and save result
    await step.run('update-usage-and-save', async () => {
      console.log(`[Inngest] Updating usage count for user ${userId}`);
      
      const db = getFirestore();
      const userRef = doc(db, 'users', userId);
      
      await updateDoc(userRef, {
        audiobookChaptersUsed: increment(1),
      });

      // Save the audio URL to Firestore for status polling
      const audioRef = doc(db, 'audiobooks', `${projectId}_${chapterId}`);
      await setDoc(audioRef, {
        audioUrl,
        audioSize: finalAudio.length,
        chapterId,
        chapterTitle,
        projectId,
        userId,
        completedAt: new Date().toISOString(),
      });
      
      console.log(`[Inngest] Result saved to Firestore`);
    });

    console.log(`[Inngest] ✅ Generation complete for chapter: ${chapterTitle}`);

    return {
      success: true,
      audioUrl,
      chapterId,
      chapterTitle,
      audioSize: finalAudio.length,
    };
  }
);
