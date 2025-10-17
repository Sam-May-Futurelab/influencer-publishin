import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Plus, 
  Star, 
  Calendar, 
  FileText, 
  MagnifyingGlass,
  GridFour,
  ListBullets,
  Clock,
  Trophy,
  Target,
  Eye,
  SignIn
} from '@phosphor-icons/react';
import { EbookProject } from '@/lib/types';
import { motion } from 'framer-motion';
import { WritingGoalsComponent } from '@/components/WritingGoals';
import { useWritingAnalytics } from '@/hooks/use-writing-analytics';
import { PreviewDialog } from '@/components/PreviewDialog';
import { useAuth } from '@/hooks/use-auth';

interface DashboardProps {
  projects: EbookProject[];
  onSelectProject: (project: EbookProject) => void;
  onCreateProject: (title: string) => void;
  onShowTemplateGallery: () => void;
}

export function Dashboard({ 
  projects, 
  onSelectProject, 
  onCreateProject, 
  onShowTemplateGallery 
}: DashboardProps) {
  const { user } = useAuth();
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [previewProject, setPreviewProject] = useState<EbookProject | null>(null);

  // Writing analytics
  const {
    goals,
    stats,
    progress,
    recentAchievements,
    wroteToday,
    updateGoals,
  } = useWritingAnalytics(projects);

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
        className="text-center space-y-4"
      >
        <h1 className="text-2xl lg:text-4xl font-bold">Welcome to Your Publishing Dashboard</h1>
        <p className="text-muted-foreground text-sm lg:text-base max-w-2xl mx-auto">
          Create, manage, and publish your ebooks with ease. Start a new project or continue working on an existing one.
        </p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-4"
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
                <BookOpen size={20} className="text-accent" />
              </div>
              <h3 className="font-semibold text-sm lg:text-base">Use Template</h3>
            </div>
            <p className="text-xs lg:text-sm text-muted-foreground mb-4">
              Start with a professional template to speed up your writing process.
            </p>
            <Button
              onClick={onShowTemplateGallery}
              variant="outline"
              className="w-full neomorph-button border-0 text-sm min-h-[40px] hover:text-black"
            >
              <BookOpen size={16} />
              Browse Templates
            </Button>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="neomorph-flat border-0">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl neomorph-inset">
                <Star size={20} className="text-secondary-foreground" />
              </div>
              <h3 className="font-semibold text-sm lg:text-base">Your Progress</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs lg:text-sm">
                <span className="text-muted-foreground">Total Projects</span>
                <span className="font-medium">{projects.length}</span>
              </div>
              <div className="flex justify-between text-xs lg:text-sm">
                <span className="text-muted-foreground">Active Projects</span>
                <span className="font-medium">{projects.filter(p => p.chapters.length > 0).length}</span>
              </div>
              <div className="flex justify-between text-xs lg:text-sm">
                <span className="text-muted-foreground">Total Chapters</span>
                <span className="font-medium">{projects.reduce((sum, p) => sum + p.chapters.length, 0)}</span>
              </div>
            </div>
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
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: project.brandConfig?.primaryColor || '#8B5CF6' }}
                              />
                              <h3 className="font-semibold text-sm lg:text-base group-hover:text-primary transition-colors">
                                {project.title}
                              </h3>
                            </div>
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
          <BookOpen size={64} className="mx-auto mb-6 text-muted-foreground opacity-50" />
          {!user ? (
            <>
              <h3 className="text-lg font-semibold mb-2">Welcome to InkFluence AI! ✨</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Sign in to create your first ebook project and start your publishing journey with AI-powered writing assistance.
              </p>
              <Button
                onClick={() => {
                  // Trigger the sign in flow
                  onCreateProject('');
                }}
                className="neomorph-button border-0 gap-2 hover:text-black"
              >
                <SignIn size={16} />
                Sign In to Get Started
              </Button>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first ebook project to get started with your publishing journey.
              </p>
              <Button
                onClick={onShowTemplateGallery}
                className="neomorph-button border-0 gap-2 hover:text-black"
              >
                <BookOpen size={16} />
                Browse Templates
              </Button>
            </>
          )}
        </motion.div>
      )}

      {/* Writing Goals Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <WritingGoalsComponent
          goals={goals}
          stats={stats}
          progress={progress}
          onUpdateGoals={updateGoals}
        />
      </motion.div>

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="neomorph-flat border-0">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center gap-3 mb-4">
                <motion.div 
                  className="p-2 rounded-xl neomorph-flat"
                  animate={{ 
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                >
                  <Trophy size={20} className="text-yellow-500" weight="fill" />
                </motion.div>
                <div>
                  <h3 className="font-semibold">Recent Achievements</h3>
                  <p className="text-sm text-muted-foreground">Celebrate your writing milestones! 🎉</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentAchievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                  >
                    <div className="neomorph-flat border-0 rounded-lg px-3 py-2 flex items-center gap-2 hover:neomorph-raised transition-all duration-200 cursor-default">
                      <motion.span 
                        className="text-xl"
                        animate={{ 
                          scale: [1, 1.15, 1],
                        }}
                        transition={{ 
                          duration: 1.5,
                          repeat: Infinity,
                          repeatDelay: 2 + index * 0.5
                        }}
                      >
                        {achievement.icon}
                      </motion.span>
                      <span className="font-medium text-sm text-foreground">{achievement.title}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
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
    </div>
  );
}
