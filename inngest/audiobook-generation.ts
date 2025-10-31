import { inngest } from '../src/lib/inngest-client';
import OpenAI from 'openai';
import { adminDb, adminStorage } from './firebase-admin';

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

    // Step 2: Generate and upload audio
    const audioUrl = await step.run('generate-and-upload-audio', async () => {
      // Split into chunks if needed
      const textChunks = splitIntoChunks(cleanedText);
      console.log(`[Inngest] Split into ${textChunks.length} chunk(s)`);
      
      // Generate audio for each chunk
      const audioBuffers: Buffer[] = [];
      for (let i = 0; i < textChunks.length; i++) {
        console.log(`[Inngest] Generating audio for chunk ${i + 1}/${textChunks.length}...`);
        
        const response = await openai.audio.speech.create({
          model: quality === 'premium' ? 'tts-1-hd' : 'tts-1',
          voice: voice as any,
          input: textChunks[i],
        });

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        console.log(`[Inngest] Chunk ${i + 1} generated, size: ${buffer.length} bytes`);
        audioBuffers.push(buffer);
      }
      
      // Merge chunks if multiple
      let finalAudio: Buffer;
      if (audioBuffers.length === 1) {
        finalAudio = audioBuffers[0];
      } else {
        console.log(`[Inngest] Merging ${audioBuffers.length} audio chunks...`);
        finalAudio = Buffer.concat(audioBuffers);
        console.log(`[Inngest] Merged audio size: ${finalAudio.length} bytes`);
      }
      
      // Upload to Firebase Storage
      console.log(`[Inngest] Uploading to Firebase Storage...`);
      const fileName = `audiobooks/${userId}/${projectId}/${chapterId}.mp3`;
      const bucket = adminStorage.bucket();
      const file = bucket.file(fileName);
      
      await file.save(finalAudio, {
        contentType: 'audio/mpeg',
        metadata: {
          metadata: {
            chapterId,
            chapterTitle,
            projectId,
            userId,
          }
        }
      });
      
      // Make file publicly accessible
      await file.makePublic();
      
      // Get download URL
      const downloadUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
      console.log(`[Inngest] Upload complete: ${downloadUrl}`);
      
      return { downloadUrl, audioSize: finalAudio.length };
    });

    // Step 3: Update user's audiobook usage count and save result
    await step.run('update-usage-and-save', async () => {
      console.log(`[Inngest] Updating usage count for user ${userId}`);
      
      const userRef = adminDb.collection('users').doc(userId);
      
      await userRef.update({
        audiobookChaptersUsed: (await userRef.get()).data()?.audiobookChaptersUsed || 0 + 1,
      });

      // Save the audio URL to Firestore for status polling
      const audioRef = adminDb.collection('audiobooks').doc(`${projectId}_${chapterId}`);
      await audioRef.set({
        audioUrl: audioUrl.downloadUrl,
        audioSize: audioUrl.audioSize,
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
      audioUrl: audioUrl.downloadUrl,
      chapterId,
      chapterTitle,
      audioSize: audioUrl.audioSize,
    };
  }
);
