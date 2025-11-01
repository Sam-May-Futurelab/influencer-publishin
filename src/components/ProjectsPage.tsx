import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  BookOpen, 
  Plus, 
  MagnifyingGlass,
  GridFour,
  ListBullets,
  Clock,
  FileText,
  Trash,
  Pencil,
  Copy,
  Export,
  Eye,
  Star,
  SpeakerHigh,
  Download
} from '@phosphor-icons/react';
import { EbookProject } from '@/lib/types';
import { motion } from 'framer-motion';
import { PreviewDialog } from '@/components/PreviewDialog';
import { AudioPlayer } from '@/components/AudioPlayer';
import { useAuth } from '@/hooks/use-auth';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ProjectsPageProps {
  projects: EbookProject[];
  onSelectProject: (project: EbookProject) => void;
  onCreateProject: (projectData: { title: string; author?: string; category?: string; targetAudience?: string; description?: string }) => void;
  onShowTemplateGallery: () => void;
  onDeleteProject?: (projectId: string) => void;
  onRenameProject?: (projectId: string, newTitle: string) => void;
  onDuplicateProject?: (project: EbookProject) => void;
  onToggleFavorite?: (projectId: string) => void;
}

export function ProjectsPage({ 
  projects, 
  onSelectProject, 
  onCreateProject, 
  onShowTemplateGallery,
  onDeleteProject,
  onRenameProject,
  onDuplicateProject,
  onToggleFavorite
}: ProjectsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'title'>('updated');
  const [previewProject, setPreviewProject] = useState<EbookProject | null>(null);
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [projectToRename, setProjectToRename] = useState<EbookProject | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<EbookProject | null>(null);
  const [renameTitle, setRenameTitle] = useState('');
  const [audiobooks, setAudiobooks] = useState<any[]>([]);
  const [loadingAudiobooks, setLoadingAudiobooks] = useState(true);
  const [audiobookToDelete, setAudiobookToDelete] = useState<any | null>(null);
  const [showDeleteAudiobookDialog, setShowDeleteAudiobookDialog] = useState(false);
  const [showMergeDialog, setShowMergeDialog] = useState(false);
  const [selectedProjectForMerge, setSelectedProjectForMerge] = useState<string | null>(null);
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  
  // Bulk selection states
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [selectedAudiobooks, setSelectedAudiobooks] = useState<string[]>([]);
  const [bulkDeleteMode, setBulkDeleteMode] = useState(false);
  
  const { user } = useAuth();

  // Bulk selection handlers
  const toggleProjectSelection = (projectId: string) => {
    setSelectedProjects(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const toggleAudiobookSelection = (audiobookId: string) => {
    setSelectedAudiobooks(prev => 
      prev.includes(audiobookId) 
        ? prev.filter(id => id !== audiobookId)
        : [...prev, audiobookId]
    );
  };

  const handleBulkDelete = async () => {
    if (!user?.uid) return;
    
    try {
      // Delete selected projects (use correct path with userId)
      await Promise.all(
        selectedProjects.map(projectId => 
          deleteDoc(doc(db, 'users', user.uid, 'projects', projectId))
        )
      );

      // Delete selected audiobooks
      await Promise.all(
        selectedAudiobooks.map(audiobookId => 
          deleteDoc(doc(db, 'audiobooks', audiobookId))
        )
      );

      toast.success(`Deleted ${selectedProjects.length} project(s) and ${selectedAudiobooks.length} audiobook(s)`);

      // Reset selections
      setSelectedProjects([]);
      setSelectedAudiobooks([]);
      setBulkDeleteMode(false);
      setShowDeleteDialog(false);
      
      // Reload the page to refresh the lists
      window.location.reload();
    } catch (error) {
      console.error('Error deleting items:', error);
      toast.error('Failed to delete items');
    }
  };

  // Load audiobooks with project titles
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
          // Find matching project to get title
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

  const filteredAndSortedProjects = projects
    .filter(project => {
      const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           project.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesSearch;
    })
    .sort((a, b) => {
      // Keep favorites prioritized unless we're explicitly sorting by recency
      if (sortBy !== 'updated') {
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
      }

      // Then apply the selected sort
      switch (sortBy) {
        case 'updated':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  const getProjectStats = (project: EbookProject) => {
    const wordCount = project.chapters.reduce((total, chapter) => {
      if (!chapter.content) return total;
      // Strip HTML tags for accurate word count
      const textContent = chapter.content.replace(/<[^>]*>/g, ' ');
      return total + textContent.split(/\s+/).filter(word => word.length > 0).length;
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

  const getProjectStatus = (project: EbookProject) => {
    if (project.chapters.length === 0) return { label: 'Draft', color: 'bg-gray-500' };
    if (project.chapters.some(c => !c.content || c.content.trim().length === 0)) return { label: 'In Progress', color: 'bg-yellow-500' };
    return { label: 'Active', color: 'bg-green-500' };
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Your Projects</h1>
          <p className="text-muted-foreground text-sm lg:text-base">
            Manage and organize all your ebook projects in one place
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={onShowTemplateGallery}
            variant="outline"
            className="neomorph-button border-0 gap-2"
          >
            <BookOpen size={16} />
            <span className="text-sm">Use Template</span>
          </Button>
          <Button
            onClick={() => setShowNewProjectDialog(true)}
            className="neomorph-button border-0 gap-2"
          >
            <Plus size={16} />
            <span className="text-sm">New Project</span>
          </Button>
        </div>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between"
      >
        {/* Search */}
        <div className="relative flex-1 lg:max-w-md">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 neomorph-inset border-0 text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Bulk Actions Toggle */}
          <Button
            variant={bulkDeleteMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setBulkDeleteMode(!bulkDeleteMode);
              setSelectedProjects([]);
              setSelectedAudiobooks([]);
            }}
            className="gap-2 neomorph-flat border-0 hover:neomorph-inset"
          >
            <div className={cn(
              "w-4 h-4 rounded border-2 flex items-center justify-center transition-colors",
              bulkDeleteMode 
                ? "bg-primary border-primary" 
                : "border-muted-foreground/30"
            )}>
              {bulkDeleteMode && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <span>Select Multiple</span>
          </Button>

          {/* Bulk Delete Button - Show when items selected */}
          {bulkDeleteMode && (selectedProjects.length > 0 || selectedAudiobooks.length > 0) && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (selectedProjects.length > 0 || selectedAudiobooks.length > 0) {
                  setShowDeleteDialog(true);
                }
              }}
              className="gap-2"
            >
              <Trash size={14} />
              <span>
                Delete ({selectedProjects.length + selectedAudiobooks.length})
              </span>
            </Button>
          )}

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'updated' | 'created' | 'title')}
            className="text-xs px-3 py-2 rounded-lg neomorph-inset border-0 bg-background"
          >
            <option value="updated">Last Updated</option>
            <option value="created">Date Created</option>
            <option value="title">Title A-Z</option>
          </select>

          {/* View Mode */}
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
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Card className="neomorph-flat border-0">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{projects.length}</div>
            <div className="text-xs text-muted-foreground">Total Projects</div>
          </CardContent>
        </Card>
        <Card className="neomorph-flat border-0">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-accent">{projects.filter(p => p.chapters.length > 0).length}</div>
            <div className="text-xs text-muted-foreground">Active Projects</div>
          </CardContent>
        </Card>
        <Card className="neomorph-flat border-0">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-secondary-foreground">{projects.reduce((sum, p) => sum + p.chapters.length, 0)}</div>
            <div className="text-xs text-muted-foreground">Total Chapters</div>
          </CardContent>
        </Card>
        <Card className="neomorph-flat border-0">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {projects.reduce((sum, p) => {
                const words = p.chapters.reduce((total, chapter) => {
                  if (!chapter.content) return total;
                  // Strip HTML tags for accurate word count
                  const textContent = chapter.content.replace(/<[^>]*>/g, ' ');
                  return total + textContent.split(/\s+/).filter(word => word.length > 0).length;
                }, 0);
                return sum + words;
              }, 0).toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Total Words</div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Audiobooks Section */}
      {!loadingAudiobooks && audiobooks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
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
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            className="gap-2 bg-primary hover:bg-primary/90"
                            onClick={() => setShowMergeDialog(true)}
                          >
                            <SpeakerHigh size={16} weight="fill" />
                            Merge Chapters
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Combine multiple chapter audiobooks into a single file (Premium feature)</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {audiobooks.slice(0, 6).map((audiobook: any) => (
                  <div 
                    key={audiobook.id} 
                    className={cn(
                      "p-4 neomorph-inset rounded-lg space-y-3 transition-all",
                      bulkDeleteMode && "cursor-pointer hover:ring-2 hover:ring-primary/50",
                      bulkDeleteMode && selectedAudiobooks.includes(audiobook.id) && "ring-2 ring-primary"
                    )}
                    onClick={() => {
                      if (bulkDeleteMode) {
                        toggleAudiobookSelection(audiobook.id);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0 flex items-start gap-2">
                        {bulkDeleteMode && (
                          <div 
                            className={cn(
                              "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 mt-0.5",
                              selectedAudiobooks.includes(audiobook.id)
                                ? "bg-primary border-primary" 
                                : "border-muted-foreground/30"
                            )}
                          >
                            {selectedAudiobooks.includes(audiobook.id) && (
                              <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                                <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </div>
                        )}
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
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          asChild
                          onClick={(e) => e.stopPropagation()}
                        >
                          <a href={audiobook.audioUrl} download={`${audiobook.chapterTitle}.mp3`} title="Download">
                            <Download size={14} />
                          </a>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
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
              {audiobooks.length > 6 && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    +{audiobooks.length - 6} more audiobook{audiobooks.length - 6 !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Projects Grid/List */}
      {filteredAndSortedProjects.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={viewMode === 'grid' 
            ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6" 
            : "space-y-3"
          }
        >
          {filteredAndSortedProjects.map((project, index) => {
            const stats = getProjectStats(project);
            const status = getProjectStatus(project);
            const isMostRecent = sortBy === 'updated' && index === 0 && !searchQuery;
            
            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group"
              >
                <Card 
                  className={cn(
                    "neomorph-flat border-0 hover:neomorph-raised transition-all duration-300 h-full",
                    bulkDeleteMode && "cursor-pointer",
                    bulkDeleteMode && selectedProjects.includes(project.id) && "ring-2 ring-primary"
                  )}
                  onClick={() => {
                    if (bulkDeleteMode) {
                      toggleProjectSelection(project.id);
                    }
                  }}
                >
                  <CardContent className={viewMode === 'grid' ? "p-4 lg:p-6" : "p-4"}>
                    <div className={viewMode === 'grid' ? "space-y-4" : "flex items-center justify-between"}>
                      <div className={viewMode === 'grid' ? "space-y-3" : "flex-1 space-y-1"}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {bulkDeleteMode && (
                              <div 
                                className={cn(
                                  "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0",
                                  selectedProjects.includes(project.id)
                                    ? "bg-primary border-primary" 
                                    : "border-muted-foreground/30"
                                )}
                              >
                                {selectedProjects.includes(project.id) && (
                                  <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                                    <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                )}
                              </div>
                            )}
                            <div 
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: project.brandConfig?.primaryColor || '#8B5CF6' }}
                            />
                            <h3 
                              className="font-semibold text-sm lg:text-base group-hover:text-primary transition-colors cursor-pointer truncate"
                              onClick={(e) => {
                                if (!bulkDeleteMode) {
                                  onSelectProject(project);
                                }
                                e.stopPropagation();
                              }}
                            >
                              {project.title}
                            </h3>
                            {project.isAudioVersion && (
                              <Badge variant="secondary" className="text-xs gap-1 flex-shrink-0">
                                🎵 Audiobook
                              </Badge>
                            )}
                            {isMostRecent && (
                              <Badge variant="outline" className="text-xs flex-shrink-0">
                                Most Recent
                              </Badge>
                            )}
                            {onToggleFavorite && (
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onToggleFavorite(project.id);
                                }}
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                title={project.isFavorite ? "Remove from favorites" : "Add to favorites"}
                              >
                                <Star 
                                  size={16} 
                                  weight={project.isFavorite ? "fill" : "regular"}
                                  className={project.isFavorite ? "text-amber-500" : ""}
                                />
                              </Button>
                            )}
                          </div>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewProject(project);
                            }}
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1.5 text-xs neomorph-flat border-0 hover:neomorph-inset flex-shrink-0"
                          >
                            <Eye size={14} />
                            <span className="hidden sm:inline">Preview</span>
                          </Button>
                        </div>
                        
                        {project.description && (
                          <p className="text-xs lg:text-sm text-muted-foreground line-clamp-2">
                            {project.description}
                          </p>
                        )}
                        
                        <div className={viewMode === 'grid' 
                          ? "grid grid-cols-3 gap-2 text-xs" 
                          : "flex items-center gap-4 text-xs"
                        }>
                          <div className="flex items-center gap-1">
                            <FileText size={12} />
                            <span>{stats.chapters} chapters</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <BookOpen size={12} />
                            <span>{stats.words.toLocaleString()} words</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={12} />
                            <span>{formatDate(project.updatedAt)}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className={viewMode === 'grid' 
                        ? "flex flex-col items-center gap-3 pt-3 border-t border-border/20" 
                        : "flex items-center gap-2"
                      }>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!bulkDeleteMode) {
                              onSelectProject(project);
                            }
                          }}
                          variant="outline"
                          size="sm"
                          className={viewMode === 'grid' 
                            ? "neomorph-button border-0 gap-2 w-full justify-center" 
                            : "neomorph-button border-0 gap-2 flex-1 lg:flex-none"
                          }
                        >
                          <BookOpen size={14} />
                          <span className="text-xs">Open</span>
                        </Button>
                        
                        <div className={viewMode === 'grid' 
                          ? "flex items-center justify-center gap-1" 
                          : "flex items-center gap-1"
                        }>
                          {onDuplicateProject && (
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDuplicateProject(project);
                              }}
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Copy size={14} />
                            </Button>
                          )}
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              setProjectToRename(project);
                              setRenameTitle(project.title);
                              setShowRenameDialog(true);
                            }}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Pencil size={14} />
                          </Button>
                          {onDeleteProject && (
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                setProjectToDelete(project);
                                setShowDeleteDialog(true);
                              }}
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                            >
                              <Trash size={14} />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center py-12"
        >
          <BookOpen size={64} className="mx-auto mb-6 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">
            {searchQuery ? 'No projects found' : 'No projects yet'}
          </h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery 
              ? `No projects match "${searchQuery}". Try adjusting your search.`
              : 'Create your first ebook project to get started.'
            }
          </p>
          {!searchQuery && (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => setShowNewProjectDialog(true)}
                className="neomorph-button border-0 gap-2"
              >
                <Plus size={16} />
                Create Project
              </Button>
              <Button
                onClick={onShowTemplateGallery}
                variant="outline"
                className="neomorph-button border-0 gap-2 hover:text-black"
              >
                <BookOpen size={16} />
                Browse Templates
              </Button>
            </div>
          )}
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

      {/* New Project Dialog */}
      <Dialog open={showNewProjectDialog} onOpenChange={setShowNewProjectDialog}>
        <DialogContent className="neomorph-flat border-0 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus size={20} className="text-primary" />
              Create New Project
            </DialogTitle>
            <DialogDescription>
              Start a new ebook project. You can customize all details later.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="project-title">Project Title</Label>
              <Input
                id="project-title"
                placeholder="e.g., My Amazing Ebook"
                value={newProjectTitle}
                onChange={(e) => setNewProjectTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newProjectTitle.trim()) {
                    onCreateProject({ title: newProjectTitle.trim() });
                    setNewProjectTitle('');
                    setShowNewProjectDialog(false);
                  }
                }}
                className="neomorph-inset border-0"
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setNewProjectTitle('');
                  setShowNewProjectDialog(false);
                }}
                className="neomorph-flat border-0"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (newProjectTitle.trim()) {
                    onCreateProject({ title: newProjectTitle.trim() });
                    setNewProjectTitle('');
                    setShowNewProjectDialog(false);
                  }
                }}
                disabled={!newProjectTitle.trim()}
                className="neomorph-button border-0 gap-2"
              >
                <Plus size={16} />
                Create Project
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rename Project Dialog */}
      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent className="neomorph-flat border-0 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil size={20} className="text-primary" />
              Rename Project
            </DialogTitle>
            <DialogDescription>
              Enter a new title for "{projectToRename?.title}"
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="rename-title">Project Title</Label>
              <Input
                id="rename-title"
                placeholder="Enter new title"
                value={renameTitle}
                onChange={(e) => setRenameTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && renameTitle.trim() && projectToRename && onRenameProject) {
                    onRenameProject(projectToRename.id, renameTitle);
                    setShowRenameDialog(false);
                    setRenameTitle('');
                    setProjectToRename(null);
                  }
                }}
                className="neomorph-inset border-0"
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowRenameDialog(false);
                  setRenameTitle('');
                  setProjectToRename(null);
                }}
                className="neomorph-flat border-0"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (renameTitle.trim() && projectToRename && onRenameProject) {
                    onRenameProject(projectToRename.id, renameTitle);
                    setShowRenameDialog(false);
                    setRenameTitle('');
                    setProjectToRename(null);
                  }
                }}
                disabled={!renameTitle.trim()}
                className="neomorph-button border-0 gap-2"
              >
                <Pencil size={16} />
                Rename
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Project Alert Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="neomorph-flat border-0">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash size={20} className="text-destructive" />
              {bulkDeleteMode ? 'Delete Multiple Items?' : 'Delete Project?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {bulkDeleteMode ? (
                <div className="space-y-3">
                  <p className="text-sm">
                    You are about to delete <span className="font-semibold text-foreground">{selectedProjects.length + selectedAudiobooks.length} item(s)</span>:
                  </p>
                  <div className="p-3 bg-destructive/10 rounded-lg space-y-1 text-sm">
                    {selectedProjects.length > 0 && (
                      <div>• <span className="font-medium">{selectedProjects.length}</span> project(s)</div>
                    )}
                    {selectedAudiobooks.length > 0 && (
                      <div>• <span className="font-medium">{selectedAudiobooks.length}</span> audiobook(s)</div>
                    )}
                  </div>
                  <p className="text-sm text-destructive font-medium">
                    This action cannot be undone. All content will be permanently lost.
                  </p>
                </div>
              ) : (
                `Are you sure you want to delete "${projectToDelete?.title}"? This action cannot be undone and all content will be permanently lost.`
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => {
                setShowDeleteDialog(false);
                setProjectToDelete(null);
              }}
              className="neomorph-flat border-0"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (bulkDeleteMode) {
                  handleBulkDelete();
                } else if (projectToDelete && onDeleteProject) {
                  onDeleteProject(projectToDelete.id);
                  setShowDeleteDialog(false);
                  setProjectToDelete(null);
                }
              }}
              className="neomorph-button border-0 bg-destructive hover:bg-destructive/90 text-white gap-2"
            >
              <Trash size={16} />
              {bulkDeleteMode ? `Delete ${selectedProjects.length + selectedAudiobooks.length} Items` : 'Delete Project'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
                    // Delete from Firestore
                    const { deleteDoc, doc } = await import('firebase/firestore');
                    await deleteDoc(doc(db, 'audiobooks', audiobookToDelete.id));
                    
                    // Update local state
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

      {/* Merge Audiobooks Dialog */}
      <Dialog open={showMergeDialog} onOpenChange={setShowMergeDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <SpeakerHigh size={20} className="text-primary" />
              Merge Audiobook Chapters
            </DialogTitle>
            <DialogDescription>
              Select chapters to combine into a single audiobook file. Premium feature.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {audiobooks.length > 0 && (
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {/* Group audiobooks by project */}
                {Object.entries(
                  audiobooks.reduce((acc, audiobook) => {
                    const projectId = audiobook.projectId;
                    if (!acc[projectId]) {
                      acc[projectId] = [];
                    }
                    acc[projectId].push(audiobook);
                    return acc;
                  }, {} as Record<string, any[]>)
                ).map(([projectId, projectAudiobooks]: [string, any[]]) => (
                  <div key={projectId} className="space-y-2">
                    <div className="flex items-center justify-between px-3 py-2 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-semibold text-sm">{projectAudiobooks[0].projectTitle}</p>
                        <p className="text-xs text-muted-foreground">{projectAudiobooks.length} chapter{projectAudiobooks.length !== 1 ? 's' : ''}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const projectChapterIds = projectAudiobooks.map(a => a.chapterId);
                          const allSelected = projectChapterIds.every(id => selectedChapters.includes(id));
                          
                          if (allSelected) {
                            // Deselect all from this project
                            setSelectedChapters(prev => prev.filter(id => !projectChapterIds.includes(id)));
                            if (selectedProjectForMerge === projectId) {
                              setSelectedProjectForMerge(null);
                            }
                          } else {
                            // Select all from this project
                            setSelectedChapters(projectChapterIds);
                            setSelectedProjectForMerge(projectId);
                          }
                        }}
                        className="text-xs"
                      >
                        {projectAudiobooks.every(a => selectedChapters.includes(a.chapterId)) ? 'Deselect All' : 'Select All'}
                      </Button>
                    </div>
                    {projectAudiobooks.map((audiobook: any) => (
                      <label
                        key={audiobook.id}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer ml-4",
                          selectedProjectForMerge && audiobook.projectId !== selectedProjectForMerge && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={selectedChapters.includes(audiobook.chapterId)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedChapters(prev => [...prev, audiobook.chapterId]);
                              if (!selectedProjectForMerge) {
                                setSelectedProjectForMerge(audiobook.projectId);
                              }
                            } else {
                              setSelectedChapters(prev => prev.filter(id => id !== audiobook.chapterId));
                              if (selectedChapters.length === 1) {
                                setSelectedProjectForMerge(null);
                              }
                            }
                          }}
                          disabled={!!(selectedProjectForMerge && audiobook.projectId !== selectedProjectForMerge)}
                          className="rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{audiobook.chapterTitle}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {(audiobook.audioSize / (1024 * 1024)).toFixed(1)} MB
                        </span>
                      </label>
                    ))}
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                {selectedChapters.length} chapter{selectedChapters.length !== 1 ? 's' : ''} selected
                {selectedProjectForMerge && ` from ${audiobooks.find(a => a.projectId === selectedProjectForMerge)?.projectTitle}`}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowMergeDialog(false);
                    setSelectedChapters([]);
                    setSelectedProjectForMerge(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    if (selectedChapters.length < 2) {
                      toast.error('Select at least 2 chapters to merge');
                      return;
                    }

                    setIsMerging(true);
                    try {
                      const response = await fetch('/api/merge-audiobooks', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          userId: user?.uid,
                          projectId: selectedProjectForMerge,
                          chapterIds: selectedChapters,
                          title: 'Merged Audiobook'
                        })
                      });

                      if (!response.ok) {
                        const error = await response.json();
                        throw new Error(error.error || 'Failed to merge');
                      }

                      const data = await response.json();
                      toast.success('Audiobook chapters merged successfully!');
                      
                      // Reload audiobooks
                      const audiobooksRef = collection(db, 'audiobooks');
                      const q = query(audiobooksRef, where('userId', '==', user?.uid));
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
                      
                      setShowMergeDialog(false);
                      setSelectedChapters([]);
                      setSelectedProjectForMerge(null);
                    } catch (error: any) {
                      console.error('Failed to merge audiobooks:', error);
                      toast.error(error.message || 'Failed to merge audiobooks');
                    } finally {
                      setIsMerging(false);
                    }
                  }}
                  disabled={selectedChapters.length < 2 || isMerging}
                  className="gap-2"
                >
                  {isMerging ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Merging...
                    </>
                  ) : (
                    <>
                      <SpeakerHigh size={16} />
                      Merge Chapters
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
