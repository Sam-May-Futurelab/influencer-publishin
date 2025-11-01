import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { usePreviewMigration } from '@/hooks/use-preview-migration';
import { useAuth } from '@/hooks/use-auth';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  BookOpen, 
  Plus, 
  FileText, 
  MagnifyingGlass,
  GridFour,
  ListBullets,
  Eye,
  Sparkle,
  Rocket,
  Trash,
  Pencil,
  Fire,
  CheckCircle,
  Clock,
  Target,
  Calendar,
  UploadSimple,
  FilePlus,
  ArrowRight,
  SpeakerHigh,
  Download
} from '@phosphor-icons/react';
import { EbookProject } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { PreviewDialog } from '@/components/PreviewDialog';
import { AudioPlayer } from '@/components/AudioPlayer';
import { useWritingAnalytics } from '@/hooks/use-writing-analytics';
import { WritingStreakCard, GoalProgressCard, ProjectCompletionCard } from '@/components/AnalyticsCards';
import { importFile } from '@/lib/import';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ProjectSetupDialog } from '@/components/ProjectSetupDialog';
import { UserProfile, canGenerateFullBook, getRemainingFullBooks } from '@/lib/auth';

interface DashboardProps {
  projects: EbookProject[];
  onSelectProject: (project: EbookProject) => void;
  onCreateProject: (projectData: { title: string; author?: string; category?: string; targetAudience?: string; description?: string }) => void;
  onShowTemplateGallery: () => void;
  onDeleteProject?: (projectId: string) => void;
  onImportProject?: (project: Partial<EbookProject>) => void;
  onProjectsChanged?: () => Promise<void>;
  onNavigate?: (section: string) => void;
  userProfile?: UserProfile | null;
  onOpenBookGenerator?: () => void;
}

