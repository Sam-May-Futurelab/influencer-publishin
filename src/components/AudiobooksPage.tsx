import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AudioPlayer } from '@/components/AudioPlayer';
import { SpeakerHigh, Download, BookOpen } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useNavigate } from 'react-router-dom';

interface Audiobook {
  id: string;
  projectId: string;
  projectTitle?: string;
  chapterId: string;
  chapterTitle: string;
  audioUrl: string;
  audioSize: number;
  completedAt: string;
}

export function AudiobooksPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [audiobooks, setAudiobooks] = useState<Audiobook[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupedAudiobooks, setGroupedAudiobooks] = useState<Record<string, Audiobook[]>>({});

  useEffect(() => {
    const loadAudiobooks = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        const audiobooksRef = collection(db, 'audiobooks');
        const q = query(
          audiobooksRef,
          where('userId', '==', user.uid),
          orderBy('completedAt', 'desc')
        );
        
        const snapshot = await getDocs(q);
        const loadedAudiobooks: Audiobook[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Audiobook));

        setAudiobooks(loadedAudiobooks);

        // Group by project
        const grouped = loadedAudiobooks.reduce((acc, audiobook) => {
          const projectId = audiobook.projectId;
          if (!acc[projectId]) {
            acc[projectId] = [];
          }
          acc[projectId].push(audiobook);
          return acc;
        }, {} as Record<string, Audiobook[]>);

        setGroupedAudiobooks(grouped);
      } catch (error) {
        console.error('Failed to load audiobooks:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAudiobooks();
  }, [user?.uid]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (audiobooks.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Your Audiobooks</h1>
          <p className="text-muted-foreground text-sm lg:text-base">
            All your generated audiobooks in one place
          </p>
        </div>

        <Card className="neomorph-flat border-0">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <SpeakerHigh size={64} className="text-muted-foreground mb-4" weight="thin" />
            <h3 className="text-lg font-semibold mb-2">No audiobooks yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md">
              Generate your first audiobook by opening a project and clicking the Audiobook tab.
            </p>
            <Button
              onClick={() => navigate('/app/projects')}
              className="neomorph-button border-0 gap-2"
            >
              <BookOpen size={16} />
              Go to Projects
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Your Audiobooks</h1>
          <p className="text-muted-foreground text-sm lg:text-base">
            {audiobooks.length} audiobook{audiobooks.length !== 1 ? 's' : ''} across {Object.keys(groupedAudiobooks).length} project{Object.keys(groupedAudiobooks).length !== 1 ? 's' : ''}
          </p>
        </div>
      </motion.div>

      <div className="space-y-8">
        {Object.entries(groupedAudiobooks).map(([projectId, projectAudiobooks]) => (
          <motion.div
            key={projectId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="neomorph-flat border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {projectAudiobooks[0]?.projectTitle || 'Unknown Project'}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {projectAudiobooks.length} chapter{projectAudiobooks.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/app/project/${projectId}`)}
                    className="gap-2"
                  >
                    <BookOpen size={16} />
                    Open Project
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {projectAudiobooks.map((audiobook) => (
                  <div key={audiobook.id} className="p-4 neomorph-inset rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{audiobook.chapterTitle}</h3>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{formatFileSize(audiobook.audioSize)}</span>
                          <span>•</span>
                          <span>{formatDate(audiobook.completedAt)}</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        asChild
                      >
                        <a href={audiobook.audioUrl} download={`${audiobook.chapterTitle}.mp3`}>
                          <Download size={16} />
                          Download
                        </a>
                      </Button>
                    </div>
                    <AudioPlayer src={audiobook.audioUrl} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
