import { useState, useEffect, lazy, Suspense } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useWritingAnalytics } from '@/hooks/use-writing-analytics';
import { useAuth } from '@/hooks/use-auth';
import { incrementPageUsage, syncPageUsage } from '@/lib/auth';
import { ProjectHeader } from '@/components/ProjectHeader';
import { Header } from '@/components/Header';
import { UsageTracker } from '@/components/UsageTracker';
import { AuthGuardDialog } from '@/components/AuthGuardDialog';
import { AuthModal } from '@/components/AuthModal';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from '@phosphor-icons/react';
import { EbookProject, Chapter, BrandConfig } from '@/lib/types';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

// Lazy load page components for code splitting
const Dashboard = lazy(() => import('@/components/Dashboard').then(module => ({ default: module.Dashboard })));
const ProjectsPage = lazy(() => import('@/components/ProjectsPage').then(module => ({ default: module.ProjectsPage })));
const TemplateGallery = lazy(() => import('@/components/TemplateGallery').then(module => ({ default: module.TemplateGallery })));
const SettingsPage = lazy(() => import('@/components/SettingsPage').then(module => ({ default: module.SettingsPage })));
const ProfilePage = lazy(() => import('@/components/ProfilePage').then(module => ({ default: module.ProfilePage })));

// Lazy load heavy components
const ChapterEditor = lazy(() => import('@/components/ChapterEditor').then(module => ({ default: module.ChapterEditor })));
const BrandCustomizer = lazy(() => import('@/components/BrandCustomizer').then(module => ({ default: module.BrandCustomizer })));

// Loading component for Suspense fallback
const PageLoading = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const defaultBrandConfig: BrandConfig = {
  primaryColor: '#8B5CF6',
  secondaryColor: '#A78BFA',
  accentColor: '#C4B5FD',
  fontFamily: 'Inter, sans-serif',
  coverStyle: 'gradient',
};

