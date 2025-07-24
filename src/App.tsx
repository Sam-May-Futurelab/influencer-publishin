import { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { ChapterEditor } from '@/components/ChapterEditor';
import { ProjectHeader } from '@/components/ProjectHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Sparkles } from '@phosphor-icons/react';
import { EbookProject, Chapter } from '@/lib/types';
import { exportToPDF } from '@/lib/export';
import { toast } from 'sonner';

function App() {
  const [projects, setProjects] = useKV<EbookProject[]>('ebook-projects', []);
  const [currentProject, setCurrentProject] = useState<EbookProject | null>(null);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [newProjectTitle, setNewProjectTitle] = useState('');

  useEffect(() => {
    if (projects.length > 0) {
      setShowWelcome(false);
      if (!currentProject) {
        setCurrentProject(projects[0]);
      }
    }
  }, [projects, currentProject]);

  const createProject = (title: string) => {
    const newProject: EbookProject = {
      id: crypto.randomUUID(),
      title: title.trim() || 'Untitled Ebook',
      description: '',
      chapters: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setProjects(currentProjects => [...currentProjects, newProject]);
    setCurrentProject(newProject);
    setShowWelcome(false);
    setNewProjectTitle('');
    toast.success('New ebook project created!');
  };

  const updateProject = (updates: Partial<EbookProject>) => {
    if (!currentProject) return;

    const updatedProject = {
      ...currentProject,
      ...updates,
      updatedAt: new Date(),
    };

    setCurrentProject(updatedProject);
    setProjects(currentProjects => 
      currentProjects.map(p => p.id === currentProject.id ? updatedProject : p)
    );
  };

  const createChapter = () => {
    if (!currentProject) return;

    const newChapter: Chapter = {
      id: crypto.randomUUID(),
      title: `Chapter ${currentProject.chapters.length + 1}`,
      content: '',
      order: currentProject.chapters.length,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedChapters = [...currentProject.chapters, newChapter];
    updateProject({ chapters: updatedChapters });
    setCurrentChapter(newChapter);
    toast.success('New chapter created!');
  };

  const updateChapter = (id: string, updates: Partial<Chapter>) => {
    if (!currentProject) return;

    const updatedChapters = currentProject.chapters.map(chapter =>
      chapter.id === id
        ? { ...chapter, ...updates, updatedAt: new Date() }
        : chapter
    );

    updateProject({ chapters: updatedChapters });

    if (currentChapter?.id === id) {
      setCurrentChapter({ ...currentChapter, ...updates, updatedAt: new Date() });
    }
  };

  const deleteChapter = (id: string) => {
    if (!currentProject) return;

    const updatedChapters = currentProject.chapters.filter(chapter => chapter.id !== id);
    updateProject({ chapters: updatedChapters });

    if (currentChapter?.id === id) {
      setCurrentChapter(updatedChapters.length > 0 ? updatedChapters[0] : null);
    }
    toast.success('Chapter deleted');
  };

  const handleExport = async () => {
    if (!currentProject) return;

    try {
      toast.loading('Generating PDF...', { id: 'export' });
      await exportToPDF(currentProject);
      toast.success('PDF export complete!', { id: 'export' });
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed. Please try again.', { id: 'export' });
    }
  };

  if (showWelcome || !currentProject) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <BookOpen size={32} className="text-primary" />
              <Sparkles size={24} className="text-accent" />
            </div>
            <CardTitle className="text-2xl">Welcome to EbookCrafter</CardTitle>
            <p className="text-muted-foreground">
              Transform your expertise into professional ebooks and guides that you can sell.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                placeholder="Enter your ebook title..."
                value={newProjectTitle}
                onChange={(e) => setNewProjectTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newProjectTitle.trim()) {
                    createProject(newProjectTitle);
                  }
                }}
              />
            </div>
            <Button 
              onClick={() => createProject(newProjectTitle)}
              disabled={!newProjectTitle.trim()}
              className="w-full gap-2"
            >
              <BookOpen size={16} />
              Create Your First Ebook
            </Button>
            
            {projects.length > 0 && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Or continue with existing project:</p>
                <div className="space-y-2">
                  {projects.map(project => (
                    <Button
                      key={project.id}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        setCurrentProject(project);
                        setShowWelcome(false);
                      }}
                    >
                      {project.title}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-['Inter']">
      <ProjectHeader
        project={currentProject}
        onProjectUpdate={updateProject}
        onExport={handleExport}
      />
      
      <main className="h-[calc(100vh-80px)] p-6">
        <ChapterEditor
          chapters={currentProject.chapters}
          currentChapter={currentChapter}
          onChapterSelect={setCurrentChapter}
          onChapterCreate={createChapter}
          onChapterUpdate={updateChapter}
          onChapterDelete={deleteChapter}
        />
      </main>
    </div>
  );
}

export default App;