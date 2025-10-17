import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
      if (!chapter.content) return total;
      
      // Strip HTML tags for accurate word count
      const textContent = chapter.content.replace(/<[^>]*>/g, ' ');
      const wordCount = textContent.split(/\s+/).filter(word => word.length > 0).length;
      
      return total + wordCount;
    }, 0);
  };

  const isHTML = (content: string) => {
    // Check if content contains HTML tags
    return /<\/?[a-z][\s\S]*>/i.test(content);
  };

  const formatContent = (content: string) => {
    // If content is HTML (from rich text editor), render it directly
    if (isHTML(content)) {
      return (
        <div 
          className="prose prose-sm lg:prose-base max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      );
    }
    
    // Otherwise, treat as plain text (from AI or old content)
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
      <DialogContent className="max-w-4xl w-full h-[80vh] neomorph-raised border-0 p-0 gap-0 [&>button]:hidden">
        <DialogHeader className="p-4 lg:p-6 border-b border-border/20 relative">
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
          
          {/* Custom styled close button */}
          <motion.div 
            className="absolute top-4 right-4 lg:top-6 lg:right-6"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="neomorph-button border-0 h-10 w-10 p-0 rounded-full bg-background/80 backdrop-blur-sm hover:bg-primary/10 transition-all duration-200 shadow-lg"
            >
              <X size={18} className="text-muted-foreground hover:text-primary transition-colors" />
            </Button>
          </motion.div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 max-h-[calc(80vh-120px)]">
          <div className="max-w-3xl mx-auto">
            {/* Title Page - Enhanced with export-like styling */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 mb-12 border-b-4 border-border/30"
              style={{ borderColor: project.brandConfig?.accentColor || '#C4B5FD' }}
            >
              {/* Logo if available */}
              {project.brandConfig?.logoUrl && (
                <div className="mb-6">
                  <img 
                    src={project.brandConfig.logoUrl} 
                    alt="Logo" 
                    className="h-16 mx-auto object-contain"
                  />
                </div>
              )}
              
              <h1 
                className="text-4xl lg:text-5xl font-bold mb-6 leading-tight"
                style={{ 
                  color: project.brandConfig?.primaryColor || '#8B5CF6',
                  fontFamily: project.brandConfig?.fontFamily || 'Inter, sans-serif'
                }}
              >
                {project.title}
              </h1>
              
              {project.author && (
                <p 
                  className="text-xl mb-6 italic"
                  style={{ 
                    color: project.brandConfig?.secondaryColor || '#A78BFA',
                    fontFamily: project.brandConfig?.fontFamily || 'Inter, sans-serif'
                  }}
                >
                  by {project.author}
                </p>
              )}
              
              {project.description && (
                <p 
                  className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8"
                  style={{ fontFamily: project.brandConfig?.fontFamily || 'Inter, sans-serif' }}
                >
                  {project.description}
                </p>
              )}
              
              <div className="flex justify-center gap-4 mt-8 text-sm font-medium">
                <span 
                  style={{ 
                    color: project.brandConfig?.primaryColor || '#8B5CF6',
                    fontFamily: project.brandConfig?.fontFamily || 'Inter, sans-serif'
                  }}
                >
                  {sortedChapters.length} Chapter{sortedChapters.length !== 1 ? 's' : ''}
                </span>
                <span className="text-muted-foreground">•</span>
                <span 
                  style={{ 
                    color: project.brandConfig?.primaryColor || '#8B5CF6',
                    fontFamily: project.brandConfig?.fontFamily || 'Inter, sans-serif'
                  }}
                >
                  {getWordCount().toLocaleString()} Words
                </span>
                <span className="text-muted-foreground">•</span>
                <span 
                  style={{ 
                    color: project.brandConfig?.primaryColor || '#8B5CF6',
                    fontFamily: project.brandConfig?.fontFamily || 'Inter, sans-serif'
                  }}
                >
                  ~{Math.ceil(getWordCount() / 250)} Pages
                </span>
              </div>
            </motion.div>

            {/* Chapters - Enhanced with export-like styling */}
            <div className="space-y-12 mt-8">
              {sortedChapters.map((chapter, index) => (
                <motion.div
                  key={chapter.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-6 pb-8"
                  style={{ 
                    borderBottom: index < sortedChapters.length - 1 ? `2px solid ${project.brandConfig?.accentColor || '#E9D5FF'}` : 'none',
                    fontFamily: project.brandConfig?.fontFamily || 'Inter, sans-serif'
                  }}
                >
                  {/* Chapter Number */}
                  <div 
                    className="text-sm font-semibold tracking-wider uppercase mb-2"
                    style={{ color: project.brandConfig?.secondaryColor || '#A78BFA' }}
                  >
                    Chapter {index + 1}
                  </div>
                  
                  {/* Chapter Title with bottom border */}
                  <h2 
                    className="text-2xl lg:text-3xl font-bold pb-4"
                    style={{ 
                      color: project.brandConfig?.primaryColor || '#8B5CF6',
                      borderBottom: `3px solid ${project.brandConfig?.accentColor || '#C4B5FD'}`,
                      fontFamily: project.brandConfig?.fontFamily || 'Inter, sans-serif'
                    }}
                  >
                    {chapter.title}
                  </h2>
                  
                  {/* Chapter Content with drop cap styling */}
                  <div 
                    className="text-base lg:text-lg leading-relaxed text-foreground/90"
                    style={{ 
                      textAlign: 'justify',
                      lineHeight: '1.8',
                      fontFamily: project.brandConfig?.fontFamily || 'Inter, sans-serif'
                    }}
                  >
                    {chapter.content ? (
                      <div className="chapter-content-preview">
                        <style>{`
                          .chapter-content-preview p:first-of-type::first-letter {
                            font-size: 3em;
                            font-weight: 700;
                            color: ${project.brandConfig?.primaryColor || '#8B5CF6'};
                            float: left;
                            line-height: 1;
                            margin-right: 8px;
                            margin-top: 4px;
                          }
                          .chapter-content-preview p {
                            margin-bottom: 1.2em;
                          }
                        `}</style>
                        {formatContent(chapter.content)}
                      </div>
                    ) : (
                      <p className="text-muted-foreground italic">
                        This chapter has no content yet.
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

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
        </div>
      </DialogContent>
    </Dialog>
  );
}
