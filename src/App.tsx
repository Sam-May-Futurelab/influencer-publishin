import { useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { ChapterEditor } from '@/components/ChapterEditor';
import { ProjectHeader } from '@/components/ProjectHeader';
import { BrandCustomizer } from '@/components/BrandCustomizer';
import { TemplateGallery } from '@/components/TemplateGallery';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Star, Palette, Star as StarIcon } from '@phosphor-icons/react';
import { EbookProject, Chapter, BrandConfig } from '@/lib/types';
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
  const [projects, setProjects] = useLocalStorage<EbookProject[]>('ebook-projects', []);
  const [currentProject, setCurrentProject] = useState<EbookProject | null>(null);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [showBrandCustomizer, setShowBrandCustomizer] = useState(false);
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);

  useEffect(() => {
    if (projects.length > 0) {
      // Migrate existing projects to include brand config, author, and category
      const needsMigration = projects.some(p => !p.brandConfig || p.author === undefined || p.category === undefined);
      if (needsMigration) {
        const migratedProjects = projects.map(project => ({
          ...project,
          author: project.author || '',
          category: project.category || 'general',
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
      category: 'general',
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

  const createProjectFromTemplate = (project: EbookProject) => {
    setProjects(currentProjects => [...currentProjects, project]);
    setCurrentProject(project);
    setShowWelcome(false);
    setShowTemplateGallery(false);
    toast.success('Ebook created from template!');
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
    // This function is no longer needed as export is handled by ExportDialog
    // Keeping for backward compatibility, but it's not used
  };

  if (showWelcome || !currentProject) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-3 lg:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full max-w-md neomorph-raised border-0">
            <CardHeader className="text-center">
              <motion.div 
                className="flex items-center justify-center gap-2 lg:gap-3 mb-4 lg:mb-6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                <div className="p-2 lg:p-3 rounded-xl neomorph-flat">
                  <BookOpen size={24} className="lg:hidden text-primary" />
                  <BookOpen size={32} className="hidden lg:block text-primary" />
                </div>
                <div className="p-1.5 lg:p-2 rounded-xl neomorph-flat">
                  <Star size={18} className="lg:hidden text-accent" />
                  <Star size={24} className="hidden lg:block text-accent" />
                </div>
              </motion.div>
              <CardTitle className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                EbookCrafter
              </CardTitle>
              <p className="text-muted-foreground mt-2 text-sm lg:text-base">
                Transform your expertise into professional ebooks and guides with beautiful branding that you can sell.
              </p>
            </CardHeader>
            <CardContent className="space-y-4 lg:space-y-6">
              <div className="grid gap-3 lg:gap-4">
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
                    className="neomorph-inset border-0 text-center text-base lg:text-lg h-12 lg:h-14"
                  />
                </div>
                <Button 
                  onClick={() => createProject(newProjectTitle)}
                  disabled={!newProjectTitle.trim()}
                  className="w-full gap-2 lg:gap-3 h-12 lg:h-14 text-base lg:text-lg neomorph-button border-0"
                  size="lg"
                >
                  <BookOpen size={18} className="lg:hidden" />
                  <BookOpen size={20} className="hidden lg:block" />
                  <span className="hidden sm:inline">Create Blank Ebook</span>
                  <span className="sm:hidden">Create Ebook</span>
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/50" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-background px-4 text-muted-foreground">or</span>
                  </div>
                </div>
                
                <Button 
                  variant="outline"
                  onClick={() => setShowTemplateGallery(true)}
                  className="w-full gap-2 lg:gap-3 h-12 lg:h-14 text-base lg:text-lg neomorph-button border-0"
                  size="lg"
                >
                  <Star size={18} className="lg:hidden" />
                  <Star size={20} className="hidden lg:block" />
                  <span className="hidden sm:inline">Choose from Templates</span>
                  <span className="sm:hidden">Templates</span>
                </Button>
              </div>
              
              {projects.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="pt-6 border-t border-border/50"
                >
                  <p className="text-xs lg:text-sm text-muted-foreground mb-3 lg:mb-4 text-center">
                    Or continue with existing project:
                  </p>
                  <div className="space-y-2 lg:space-y-3">
                    {projects.map((project, index) => (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Button
                          variant="outline"
                          className="w-full justify-start neomorph-button border-0 h-10 lg:h-12"
                          onClick={() => {
                            setCurrentProject(project);
                            setShowWelcome(false);
                          }}
                        >
                          <div className="flex items-center gap-2 lg:gap-3">
                            <div 
                              className="w-2.5 lg:w-3 h-2.5 lg:h-3 rounded-full"
                              style={{ backgroundColor: project.brandConfig?.primaryColor || defaultBrandConfig.primaryColor }}
                            />
                            <span className="font-medium text-sm lg:text-base truncate">{project.title}</span>
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
        onBrandCustomize={() => setShowBrandCustomizer(true)}
      />
      
      <main className="p-3 lg:p-6 pb-6 lg:pb-8">
        <ChapterEditor
          chapters={currentProject.chapters}
          currentChapter={currentChapter}
          onChapterSelect={setCurrentChapter}
          onChapterCreate={createChapter}
          onChapterUpdate={updateChapter}
          onChapterDelete={deleteChapter}
          ebookCategory={currentProject.category || 'general'}
        />
      </main>

      <BrandCustomizer
        brandConfig={currentProject.brandConfig || defaultBrandConfig}
        onUpdate={updateBrandConfig}
        isOpen={showBrandCustomizer}
        onClose={() => setShowBrandCustomizer(false)}
      />

      {showTemplateGallery && (
        <TemplateGallery
          onSelectTemplate={createProjectFromTemplate}
          onClose={() => setShowTemplateGallery(false)}
        />
      )}
    </div>
  );
}

export default App;