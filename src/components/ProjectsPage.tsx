import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
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
  Eye
} from '@phosphor-icons/react';
import { EbookProject } from '@/lib/types';
import { motion } from 'framer-motion';
import { PreviewDialog } from '@/components/PreviewDialog';

interface ProjectsPageProps {
  projects: EbookProject[];
  onSelectProject: (project: EbookProject) => void;
  onCreateProject: (title: string) => void;
  onShowTemplateGallery: () => void;
  onDeleteProject?: (projectId: string) => void;
  onRenameProject?: (projectId: string, newTitle: string) => void;
  onDuplicateProject?: (project: EbookProject) => void;
}

export function ProjectsPage({ 
  projects, 
  onSelectProject, 
  onCreateProject, 
  onShowTemplateGallery,
  onDeleteProject,
  onRenameProject,
  onDuplicateProject
}: ProjectsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'title'>('updated');
  const [filterBy, setFilterBy] = useState<'all' | 'active' | 'draft'>('all');
  const [previewProject, setPreviewProject] = useState<EbookProject | null>(null);
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [projectToRename, setProjectToRename] = useState<EbookProject | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<EbookProject | null>(null);
  const [renameTitle, setRenameTitle] = useState('');

  const filteredAndSortedProjects = projects
    .filter(project => {
      const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           project.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = filterBy === 'all' || 
                           (filterBy === 'active' && project.chapters.length > 0) ||
                           (filterBy === 'draft' && project.chapters.length === 0);
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
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
          {/* Filter */}
          <div className="flex rounded-lg neomorph-inset p-1">
            {(['all', 'active', 'draft'] as const).map((filter) => (
              <Button
                key={filter}
                variant={filterBy === filter ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilterBy(filter)}
                className="h-8 px-3 text-xs capitalize"
              >
                {filter}
              </Button>
            ))}
          </div>

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
            
            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group"
              >
                <Card 
                  className="neomorph-flat border-0 hover:neomorph-raised transition-all duration-300 h-full"
                >
                  <CardContent className={viewMode === 'grid' ? "p-4 lg:p-6" : "p-4"}>
                    <div className={viewMode === 'grid' ? "space-y-4" : "flex items-center justify-between"}>
                      <div className={viewMode === 'grid' ? "space-y-3" : "flex-1 space-y-1"}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: project.brandConfig?.primaryColor || '#8B5CF6' }}
                            />
                            <h3 
                              className="font-semibold text-sm lg:text-base group-hover:text-primary transition-colors cursor-pointer truncate"
                              onClick={() => onSelectProject(project)}
                            >
                              {project.title}
                            </h3>
                          </div>
                          <Button
                            onClick={() => setPreviewProject(project)}
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1.5 text-xs neomorph-flat border-0 hover:neomorph-inset"
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
                          onClick={() => onSelectProject(project)}
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
                              onClick={() => onDuplicateProject(project)}
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Copy size={14} />
                            </Button>
                          )}
                          <Button
                            onClick={() => {
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
                              onClick={() => {
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
                    onCreateProject(newProjectTitle.trim());
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
                    onCreateProject(newProjectTitle.trim());
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
              Delete Project?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{projectToDelete?.title}"? This action cannot be undone and all content will be permanently lost.
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
                if (projectToDelete && onDeleteProject) {
                  onDeleteProject(projectToDelete.id);
                  setShowDeleteDialog(false);
                  setProjectToDelete(null);
                }
              }}
              className="neomorph-button border-0 bg-destructive hover:bg-destructive/90 text-white gap-2"
            >
              <Trash size={16} />
              Delete Project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
