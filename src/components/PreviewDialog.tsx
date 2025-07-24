import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpen, X } from '@phosphor-icons/react';
import { EbookProject } from '@/lib/types';
import { motion } from 'framer-motion';

interface PreviewDialogProps {
  project: EbookProject;
  isOpen: boolean;
  onClose: () => void;
}

export function PreviewDialog({ project, isOpen, onClose }: PreviewDialogProps) {
  const getWordCount = () => {
    return project.chapters.reduce((total, chapter) => {
      return total + (chapter.content?.split(/\s+/).filter(word => word.length > 0).length || 0);
    }, 0);
  };

  const formatContent = (content: string) => {
    // Simple formatting for preview
    return content
      .split('\n\n')
      .map((paragraph, index) => {
        if (paragraph.startsWith('#')) {
          // Handle markdown headers
          const level = paragraph.match(/^#+/)?.[0].length || 1;
          const text = paragraph.replace(/^#+\s*/, '');
          const className = level === 1 ? 'text-xl font-bold mb-4' : 
                           level === 2 ? 'text-lg font-semibold mb-3' : 
                           'text-base font-medium mb-2';
          return <h2 key={index} className={className}>{text}</h2>;
        }
        return <p key={index} className="mb-3 leading-relaxed">{paragraph}</p>;
      });
  };

  const sortedChapters = [...project.chapters].sort((a, b) => a.order - b.order);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[80vh] neomorph-raised border-0 p-0 gap-0">
        <DialogHeader className="p-4 lg:p-6 border-b border-border/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl neomorph-inset">
                <BookOpen size={20} className="text-primary" />
              </div>
              <div>
                <DialogTitle className="text-lg lg:text-xl font-bold">
                  {project.title} - Preview
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                  {sortedChapters.length} chapters • {getWordCount().toLocaleString()} words
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="neomorph-button border-0 h-8 w-8 p-0"
            >
              <X size={16} />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6">
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Title Page */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8 border-b border-border/20"
            >
              <h1 
                className="text-3xl lg:text-4xl font-bold mb-4"
                style={{ color: project.brandConfig?.primaryColor || '#8B5CF6' }}
              >
                {project.title}
              </h1>
              {project.author && (
                <p className="text-lg text-muted-foreground mb-4">
                  by {project.author}
                </p>
              )}
              {project.description && (
                <p className="text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  {project.description}
                </p>
              )}
              
              <div className="flex justify-center gap-4 mt-6">
                <Badge 
                  variant="secondary" 
                  className="neomorph-flat border-0"
                  style={{ 
                    backgroundColor: project.brandConfig?.accentColor || '#EDE9FE',
                    color: project.brandConfig?.primaryColor || '#8B5CF6'
                  }}
                >
                  {sortedChapters.length} {sortedChapters.length === 1 ? 'Chapter' : 'Chapters'}
                </Badge>
                <Badge 
                  variant="secondary" 
                  className="neomorph-flat border-0"
                  style={{ 
                    backgroundColor: project.brandConfig?.accentColor || '#EDE9FE',
                    color: project.brandConfig?.primaryColor || '#8B5CF6'
                  }}
                >
                  {getWordCount().toLocaleString()} Words
                </Badge>
              </div>
            </motion.div>

            {/* Chapters */}
            {sortedChapters.map((chapter, index) => (
              <motion.div
                key={chapter.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Badge 
                    variant="outline"
                    className="neomorph-flat border-0 px-3 py-1"
                    style={{ 
                      backgroundColor: project.brandConfig?.secondaryColor || '#A78BFA',
                      color: 'white'
                    }}
                  >
                    Chapter {index + 1}
                  </Badge>
                  <h2 
                    className="text-xl lg:text-2xl font-bold"
                    style={{ color: project.brandConfig?.primaryColor || '#8B5CF6' }}
                  >
                    {chapter.title}
                  </h2>
                </div>
                
                <div className="text-sm lg:text-base leading-relaxed text-foreground/90 space-y-3">
                  {chapter.content ? (
                    formatContent(chapter.content)
                  ) : (
                    <p className="text-muted-foreground italic">
                      This chapter has no content yet.
                    </p>
                  )}
                </div>
                
                {index < sortedChapters.length - 1 && (
                  <div 
                    className="w-16 h-px mx-auto my-8"
                    style={{ backgroundColor: project.brandConfig?.secondaryColor || '#A78BFA' }}
                  />
                )}
              </motion.div>
            ))}

            {sortedChapters.length === 0 && (
              <div className="text-center py-12">
                <BookOpen size={64} className="mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Chapters Yet</h3>
                <p className="text-muted-foreground">
                  Create your first chapter to see the preview.
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
