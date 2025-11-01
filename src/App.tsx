import { useState, useEffect, lazy, Suspense, useRef, useCallback } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useWritingAnalytics } from '@/hooks/use-writing-analytics';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';
import { incrementPageUsage, syncPageUsage, updateUserProfile, canGenerateFullBook, getRemainingFullBooks, incrementFullBookGeneration } from '@/lib/auth';
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
import { ScrollToTop } from '@/components/ScrollToTop';
import { KeyboardShortcutsDialog } from '@/components/KeyboardShortcutsDialog';
import { CookieConsent } from '@/components/CookieConsent';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from '@phosphor-icons/react';
import { EbookProject, Chapter, BrandConfig } from '@/lib/types';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { AIBookGeneratorWizard } from '@/components/AIBookGeneratorWizard';

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
const PricingPage = lazy(() => import('@/components/PricingPage').then(module => ({ default: module.PricingPage })));
const FeaturesPage = lazy(() => import('@/components/FeaturesPage'));
const BlogPage = lazy(() => import('@/components/BlogPage'));
const ContactPage = lazy(() => import('@/components/ContactPage').then(module => ({ default: module.default })));
const TestimonialsPage = lazy(() => import('@/components/TestimonialsPage'));
const CaseStudiesPage = lazy(() => import('@/components/CaseStudiesPage'));
const FAQPage = lazy(() => import('@/components/FAQPage'));
const TryFreePage = lazy(() => import('@/components/TryFreePage').then(module => ({ default: module.TryFreePage })));

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
  const { actualTheme } = useTheme();
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
  const [upgradeHighlightMessage, setUpgradeHighlightMessage] = useState<string | undefined>(undefined);
  const [showAuthGuard, setShowAuthGuard] = useState(false);
  const [authGuardAction, setAuthGuardAction] = useState("create an eBook");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showBookGenerator, setShowBookGenerator] = useState(false);

  // Debounce timer for auto-save
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentProjectRef = useRef<EbookProject | null>(null);
  const userRef = useRef(user);
  const editorSaveRef = useRef<(() => void) | null>(null);

  // Keep refs in sync with current state
  useEffect(() => {
    currentProjectRef.current = currentProject;
  }, [currentProject]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Writing analytics
  const { recordWritingSession } = useWritingAnalytics(projects);

  // Keyboard shortcuts - save current project
  const handleSave = async () => {
    // If in editor, use editor's forceSave for proper state updates
    if (editorSaveRef.current) {
      editorSaveRef.current();
      return;
    }
    
    // Otherwise save at app level
    if (currentProject && user) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      try {
        await saveProject(user.uid, currentProject);
        toast.success('Saved!', { duration: 2000 });
      } catch (error) {
        console.error('Error saving:', error);
        toast.error('Failed to save');
      }
    }
  };

  useKeyboardShortcuts(
    handleSave,
    undefined, // AI assist handled in editor
    undefined, // Export handled per page
    undefined, // New project handled in dashboard
    undefined  // Search not implemented yet
  );

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

  // Function to reload projects (for use after migration, etc.)
  const reloadProjects = async () => {
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
    }
  };

  // Check if user needs onboarding
  useEffect(() => {
    if (user && userProfile && !userProfile.hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
  }, [user, userProfile]);

  // URL-based routing is now handled by React Router

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
        saveProject(userAtCleanup.uid, projectToSave).catch(error => {
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
        navigate('/app/dashboard');
      }
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (canceled === 'true') {
      toast.info('Payment canceled. You can upgrade anytime!');
      // Navigate to dashboard if authenticated, otherwise landing page
      if (user) {
        navigate('/app/dashboard');
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

  const openBookGenerator = useCallback(() => {
    if (!user) {
      setAuthGuardAction('use the AI Book Generator');
      setShowAuthGuard(true);
      return;
    }

    if (!userProfile) {
      toast.info('Loading your account details. Please try again in a moment.');
      return;
    }

    if (!canGenerateFullBook(userProfile)) {
      const remainingBooks = getRemainingFullBooks(userProfile);

      if (userProfile.subscriptionStatus === 'free' || userProfile.subscriptionStatus === 'trial') {
        setUpgradeHighlightMessage('Unlock the AI Book Generator with the Creator or Premium plan.');
        setShowUpgradeModal(true);
      } else if (userProfile.subscriptionStatus === 'creator' && typeof remainingBooks === 'number' && remainingBooks <= 0) {
        setUpgradeHighlightMessage('You’ve used all 5 AI book generations this month. Upgrade for unlimited access.');
        setShowUpgradeModal(true);
      } else {
        toast.info('Your current plan does not include the AI Book Generator.');
      }
      return;
    }

    setUpgradeHighlightMessage(undefined);
    setShowBookGenerator(true);
  }, [
    user,
    userProfile,
    setAuthGuardAction,
    setShowAuthGuard,
    setShowUpgradeModal,
    setUpgradeHighlightMessage,
    setShowBookGenerator,
    toast
  ]);

  const selectProject = (project: EbookProject) => {
    setCurrentProject(project);
    // Auto-select first chapter if available
    const firstChapter = project.chapters.length > 0 ? project.chapters[0] : null;
    setCurrentChapter(firstChapter);
    navigate('/app/editor');
    setCurrentSection('editor');
  };

  const handleBookGeneratorComplete = async (project: EbookProject) => {
    if (!user) {
      toast.error('Please sign in to save your AI-generated book.');
      return;
    }

    setShowBookGenerator(false);

    try {
      await saveProject(user.uid, project);
      setProjects(currentProjects => {
        const alreadyExists = currentProjects.some(existing => existing.id === project.id);
        return alreadyExists ? currentProjects : [...currentProjects, project];
      });

      try {
        await incrementFullBookGeneration(user.uid);
        await refreshProfile();
      } catch (usageError) {
        console.error('Error updating AI book usage:', usageError);
      }

      toast.success('AI-generated book saved to your projects!');
      selectProject(project);
    } catch (error) {
      console.error('Error saving AI-generated project:', error);
      toast.error('Failed to save AI-generated book. Please try again.');
    }
  };

  const returnToDashboard = async () => {
    // Force save before leaving
    if (currentProject && user) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      try {
        await saveProject(user.uid, currentProject);
      } catch (error) {
        console.error('❌ Error saving:', error);
        toast.error('Failed to save. Please try again.');
        return; // Don't navigate if save failed
      }
    }
    
    setCurrentProject(null);
    setCurrentChapter(null);
    navigate('/app/dashboard');
    setCurrentSection('dashboard');
  };

  const goToProjectsPage = async () => {
    // Force save before leaving
    if (currentProject && user) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      try {
        await saveProject(user.uid, currentProject);
      } catch (error) {
        console.error('❌ Error saving:', error);
        toast.error('Failed to save. Please try again.');
        return;
      }
    }
    
    setCurrentProject(null);
    setCurrentChapter(null);
    navigate('/app/projects');
    setCurrentSection('projects');
  };

  const goToTemplatesPage = () => {
    setCurrentProject(null);
    setCurrentChapter(null);
    navigate('/app/templates');
    setCurrentSection('templates');
  };

  const goToSnippetsPage = () => {
    setCurrentProject(null);
    setCurrentChapter(null);
    navigate('/app/snippets');
    setCurrentSection('snippets');
  };

  const goToSettingsPage = () => {
    // Settings merged into Profile page
    setCurrentProject(null);
    setCurrentChapter(null);
    navigate('/app/profile');
    setCurrentSection('profile');
  };

  const goToProfilePage = () => {
    setCurrentProject(null);
    setCurrentChapter(null);
    navigate('/app/profile');
    setCurrentSection('profile');
  };

  const createProject = async (projectData: { title: string; author?: string; category?: string; targetAudience?: string; description?: string }) => {
    // Check authentication first
    if (!requireAuth("create a new eBook project")) return;
    if (!user) return;
    
    // Create Chapter 1 by default for better UX
    const chapter1: Chapter = {
      id: crypto.randomUUID(),
      title: 'Chapter 1',
      content: '',
      order: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const newProject: EbookProject = {
      id: crypto.randomUUID(),
      title: projectData.title.trim() || 'Untitled Ebook',
      description: projectData.description?.trim() || '',
      author: projectData.author?.trim() || userProfile?.displayName || '',
      category: (projectData.category as any) || 'general',
      targetAudience: projectData.targetAudience?.trim(),
      chapters: [chapter1], // Start with Chapter 1
      brandConfig: { ...defaultBrandConfig },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      await saveProject(user.uid, newProject);
      setProjects(currentProjects => [...currentProjects, newProject]);
      selectProject(newProject);
      setCurrentChapter(chapter1); // Open Chapter 1 immediately
      
      // Show different success message based on whether setup was completed
      if (projectData.author && projectData.category) {
        toast.success('Project created! 🎉');
      } else {
        toast.success('New ebook project created!');
      }
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

  const importProject = async (importedData: Partial<EbookProject>) => {
    // Check authentication first
    if (!requireAuth("import a document")) return;
    if (!user) return;
    
    const newProject: EbookProject = {
      id: crypto.randomUUID(),
      title: importedData.title || 'Imported Document',
      description: importedData.description || 'Imported from file',
      author: importedData.author || userProfile?.displayName || '',
      category: importedData.category || 'general',
      chapters: importedData.chapters || [],
      brandConfig: importedData.brandConfig || { ...defaultBrandConfig },
      coverDesign: importedData.coverDesign,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      await saveProject(user.uid, newProject);
      setProjects(currentProjects => [...currentProjects, newProject]);
      selectProject(newProject);
      
      // Record writing session for imported words
      // This ensures the streak updates when you import content
      const totalWords = newProject.chapters.reduce((total, chapter) => {
        return total + (chapter.content?.split(/\s+/).filter(word => word.length > 0).length || 0);
      }, 0);
      
      if (totalWords > 0 && newProject.chapters.length > 0) {
        // Record session for the first chapter (representative of the import)
        recordWritingSession(newProject.id, newProject.chapters[0].id, totalWords);
      }
    } catch (error) {
      console.error('Error importing project:', error);
      toast.error('Failed to save imported project');
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
        // Verify user is still authenticated before saving
        const currentUser = userRef.current;
        if (!currentUser) {
          console.log('⚠️ Skipping save: User no longer authenticated');
          return;
        }
        await saveProject(currentUser.uid, updatedProject);
      } catch (error: any) {
        // Only show error toast if it's not a permissions error (which happens on logout)
        if (!error.message?.includes('permissions')) {
          console.error('❌ Error saving project:', error);
          toast.error('Failed to save changes. Please try again.');
        }
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
      navigate('/app/dashboard');
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
        setUpgradeHighlightMessage("You've reached your page limit! Upgrade to Premium for unlimited pages.");
        setShowUpgradeModal(true);
        return;
      }
    }

    // Try to increment page usage
    const canCreatePage = await incrementPageUsage(user.uid);
    if (!canCreatePage) {
      setUpgradeHighlightMessage("You've reached your page limit! Upgrade to Premium for unlimited pages.");
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
      case 'help':
        navigate('/app/help');
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
    <div className="min-h-screen font-['Inter']">
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={!user ? <LandingPage /> : <Navigate to="/app/dashboard" replace />} />
        <Route path="/try-free" element={
          <main className="p-0">
            <Suspense fallback={<PageLoading />}>
              <TryFreePage />
            </Suspense>
          </main>
        } />
        <Route path="/privacy" element={
          <main className="p-0">
            <Suspense fallback={<PageLoading />}>
              <PrivacyPolicy />
            </Suspense>
          </main>
        } />
        <Route path="/terms" element={
          <main className="p-0">
            <Suspense fallback={<PageLoading />}>
              <TermsOfService />
            </Suspense>
          </main>
        } />
        <Route path="/cookies" element={
          <main className="p-0">
            <Suspense fallback={<PageLoading />}>
              <CookiePolicy />
            </Suspense>
          </main>
        } />
        <Route path="/about" element={
          <main className="p-0">
            <Suspense fallback={<PageLoading />}>
              <AboutPage />
            </Suspense>
          </main>
        } />
        <Route path="/help" element={
          <main className="p-0">
            <Suspense fallback={<PageLoading />}>
              <HelpCenter />
            </Suspense>
          </main>
        } />
        <Route path="/pricing" element={
          <main className="p-0">
            <Suspense fallback={<PageLoading />}>
              <PricingPage />
            </Suspense>
          </main>
        } />
        <Route path="/features" element={
          <main className="p-0">
            <Suspense fallback={<PageLoading />}>
              <FeaturesPage />
            </Suspense>
          </main>
        } />
        <Route path="/blog" element={
          <main className="p-0">
            <Suspense fallback={<PageLoading />}>
              <BlogPage />
            </Suspense>
          </main>
        } />
        <Route path="/blog/:postId" element={
          <main className="p-0">
            <Suspense fallback={<PageLoading />}>
              <BlogPage />
            </Suspense>
          </main>
        } />
        <Route path="/contact" element={
          <main className="p-0">
            <Suspense fallback={<PageLoading />}>
              <ContactPage />
            </Suspense>
          </main>
        } />
        <Route path="/testimonials" element={
          <main className="p-0">
            <Suspense fallback={<PageLoading />}>
              <TestimonialsPage />
            </Suspense>
          </main>
        } />
        <Route path="/case-studies" element={
          <main className="p-0">
            <Suspense fallback={<PageLoading />}>
              <CaseStudiesPage />
            </Suspense>
          </main>
        } />
        <Route path="/faq" element={
          <main className="p-0">
            <Suspense fallback={<PageLoading />}>
              <FAQPage />
            </Suspense>
          </main>
        } />

        {/* Protected Routes - Dark mode scoped to dashboard only */}
        <Route path="/app/*" element={
          user ? (
            <div className={cn(
              'min-h-screen bg-background',
              actualTheme === 'dark' ? 'dashboard-dark' : ''
            )}>
              <Header
                logoText="Inkfluence AI"
                onNavigate={handleNavigation}
                currentSection={currentSection}
                notifications={0}
              />
              <Routes>
                <Route path="dashboard" element={
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
                          onImportProject={importProject}
                          onProjectsChanged={reloadProjects}
                          onNavigate={handleNavigation}
                          userProfile={userProfile}
                          onOpenBookGenerator={openBookGenerator}
                        />
                      )}
                    </Suspense>
                  </main>
                } />
                <Route path="projects" element={
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
                } />
                <Route path="templates" element={
                  <main className="p-3 lg:p-6 pb-6 lg:pb-8">
                    <Suspense fallback={<PageLoading />}>
                      <TemplateGallery
                        onSelectTemplate={createProjectFromTemplate}
                        onShowUpgradeModal={() => {
                          setUpgradeHighlightMessage('Unlock premium templates and advanced AI workflows with Creator or Premium.');
                          setShowUpgradeModal(true);
                        }}
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
                } />
                <Route path="snippets" element={
                  <main className="p-3 lg:p-6 pb-6 lg:pb-8">
                    <Suspense fallback={<PageLoading />}>
                      <SnippetsPage />
                    </Suspense>
                  </main>
                } />
                <Route path="profile" element={
                  <main className="p-0">
                    <Suspense fallback={<PageLoading />}>
                      <ProfilePage onNavigate={handleNavigation} />
                    </Suspense>
                  </main>
                } />
                <Route path="help" element={
                  <main className="p-0">
                    <Suspense fallback={<PageLoading />}>
                      <HelpCenter />
                    </Suspense>
                  </main>
                } />
                <Route path="editor" element={
                  currentProject ? (
                    <>
                      <ProjectHeader
                        project={currentProject}
                        onProjectUpdate={updateProject}
                        onBrandCustomize={() => setShowBrandCustomizer(true)}
                        onUpgradeClick={() => setCurrentSection('profile')}
                        onDeleteProject={handleDeleteCurrentProject}
                        onProjectsChanged={reloadProjects}
                        onBack={() => {
                          // Go back to where we came from (dashboard, projects, or templates)
                          if (currentSection === 'projects') {
                            goToProjectsPage();
                          } else if (currentSection === 'templates') {
                            goToTemplatesPage();
                          } else {
                            returnToDashboard();
                          }
                        }}
                        backLabel={
                          currentSection === 'projects' ? 'Back to Projects' : 
                          currentSection === 'templates' ? 'Back to Templates' : 
                          'Back to Dashboard'
                        }
                      />
                      
                      <main className="p-3 lg:p-6 pb-6 lg:pb-8 space-y-6">
                        <UsageTracker 
                          onUpgradeClick={() => {
                            setUpgradeHighlightMessage('Upgrade to unlock higher page limits and advanced analytics.');
                            setShowUpgradeModal(true);
                          }}
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
                            onSaveRef={editorSaveRef}
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
                  ) : (
                    <Navigate to="/app/dashboard" replace />
                  )
                } />
              </Routes>
              <AppFooter 
                onNavigateToPrivacy={() => navigate('/privacy')}
                onNavigateToTerms={() => navigate('/terms')}
                onNavigateToCookies={() => navigate('/cookies')}
                onNavigateToHelp={() => navigate('/help')}
                onNavigateToAbout={() => navigate('/about')}
              />
            </div>
          ) : (
            <Navigate to="/?signin=true" replace />
          )
        } />
      </Routes>

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
        onShowTemplates={goToTemplatesPage}
        onStartProject={() => createProject({ title: 'My First Ebook' })}
        onShowAIGenerate={() => {
          openBookGenerator();
          navigate('/app/dashboard');
        }}
      />

      <UpgradeModal
        open={showUpgradeModal}
        onClose={() => {
          setShowUpgradeModal(false);
          setUpgradeHighlightMessage(undefined);
        }}
        highlightMessage={upgradeHighlightMessage || "You've reached your page limit! Upgrade to Premium for unlimited pages."}
      />

      {user && userProfile && (
        <AIBookGeneratorWizard
          open={showBookGenerator}
          onClose={() => setShowBookGenerator(false)}
          onComplete={handleBookGeneratorComplete}
          userProfile={userProfile}
        />
      )}

      {/* Auth Modal - Show for both authenticated and non-authenticated users */}
      <AuthModal
        isOpen={showAuthModal}
        onOpenChange={setShowAuthModal}
      />

      {/* Keyboard Shortcuts Dialog */}
      <KeyboardShortcutsDialog />

      {/* Cookie Consent Banner */}
      <CookieConsent />
    </div>
  );
}

export default App;