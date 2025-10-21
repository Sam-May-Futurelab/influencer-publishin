import { useState, useEffect, lazy, Suspense, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWritingAnalytics } from '@/hooks/use-writing-analytics';
import { useAuth } from '@/hooks/use-auth';
import { incrementPageUsage, syncPageUsage, updateUserProfile } from '@/lib/auth';
import { getUserProjects, saveProject, deleteProject as deleteProjectFromFirestore } from '@/lib/projects';
import { ProjectHeader } from '@/components/ProjectHeader';
import { Header } from '@/components/Header';
import { AppFooter } from '@/components/AppFooter';
import { UsageTracker } from '@/components/UsageTracker';
import { AuthGuardDialog } from '@/components/AuthGuardDialog';
import { AuthModal } from '@/components/AuthModal';
import { Onboarding } from '@/components/Onboarding';
import { UpgradeModal } from '@/components/UpgradeModal';
import { LandingPage } from '@/components/LandingPage';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from '@phosphor-icons/react';
import { EbookProject, Chapter, BrandConfig } from '@/lib/types';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

// Lazy load page components for code splitting
const Dashboard = lazy(() => import('@/components/Dashboard').then(module => ({ default: module.Dashboard })));
const ProjectsPage = lazy(() => import('@/components/ProjectsPage').then(module => ({ default: module.ProjectsPage })));
const TemplateGallery = lazy(() => import('@/components/TemplateGallery').then(module => ({ default: module.TemplateGallery })));
const SnippetsPage = lazy(() => import('@/components/SnippetsPage').then(module => ({ default: module.SnippetsPage })));
const ProfilePage = lazy(() => import('@/components/ProfilePage').then(module => ({ default: module.ProfilePage })));
const PrivacyPolicy = lazy(() => import('@/components/PrivacyPolicy').then(module => ({ default: module.PrivacyPolicy })));
const TermsOfService = lazy(() => import('@/components/TermsOfService').then(module => ({ default: module.TermsOfService })));
const CookiePolicy = lazy(() => import('@/components/CookiePolicy').then(module => ({ default: module.CookiePolicy })));
const AboutPage = lazy(() => import('@/components/AboutPage').then(module => ({ default: module.AboutPage })));
const HelpCenter = lazy(() => import('@/components/HelpCenter').then(module => ({ default: module.HelpCenter })));

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
  const { user, userProfile, loading: authLoading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [projects, setProjects] = useState<EbookProject[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [currentProject, setCurrentProject] = useState<EbookProject | null>(null);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [showBrandCustomizer, setShowBrandCustomizer] = useState(false);
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [viewMode, setViewMode] = useState<'dashboard' | 'projects' | 'templates' | 'snippets' | 'profile' | 'project' | 'privacy' | 'terms' | 'cookies' | 'about' | 'help'>('dashboard');
  const [showAuthGuard, setShowAuthGuard] = useState(false);
  const [authGuardAction, setAuthGuardAction] = useState("create an eBook");
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Debounce timer for auto-save
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentProjectRef = useRef<EbookProject | null>(null);

  // Keep ref in sync with current project
  useEffect(() => {
    currentProjectRef.current = currentProject;
  }, [currentProject]);

  // Writing analytics
  const { recordWritingSession } = useWritingAnalytics(projects);

  // Load projects from Firebase when user logs in
  useEffect(() => {
    const loadProjects = async () => {
      if (user) {
        setProjectsLoading(true);
        try {
          const userProjects = await getUserProjects(user.uid);
          setProjects(userProjects);
        } catch (error) {
          console.error('Error loading projects:', error);
          toast.error('Failed to load your projects');
        } finally {
          setProjectsLoading(false);
        }
      } else {
        // Clear projects when user logs out and reset to landing page
        setProjects([]);
        setCurrentProject(null);
        setCurrentChapter(null);
        // Don't set viewMode here - let the render logic handle showing landing page when !user
      }
    };

    loadProjects();
  }, [user]);

  // Check if user needs onboarding
  useEffect(() => {
    if (user && userProfile && !userProfile.hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
  }, [user, userProfile]);

  // Sync URL with viewMode state
  useEffect(() => {
    const path = location.pathname;
    if (path === '/about' && viewMode !== 'about') {
      setViewMode('about');
    } else if (path === '/help' && viewMode !== 'help') {
      setViewMode('help');
    } else if (path === '/privacy' && viewMode !== 'privacy') {
      setViewMode('privacy');
    } else if (path === '/terms' && viewMode !== 'terms') {
      setViewMode('terms');
    } else if (path === '/cookies' && viewMode !== 'cookies') {
      setViewMode('cookies');
    } else if (path === '/' && ['about', 'help', 'privacy', 'terms', 'cookies'].includes(viewMode)) {
      setViewMode('dashboard');
    }
  }, [location.pathname, viewMode]);

  // Update URL when viewMode changes
  useEffect(() => {
    const currentPath = location.pathname;
    let targetPath = '/';
    
    switch (viewMode) {
      case 'about':
        targetPath = '/about';
        break;
      case 'help':
        targetPath = '/help';
        break;
      case 'privacy':
        targetPath = '/privacy';
        break;
      case 'terms':
        targetPath = '/terms';
        break;
      case 'cookies':
        targetPath = '/cookies';
        break;
      default:
        targetPath = '/';
        break;
    }
    
    if (currentPath !== targetPath) {
      navigate(targetPath, { replace: true });
    }
  }, [viewMode, navigate, location.pathname]);

  // Force save on unmount or when currentProject changes
  useEffect(() => {
    // Store user in a ref to check at cleanup time
    const currentUserRef = { current: user };
    
    return () => {
      // Clear timeout on unmount
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      // Force save the current project if it exists AND user is still logged in
      const projectToSave = currentProjectRef.current;
      const userAtCleanup = currentUserRef.current;
      
      if (projectToSave && userAtCleanup) {
        console.log('🔄 Force saving on unmount...', {
          id: projectToSave.id,
          title: projectToSave.title,
          chaptersCount: projectToSave.chapters.length
        });
        saveProject(userAtCleanup.uid, projectToSave).then(() => {
          console.log('✅ Force save completed');
        }).catch(error => {
          // Only log error if it's not a permissions error (which happens on logout)
          if (!error.message?.includes('permissions')) {
            console.error('❌ Error saving on unmount:', error);
          }
        });
      }
    };
  }, [user]); // Only depend on user, not currentProject (we use ref instead)

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

  // Handle Stripe checkout success/cancel redirects
  useEffect(() => {
    // Don't process if still checking auth
    if (authLoading) return;

    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const canceled = urlParams.get('canceled');
    const sessionId = urlParams.get('session_id');

    if (success === 'true' && sessionId) {
      // Ensure user is authenticated before showing success
      if (user) {
        toast.success('Payment successful! Your premium features will be activated shortly.');
        // Refresh user profile to get updated premium status
        setTimeout(() => {
          refreshProfile();
        }, 2000);
        // Navigate to dashboard after showing success
        setViewMode('dashboard');
      }
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (canceled === 'true') {
      toast.info('Payment canceled. You can upgrade anytime!');
      // Navigate to dashboard if authenticated, otherwise landing page
      if (user) {
        setViewMode('dashboard');
      }
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [refreshProfile, authLoading, user]);

  // Helper function to show auth guard
  const requireAuth = (action: string) => {
    if (!user) {
      setAuthGuardAction(action);
      setShowAuthGuard(true);
      return false;
    }
    return true;
  };

  // Onboarding handlers
  const handleOnboardingComplete = async () => {
    if (user) {
      await updateUserProfile(user.uid, { hasCompletedOnboarding: true });
      await refreshProfile();
      setShowOnboarding(false);
      toast.success('Welcome to Inkfluence AI! 🎉');
    }
  };

  const handleOnboardingSkip = async () => {
    if (user) {
      await updateUserProfile(user.uid, { hasCompletedOnboarding: true });
      await refreshProfile();
      setShowOnboarding(false);
    }
  };

  const selectProject = (project: EbookProject) => {
    setCurrentProject(project);
    setCurrentChapter(null);
    setViewMode('project');
    setCurrentSection('editor');
  };

  const returnToDashboard = async () => {
    // Force save before leaving
    if (currentProject && user) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      console.log('💾 Saving before returning to dashboard...');
      try {
        await saveProject(user.uid, currentProject);
        console.log('✅ Save completed');
      } catch (error) {
        console.error('❌ Error saving:', error);
        toast.error('Failed to save. Please try again.');
        return; // Don't navigate if save failed
      }
    }
    
    setCurrentProject(null);
    setCurrentChapter(null);
    setViewMode('dashboard');
    setCurrentSection('dashboard');
  };

  const goToProjectsPage = async () => {
    // Force save before leaving
    if (currentProject && user) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      console.log('💾 Saving before going to projects page...');
      try {
        await saveProject(user.uid, currentProject);
        console.log('✅ Save completed');
      } catch (error) {
        console.error('❌ Error saving:', error);
        toast.error('Failed to save. Please try again.');
        return;
      }
    }
    
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

  const goToSnippetsPage = () => {
    setCurrentProject(null);
    setCurrentChapter(null);
    setViewMode('snippets');
    setCurrentSection('snippets');
  };

  const goToSettingsPage = () => {
    // Settings merged into Profile page
    setCurrentProject(null);
    setCurrentChapter(null);
    setViewMode('profile');
    setCurrentSection('profile');
  };

  const goToProfilePage = () => {
    setCurrentProject(null);
    setCurrentChapter(null);
    setViewMode('profile');
    setCurrentSection('profile');
  };

  const createProject = async (title: string) => {
    // Check authentication first
    if (!requireAuth("create a new eBook project")) return;
    if (!user) return;
    
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

    try {
      await saveProject(user.uid, newProject);
      setProjects(currentProjects => [...currentProjects, newProject]);
      selectProject(newProject);
      toast.success('New ebook project created!');
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
    }
  };

  const createProjectFromTemplate = async (project: EbookProject) => {
    // Check authentication first
    if (!requireAuth("create an eBook from template")) return;
    if (!user) return;
    
    try {
      await saveProject(user.uid, project);
      setProjects(currentProjects => [...currentProjects, project]);
      selectProject(project);
      toast.success('Ebook created from template!');
    } catch (error) {
      console.error('Error creating project from template:', error);
      toast.error('Failed to create project from template');
    }
  };

  const updateProject = async (updates: Partial<EbookProject>) => {
    if (!currentProject || !user) return;

    const updatedProject = {
      ...currentProject,
      ...updates,
      updatedAt: new Date(),
    };

    // Update local state immediately for responsive UI
    setCurrentProject(updatedProject);
    setProjects(currentProjects => 
      currentProjects.map(p => p.id === currentProject.id ? updatedProject : p)
    );

    // Debounce Firebase save to prevent too many writes
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        console.log('Saving project to Firebase:', {
          id: updatedProject.id,
          title: updatedProject.title,
          chaptersCount: updatedProject.chapters.length,
          chapters: updatedProject.chapters.map(ch => ({
            id: ch.id,
            title: ch.title,
            contentLength: ch.content.length
          }))
        });
        await saveProject(user.uid, updatedProject);
        console.log('✅ Project auto-saved to Firebase successfully');
      } catch (error) {
        console.error('❌ Error saving project:', error);
        toast.error('Failed to save changes. Please try again.');
      }
    }, 1000); // Save after 1 second of inactivity
  };

  const updateBrandConfig = (brandConfig: BrandConfig) => {
    updateProject({ brandConfig });
  };

  const deleteProject = async (projectId: string) => {
    if (!user) return;

    try {
      await deleteProjectFromFirestore(user.uid, projectId);
      setProjects(currentProjects => currentProjects.filter(p => p.id !== projectId));
      toast.success('Project deleted successfully');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  };

  const renameProject = async (projectId: string, newTitle: string) => {
    if (!user || !newTitle.trim()) return;

    try {
      // Update in state
      setProjects(currentProjects => 
        currentProjects.map(p => 
          p.id === projectId 
            ? { ...p, title: newTitle.trim(), updatedAt: new Date() }
            : p
        )
      );

      // If it's the current project, update that too
      if (currentProject?.id === projectId) {
        setCurrentProject(prev => prev ? { ...prev, title: newTitle.trim(), updatedAt: new Date() } : null);
      }

      // Save to Firebase
      const projectToUpdate = projects.find(p => p.id === projectId);
      if (projectToUpdate) {
        const updatedProject = { ...projectToUpdate, title: newTitle.trim(), updatedAt: new Date() };
        await saveProject(user.uid, updatedProject);
      }

      toast.success('Project renamed successfully');
    } catch (error) {
      console.error('Error renaming project:', error);
      toast.error('Failed to rename project');
    }
  };

  const handleDeleteCurrentProject = async () => {
    if (!currentProject || !user) return;

    const projectId = currentProject.id;

    try {
      // Delete from Firebase first
      await deleteProjectFromFirestore(user.uid, projectId);
      
      // Then update local state
      setProjects(currentProjects => currentProjects.filter(p => p.id !== projectId));
      
      // Clear current project without saving
      setCurrentProject(null);
      setCurrentChapter(null);
      setViewMode('dashboard');
      setCurrentSection('dashboard');
      
      toast.success('Project deleted successfully');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  };

  const duplicateProject = async (project: EbookProject) => {
    if (!user) return;

    const duplicatedProject: EbookProject = {
      ...project,
      id: crypto.randomUUID(),
      title: `${project.title} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      await saveProject(user.uid, duplicatedProject);
      setProjects(currentProjects => [...currentProjects, duplicatedProject]);
      toast.success('Project duplicated successfully');
    } catch (error) {
      console.error('Error duplicating project:', error);
      toast.error('Failed to duplicate project');
    }
  };

  const toggleFavorite = async (projectId: string) => {
    if (!user) return;

    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const updatedProject = {
      ...project,
      isFavorite: !project.isFavorite,
      updatedAt: new Date(),
    };

    try {
      await saveProject(user.uid, updatedProject);
      setProjects(currentProjects =>
        currentProjects.map(p => p.id === projectId ? updatedProject : p)
      );
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorite');
    }
  };

  const createChapter = async () => {
    if (!currentProject) return;
    
    // Check authentication first
    if (!requireAuth("create a new chapter")) return;
    if (!user) return;

    // Check if user can create more pages
    if (!userProfile?.isPremium) {
      const currentUsage = userProfile?.pagesUsed || 0;
      const maxPages = userProfile?.maxPages || 4;
      
      if (currentUsage >= maxPages) {
        setShowUpgradeModal(true);
        return;
      }
    }

    // Try to increment page usage
    const canCreatePage = await incrementPageUsage(user.uid);
    if (!canCreatePage) {
      setShowUpgradeModal(true);
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
      case 'snippets':
        goToSnippetsPage();
        break;
      case 'settings':
        goToSettingsPage();
        break;
      case 'profile':
        goToProfilePage();
        break;
    }
  };

  // Show loading screen while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background font-['Inter'] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-['Inter']">
      {/* Show legal pages for both authenticated and non-authenticated users */}
      {viewMode === 'privacy' ? (
        <main className="p-0">
          <Suspense fallback={<PageLoading />}>
            <PrivacyPolicy onBack={() => {
              if (user) {
                returnToDashboard();
              } else {
                setViewMode('dashboard');
              }
            }} />
          </Suspense>
        </main>
      ) : viewMode === 'terms' ? (
        <main className="p-0">
          <Suspense fallback={<PageLoading />}>
            <TermsOfService onBack={() => {
              if (user) {
                returnToDashboard();
              } else {
                setViewMode('dashboard');
              }
            }} />
          </Suspense>
        </main>
      ) : viewMode === 'cookies' ? (
        <main className="p-0">
          <Suspense fallback={<PageLoading />}>
            <CookiePolicy onBack={() => {
              if (user) {
                returnToDashboard();
              } else {
                setViewMode('dashboard');
              }
            }} />
          </Suspense>
        </main>
      ) : viewMode === 'about' ? (
        <main className="p-0">
          <Suspense fallback={<PageLoading />}>
            <AboutPage 
              onNavigate={(page) => {
                if (page === 'landing') {
                  if (user) {
                    returnToDashboard();
                  } else {
                    setViewMode('dashboard');
                  }
                } else if (page === 'dashboard') {
                  if (user) {
                    returnToDashboard();
                  } else {
                    setShowAuthModal(true);
                  }
                } else if (page === 'help') {
                  setViewMode('help');
                }
              }}
              isAuthenticated={!!user}
            />
          </Suspense>
        </main>
      ) : viewMode === 'help' ? (
        <main className="p-0">
          <Suspense fallback={<PageLoading />}>
            <HelpCenter 
              onNavigate={(page) => {
                if (page === 'landing') {
                  if (user) {
                    returnToDashboard();
                  } else {
                    setViewMode('dashboard');
                  }
                } else if (page === 'dashboard') {
                  if (user) {
                    returnToDashboard();
                  } else {
                    setShowAuthModal(true);
                  }
                } else if (page === 'about') {
                  setViewMode('about');
                }
              }}
              isAuthenticated={!!user}
            />
          </Suspense>
        </main>
      ) : !user ? (
        /* Show Landing Page if user is not authenticated */
        <LandingPage 
          onGetStarted={() => setShowAuthModal(true)}
          onSignIn={() => setShowAuthModal(true)}
          onNavigateToPrivacy={() => setViewMode('privacy')}
          onNavigateToTerms={() => setViewMode('terms')}
          onNavigateToCookies={() => setViewMode('cookies')}
          onNavigateToHelp={() => setViewMode('help')}
          onNavigateToAbout={() => setViewMode('about')}
        />
      ) : user && (
        <>
          <Header
            logoText="Inkfluence AI"
            onNavigate={handleNavigation}
            currentSection={currentSection}
            notifications={0}
          />
          
          {viewMode === 'dashboard' ? (
            <main className="p-3 lg:p-6 pb-6 lg:pb-8">
              <Suspense fallback={<PageLoading />}>
                {projectsLoading ? (
                  <PageLoading />
                ) : (
              <Dashboard
                projects={projects}
                onSelectProject={selectProject}
                onCreateProject={createProject}
                onShowTemplateGallery={goToTemplatesPage}
                onDeleteProject={deleteProject}
              />
            )}
          </Suspense>
        </main>
      ) : viewMode === 'projects' ? (
        <main className="p-3 lg:p-6 pb-6 lg:pb-8">
          <Suspense fallback={<PageLoading />}>
            {projectsLoading ? (
              <PageLoading />
            ) : (
              <ProjectsPage
                projects={projects}
                onSelectProject={selectProject}
                onCreateProject={createProject}
                onShowTemplateGallery={goToTemplatesPage}
                onDeleteProject={deleteProject}
                onRenameProject={renameProject}
                onDuplicateProject={duplicateProject}
                onToggleFavorite={toggleFavorite}
              />
            )}
          </Suspense>
        </main>
      ) : viewMode === 'templates' ? (
        <main className="p-3 lg:p-6 pb-6 lg:pb-8">
          <Suspense fallback={<PageLoading />}>
            <TemplateGallery
              onSelectTemplate={createProjectFromTemplate}
              onShowUpgradeModal={() => setShowUpgradeModal(true)}
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
      ) : viewMode === 'snippets' ? (
        <main className="p-3 lg:p-6 pb-6 lg:pb-8">
          <Suspense fallback={<PageLoading />}>
            <SnippetsPage />
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
            onDeleteProject={handleDeleteCurrentProject}
          />
          
          <main className="p-3 lg:p-6 pb-6 lg:pb-8 space-y-6">
            <UsageTracker 
              onUpgradeClick={() => setShowUpgradeModal(true)}
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
                targetAudience={currentProject.targetAudience}
                projectTitle={currentProject.title}
                projectAuthor={currentProject.author}
                projectDescription={currentProject.description}
                brandConfig={currentProject.brandConfig}
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

      <Onboarding
        open={showOnboarding}
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingSkip}
      />

      <UpgradeModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        highlightMessage="You've reached your page limit! Upgrade to Premium for unlimited pages."
      />

          {/* App Footer - Only show when authenticated */}
          <AppFooter 
            onNavigateToPrivacy={() => setViewMode('privacy')}
            onNavigateToTerms={() => setViewMode('terms')}
            onNavigateToCookies={() => setViewMode('cookies')}
            onNavigateToHelp={() => setViewMode('help')}
            onNavigateToAbout={() => setViewMode('about')}
          />
        </>
      )}

      {/* Auth Modal - Show for both authenticated and non-authenticated users */}
      <AuthModal
        isOpen={showAuthModal}
        onOpenChange={setShowAuthModal}
      />
    </div>
  );
}

export default App;