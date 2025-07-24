import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FilePdf, FileDoc, BookOpen, Download, Star } from '@phosphor-icons/react';
import { ExportFormat, exportToFormat } from '@/lib/export';
import { EbookProject } from '@/lib/types';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface ExportDialogProps {
  project: EbookProject;
  isOpen: boolean;
  onClose: () => void;
}

interface ExportOption {
  format: ExportFormat;
  title: string;
  description: string;
  icon: React.ElementType;
  features: string[];
  recommended?: boolean;
}

const exportOptions: ExportOption[] = [
  {
    format: 'pdf',
    title: 'PDF Document',
    description: 'Perfect for professional distribution and printing',
    icon: FilePdf,
    features: ['Print-ready layout', 'Custom branding', 'Universal compatibility', 'Professional formatting'],
    recommended: true,
  },
  {
    format: 'epub',
    title: 'EPUB eBook',
    description: 'Standard format for digital reading devices',
    icon: BookOpen,
    features: ['E-reader compatible', 'Responsive text', 'Bookmarking support', 'Offline reading'],
  },
  {
    format: 'docx',
    title: 'Word Document',
    description: 'Editable format for further customization',
    icon: FileDoc,
    features: ['Fully editable', 'Track changes', 'Comments support', 'Microsoft Office'],
  },
];

export function ExportDialog({ project, isOpen, onClose }: ExportDialogProps) {
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(null);

  const handleExport = async (format: ExportFormat) => {
    try {
      setExportingFormat(format);
      toast.loading(`Generating ${format.toUpperCase()}...`, { id: 'export' });
      await exportToFormat(project, format);
      toast.success(`${format.toUpperCase()} export complete!`, { id: 'export' });
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      toast.error(`Export failed. Please try again.`, { id: 'export' });
    } finally {
      setExportingFormat(null);
    }
  };

  const getWordCount = () => {
    return project.chapters.reduce((total, chapter) => {
      return total + (chapter.content?.split(/\s+/).filter(word => word.length > 0).length || 0);
    }, 0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl neomorph-raised border-0">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <div className="p-2 rounded-xl neomorph-flat">
              <Download size={24} className="text-primary" />
            </div>
            Export Your Ebook
          </DialogTitle>
          <p className="text-muted-foreground">
            Choose your preferred format to export "{project.title}"
          </p>
        </DialogHeader>

        {/* Project stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 rounded-xl neomorph-inset">
            <div className="text-2xl font-bold text-primary">{project.chapters.length}</div>
            <div className="text-sm text-muted-foreground">Chapters</div>
          </div>
          <div className="text-center p-4 rounded-xl neomorph-inset">
            <div className="text-2xl font-bold text-accent">{getWordCount().toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Words</div>
          </div>
          <div className="text-center p-4 rounded-xl neomorph-inset">
            <div className="text-2xl font-bold text-secondary-foreground">~{Math.ceil(getWordCount() / 250)}</div>
            <div className="text-sm text-muted-foreground">Pages</div>
          </div>
        </div>

        {/* Export options */}
        <div className="grid gap-4">
          {exportOptions.map((option, index) => {
            const Icon = option.icon;
            const isExporting = exportingFormat === option.format;
            
            return (
              <motion.div
                key={option.format}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="neomorph-flat border-0 hover:neomorph-raised transition-all duration-300 cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-3 rounded-xl neomorph-inset">
                          <Icon size={32} className="text-primary" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold">{option.title}</h3>
                            {option.recommended && (
                              <Badge variant="secondary" className="gap-1 neomorph-flat border-0">
                                <Star size={12} />
                                Recommended
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-muted-foreground mb-4">
                            {option.description}
                          </p>
                          
                          <div className="flex flex-wrap gap-2">
                            {option.features.map((feature) => (
                              <Badge 
                                key={feature} 
                                variant="outline" 
                                className="text-xs neomorph-inset border-0"
                              >
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => handleExport(option.format)}
                        disabled={isExporting}
                        className="neomorph-button border-0 gap-2"
                        size="lg"
                      >
                        {isExporting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                            Exporting...
                          </>
                        ) : (
                          <>
                            <Download size={16} />
                            Export {option.format.toUpperCase()}
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-6 p-4 rounded-xl neomorph-inset bg-muted/30">
          <p className="text-sm text-muted-foreground text-center">
            💡 <strong>Tip:</strong> PDF is recommended for final distribution, EPUB for e-readers, and DOCX for further editing.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}