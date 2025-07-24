import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DownloadSimple, Edit3, FileText, Settings } from '@phosphor-icons/react';
import { EbookProject } from '@/lib/types';

interface ProjectHeaderProps {
  project: EbookProject;
  onProjectUpdate: (updates: Partial<EbookProject>) => void;
  onExport: () => void;
}

export function ProjectHeader({ project, onProjectUpdate, onExport }: ProjectHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(project.title);
  const [tempDescription, setTempDescription] = useState(project.description);

  const handleSave = () => {
    onProjectUpdate({
      title: tempTitle.trim() || 'Untitled Ebook',
      description: tempDescription.trim(),
    });
    setIsEditing(false);
  };

  const wordCount = project.chapters.reduce((total, chapter) => {
    return total + (chapter.content?.split(/\s+/).filter(word => word.length > 0).length || 0);
  }, 0);

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <FileText size={24} className="text-primary" />
            <div>
              <h1 className="text-xl font-bold">{project.title}</h1>
              {project.description && (
                <p className="text-sm text-muted-foreground">{project.description}</p>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Badge variant="secondary">
              {project.chapters.length} {project.chapters.length === 1 ? 'Chapter' : 'Chapters'}
            </Badge>
            <Badge variant="outline">
              {wordCount.toLocaleString()} words
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Settings size={16} />
                Project Settings
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Project Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Project Title</label>
                  <Input
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    placeholder="Enter your ebook title..."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <Textarea
                    value={tempDescription}
                    onChange={(e) => setTempDescription(e.target.value)}
                    placeholder="Brief description of your ebook..."
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>
                    Save Changes
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button onClick={onExport} className="gap-2">
            <DownloadSimple size={16} />
            Export PDF
          </Button>
        </div>
      </div>
    </header>
  );
}