# Voice Preview Samples

This directory contains short MP3 preview files for each OpenAI TTS voice.

## Option 1: Use External Links (FREE - Recommended)

Instead of hosting MP3 files, update VoiceSelector.tsx to use OpenAI's official sample URLs:

```typescript
const voiceSamples = {
  alloy: 'https://cdn.openai.com/API/docs/audio/alloy.wav',
  echo: 'https://cdn.openai.com/API/docs/audio/echo.wav',
  fable: 'https://cdn.openai.com/API/docs/audio/fable.wav',
  onyx: 'https://cdn.openai.com/API/docs/audio/onyx.wav',
  nova: 'https://cdn.openai.com/API/docs/audio/nova.wav',
  shimmer: 'https://cdn.openai.com/API/docs/audio/shimmer.wav',
};
```

## Option 2: Generate Once (One-time cost ~$0.03)

Run the generate script once to create local copies:
```bash
node scripts/generate-voice-samples.js
```

This costs about $0.005 per voice (6 voices × $0.005 = $0.03 total, one-time).
After generation, files are served from your hosting for free forever.

## Option 3: Manual Download

Visit https://platform.openai.com/docs/guides/text-to-speech and download the sample audio files manually, then place them here.
