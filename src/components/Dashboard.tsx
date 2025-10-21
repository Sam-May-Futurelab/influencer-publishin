import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  BookOpen, 
  Plus, 
  FileText, 
  MagnifyingGlass,
  GridFour,
  ListBullets,
  Eye,
  Sparkle,
  Rocket,
  Trash
} from '@phosphor-icons/react';
import { EbookProject } from '@/lib/types';
import { motion } from 'framer-motion';
import { PreviewDialog } from '@/components/PreviewDialog';

interface DashboardProps {
  projects: EbookProject[];
  onSelectProject: (project: EbookProject) => void;
  onCreateProject: (title: string) => void;
  onShowTemplateGallery: () => void;
  onDeleteProject?: (projectId: string) => void;
}

export function Dashboard({ 
  projects, 
  onSelectProject, 
  onCreateProject, 
  onShowTemplateGallery,
  onDeleteProject
}: DashboardProps) {
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [previewProject, setPreviewProject] = useState<EbookProject | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<EbookProject | null>(null);

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateProject = () => {
    if (newProjectTitle.trim()) {
      onCreateProject(newProjectTitle.trim());
      setNewProjectTitle('');
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
        className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-4xl mx-auto"
      >
        {/* Create New Project */}
        <Card className="neomorph-flat border-0 hover:neomorph-raised transition-all duration-300">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl neomorph-inset">
                <Plus size={20} className="text-primary" />
              </div>
              <h3 className="font-semibold text-sm lg:text-base">Create New Project</h3>
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

        {/* Use Template */}
        <Card className="neomorph-flat border-0 hover:neomorph-raised transition-all duration-300">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl neomorph-inset">
                <Sparkle size={20} className="text-accent" weight="fill" />
              </div>
              <h3 className="font-semibold text-sm lg:text-base">Use AI Template</h3>
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
      </motion.div>

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
            {filteredProjects.map((project, index) => {
              const stats = getProjectStats(project);
              
              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <Card 
                    className="neomorph-flat border-0 hover:neomorph-raised transition-all duration-300 cursor-pointer h-full"
                    onClick={() => onSelectProject(project)}
                  >
                    <CardContent className={viewMode === 'grid' ? "p-4 lg:p-6" : "p-4"}>
                      <div className={viewMode === 'grid' ? "space-y-4" : "flex items-center justify-between"}>
                        <div className={viewMode === 'grid' ? "space-y-3" : "flex-1 space-y-1"}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div 
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: project.brandConfig?.primaryColor || '#8B5CF6' }}
                              />
                              <h3 className="font-semibold text-sm lg:text-base group-hover:text-primary transition-colors truncate">
                                {project.title}
                              </h3>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPreviewProject(project);
                                }}
                                variant="ghost"
                                size="sm"
                                className="h-8 gap-1.5 text-xs neomorph-flat border-0 hover:neomorph-inset"
                              >
                                <Eye size={14} />
                                <span className="hidden sm:inline">Preview</span>
                              </Button>
                              {onDeleteProject && (
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setProjectToDelete(project);
                                  }}
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 gap-1.5 text-xs neomorph-flat border-0 hover:neomorph-inset text-destructive hover:text-destructive"
                                >
                                  <Trash size={14} />
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          {project.description && (
                            <p className="text-xs lg:text-sm text-muted-foreground line-clamp-2">
                              {project.description}
                            </p>
                          )}
                          
                          <div className={viewMode === 'grid' 
                            ? "flex flex-wrap items-center gap-3 text-xs text-muted-foreground" 
                            : "flex items-center gap-4 text-xs text-muted-foreground"
                          }>
                            <div className="flex items-center gap-1">
                              <FileText size={12} />
                              <span>{stats.chapters} chapter{stats.chapters !== 1 ? 's' : ''}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <BookOpen size={12} />
                              <span>{stats.words.toLocaleString()} words</span>
                            </div>
                            <span>•</span>
                            <span>{formatDate(project.updatedAt)}</span>
                          </div>
                        </div>
                        
                        {viewMode === 'list' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="neomorph-button border-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Open Project
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {filteredProjects.length === 0 && searchQuery && (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
              <p>No projects found matching "{searchQuery}"</p>
            </div>
          )}
        </motion.div>
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
    </div>
  );
}
