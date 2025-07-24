import { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { ChapterEditor } from '@/components/ChapterEditor';
import { ProjectHeader } from '@/components/ProjectHeader';
import { BrandCustomizer } from '@/components/BrandCustomizer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Sparkles, Palette } from '@phosphor-icons/react';
import { EbookProject, Chapter, BrandConfig } from '@/lib/types';
import { exportToPDF } from '@/lib/export';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const defaultBrandConfig: BrandConfig = {
  primaryColor: '#8B5CF6',
  secondaryColor: '#A78BFA',
  accentColor: '#C4B5FD',
  fontFamily: 'Inter, sans-serif',
  coverStyle: 'gradient',
};

function App() {
  const [projects, setProjects] = useKV<EbookProject[]>('ebook-projects', []);
  const [currentProject, setCurrentProject] = useState<EbookProject | null>(null);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [showBrandCustomizer, setShowBrandCustomizer] = useState(false);

  useEffect(() => {
    if (projects.length > 0) {
      // Migrate existing projects to include brand config and author
      const needsMigration = projects.some(p => !p.brandConfig || p.author === undefined);
      if (needsMigration) {
        const migratedProjects = projects.map(project => ({
          ...project,
          author: project.author || '',
          brandConfig: project.brandConfig || { ...defaultBrandConfig },
        }));
        setProjects(() => migratedProjects);
      }
      
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
      author: '',
      chapters: [],
      brandConfig: { ...defaultBrandConfig },
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

  const updateBrandConfig = (brandConfig: BrandConfig) => {
    updateProject({ brandConfig });
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full max-w-md neomorph-raised border-0">
            <CardHeader className="text-center">
              <motion.div 
                className="flex items-center justify-center gap-3 mb-6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                <div className="p-3 rounded-xl neomorph-flat">
                  <BookOpen size={32} className="text-primary" />
                </div>
                <div className="p-2 rounded-xl neomorph-flat">
                  <Sparkles size={24} className="text-accent" />
                </div>
              </motion.div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                EbookCrafter
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Transform your expertise into professional ebooks and guides with beautiful branding that you can sell.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
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
                  className="neomorph-inset border-0 text-center text-lg h-14"
                />
              </div>
              <Button 
                onClick={() => createProject(newProjectTitle)}
                disabled={!newProjectTitle.trim()}
                className="w-full gap-3 h-14 text-lg neomorph-button border-0"
                size="lg"
              >
                <BookOpen size={20} />
                Create Your First Ebook
              </Button>
              
              {projects.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="pt-6 border-t border-border/50"
                >
                  <p className="text-sm text-muted-foreground mb-4 text-center">
                    Or continue with existing project:
                  </p>
                  <div className="space-y-3">
                    {projects.map((project, index) => (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Button
                          variant="outline"
                          className="w-full justify-start neomorph-button border-0 h-12"
                          onClick={() => {
                            setCurrentProject(project);
                            setShowWelcome(false);
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: project.brandConfig?.primaryColor || defaultBrandConfig.primaryColor }}
                            />
                            <span className="font-medium">{project.title}</span>
                          </div>
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-['Inter']">
      <ProjectHeader
        project={currentProject}
        onProjectUpdate={updateProject}
        onExport={handleExport}
        onBrandCustomize={() => setShowBrandCustomizer(true)}
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

      <BrandCustomizer
        brandConfig={currentProject.brandConfig || defaultBrandConfig}
        onUpdate={updateBrandConfig}
        isOpen={showBrandCustomizer}
        onClose={() => setShowBrandCustomizer(false)}
      />
    </div>
  );
}

export default App;