function App() {
  const { user, userProfile, refreshProfile } = useAuth();
  const [projects, setProjects] = useLocalStorage<EbookProject[]>('ebook-projects', []);
  const [currentProject, setCurrentProject] = useState<EbookProject | null>(null);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [showBrandCustomizer, setShowBrandCustomizer] = useState(false);
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [viewMode, setViewMode] = useState<'dashboard' | 'projects' | 'templates' | 'settings' | 'profile' | 'project'>('dashboard');
  const [showAuthGuard, setShowAuthGuard] = useState(false);
  const [authGuardAction, setAuthGuardAction] = useState("create an eBook");
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Writing analytics
  const { recordWritingSession } = useWritingAnalytics(projects);

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
    }
  }, [projects]);

  // Sync page usage with actual project data
  useEffect(() => {
    if (user && userProfile && projects.length > 0) {
      const actualPagesUsed = projects.reduce((total, project) => {
        return total + project.chapters.length;
      }, 0);
      
      // If the stored usage doesn't match actual usage, sync it
      if (userProfile.pagesUsed !== actualPagesUsed) {
        syncPageUsage(user.uid, actualPagesUsed).then(() => {
          refreshProfile();
        });
      }
    }
  }, [user, userProfile, projects, refreshProfile]);

  // Helper function to show auth guard
  const requireAuth = (action: string) => {
    if (!user) {
      setAuthGuardAction(action);
      setShowAuthGuard(true);
      return false;
    }
    return true;
  };

  const selectProject = (project: EbookProject) => {
    setCurrentProject(project);
    setCurrentChapter(null);
    setViewMode('project');
    setCurrentSection('editor');
  };

  const returnToDashboard = () => {
    setCurrentProject(null);
    setCurrentChapter(null);
    setViewMode('dashboard');
    setCurrentSection('dashboard');
  };

  const goToProjectsPage = () => {
    setCurrentProject(null);
    setCurrentChapter(null);
    setViewMode('projects');
    setCurrentSection('projects');
  };

  const goToTemplatesPage = () => {
    setCurrentProject(null);
    setCurrentChapter(null);
    setViewMode('templates');
    setCurrentSection('templates');
  };

  const goToSettingsPage = () => {
    setCurrentProject(null);
    setCurrentChapter(null);
    setViewMode('settings');
    setCurrentSection('settings');
  };

  const goToProfilePage = () => {
    setCurrentProject(null);
    setCurrentChapter(null);
    setViewMode('profile');
    setCurrentSection('profile');
  };

  const createProject = (title: string) => {
    // Check authentication first
    if (!requireAuth("create a new eBook project")) return;
    
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
    selectProject(newProject);
    toast.success('New ebook project created!');
  };

  const createProjectFromTemplate = (project: EbookProject) => {
    // Check authentication first
    if (!requireAuth("create an eBook from template")) return;
    
    setProjects(currentProjects => [...currentProjects, project]);
    selectProject(project);
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

  const deleteProject = (projectId: string) => {
    setProjects(currentProjects => currentProjects.filter(p => p.id !== projectId));
    toast.success('Project deleted successfully');
  };

  const duplicateProject = (project: EbookProject) => {
    const duplicatedProject: EbookProject = {
      ...project,
      id: crypto.randomUUID(),
      title: `${project.title} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setProjects(currentProjects => [...currentProjects, duplicatedProject]);
    toast.success('Project duplicated successfully');
  };

  const createChapter = async () => {
    if (!currentProject) return;
    
    // Check authentication first
    if (!requireAuth("create a new chapter")) return;

    // Check if user can create more pages
    if (!userProfile?.isPremium) {
      const currentUsage = userProfile?.pagesUsed || 0;
      const maxPages = userProfile?.maxPages || 4;
      
      if (currentUsage >= maxPages) {
        toast.error('Page limit reached! Upgrade to Premium for unlimited pages.');
        return;
      }
    }

    // Try to increment page usage
    const canCreatePage = await incrementPageUsage(user!.uid);
    if (!canCreatePage) {
      toast.error('Page limit reached! Upgrade to Premium for unlimited pages.');
      return;
    }

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
    
    // Refresh profile to update page usage in UI
    await refreshProfile();
    
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

  const reorderChapters = (startIndex: number, endIndex: number) => {
    if (!currentProject) return;

    const result = Array.from(currentProject.chapters);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    // Update order property for all chapters
    const reorderedChapters = result.map((chapter, index) => ({
      ...chapter,
      order: index,
      updatedAt: new Date(),
    }));

    updateProject({ chapters: reorderedChapters });
    toast.success('Chapters reordered!');
  };

  const handleNavigation = (section: string) => {
    setCurrentSection(section);
    switch (section) {
      case 'dashboard':
        returnToDashboard();
        break;
      case 'projects':
        goToProjectsPage();
        break;
      case 'templates':
        goToTemplatesPage();
        break;
      case 'settings':
        goToSettingsPage();
        break;
      case 'profile':
        goToProfilePage();
        break;
    }
  };

  return (
    <div className="min-h-screen bg-background font-['Inter']">
      <Header
        logoText="InkFluenceAI"
        onNavigate={handleNavigation}
        currentSection={currentSection}
        notifications={0}
      />
      
      {viewMode === 'dashboard' ? (
        <main className="p-3 lg:p-6 pb-6 lg:pb-8">
          <Suspense fallback={<PageLoading />}>
            <Dashboard
              projects={projects}
              onSelectProject={selectProject}
              onCreateProject={createProject}
              onShowTemplateGallery={goToTemplatesPage}
            />
          </Suspense>
        </main>
      ) : viewMode === 'projects' ? (
        <main className="p-3 lg:p-6 pb-6 lg:pb-8">
          <Suspense fallback={<PageLoading />}>
            <ProjectsPage
              projects={projects}
              onSelectProject={selectProject}
              onCreateProject={createProject}
              onShowTemplateGallery={goToTemplatesPage}
              onDeleteProject={deleteProject}
              onDuplicateProject={duplicateProject}
            />
          </Suspense>
        </main>
      ) : viewMode === 'templates' ? (
        <main className="p-3 lg:p-6 pb-6 lg:pb-8">
          <Suspense fallback={<PageLoading />}>
            <TemplateGallery
              onSelectTemplate={createProjectFromTemplate}
              onClose={() => {
                // Go back to where we came from
                if (currentSection === 'projects') {
                  goToProjectsPage();
                } else {
                  returnToDashboard();
                }
              }}
            />
          </Suspense>
        </main>
      ) : viewMode === 'settings' ? (
        <main className="p-3 lg:p-6 pb-6 lg:pb-8">
          <Suspense fallback={<PageLoading />}>
            <SettingsPage onBack={returnToDashboard} />
          </Suspense>
        </main>
      ) : viewMode === 'profile' ? (
        <main className="p-0">
          <Suspense fallback={<PageLoading />}>
            <ProfilePage onNavigate={handleNavigation} />
          </Suspense>
        </main>
      ) : currentProject ? (
        <>
          <div className="flex items-center gap-3 px-3 lg:px-6 pt-3 lg:pt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (viewMode === 'project') {
                  // Go back to where we came from (dashboard, projects, or templates)
                  if (currentSection === 'projects') {
                    goToProjectsPage();
                  } else if (currentSection === 'templates') {
                    goToTemplatesPage();
                  } else {
                    returnToDashboard();
                  }
                }
              }}
              className="neomorph-button border-0 gap-2"
            >
              <ArrowLeft size={16} />
              <span className="hidden lg:inline">
                {currentSection === 'projects' ? 'Back to Projects' : 
                 currentSection === 'templates' ? 'Back to Templates' : 
                 'Back to Dashboard'}
              </span>
              <span className="lg:hidden">Back</span>
            </Button>
          </div>
          
          <ProjectHeader
            project={currentProject}
            onProjectUpdate={updateProject}
            onBrandCustomize={() => setShowBrandCustomizer(true)}
            onUpgradeClick={() => setCurrentSection('profile')}
          />
          
          <main className="p-3 lg:p-6 pb-6 lg:pb-8 space-y-6">
            <UsageTracker 
              onUpgradeClick={() => setCurrentSection('profile')}
            />
            
            <Suspense fallback={<PageLoading />}>
              <ChapterEditor
                chapters={currentProject.chapters}
                currentChapter={currentChapter}
                onChapterSelect={setCurrentChapter}
                onChapterCreate={createChapter}
                onChapterUpdate={updateChapter}
                onChapterDelete={deleteChapter}
                onChapterReorder={reorderChapters}
                onRecordWritingSession={recordWritingSession}
                projectId={currentProject.id}
                ebookCategory={currentProject.category || 'general'}
              />
            </Suspense>
          </main>

          <Suspense fallback={<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>}>
            <BrandCustomizer
              brandConfig={currentProject.brandConfig || defaultBrandConfig}
              onUpdate={updateBrandConfig}
              isOpen={showBrandCustomizer}
              onClose={() => setShowBrandCustomizer(false)}
            />
          </Suspense>
        </>
      ) : null}

      <AuthGuardDialog
        isOpen={showAuthGuard}
        onClose={() => setShowAuthGuard(false)}
        onSignIn={() => {
          setShowAuthGuard(false);
          setShowAuthModal(true);
        }}
        action={authGuardAction}
      />

      <AuthModal
        isOpen={showAuthModal}
        onOpenChange={setShowAuthModal}
      />
    </div>
  );
}

export default App;