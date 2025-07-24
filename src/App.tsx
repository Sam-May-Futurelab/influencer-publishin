import { useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { ChapterEditor } from '@/components/ChapterEditor';
import { ProjectHeader } from '@/components/ProjectHeader';
import { Header } from '@/components/Header';
import { Dashboard } from '@/components/Dashboard';
import { ProjectsPage } from '@/components/ProjectsPage';
import { SettingsPage } from '@/components/SettingsPage';
import { BrandCustomizer } from '@/components/BrandCustomizer';
import { TemplateGallery } from '@/components/TemplateGallery';
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
  const [projects, setProjects] = useLocalStorage<EbookProject[]>('ebook-projects', []);
  const [currentProject, setCurrentProject] = useState<EbookProject | null>(null);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [showBrandCustomizer, setShowBrandCustomizer] = useState(false);
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [viewMode, setViewMode] = useState<'dashboard' | 'projects' | 'templates' | 'settings' | 'project'>('dashboard');

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
    }
  };

  return (
    <div className="min-h-screen bg-background font-['Inter']">
      <Header
        logoText="Influencer Publishing"
        onNavigate={handleNavigation}
        currentSection={currentSection}
        userName={currentProject?.author || "Creator"}
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
        </>
      ) : null}
    </div>
  );
}

export default App;