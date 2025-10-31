# Voice Preview Samples

This directory contains 15-second audio samples for each OpenAI TTS voice.

## Required Files:
- `alloy.mp3` - Neutral, versatile voice
- `echo.mp3` - Clear, expressive male voice
- `fable.mp3` - Warm, engaging male voice
- `onyx.mp3` - Deep, authoritative male voice
- `nova.mp3` - Friendly, warm female voice
- `shimmer.mp3` - Bright, energetic female voice

## How to Generate:

You can generate these samples using the OpenAI TTS API:

```javascript
const OpenAI = require('openai');
const fs = require('fs');

const openai = new OpenAI({ apiKey: 'YOUR_API_KEY' });

const sampleText = "Welcome to your audiobook. This is a preview of how this voice sounds when reading your content. Each voice has its own unique character and tone, perfect for different types of books.";

const voices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];

async function generateSamples() {
  for (const voice of voices) {
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',
      voice: voice,
      input: sampleText,
    });
    
    const buffer = Buffer.from(await mp3.arrayBuffer());
    fs.writeFileSync(`./public/voice-samples/${voice}.mp3`, buffer);
    console.log(`Generated ${voice}.mp3`);
  }
}

generateSamples();
```

## Alternative:

For now, these files can be generated on-demand or you can use placeholder files. The app will gracefully handle missing samples.
