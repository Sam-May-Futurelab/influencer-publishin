import { useState } from 'react';
import { SpeakerHigh, Play, Pause } from '@phosphor-icons/react';
import { Voice } from './AudiobookTab';
import { motion } from 'framer-motion';

interface VoiceSelectorProps {
  selectedVoice: Voice;
  onSelectVoice: (voice: Voice) => void;
}

const voices: { id: Voice; name: string; description: string; gender: string }[] = [
  { id: 'alloy', name: 'Alloy', description: 'Neutral, versatile voice', gender: 'Neutral' },
  { id: 'echo', name: 'Echo', description: 'Clear, expressive male voice', gender: 'Male' },
  { id: 'fable', name: 'Fable', description: 'Warm, engaging male voice', gender: 'Male' },
  { id: 'onyx', name: 'Onyx', description: 'Deep, authoritative male voice', gender: 'Male' },
  { id: 'nova', name: 'Nova', description: 'Friendly, warm female voice', gender: 'Female' },
  { id: 'shimmer', name: 'Shimmer', description: 'Bright, energetic female voice', gender: 'Female' },
];

export function VoiceSelector({ selectedVoice, onSelectVoice }: VoiceSelectorProps) {
  const [playingVoice, setPlayingVoice] = useState<Voice | null>(null);
  const [audioElements] = useState<Map<Voice, HTMLAudioElement>>(new Map());

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
      audio = new Audio(`/voice-samples/${voice}.mp3`);
      audio.onended = () => setPlayingVoice(null);
      audioElements.set(voice, audio);
    }

    // Play the preview
    audio.play();
    setPlayingVoice(voice);
  };

  return (
    <div>
      <label className="text-sm font-semibold mb-3 block">Choose a Voice</label>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {voices.map((voice) => (
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
