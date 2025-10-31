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

export type Voice = 'alloy' | 'ash' | 'coral' | 'echo' | 'fable' | 'nova' | 'onyx' | 'sage' | 'shimmer';
export type Quality = 'standard' | 'hd';

interface GeneratedChapter {
  chapterId: string;
  title: string;
  audioUrl: string;
  duration?: number;
}

export function AudiobookTab({ project }: AudiobookTabProps) {
  const { userProfile, user } = useAuth();
  const [selectedVoice, setSelectedVoice] = useState<Voice>('nova');
  const [selectedQuality, setSelectedQuality] = useState<Quality>('standard');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedChapters, setGeneratedChapters] = useState<GeneratedChapter[]>([]);
  const [currentGeneratingChapter, setCurrentGeneratingChapter] = useState<string>('');

  const isPremium = userProfile?.isPremium || false;
  const subscriptionStatus = userProfile?.subscriptionStatus || 'free';
  const userId = user?.uid;

  // Calculate total characters
  const totalCharacters = project.chapters.reduce((sum, chapter) => {
    return sum + (chapter.content?.length || 0);
  }, 0);

  const totalChapters = project.chapters.length;

  // Get tier limits (chapter-based)
  const getTierLimit = () => {
    if (subscriptionStatus === 'free') return 0;
    if (subscriptionStatus === 'creator') return 25;
    return 50; // premium
  };

  const chapterLimit = getTierLimit();
  const chaptersUsed = userProfile?.audiobookChaptersUsed || 0;
  const chaptersRemaining = chapterLimit - chaptersUsed;

  const canGenerate = () => {
    if (subscriptionStatus === 'free') return false;
    if (totalChapters > chaptersRemaining) return false;
    return true;
  };

  const handleGenerate = async () => {
    if (!canGenerate()) {
      if (subscriptionStatus === 'free') {
        toast.error('Audiobooks are a premium feature', {
          description: 'Upgrade to Creator or Premium to generate audiobooks'
        });
      } else {
        toast.error('Not enough chapter allowance', {
          description: `You need ${totalChapters} chapters but only have ${chaptersRemaining} remaining this month`
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

        // Call API to generate audio (only pass chapterCount on first chapter for limit check)
        const response = await fetch('/api/ai-generation?type=audiobook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: chapter.content,
            voice: selectedVoice,
            quality: selectedQuality,
            chapterId: chapter.id,
            chapterTitle: chapter.title,
            userId: userId,
            chapterCount: i === 0 ? sortedChapters.length : undefined,
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
      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 neomorph-inset rounded-lg">
          <div className="text-xs text-muted-foreground mb-1">Chapters</div>
          <div className="text-lg font-bold text-foreground">{totalChapters}</div>
        </div>
        <div className="p-3 neomorph-inset rounded-lg">
          <div className="text-xs text-muted-foreground mb-1">Characters</div>
          <div className="text-lg font-bold text-foreground">{totalCharacters.toLocaleString()}</div>
        </div>
        <div className="p-3 neomorph-inset rounded-lg">
          <div className="text-xs text-muted-foreground mb-1">Remaining</div>
          <div className="text-lg font-bold text-foreground">
            {chapterLimit === 0 ? (
              <span className="text-orange-600">Upgrade</span>
            ) : (
              `${chaptersRemaining}/${chapterLimit}`
            )}
          </div>
        </div>
      </div>

      {/* Tier limit warning */}
      {subscriptionStatus === 'free' && (
        <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
          <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
            Audiobooks are available on Creator and Premium plans. Upgrade to start generating audiobooks.
          </p>
        </div>
      )}

      {subscriptionStatus !== 'free' && totalChapters > chaptersRemaining && (
        <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
          <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
            This book requires {totalChapters} chapters but you only have {chaptersRemaining} remaining this month.
            {subscriptionStatus === 'creator' && ' Upgrade to Premium for 50 chapters/month.'}
          </p>
        </div>
      )}

      {/* Voice Selection */}
      {subscriptionStatus !== 'free' && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left: Voice Selection */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold mb-3 block">Choose a Voice</label>
              <VoiceSelector
                selectedVoice={selectedVoice}
                onSelectVoice={setSelectedVoice}
              />
            </div>
          </div>

          {/* Right: Quality & Generate */}
          <div className="space-y-4">
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
                  <div className="text-xs text-muted-foreground">Good quality</div>
                  <Badge variant="secondary" className="mt-2 text-xs">Recommended</Badge>
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
                  <div className="text-xs text-muted-foreground">Best quality</div>
                  <Badge variant="secondary" className="mt-2 text-xs">High-Def</Badge>
                </button>
              </div>
            </div>

            {/* Generate Button */}
            <div className="pt-4">
              <Button
                onClick={handleGenerate}
                disabled={!canGenerate() || isGenerating}
                className="w-full h-14 gap-2 text-base bg-gradient-to-r from-primary to-accent text-primary-foreground"
                size="lg"
              >
                <Sparkle size={20} weight="fill" />
                {isGenerating ? 'Generating...' : 'Generate Audiobook'}
              </Button>
              {canGenerate() && !isGenerating && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Will use {totalChapters} of {chaptersRemaining} available chapters
                </p>
              )}
            </div>
          </div>
        </div>
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
