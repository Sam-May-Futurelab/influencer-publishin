import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VoiceSelector } from '@/components/VoiceSelector';
import { AudioPlayer } from '@/components/AudioPlayer';
import { AILoading } from '@/components/AILoading';
import { AudiobookSplitDialog } from '@/components/AudiobookSplitDialog';
import { SpeakerHigh, Download, Sparkle, Info } from '@phosphor-icons/react';
import { EbookProject } from '@/lib/types';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { createAudioVersionProject } from '@/lib/projects';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface AudiobookTabProps {
  project: EbookProject;
  onProjectsChanged?: () => Promise<void>;
}

export type Voice = 'alloy' | 'ash' | 'coral' | 'echo' | 'fable' | 'nova' | 'onyx' | 'sage' | 'shimmer';
export type Quality = 'standard' | 'hd';

interface GeneratedChapter {
  chapterId: string;
  title: string;
  audioUrl: string;
  duration?: number;
}

// Helper to merge multiple audio blobs into one
async function mergeAudioBuffers(blobs: Blob[]): Promise<Blob> {
  // Convert blobs to array buffers
  const buffers = await Promise.all(
    blobs.map(blob => blob.arrayBuffer())
  );
  
  // Calculate total size
  const totalSize = buffers.reduce((sum, buffer) => sum + buffer.byteLength, 0);
  
  // Create merged buffer
  const mergedBuffer = new Uint8Array(totalSize);
  let offset = 0;
  
  for (const buffer of buffers) {
    mergedBuffer.set(new Uint8Array(buffer), offset);
    offset += buffer.byteLength;
  }
  
  // Return as blob
  return new Blob([mergedBuffer], { type: 'audio/mpeg' });
}

