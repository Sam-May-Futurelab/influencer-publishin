/**
 * Generate Voice Preview Samples
 * 
 * This script generates short MP3 preview files for all 6 OpenAI TTS voices.
 * Run this once to create the preview files in /public/voice-samples/
 * 
 * Usage: node scripts/generate-voice-samples.js
 */

import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize OpenAI (uses OPENAI_API_KEY from environment)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Voice configurations
const voices = [
  { name: 'alloy', description: 'Neutral and balanced' },
  { name: 'echo', description: 'Male, clear and direct' },
  { name: 'fable', description: 'British accent, expressive' },
  { name: 'onyx', description: 'Deep male, authoritative' },
  { name: 'nova', description: 'Female, warm and engaging' },
  { name: 'shimmer', description: 'Female, bright and energetic' },
];

// Preview text (short and engaging)
const previewText = "Welcome to your audiobook. This is how I sound when reading your content.";

// Output directory
const outputDir = path.join(__dirname, '../public/voice-samples');

async function generateVoiceSample(voice) {
  console.log(`Generating sample for ${voice.name}...`);

  try {
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',
      voice: voice.name,
      input: previewText,
      speed: 1.0,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    const outputPath = path.join(outputDir, `${voice.name}.mp3`);
    
    fs.writeFileSync(outputPath, buffer);
    console.log(`✓ Created ${voice.name}.mp3 (${(buffer.length / 1024).toFixed(1)}KB)`);
  } catch (error) {
    console.error(`✗ Failed to generate ${voice.name}:`, error.message);
  }
}

async function main() {
  console.log('🎙️  Generating voice preview samples...\n');

  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log('Created /public/voice-samples/ directory\n');
  }

  // Generate all voice samples
  for (const voice of voices) {
    await generateVoiceSample(voice);
  }

  console.log('\n✨ All voice samples generated successfully!');
  console.log(`📁 Samples saved to: ${outputDir}`);
}

main().catch(console.error);