export function Dashboard({ 
  projects, 
  onSelectProject, 
  onCreateProject,
  onShowTemplateGallery,
  onDeleteProject,
  onImportProject,
  onProjectsChanged,
  onNavigate,
  userProfile,
  onOpenBookGenerator
}: DashboardProps) {
  const { stats, totalWords, goals, progress } = useWritingAnalytics(projects);
  const { hasPreview, previewData, isMigrating, migrateToAccount, dismissPreview } = usePreviewMigration();
  const { user } = useAuth();
  
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [previewProject, setPreviewProject] = useState<EbookProject | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<EbookProject | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [splitOnH2, setSplitOnH2] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Audiobooks state
  const [audiobooks, setAudiobooks] = useState<any[]>([]);
  const [loadingAudiobooks, setLoadingAudiobooks] = useState(true);
  const [audiobookToDelete, setAudiobookToDelete] = useState<any | null>(null);
  const [showDeleteAudiobookDialog, setShowDeleteAudiobookDialog] = useState(false);
  
  // Project setup dialog state
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [pendingProjectTitle, setPendingProjectTitle] = useState('');
  
  // AI Book Generator quick action is controlled by parent via onOpenBookGenerator
  const canUseAiBookGenerator = userProfile ? canGenerateFullBook(userProfile) : false;
  const remainingAiBooks = userProfile ? getRemainingFullBooks(userProfile) : null;

  const filteredProjects = projects.filter((project) =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedProjects = [...filteredProjects].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  
  // Load audiobooks
  useEffect(() => {
    const loadAudiobooks = async () => {
      if (!user?.uid) {
        setLoadingAudiobooks(false);
        return;
      }

      try {
        const audiobooksRef = collection(db, 'audiobooks');
        const q = query(
          audiobooksRef,
          where('userId', '==', user.uid)
        );
        
        const snapshot = await getDocs(q);
        const loadedAudiobooks = snapshot.docs.map(doc => {
          const data = doc.data();
          const project = projects.find(p => p.id === data.projectId);
          return {
            id: doc.id,
            ...data,
            projectTitle: data.projectTitle || project?.title || 'Unknown Project'
          };
        });

        setAudiobooks(loadedAudiobooks);
      } catch (error) {
        console.error('Failed to load audiobooks:', error);
      } finally {
        setLoadingAudiobooks(false);
      }
    };

    loadAudiobooks();
  }, [user?.uid, projects]);
  
  // Handle preview migration
  const handleMigratePreview = async () => {
    const migratedProject = await migrateToAccount();
    if (migratedProject) {
      toast.success('Your preview has been added to your projects!');
      
      // Reload projects list to include the new migrated project
      if (onProjectsChanged) {
        await onProjectsChanged();
      }
      
      // Navigate to the new project
      onSelectProject(migratedProject);
    }
  };
  const handleCreateProject = () => {
    if (newProjectTitle.trim()) {
      setPendingProjectTitle(newProjectTitle.trim());
      setShowSetupDialog(true);
    }
  };

  const handleSetupComplete = (data: { title: string; author: string; category: string; targetAudience: string; description: string }) => {
    onCreateProject(data);
    setShowSetupDialog(false);
    setNewProjectTitle('');
    setPendingProjectTitle('');
  };

  const handleSetupSkip = () => {
    onCreateProject({ title: pendingProjectTitle });
    setShowSetupDialog(false);
    setNewProjectTitle('');
    setPendingProjectTitle('');
  };

  // Keyboard shortcuts
  useKeyboardShortcuts(
    undefined,
    undefined,
    undefined,
    () => {
      // Focus the new project input on Cmd/Ctrl+N
      const input = document.querySelector('input[placeholder*="project"]') as HTMLInputElement;
      if (input) input.focus();
    },
    undefined
  );

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await processFile(file);
  };

  const handleFileDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    
    const file = event.dataTransfer.files?.[0];
    if (!file) return;

    // Check file type
    const validTypes = ['.docx', '.doc', '.txt'];
    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!validTypes.includes(fileExt)) {
      toast.error('Please upload a .docx or .txt file');
      return;
    }

    await processFile(file);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const processFile = async (file: File) => {
    setIsImporting(true);
    
    try {
      const result = await importFile(file, { splitOnH2 });
      
      if (result.success && result.chapters && result.project) {
        // Call the parent's import handler
        if (onImportProject) {
          onImportProject({
            ...result.project,
            chapters: result.chapters,
          });
          toast.success(`Successfully imported "${result.project.title}" with ${result.chapters.length} chapter${result.chapters.length === 1 ? '' : 's'}!`, {
            duration: 4000
          });
          setShowImportDialog(false);
        }
      } else {
        toast.error(result.error || 'Failed to import file');
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('An error occurred while importing the file');
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getProjectStats = (project: EbookProject) => {
    const wordCount = project.chapters.reduce((total, chapter) => {
      return total + (chapter.content?.split(/\s+/).filter(word => word.length > 0).length || 0);
    }, 0);
    
    return {
      chapters: project.chapters.length,
      words: wordCount,
      pages: Math.ceil(wordCount / 250)
    };
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date));
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-3"
      >
        <h1 className="text-2xl lg:text-4xl font-bold">
          {projects.length === 0 ? 'Create Your First Ebook' : 'Your Ebook Dashboard'}
        </h1>
        <p className="text-muted-foreground text-sm lg:text-base max-w-2xl mx-auto">
          {projects.length === 0 
            ? 'Start with AI-powered templates or create from scratch. Your publishing journey begins here.' 
            : `You've created ${projects.length} ebook${projects.length === 1 ? '' : 's'}. Keep going! 🚀`
          }
        </p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 max-w-7xl mx-auto"
      >
        {/* Create New Project */}
        <Card className="neomorph-flat border-0 hover:neomorph-raised transition-all duration-300">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl neomorph-inset">
                <Plus size={20} className="text-primary" />
              </div>
              <h3 className="font-semibold text-sm lg:text-base">Create New</h3>
            </div>
            <div className="space-y-3">
              <Input
                placeholder="Enter project title..."
                value={newProjectTitle}
                onChange={(e) => setNewProjectTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                className="neomorph-inset border-0 text-sm"
              />
              <Button
                onClick={handleCreateProject}
                disabled={!newProjectTitle.trim()}
                className="w-full neomorph-button border-0 text-sm min-h-[40px]"
              >
                <Plus size={16} />
                Create Project
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Import from File */}
        <Card className="neomorph-flat border-0 hover:neomorph-raised transition-all duration-300">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl neomorph-inset">
                <UploadSimple size={20} className="text-primary" weight="fill" />
              </div>
              <h3 className="font-semibold text-sm lg:text-base">Import File</h3>
            </div>
            <p className="text-xs lg:text-sm text-muted-foreground mb-4">
              Import from Google Docs (.docx) or text files with automatic chapter detection.
            </p>
            <Button
              onClick={() => setShowImportDialog(true)}
              variant="outline"
              className="w-full neomorph-button border-0 text-sm min-h-[40px]"
            >
              <FilePlus size={16} />
              Import Document
            </Button>
          </CardContent>
        </Card>

        {/* Use Template */}
        <Card className="neomorph-flat border-0 hover:neomorph-raised transition-all duration-300">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl neomorph-inset">
                <Sparkle size={20} className="text-accent" weight="fill" />
              </div>
              <h3 className="font-semibold text-sm lg:text-base">AI Template</h3>
            </div>
            <p className="text-xs lg:text-sm text-muted-foreground mb-4">
              Jump-start your ebook with professional, AI-powered templates.
            </p>
            <Button
              onClick={onShowTemplateGallery}
              variant="outline"
              className="w-full neomorph-button border-0 text-sm min-h-[40px]"
            >
              <Rocket size={16} />
              Browse Templates
            </Button>
          </CardContent>
        </Card>

        {/* AI Book Generator - NEW */}
        <Card className="neomorph-flat border-0 hover:neomorph-raised transition-all duration-300 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-primary/10 to-purple-500/10 pointer-events-none" />
          <CardContent className="p-4 lg:p-6 relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-600 to-primary shadow-lg">
                <Sparkle size={20} className="text-white" weight="fill" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm lg:text-base">AI Book Generator</h3>
                <Badge variant="secondary" className="text-[10px] mt-1 bg-gradient-to-r from-purple-500 to-primary text-white border-0">New!</Badge>
              </div>
            </div>
            <p className="text-xs lg:text-sm text-muted-foreground mb-4">
              Generate a complete ebook (6-15 chapters) with AI in minutes.
            </p>
            <Button
              onClick={() => onOpenBookGenerator?.()}
              disabled={!userProfile}
              className={cn(
                'w-full neomorph-button border-0 text-sm min-h-[40px] bg-gradient-to-r from-purple-600 to-primary hover:from-purple-700 hover:to-primary/90 text-white',
                !canUseAiBookGenerator && userProfile && 'opacity-80 hover:opacity-90'
              )}
            >
              <Sparkle size={16} weight="fill" />
              {userProfile
                ? canUseAiBookGenerator
                  ? 'Generate Full Book'
                  : userProfile.subscriptionStatus === 'free'
                    ? 'Unlock AI Book Generator'
                    : 'Upgrade for More Books'
                : 'Generate Full Book'}
            </Button>
            
            {/* Usage indicator */}
            {userProfile && (
              <div className="mt-3 text-xs text-muted-foreground text-center">
                {userProfile.subscriptionStatus === 'free' && (
                  <Badge variant="outline" className="text-xs">Premium Feature</Badge>
                )}
                {userProfile.subscriptionStatus === 'creator' && typeof remainingAiBooks === 'number' && (
                  <div className="space-y-1">
                    <span>{remainingAiBooks} of 5 books left this month</span>
                    {remainingAiBooks === 0 && (
                      <span className="block text-[11px] text-muted-foreground/80">Upgrade for unlimited AI books</span>
                    )}
                  </div>
                )}
                {userProfile.subscriptionStatus === 'premium' && (
                  <>Unlimited ✨</>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Audiobooks Section */}
      {!loadingAudiobooks && audiobooks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
        >
          <Card className="neomorph-flat border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <SpeakerHigh size={20} className="text-primary" />
                  <h2 className="text-lg font-semibold">Your Audiobooks</h2>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{audiobooks.length}</Badge>
                  {audiobooks.length > 1 && (
                    <Button
                      size="sm"
                      className="gap-2 bg-primary hover:bg-primary/90"
                      onClick={() => onNavigate?.('projects')}
                    >
                      <SpeakerHigh size={16} weight="fill" />
                      Merge Chapters
                    </Button>
                  )}
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {audiobooks.slice(0, 3).map((audiobook: any) => (
                  <div key={audiobook.id} className="p-4 neomorph-inset rounded-lg space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate" title={audiobook.chapterTitle}>
                          {audiobook.chapterTitle}
                        </h3>
                        <p className="text-xs text-muted-foreground truncate" title={audiobook.projectTitle}>
                          {audiobook.projectTitle}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {(audiobook.audioSize / (1024 * 1024)).toFixed(1)} MB
                        </p>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          asChild
                        >
                          <a href={audiobook.audioUrl} download={`${audiobook.chapterTitle}.mp3`} title="Download">
                            <Download size={14} />
                          </a>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={() => {
                            setAudiobookToDelete(audiobook);
                            setShowDeleteAudiobookDialog(true);
                          }}
                          title="Delete"
                        >
                          <Trash size={14} className="text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <AudioPlayer src={audiobook.audioUrl} />
                  </div>
                ))}
              </div>
              {audiobooks.length > 3 && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    +{audiobooks.length - 3} more audiobook{audiobooks.length - 3 !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Projects Section */}
      {projects.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-4 lg:space-y-6"
        >
          {/* Search and View Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <h2 className="text-lg lg:text-xl font-semibold">Your Projects</h2>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 lg:flex-none">
                <MagnifyingGlass size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 neomorph-inset border-0 text-sm lg:w-64"
                />
              </div>
              <div className="flex rounded-lg neomorph-inset p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-8 px-3"
                >
                  <GridFour size={14} />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-8 px-3"
                >
                  <ListBullets size={14} />
                </Button>
              </div>
            </div>
          </div>

          {/* Projects Grid/List */}
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6" 
            : "space-y-3"
          }>
            {sortedProjects.map((project, index) => {
              const stats = getProjectStats(project);
              const isMostRecent = !searchQuery && index === 0;
              
              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <Card 
                    className="relative overflow-hidden border hover:border-primary/50 transition-all duration-300 cursor-pointer h-full hover:shadow-lg bg-gradient-to-br from-background to-muted/20"
                    onClick={() => onSelectProject(project)}
                  >
                    {/* Colored accent bar */}
                    <div 
                      className="absolute top-0 left-0 right-0 h-1"
                      style={{ 
                        background: `linear-gradient(90deg, ${project.brandConfig?.primaryColor || '#8B5CF6'}, ${project.brandConfig?.secondaryColor || '#A78BFA'})` 
                      }}
                    />
                    
                    <CardContent className="p-5">
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors truncate mb-1">
                              {project.title}
                            </h3>
                            {isMostRecent && (
                              <Badge variant="outline" className="text-xs mb-1">
                                Most Recent
                              </Badge>
                            )}
                            {project.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                {project.description}
                              </p>
                            )}
                          </div>
                          
                          {/* Action buttons */}
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewProject(project);
                              }}
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                              title="Preview"
                            >
                              <Eye size={16} />
                            </Button>
                            {onDeleteProject && (
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setProjectToDelete(project);
                                }}
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                                title="Delete"
                              >
                                <Trash size={16} />
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        {/* Stats */}
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <div className="p-1.5 rounded-md bg-primary/10">
                              <FileText size={14} className="text-primary" />
                            </div>
                            <span className="font-medium">{stats.chapters}</span>
                            <span className="text-xs">chapter{stats.chapters !== 1 ? 's' : ''}</span>
                          </div>
                          
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <div className="p-1.5 rounded-md bg-primary/10">
                              <BookOpen size={14} className="text-primary" />
                            </div>
                            <span className="font-medium">{stats.words.toLocaleString()}</span>
                            <span className="text-xs">words</span>
                          </div>
                        </div>
                        
                        {/* Footer */}
                        <div className="flex items-center justify-between pt-3 border-t">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock size={12} />
                            <span>Updated {formatDate(project.updatedAt)}</span>
                          </div>
                          
                          <div className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                            <span>Open</span>
                            <ArrowRight size={14} />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {sortedProjects.length === 0 && searchQuery && (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
              <p>No projects found matching "{searchQuery}"</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Enhanced Analytics - Show if user has projects */}
      {projects.length > 0 && (
        <>
          {/* Quick Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <Card className="neomorph-flat border-0">
              <CardContent className="p-4 text-center">
                <Pencil size={20} className="mx-auto mb-2 text-primary" weight="duotone" />
                <p className="text-2xl font-bold">{totalWords.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Words</p>
              </CardContent>
            </Card>

            <Card className="neomorph-flat border-0">
              <CardContent className="p-4 text-center">
                <BookOpen size={20} className="mx-auto mb-2 text-primary" weight="duotone" />
                <p className="text-2xl font-bold">{projects.length}</p>
                <p className="text-xs text-muted-foreground">Projects</p>
              </CardContent>
            </Card>

            <Card className="neomorph-flat border-0">
              <CardContent className="p-4 text-center">
                <FileText size={20} className="mx-auto mb-2 text-primary" weight="duotone" />
                <p className="text-2xl font-bold">
                  {projects.reduce((sum, p) => sum + p.chapters.length, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Chapters</p>
              </CardContent>
            </Card>

            <Card className="neomorph-flat border-0">
              <CardContent className="p-4 text-center">
                <Clock size={20} className="mx-auto mb-2 text-primary" weight="duotone" />
                <p className="text-2xl font-bold">{stats.totalWordsThisWeek.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Words This Week</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Streak and Goals Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-4"
          >
            <WritingStreakCard
              currentStreak={stats.currentStreak}
              longestStreak={stats.longestStreak}
              lastWriteDate={stats.lastWritingDate || undefined}
            />
            
            {goals?.enabled && (
              <>
                <GoalProgressCard
                  title="Daily Goal"
                  current={progress.daily.current}
                  target={progress.daily.target}
                  period="daily"
                  icon={<Target className="w-5 h-5 text-primary" />}
                />
                <GoalProgressCard
                  title="Weekly Goal"
                  current={progress.weekly.current}
                  target={progress.weekly.target}
                  period="weekly"
                  icon={<Calendar className="w-5 h-5 text-accent" />}
                />
              </>
            )}

            {!goals?.enabled && (
              <Card className="lg:col-span-2">
                <CardContent className="p-6 text-center">
                  <Target className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <h3 className="font-semibold mb-2">Set Writing Goals</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Track your progress with daily and weekly word count targets
                  </p>
                  <Button size="sm" variant="outline">
                    Enable Goals
                  </Button>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </>
      )}

      {projects.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-center py-12"
        >
          <Sparkle size={64} className="mx-auto mb-6 text-primary" weight="fill" />
          <h3 className="text-xl font-semibold mb-2">Ready to create your first ebook?</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Use the options above to get started. Choose a template for quick setup or start from scratch.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={onShowTemplateGallery}
              className="neomorph-button border-0 gap-2"
            >
              <Rocket size={16} />
              Browse Templates
            </Button>
          </div>
        </motion.div>
      )}
      
      {/* Preview Dialog */}
      {previewProject && (
        <PreviewDialog 
          project={previewProject}
          isOpen={!!previewProject}
          onClose={() => setPreviewProject(null)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!projectToDelete} onOpenChange={() => setProjectToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{projectToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (projectToDelete && onDeleteProject) {
                  onDeleteProject(projectToDelete.id);
                  setProjectToDelete(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="sm:max-w-lg neomorph-flat border-0">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <UploadSimple size={24} className="text-primary" weight="fill" />
              Import Document
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Upload a .docx file (from Google Docs, Microsoft Word, etc.) or .txt file. 
              We'll automatically detect chapters from <strong>Heading 1</strong> styles.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".docx,.doc,.txt"
              onChange={handleFileImport}
              className="hidden"
              disabled={isImporting}
            />
            
            {/* Drag and Drop Area */}
            <div
              onDrop={handleFileDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => !isImporting && fileInputRef.current?.click()}
              className={cn(
                "relative border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer",
                isDragging 
                  ? "border-primary bg-primary/5 scale-[1.02]" 
                  : "border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/30",
                isImporting && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="flex flex-col items-center justify-center gap-3 text-center">
                {isImporting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <FilePlus size={48} className="text-primary" />
                    </motion.div>
                    <div>
                      <p className="font-semibold text-foreground">Importing document...</p>
                      <p className="text-sm text-muted-foreground mt-1">Please wait</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={cn(
                      "p-4 rounded-full transition-colors",
                      isDragging ? "bg-primary/20" : "bg-muted"
                    )}>
                      <UploadSimple 
                        size={48} 
                        className={isDragging ? "text-primary" : "text-muted-foreground"} 
                        weight="fill" 
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-base">
                        {isDragging ? "Drop file here" : "Drag & drop your file here"}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        or click to browse
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="font-normal">.docx</Badge>
                      <Badge variant="outline" className="font-normal">.doc</Badge>
                      <Badge variant="outline" className="font-normal">.txt</Badge>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Options Section */}
            <div className="p-3 bg-muted/30 rounded-lg border">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="split-h2" className="text-sm font-medium cursor-pointer">
                    Also split on Heading 2/3
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Create new chapters for Heading 1, 2, and 3 styles
                  </p>
                </div>
                <Switch
                  id="split-h2"
                  checked={splitOnH2}
                  onCheckedChange={setSplitOnH2}
                  disabled={isImporting}
                />
              </div>
            </div>

            {/* Info Section */}
            <div className="space-y-3 text-sm">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <span>💡</span>
                  <span>Chapter Detection</span>
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  Use <strong>Heading 1</strong> style for chapter titles{splitOnH2 && <> or <strong>Heading 2/3</strong></>}. 
                  All content under each heading becomes that chapter's content.
                </p>
              </div>
              
              <div className="text-muted-foreground text-xs space-y-1">
                <p className="font-medium text-foreground">Supported formats:</p>
                <ul className="space-y-1 ml-4">
                  <li>• <strong className="text-foreground">.docx/.doc</strong> - Microsoft Word, Google Docs export</li>
                  <li>• <strong className="text-foreground">.txt</strong> - Plain text with chapter markers</li>
                </ul>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Migration Dialog */}
      <AlertDialog open={hasPreview} onOpenChange={(open) => !open && dismissPreview()}>
        <AlertDialogContent className="bg-background">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Sparkle className="w-5 h-5 text-primary" weight="fill" />
              Welcome back! Continue your book?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                You have a preview book titled <strong className="text-foreground">"{previewData?.title}"</strong> that you 
                created earlier. Would you like to add it to your projects and continue writing?
              </p>
              <p className="text-xs text-muted-foreground">
                You'll be able to add more chapters, customize the cover, and export your book.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={dismissPreview} disabled={isMigrating}>
              No, discard it
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleMigratePreview}
              disabled={isMigrating}
              className="gap-2"
            >
              {isMigrating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Adding...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" weight="bold" />
                  Yes, continue writing
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Project Setup Dialog */}
      <ProjectSetupDialog
        open={showSetupDialog}
        initialTitle={pendingProjectTitle}
        onComplete={handleSetupComplete}
        onSkip={handleSetupSkip}
      />

      {/* Delete Audiobook Dialog */}
      <AlertDialog open={showDeleteAudiobookDialog} onOpenChange={setShowDeleteAudiobookDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Audiobook?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Are you sure you want to delete this audiobook?
              </p>
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="font-semibold text-foreground">"{audiobookToDelete?.chapterTitle}"</p>
                <p className="text-xs text-muted-foreground mt-1">
                  from {audiobookToDelete?.projectTitle}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                This action cannot be undone. The audio file will be permanently deleted.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => {
                setShowDeleteAudiobookDialog(false);
                setAudiobookToDelete(null);
              }}
              className="neomorph-button border-0"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (audiobookToDelete) {
                  try {
                    await deleteDoc(doc(db, 'audiobooks', audiobookToDelete.id));
                    setAudiobooks(prev => prev.filter(a => a.id !== audiobookToDelete.id));
                    toast.success(`"${audiobookToDelete.chapterTitle}" deleted successfully`);
                  } catch (error) {
                    console.error('Failed to delete audiobook:', error);
                    toast.error('Failed to delete audiobook');
                  }
                  setShowDeleteAudiobookDialog(false);
                  setAudiobookToDelete(null);
                }
              }}
              className="neomorph-button border-0 bg-destructive hover:bg-destructive/90 text-white gap-2"
            >
              <Trash size={16} />
              Delete Audiobook
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