export function AudiobookTab({ project, onProjectsChanged }: AudiobookTabProps) {
  const { userProfile, user } = useAuth();
  const navigate = useNavigate();
  const [selectedVoice, setSelectedVoice] = useState<Voice>('nova');
  const [selectedQuality, setSelectedQuality] = useState<Quality>('standard');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedChapters, setGeneratedChapters] = useState<GeneratedChapter[]>([]);
  const [currentGeneratingChapter, setCurrentGeneratingChapter] = useState<string>('');
  const [showSplitDialog, setShowSplitDialog] = useState(false);
  const [isCreatingAudioVersion, setIsCreatingAudioVersion] = useState(false);

  const isPremium = userProfile?.isPremium || false;
  const subscriptionStatus = userProfile?.subscriptionStatus || 'free';
  const userId = user?.uid;

  // Load existing audiobooks from Firestore on mount
  useEffect(() => {
    const loadExistingAudiobooks = async () => {
      if (!project.id || !userId) return;

      try {
        const audiobooksRef = collection(db, 'audiobooks');
        const q = query(
          audiobooksRef,
          where('projectId', '==', project.id),
          where('userId', '==', userId)
        );
        
        const snapshot = await getDocs(q);
        const existingAudiobooks: GeneratedChapter[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            chapterId: data.chapterId,
            title: data.chapterTitle,
            audioUrl: data.audioUrl,
          };
        });

        if (existingAudiobooks.length > 0) {
          setGeneratedChapters(existingAudiobooks);
        }
      } catch (error) {
        console.error('Failed to load existing audiobooks:', error);
      }
    };

    loadExistingAudiobooks();
  }, [project.id, userId]);

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

  // Check if any chapters need splitting (with 200 char buffer)
  const BUFFER = 200;
  const MAX_CHARS = 4000 + BUFFER;
  
  const needsSplitting = project.chapters.some(chapter => {
    const cleanContent = chapter.content
      ?.replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim() || '';
    return cleanContent.length > MAX_CHARS;
  });

  // Calculate estimated chapter count after splitting
  const estimateChapterCount = () => {
    let count = 0;
    project.chapters.forEach(chapter => {
      const cleanContent = chapter.content
        ?.replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ')
        .trim() || '';
      
      if (cleanContent.length <= MAX_CHARS) {
        count += 1;
      } else {
        // Rough estimate: divide by 4000 and round up
        count += Math.ceil(cleanContent.length / 4000);
      }
    });
    return count;
  };

  const estimatedChapterCount = estimateChapterCount();

  const canGenerate = () => {
    if (subscriptionStatus === 'free') return false;
    if (totalChapters > chaptersRemaining) return false;
    return true;
  };

  const handleCreateAudioVersion = async () => {
    if (!userId) return;
    
    setIsCreatingAudioVersion(true);
    setShowSplitDialog(false);
    
    try {
      toast.loading('Creating audio-ready version...', { id: 'create-audio' });
      
      const audioProject = await createAudioVersionProject(userId, project);
      
      toast.success('Audio version created!', {
        id: 'create-audio',
        description: `Project split into ${audioProject.chapters.length} chapters`
      });
      
      // Reload projects to ensure new project is in state
      if (onProjectsChanged) {
        await onProjectsChanged();
      }
      
      // Navigate to the new audio project
      navigate(`/dashboard/project/${audioProject.id}`);
    } catch (error) {
      console.error('Failed to create audio version:', error);
      toast.error('Failed to create audio version', {
        id: 'create-audio',
        description: error instanceof Error ? error.message : 'Please try again'
      });
    } finally {
      setIsCreatingAudioVersion(false);
    }
  };

  const handleGenerate = async () => {
    // Check if we need to split chapters first
    if (needsSplitting && !project.isAudioVersion) {
      setShowSplitDialog(true);
      return;
    }

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
      
      // Group chapters by their base title (without "Part X")
      const chapterGroups: Map<string, typeof sortedChapters> = new Map();
      sortedChapters.forEach(chapter => {
        // Extract base title (remove "(Part X)" suffix)
        const baseTitle = chapter.title.replace(/\s*\(Part\s+\d+\)\s*$/, '');
        const group = chapterGroups.get(baseTitle) || [];
        group.push(chapter);
        chapterGroups.set(baseTitle, group);
      });
      
      let processedChapters = 0;
      
      // Generate audio for each group
      for (const [baseTitle, chapters] of chapterGroups) {
        const audioUrls: string[] = [];
        
        // Queue each part
        for (let partIndex = 0; partIndex < chapters.length; partIndex++) {
          const chapter = chapters[partIndex];
          setCurrentGeneratingChapter(baseTitle);

          // Queue the job
          const queueResponse = await fetch('/api/audiobook?action=queue', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: chapter.content,
              voice: selectedVoice,
              quality: selectedQuality,
              chapterId: chapter.id,
              chapterTitle: chapter.title,
              userId: userId,
              projectId: project.id,
            }),
          });

          if (!queueResponse.ok) {
            const errorData = await queueResponse.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(errorData.error || `Failed to queue audio for ${chapter.title}`);
          }

          const { jobId } = await queueResponse.json();
          console.log(`[Audiobook] Job queued: ${jobId}`);

          // Poll for completion
          let audioUrl: string | null = null;
          const maxAttempts = 120; // 2 minutes max (1 second intervals)
          let attempts = 0;

          while (!audioUrl && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
            
            const statusResponse = await fetch(
              `/api/audiobook?action=status&projectId=${project.id}&chapterId=${chapter.id}`
            );
            
            if (!statusResponse.ok) {
              throw new Error('Failed to check status');
            }

            const statusData = await statusResponse.json();
            
            if (statusData.status === 'completed') {
              audioUrl = statusData.audioUrl;
            } else if (statusData.status === 'failed') {
              throw new Error(statusData.error || 'Generation failed');
            }
            
            attempts++;
          }

          if (!audioUrl) {
            throw new Error('Generation timeout - please try again');
          }

          audioUrls.push(audioUrl);
          processedChapters++;
          setGenerationProgress((processedChapters / sortedChapters.length) * 100);
        }
        
        // For merged chapters, use the first URL (we're now storing in Firebase, not merging client-side)
        const finalUrl = audioUrls[0]; // If you want to merge, implement server-side merging

        setGeneratedChapters(prev => [...prev, {
          chapterId: chapters[0].id,
          title: baseTitle, // Use base title without "Part X"
          audioUrl: finalUrl,
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
                  disabled={isGenerating}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedQuality === 'standard'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="font-semibold mb-1">Standard</div>
                  <div className="text-xs text-muted-foreground">Good quality</div>
                  <Badge variant="secondary" className="mt-2 text-xs">Recommended</Badge>
                </button>
                <button
                  onClick={() => setSelectedQuality('hd')}
                  disabled={isGenerating}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedQuality === 'hd'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="font-semibold mb-1">HD</div>
                  <div className="text-xs text-muted-foreground">Best quality</div>
                  <Badge variant="secondary" className="mt-2 text-xs">High-Def</Badge>
                </button>
              </div>
            </div>

            {/* Generate Button / Loading */}
            <div className="pt-4 space-y-2">
              {isGenerating || isCreatingAudioVersion ? (
                <>
                  <div className="w-full p-4 rounded-lg border-2 border-primary/50 bg-primary/5 flex items-center justify-center">
                    <AILoading />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    {isCreatingAudioVersion 
                      ? 'Creating audio-ready version...' 
                      : `Generating ${currentGeneratingChapter}... (${Math.round(generationProgress)}%)`
                    }
                  </p>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleGenerate}
                    disabled={!canGenerate()}
                    className="w-full h-14 gap-2 text-base bg-gradient-to-r from-primary to-accent text-primary-foreground"
                    size="lg"
                  >
                    <Sparkle size={20} weight="fill" />
                    Generate Audiobook
                  </Button>
                  {canGenerate() && (
                    <p className="text-xs text-muted-foreground text-center">
                      Will use {totalChapters} of {chaptersRemaining} available chapters
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Split Dialog */}
      <AudiobookSplitDialog
        open={showSplitDialog}
        onOpenChange={setShowSplitDialog}
        onConfirm={handleCreateAudioVersion}
        originalChapterCount={totalChapters}
        newChapterCount={estimatedChapterCount}
        projectTitle={project.title}
      />

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
