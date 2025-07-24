import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DownloadSimple, Edit3, FileText, Settings, Palette } from '@phosphor-icons/react';
import { EbookProject } from '@/lib/types';
import { motion } from 'framer-motion';

interface ProjectHeaderProps {
  project: EbookProject;
  onProjectUpdate: (updates: Partial<EbookProject>) => void;
  onExport: () => void;
  onBrandCustomize: () => void;
}

export function ProjectHeader({ project, onProjectUpdate, onExport, onBrandCustomize }: ProjectHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(project.title);
  const [tempDescription, setTempDescription] = useState(project.description);
  const [tempAuthor, setTempAuthor] = useState(project.author);

  const handleSave = () => {
    onProjectUpdate({
      title: tempTitle.trim() || 'Untitled Ebook',
      description: tempDescription.trim(),
      author: tempAuthor.trim(),
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
      className="bg-card neomorph-flat border-0 mx-6 mt-6 rounded-2xl px-8 py-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <motion.div 
            className="flex items-center gap-4"
            whileHover={{ scale: 1.02 }}
          >
            <div className="p-3 rounded-xl neomorph-flat">
              <FileText size={28} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{project.title}</h1>
              {project.description && (
                <p className="text-muted-foreground mt-1">{project.description}</p>
              )}
              {project.author && (
                <p className="text-sm text-muted-foreground">by {project.author}</p>
              )}
            </div>
          </motion.div>
          
          <div className="flex gap-3">
            <Badge 
              variant="secondary" 
              className="neomorph-flat border-0 px-4 py-2 text-sm font-medium"
            >
              {project.chapters.length} {project.chapters.length === 1 ? 'Chapter' : 'Chapters'}
            </Badge>
            <Badge 
              variant="outline" 
              className="neomorph-flat border-0 px-4 py-2 text-sm font-medium"
            >
              {wordCount.toLocaleString()} words
            </Badge>
            <Badge 
              variant="outline" 
              className="neomorph-flat border-0 px-4 py-2 text-sm font-medium"
            >
              ~{estimatedPages} pages
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 neomorph-button border-0 h-12 px-6"
              onClick={onBrandCustomize}
            >
              <Palette size={18} />
              Brand Style
            </Button>
          </motion.div>

          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogTrigger asChild>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" size="sm" className="gap-2 neomorph-button border-0 h-12 px-6">
                  <Settings size={18} />
                  Project Settings
                </Button>
              </motion.div>
            </DialogTrigger>
            <DialogContent className="neomorph-raised border-0 max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl">Project Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
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
                <div className="flex justify-end gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(false)}
                    className="neomorph-button border-0 px-6"
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
              onClick={onExport} 
              className="gap-2 neomorph-button border-0 h-12 px-6 bg-gradient-to-r from-primary to-accent text-primary-foreground"
            >
              <DownloadSimple size={18} />
              Export PDF
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}