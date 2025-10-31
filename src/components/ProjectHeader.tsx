import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DownloadSimple, FileText, Gear, Palette, Eye, Crown, Sparkle, Trash, Image as ImageIcon, DotsThree, ArrowLeft } from '@phosphor-icons/react';
import { EbookProject, CoverDesign } from '@/lib/types';
import { ExportDialog } from '@/components/ExportDialog';
import { PreviewDialog } from '@/components/PreviewDialog';
import { CoverDesigner } from '@/components/CoverDesigner';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

interface ProjectHeaderProps {
  project: EbookProject;
  onProjectUpdate: (updates: Partial<EbookProject>) => void;
  onBrandCustomize: () => void;
  onUpgradeClick?: () => void;
  onDeleteProject?: () => void;
  onBack?: () => void;
  backLabel?: string;
}

export function ProjectHeader({ project, onProjectUpdate, onBrandCustomize, onUpgradeClick, onDeleteProject, onBack, backLabel }: ProjectHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showCoverDesigner, setShowCoverDesigner] = useState(false);
  const [tempTitle, setTempTitle] = useState(project.title);
  const [tempDescription, setTempDescription] = useState(project.description);
  const [tempAuthor, setTempAuthor] = useState(project.author);
  const [tempWatermark, setTempWatermark] = useState(project.customWatermark || '');
  const { userProfile } = useAuth();

  const isPremium = userProfile?.isPremium || false;
  const pagesUsed = userProfile?.pagesUsed || 0;
  const maxPages = userProfile?.maxPages || 4; // Free tier default
  // Only show unlimited if user is actually premium (not just if maxPages is -1)
  const isUnlimited = isPremium && (maxPages === -1 || userProfile?.subscriptionStatus === 'premium');
  // Default to 4 pages for free users if maxPages is invalid
  const effectiveMaxPages = !isPremium && (maxPages <= 0 || maxPages === -1) ? 4 : maxPages;
  const pagesRemaining = isUnlimited ? 0 : Math.max(0, effectiveMaxPages - pagesUsed);
  const usagePercentage = isUnlimited ? 0 : Math.min((pagesUsed / effectiveMaxPages) * 100, 100);

  const handleSave = () => {
    onProjectUpdate({
      title: tempTitle.trim() || 'Untitled Ebook',
      description: tempDescription.trim(),
      author: tempAuthor.trim(),
      customWatermark: tempWatermark.trim(),
    });
    setIsEditing(false);
  };

  const handleSaveCover = (design: CoverDesign, imageData: string) => {
    onProjectUpdate({
      coverDesign: { ...design, coverImageData: imageData },
    });
    toast.success('Cover saved successfully!');
  };

  const wordCount = project.chapters.reduce((total, chapter) => {
    return total + (chapter.content?.split(/\s+/).filter(word => word.length > 0).length || 0);
  }, 0);

  const estimatedPages = Math.ceil(wordCount / 250); // ~250 words per page

  return (
    <>
      <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-card neomorph-flat border-0 mx-3 lg:mx-6 mt-3 lg:mt-6 rounded-2xl px-4 lg:px-8 py-4 lg:py-6"
    >
      <div className="flex flex-col gap-4">
        {/* Top Row: Project Info */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2 lg:gap-3 flex-1 min-w-0">
            {/* Back Button - integrated into header */}
            {onBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="neomorph-flat border-0 p-2 lg:p-2.5 flex-shrink-0"
                title={backLabel || 'Back'}
              >
                <ArrowLeft size={18} className="lg:hidden" />
                <ArrowLeft size={20} className="hidden lg:block" />
              </Button>
            )}
            
            <div className="p-2 lg:p-3 rounded-xl neomorph-flat flex-shrink-0">
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
          </div>
          
          {/* Stats Badge - shows on desktop only, moves to second row on mobile */}
          <Badge 
            variant="secondary" 
            className="hidden lg:flex neomorph-flat border-0 px-4 py-2 text-sm font-medium flex-shrink-0"
          >
            {project.chapters.length} {project.chapters.length === 1 ? 'Chapter' : 'Chapters'} • {wordCount.toLocaleString()} words
          </Badge>
        </div>

        {/* Bottom Row: Stats (mobile) + Action Buttons */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          {/* Stats Badge - mobile only */}
          <Badge 
            variant="secondary" 
            className="lg:hidden neomorph-flat border-0 px-3 py-1.5 text-xs font-medium w-fit"
          >
            {project.chapters.length} {project.chapters.length === 1 ? 'Chapter' : 'Chapters'} • {wordCount.toLocaleString()} words
          </Badge>

          {/* Spacer to push buttons to the right on desktop */}
          <div className="hidden lg:flex lg:flex-1"></div>

          {/* Action Buttons - Responsive Grid on Mobile, Flex on Desktop */}
          <div className="grid grid-cols-3 gap-2 lg:flex lg:items-center lg:gap-2">
            {/* AI Cover Generator Button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={() => setShowCoverDesigner(true)} 
                variant="default"
                size="sm"
                className="gap-1.5 lg:gap-2 h-10 lg:h-12 px-2 lg:px-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white border-0 w-full lg:w-auto"
              >
                <Sparkle size={16} className="lg:hidden" weight="fill" />
                <Sparkle size={18} className="hidden lg:block" weight="fill" />
                <span className="hidden md:inline">AI Cover</span>
                <span className="md:hidden text-xs">AI</span>
              </Button>
            </motion.div>

            {/* Cover Design Button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={() => setShowCoverDesigner(true)} 
                variant="outline"
                size="sm"
                className="gap-1.5 lg:gap-2 neomorph-button border-0 h-10 lg:h-12 px-2 lg:px-4 w-full lg:w-auto"
              >
                <ImageIcon size={16} className="lg:hidden" />
                <ImageIcon size={18} className="hidden lg:block" />
                <span className="hidden sm:inline">Cover Design</span>
                <span className="sm:hidden text-xs">Cover</span>
              </Button>
            </motion.div>

            {/* Customize Dropdown Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1.5 lg:gap-2 neomorph-button border-0 h-10 lg:h-12 px-2 lg:px-4 w-full lg:w-auto"
                >
                  <Gear size={16} className="lg:hidden" />
                  <Gear size={18} className="hidden lg:block" />
                  <span className="hidden sm:inline">Customize</span>
                  <DotsThree size={16} className="sm:hidden lg:hidden" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-card border border-border shadow-lg">
                <DropdownMenuItem onClick={onBrandCustomize} className="cursor-pointer gap-2 p-3">
                  <Palette size={18} />
                  <span>Brand Style</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsEditing(true)} className="cursor-pointer gap-2 p-3">
                  <Gear size={18} />
                  <span>Project Settings</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Preview Button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={() => setShowPreviewDialog(true)} 
                variant="outline"
                size="sm"
                className="gap-1.5 lg:gap-2 neomorph-button border-0 h-10 lg:h-12 px-2 lg:px-4 w-full lg:w-auto"
              >
                <Eye size={16} className="lg:hidden" />
                <Eye size={18} className="hidden lg:block" />
                <span className="hidden sm:inline">Preview</span>
                <span className="sm:hidden text-xs">View</span>
              </Button>
            </motion.div>

            {/* Export Button - Primary Action */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="col-span-2 lg:col-span-1">
              <Button 
                onClick={() => setShowExportDialog(true)} 
                className="gap-1.5 lg:gap-2 neomorph-button border-0 h-10 lg:h-12 px-3 lg:px-6 bg-gradient-to-r from-primary to-accent text-primary-foreground w-full lg:w-auto"
              >
                <DownloadSimple size={16} className="lg:hidden" weight="bold" />
                <DownloadSimple size={18} className="hidden lg:block" weight="bold" />
                <span className="text-xs lg:text-sm">Export</span>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Settings Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="neomorph-raised border-0 max-w-md max-h-[85vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-xl">Project Settings</DialogTitle>
            <DialogDescription>
              Configure your ebook details and metadata
            </DialogDescription>
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
      </motion.header>

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

      <CoverDesigner
        open={showCoverDesigner}
        onOpenChange={setShowCoverDesigner}
        projectTitle={project.title}
        authorName={project.author || userProfile?.displayName || 'Author Name'}
        onSave={handleSaveCover}
        initialDesign={project.coverDesign}
      />
    </>
  );
}