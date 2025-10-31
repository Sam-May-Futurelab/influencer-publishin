import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VoiceSelector } from '@/components/VoiceSelector';
import { AudioPlayer } from '@/components/AudioPlayer';
import { SpeakerHigh, Download, Sparkle, Info } from '@phosphor-icons/react';
import { EbookProject } from '@/lib/types';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';

interface AudiobookTabProps {
  project: EbookProject;
}

export type Voice = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
export type Quality = 'standard' | 'hd';

interface GeneratedChapter {
  chapterId: string;
  title: string;
  audioUrl: string;
  duration?: number;
}

export function AudiobookTab({ project }: AudiobookTabProps) {
  const { userProfile } = useAuth();
  const [selectedVoice, setSelectedVoice] = useState<Voice>('nova');
  const [selectedQuality, setSelectedQuality] = useState<Quality>('standard');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedChapters, setGeneratedChapters] = useState<GeneratedChapter[]>([]);
  const [currentGeneratingChapter, setCurrentGeneratingChapter] = useState<string>('');

  const isPremium = userProfile?.isPremium || false;
  const subscriptionStatus = userProfile?.subscriptionStatus || 'free';

  // Calculate total characters
  const totalCharacters = project.chapters.reduce((sum, chapter) => {
    return sum + (chapter.content?.length || 0);
  }, 0);

  // Calculate cost
  const costPerThousand = selectedQuality === 'hd' ? 0.030 : 0.015;
  const estimatedCost = (totalCharacters / 1000) * costPerThousand;

  // Get tier limits
  const getTierLimit = () => {
    if (subscriptionStatus === 'free') return 0;
    if (subscriptionStatus === 'creator') return 100000;
    return 500000; // premium
  };

  const characterLimit = getTierLimit();
  const charactersUsed = userProfile?.audiobookCharactersUsed || 0;
  const charactersRemaining = characterLimit - charactersUsed;

  const canGenerate = () => {
    if (subscriptionStatus === 'free') return false;
    if (totalCharacters > charactersRemaining) return false;
    return true;
  };

  const handleGenerate = async () => {
    if (!canGenerate()) {
      if (subscriptionStatus === 'free') {
        toast.error('Audiobooks are a premium feature', {
          description: 'Upgrade to Creator or Premium to generate audiobooks'
        });
      } else {
        toast.error('Not enough character allowance', {
          description: `You need ${totalCharacters.toLocaleString()} characters but only have ${charactersRemaining.toLocaleString()} remaining this month`
        });
      }
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    setGeneratedChapters([]);

    try {
      const sortedChapters = [...project.chapters].sort((a, b) => a.order - b.order);
      
      for (let i = 0; i < sortedChapters.length; i++) {
        const chapter = sortedChapters[i];
        setCurrentGeneratingChapter(chapter.title);
        setGenerationProgress(((i + 1) / sortedChapters.length) * 100);

        // Call API to generate audio
        const response = await fetch('/api/generate-audiobook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: chapter.content,
            voice: selectedVoice,
            quality: selectedQuality,
            chapterId: chapter.id,
            chapterTitle: chapter.title,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to generate audio for ${chapter.title}`);
        }

        // Get audio blob
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        setGeneratedChapters(prev => [...prev, {
          chapterId: chapter.id,
          title: chapter.title,
          audioUrl,
        }]);
      }

      toast.success('Audiobook generated successfully!', {
        description: `All ${sortedChapters.length} chapters are ready to download`
      });
    } catch (error) {
      console.error('Audiobook generation failed:', error);
      toast.error('Failed to generate audiobook', {
        description: error instanceof Error ? error.message : 'Please try again'
      });
    } finally {
      setIsGenerating(false);
      setCurrentGeneratingChapter('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <Card className="neomorph-flat border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <SpeakerHigh size={24} className="text-primary" weight="fill" />
            Generate Audiobook
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <Info size={20} className="text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm space-y-1">
              <p className="font-medium text-foreground">Convert your ebook to audiobook</p>
              <p className="text-muted-foreground">
                Choose a voice, select quality, and generate MP3 files for each chapter. You can play them in your browser or download them to your device.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 neomorph-inset rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Chapters</div>
              <div className="text-lg font-bold text-foreground">{project.chapters.length}</div>
            </div>
            <div className="p-3 neomorph-inset rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Characters</div>
              <div className="text-lg font-bold text-foreground">{totalCharacters.toLocaleString()}</div>
            </div>
            <div className="p-3 neomorph-inset rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Est. Cost</div>
              <div className="text-lg font-bold text-foreground">${estimatedCost.toFixed(2)}</div>
            </div>
            <div className="p-3 neomorph-inset rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Remaining</div>
              <div className="text-lg font-bold text-foreground">
                {characterLimit === 0 ? '0' : charactersRemaining.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Tier limit warning */}
          {subscriptionStatus === 'free' && (
            <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                Audiobooks are a premium feature. Upgrade to Creator or Premium to generate audiobooks.
              </p>
            </div>
          )}

          {subscriptionStatus !== 'free' && totalCharacters > charactersRemaining && (
            <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                This book requires {totalCharacters.toLocaleString()} characters but you only have {charactersRemaining.toLocaleString()} remaining this month.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Voice Selection */}
      {subscriptionStatus !== 'free' && (
        <Card className="neomorph-flat border-0">
          <CardHeader>
            <CardTitle className="text-lg">Choose Voice & Quality</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <VoiceSelector
              selectedVoice={selectedVoice}
              onSelectVoice={setSelectedVoice}
            />

            {/* Quality Selection */}
            <div>
              <label className="text-sm font-semibold mb-3 block">Audio Quality</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedQuality('standard')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedQuality === 'standard'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="font-semibold mb-1">Standard</div>
                  <div className="text-sm text-muted-foreground">$0.015 per 1K chars</div>
                  <Badge variant="secondary" className="mt-2">Recommended</Badge>
                </button>
                <button
                  onClick={() => setSelectedQuality('hd')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedQuality === 'hd'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="font-semibold mb-1">HD</div>
                  <div className="text-sm text-muted-foreground">$0.030 per 1K chars</div>
                  <Badge variant="secondary" className="mt-2">Premium</Badge>
                </button>
              </div>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={!canGenerate() || isGenerating}
              className="w-full h-12 gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground"
              size="lg"
            >
              <Sparkle size={20} weight="fill" />
              {isGenerating ? 'Generating...' : 'Generate Audiobook'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Generation Progress */}
      {isGenerating && (
        <Card className="neomorph-flat border-0">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Generating: {currentGeneratingChapter}</span>
                <span className="font-semibold">{Math.round(generationProgress)}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-accent"
                  initial={{ width: 0 }}
                  animate={{ width: `${generationProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Chapters */}
      {generatedChapters.length > 0 && (
        <Card className="neomorph-flat border-0">
          <CardHeader>
            <CardTitle className="text-lg">Your Audiobook</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {generatedChapters.map((chapter) => (
              <div key={chapter.chapterId} className="p-4 neomorph-inset rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">{chapter.title}</h3>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    asChild
                  >
                    <a href={chapter.audioUrl} download={`${chapter.title}.mp3`}>
                      <Download size={16} />
                      Download
                    </a>
                  </Button>
                </div>
                <AudioPlayer src={chapter.audioUrl} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
