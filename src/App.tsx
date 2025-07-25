import { useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useWritingAnalytics } from '@/hooks/use-writing-analytics';
import { useAuth } from '@/hooks/use-auth';
import { incrementPageUsage, syncPageUsage } from '@/lib/auth';
import { ChapterEditor } from '@/components/ChapterEditor';
import { ProjectHeader } from '@/components/ProjectHeader';
import { Header } from '@/components/Header';
import { Dashboard } from '@/components/Dashboard';
import { ProjectsPage } from '@/components/ProjectsPage';
import { SettingsPage } from '@/components/SettingsPage';
import { ProfilePage } from '@/components/ProfilePage';
import { BrandCustomizer } from '@/components/BrandCustomizer';
import { TemplateGallery } from '@/components/TemplateGallery';
import { UsageTracker } from '@/components/UsageTracker';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from '@phosphor-icons/react';
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
  const { user, userProfile, refreshProfile } = useAuth();
  const [projects, setProjects] = useLocalStorage<EbookProject[]>('ebook-projects', []);
  const [currentProject, setCurrentProject] = useState<EbookProject | null>(null);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [showBrandCustomizer, setShowBrandCustomizer] = useState(false);
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [viewMode, setViewMode] = useState<'dashboard' | 'projects' | 'templates' | 'settings' | 'profile' | 'project'>('dashboard');

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
    if (!currentProject || !user) return;

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
    const canCreatePage = await incrementPageUsage(user.uid);
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
          <Dashboard
            projects={projects}
            onSelectProject={selectProject}
            onCreateProject={createProject}
            onShowTemplateGallery={goToTemplatesPage}
          />
        </main>
      ) : viewMode === 'projects' ? (
        <main className="p-3 lg:p-6 pb-6 lg:pb-8">
          <ProjectsPage
            projects={projects}
            onSelectProject={selectProject}
            onCreateProject={createProject}
            onShowTemplateGallery={goToTemplatesPage}
            onDeleteProject={deleteProject}
            onDuplicateProject={duplicateProject}
          />
        </main>
      ) : viewMode === 'templates' ? (
        <main className="p-3 lg:p-6 pb-6 lg:pb-8">
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
        </main>
      ) : viewMode === 'settings' ? (
        <main className="p-3 lg:p-6 pb-6 lg:pb-8">
          <SettingsPage onBack={returnToDashboard} />
        </main>
      ) : viewMode === 'profile' ? (
        <main className="p-0">
          <ProfilePage onNavigate={handleNavigation} />
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
          />
          
          <main className="p-3 lg:p-6 pb-6 lg:pb-8 space-y-6">
            <UsageTracker 
              onUpgradeClick={() => setCurrentSection('profile')}
            />
            
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
          </main>

          <BrandCustomizer
            brandConfig={currentProject.brandConfig || defaultBrandConfig}
            onUpdate={updateBrandConfig}
            isOpen={showBrandCustomizer}
            onClose={() => setShowBrandCustomizer(false)}
          />
        </>
      ) : null}
    </div>
  );
}

export default App;