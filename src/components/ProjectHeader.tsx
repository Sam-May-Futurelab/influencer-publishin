import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DownloadSimple, FileText, Gear, Palette, Eye, Crown, Sparkle, Trash } from '@phosphor-icons/react';
import { EbookProject } from '@/lib/types';
import { ExportDialog } from '@/components/ExportDialog';
import { PreviewDialog } from '@/components/PreviewDialog';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';

interface ProjectHeaderProps {
  project: EbookProject;
  onProjectUpdate: (updates: Partial<EbookProject>) => void;
  onBrandCustomize: () => void;
  onUpgradeClick?: () => void;
  onDeleteProject?: () => void;
}

export function ProjectHeader({ project, onProjectUpdate, onBrandCustomize, onUpgradeClick, onDeleteProject }: ProjectHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [tempTitle, setTempTitle] = useState(project.title);
  const [tempDescription, setTempDescription] = useState(project.description);
  const [tempAuthor, setTempAuthor] = useState(project.author);
  const [tempWatermark, setTempWatermark] = useState(project.customWatermark || '');
  const { userProfile } = useAuth();

  const isPremium = userProfile?.isPremium || false;
  const pagesUsed = userProfile?.pagesUsed || 0;
  const maxPages = userProfile?.maxPages || 10;
  const pagesRemaining = maxPages - pagesUsed;
  const usagePercentage = (pagesUsed / maxPages) * 100;
  const isUnlimited = isPremium;

  const handleSave = () => {
    onProjectUpdate({
      title: tempTitle.trim() || 'Untitled Ebook',
      description: tempDescription.trim(),
      author: tempAuthor.trim(),
      customWatermark: tempWatermark.trim(),
    });
    setIsEditing(false);
  };

  const wordCount = project.chapters.reduce((total, chapter) => {
    return total + (chapter.content?.split(/\s+/).filter(word => word.length > 0).length || 0);
  }, 0);

  const estimatedPages = Math.ceil(wordCount / 250); // ~250 words per page

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-card neomorph-flat border-0 mx-3 lg:mx-6 mt-3 lg:mt-6 rounded-2xl px-4 lg:px-8 py-4 lg:py-6"
    >
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-0">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3 lg:gap-6 w-full lg:w-auto">
          <motion.div 
            className="flex items-center gap-3 lg:gap-4"
            whileHover={{ scale: 1.02 }}
          >
            <div className="p-2 lg:p-3 rounded-xl neomorph-flat">
              <FileText size={20} className="lg:hidden text-primary" />
              <FileText size={28} className="hidden lg:block text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg lg:text-2xl font-bold text-foreground truncate">{project.title}</h1>
              {project.description && (
                <p className="text-muted-foreground mt-1 text-sm lg:text-base line-clamp-1 lg:line-clamp-none">{project.description}</p>
              )}
              {project.author && (
                <p className="text-xs lg:text-sm text-muted-foreground">by {project.author}</p>
              )}
            </div>
          </motion.div>
          
          <div className="flex flex-wrap gap-2 lg:gap-3 w-full lg:w-auto">
            <Badge 
              variant="secondary" 
              className="neomorph-flat border-0 px-2 lg:px-4 py-1 lg:py-2 text-xs lg:text-sm font-medium"
            >
              {project.chapters.length} {project.chapters.length === 1 ? 'Chapter' : 'Chapters'}
            </Badge>
            <Badge 
              variant="outline" 
              className="neomorph-flat border-0 px-2 lg:px-4 py-1 lg:py-2 text-xs lg:text-sm font-medium"
            >
              {wordCount.toLocaleString()} words
            </Badge>
            <Badge 
              variant="outline" 
              className="neomorph-flat border-0 px-2 lg:px-4 py-1 lg:py-2 text-xs lg:text-sm font-medium"
            >
              ~{estimatedPages} pages
            </Badge>
            
            {/* Compact Usage Badge */}
            {isPremium ? (
              <Badge 
                variant="outline"
                className="neomorph-flat border-0 px-2 lg:px-4 py-1 lg:py-2 text-xs lg:text-sm font-medium text-amber-700 dark:text-amber-400 flex items-center gap-1"
              >
                <Crown size={12} weight="fill" className="text-amber-600 dark:text-yellow-400" />
                <span className="font-semibold">Unlimited</span>
              </Badge>
            ) : (
              <Badge 
                onClick={usagePercentage >= 70 ? onUpgradeClick : undefined}
                className={`neomorph-flat border-0 px-2 lg:px-4 py-1 lg:py-2 text-xs lg:text-sm font-medium flex items-center gap-1 ${
                  usagePercentage >= 100 
                    ? 'bg-red-500/20 text-red-700 dark:text-red-400 cursor-pointer hover:bg-red-500/30' 
                    : usagePercentage >= 70 
                    ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 cursor-pointer hover:bg-yellow-500/30' 
                    : 'bg-green-500/20 text-green-700 dark:text-green-400'
                }`}
              >
                <FileText size={12} />
                <span>{pagesRemaining} of {maxPages} pages left</span>
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-3 w-full lg:w-auto">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1 lg:gap-2 neomorph-button border-0 h-9 lg:h-12 px-3 lg:px-6 text-xs lg:text-sm text-foreground hover:text-foreground"
              onClick={onBrandCustomize}
            >
              <Palette size={14} className="lg:hidden" />
              <Palette size={18} className="hidden lg:block" />
              <span className="hidden sm:inline">Brand Style</span>
              <span className="sm:hidden">Brand</span>
            </Button>
          </motion.div>

          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogTrigger asChild>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" size="sm" className="gap-1 lg:gap-2 neomorph-button border-0 h-9 lg:h-12 px-3 lg:px-6 text-xs lg:text-sm text-foreground hover:text-foreground">
                  <Gear size={14} className="lg:hidden" />
                  <Gear size={18} className="hidden lg:block" />
                  <span className="hidden sm:inline">Project Settings</span>
                  <span className="sm:hidden">Settings</span>
                </Button>
              </motion.div>
            </DialogTrigger>
            <DialogContent className="neomorph-raised border-0 max-w-md max-h-[85vh] flex flex-col">
              <DialogHeader className="flex-shrink-0">
                <DialogTitle className="text-xl">Project Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 overflow-y-auto flex-1 pr-2">
                <div>
                  <label className="text-sm font-semibold mb-3 block text-foreground">Project Title</label>
                  <Input
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    placeholder="Enter your ebook title..."
                    className="neomorph-inset border-0 h-12"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold mb-3 block text-foreground">Author Name</label>
                  <Input
                    value={tempAuthor}
                    onChange={(e) => setTempAuthor(e.target.value)}
                    placeholder="Enter author name..."
                    className="neomorph-inset border-0 h-12"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold mb-3 block text-foreground">Description</label>
                  <Textarea
                    value={tempDescription}
                    onChange={(e) => setTempDescription(e.target.value)}
                    placeholder="Brief description of your ebook..."
                    rows={4}
                    className="neomorph-inset border-0 resize-none"
                  />
                </div>
                
                {/* Custom Watermark for Premium Users */}
                {isPremium && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Label htmlFor="projectWatermark" className="text-sm font-semibold text-foreground">
                        Custom Watermark
                      </Label>
                      <Badge variant="secondary" className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                        Premium
                      </Badge>
                    </div>
                    <Input
                      id="projectWatermark"
                      value={tempWatermark}
                      onChange={(e) => setTempWatermark(e.target.value)}
                      placeholder="e.g., Written by Your Name • yourwebsite.com"
                      className="neomorph-inset border-0 h-12"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Project-specific watermark. Leave empty to use your global setting or no watermark.
                    </p>
                  </div>
                )}
                
                {/* Danger Zone - Delete Project */}
                {onDeleteProject && (
                  <div className="border-t pt-4 mt-6">
                    <label className="text-sm font-semibold mb-2 block text-red-600 dark:text-red-400">Danger Zone</label>
                    <p className="text-xs text-muted-foreground mb-3">
                      Once you delete this project, all chapters and content will be permanently removed. This action cannot be undone.
                    </p>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="destructive"
                          className="w-full gap-2"
                        >
                          <Trash size={16} />
                          Delete Project
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="neomorph-raised border-0">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete "<strong>{project.title}</strong>" and all {project.chapters.length} chapter{project.chapters.length !== 1 ? 's' : ''}. 
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="neomorph-button border-0">Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => {
                              setIsEditing(false);
                              onDeleteProject();
                            }}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Yes, Delete Project
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
                
                <div className="flex justify-end gap-3 pt-4 pb-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(false)}
                    className="neomorph-button border-0 px-6 text-foreground hover:text-foreground"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSave}
                    className="neomorph-button border-0 px-6"
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              onClick={() => setShowPreviewDialog(true)} 
              variant="outline"
              size="sm"
              className="gap-1 lg:gap-2 neomorph-button border-0 h-9 lg:h-12 px-3 lg:px-6 text-xs lg:text-sm text-foreground hover:text-foreground"
            >
              <Eye size={14} className="lg:hidden" />
              <Eye size={18} className="hidden lg:block" />
              <span className="hidden sm:inline">Preview</span>
              <span className="sm:hidden">Preview</span>
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              onClick={() => setShowExportDialog(true)} 
              className="gap-1 lg:gap-2 neomorph-button border-0 h-9 lg:h-12 px-3 lg:px-6 bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs lg:text-sm flex-1 lg:flex-none"
            >
              <DownloadSimple size={14} className="lg:hidden" />
              <DownloadSimple size={18} className="hidden lg:block" />
              <span className="hidden sm:inline">Export Ebook</span>
              <span className="sm:hidden">Export</span>
            </Button>
          </motion.div>
        </div>
      </div>

      <ExportDialog
        project={project}
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
      />
      
      <PreviewDialog
        project={project}
        isOpen={showPreviewDialog}
        onClose={() => setShowPreviewDialog(false)}
      />
    </motion.header>
  );
}