import { useState } from 'react';
import { SpeakerHigh, Play, Pause } from '@phosphor-icons/react';
import { Voice } from './AudiobookTab';
import { motion } from 'framer-motion';
import { Button } from './ui/button';

interface VoiceSelectorProps {
  selectedVoice: Voice;
  onSelectVoice: (voice: Voice) => void;
}

const voices: { id: Voice; name: string; description: string; gender: 'Male' | 'Female' | 'Neutral' }[] = [
  { id: 'alloy', name: 'Alloy', description: 'Neutral, versatile voice', gender: 'Neutral' },
  { id: 'ash', name: 'Ash', description: 'Clear, articulate male voice', gender: 'Male' },
  { id: 'coral', name: 'Coral', description: 'Warm, friendly female voice', gender: 'Female' },
  { id: 'echo', name: 'Echo', description: 'Clear, expressive male voice', gender: 'Male' },
  { id: 'fable', name: 'Fable', description: 'Engaging, British male voice', gender: 'Male' },
  { id: 'nova', name: 'Nova', description: 'Bright, energetic female voice', gender: 'Female' },
  { id: 'onyx', name: 'Onyx', description: 'Deep, authoritative male voice', gender: 'Male' },
  { id: 'sage', name: 'Sage', description: 'Professional, composed female voice', gender: 'Female' },
  { id: 'shimmer', name: 'Shimmer', description: 'Vibrant, enthusiastic female voice', gender: 'Female' },
];

// OpenAI's official voice sample URLs (free to use)
const voiceSampleUrls: Record<Voice, string> = {
  alloy: 'https://cdn.openai.com/API/docs/audio/alloy.wav',
  ash: 'https://cdn.openai.com/API/docs/audio/ash.wav',
  coral: 'https://cdn.openai.com/API/docs/audio/coral.wav',
  echo: 'https://cdn.openai.com/API/docs/audio/echo.wav',
  fable: 'https://cdn.openai.com/API/docs/audio/fable.wav',
  nova: 'https://cdn.openai.com/API/docs/audio/nova.wav',
  onyx: 'https://cdn.openai.com/API/docs/audio/onyx.wav',
  sage: 'https://cdn.openai.com/API/docs/audio/sage.wav',
  shimmer: 'https://cdn.openai.com/API/docs/audio/shimmer.wav',
};

export function VoiceSelector({ selectedVoice, onSelectVoice }: VoiceSelectorProps) {
  const [playingVoice, setPlayingVoice] = useState<Voice | null>(null);
  const [audioElements] = useState<Map<Voice, HTMLAudioElement>>(new Map());
  const [genderFilter, setGenderFilter] = useState<'All' | 'Male' | 'Female' | 'Neutral'>('All');

  const handlePlayPreview = (voice: Voice) => {
    // Stop any currently playing audio
    if (playingVoice) {
      const currentAudio = audioElements.get(playingVoice);
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
    }

    // If clicking the same voice that's playing, just stop it
    if (playingVoice === voice) {
      setPlayingVoice(null);
      return;
    }

    // Get or create audio element for this voice
    let audio = audioElements.get(voice);
    if (!audio) {
      audio = new Audio(voiceSampleUrls[voice]);
      audio.onended = () => setPlayingVoice(null);
      audioElements.set(voice, audio);
    }

    // Play the preview
    audio.play();
    setPlayingVoice(voice);
  };

  const filteredVoices = genderFilter === 'All' 
    ? voices 
    : voices.filter(v => v.gender === genderFilter);

  return (
    <div className="space-y-3">
      {/* Gender Filter */}
      <div className="flex gap-2">
        {(['All', 'Male', 'Female', 'Neutral'] as const).map((filter) => (
          <Button
            key={filter}
            variant={genderFilter === filter ? 'default' : 'outline'}
            size="sm"
            onClick={() => setGenderFilter(filter)}
            className="text-xs"
          >
            {filter}
          </Button>
        ))}
      </div>

      {/* Voice Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredVoices.map((voice) => (
          <motion.button
            key={voice.id}
            onClick={() => onSelectVoice(voice.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              selectedVoice === voice.id
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="font-semibold text-foreground">{voice.name}</div>
                <div className="text-xs text-muted-foreground">{voice.gender}</div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlayPreview(voice.id);
                }}
                className="p-2 rounded-full hover:bg-primary/10 transition-colors"
                title="Play preview"
              >
                {playingVoice === voice.id ? (
                  <Pause size={16} className="text-primary" weight="fill" />
                ) : (
                  <Play size={16} className="text-primary" weight="fill" />
                )}
              </button>
            </div>
            <p className="text-sm text-muted-foreground">{voice.description}</p>
            {selectedVoice === voice.id && (
              <div className="mt-2 flex items-center gap-1 text-xs text-primary font-medium">
                <SpeakerHigh size={14} weight="fill" />
                Selected
              </div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
