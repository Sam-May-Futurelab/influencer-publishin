import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FilePdf, FileDoc, BookOpen, Download, Star } from '@phosphor-icons/react';
import { ExportFormat, exportToFormat } from '@/lib/export';
import { EbookProject } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
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
    title: 'PDF Document (.pdf)',
    description: 'Perfect for professional distribution and printing',
    icon: FilePdf,
    features: ['Print-ready layout', 'Custom branding', 'Universal compatibility', 'Professional formatting'],
    recommended: true,
  },
  {
    format: 'epub',
    title: 'EPUB eBook (.epub)',
    description: 'Standard format for digital reading devices',
    icon: BookOpen,
    features: ['E-reader compatible', 'Responsive text', 'Bookmarking support', 'Offline reading'],
  },
  {
    format: 'docx',
    title: 'Word Document (.docx)',
    description: 'Editable format for further customization',
    icon: FileDoc,
    features: ['Fully editable', 'Track changes', 'Comments support', 'Microsoft Office'],
  },
];

export function ExportDialog({ project, isOpen, onClose }: ExportDialogProps) {
  const { userProfile } = useAuth();
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(null);
  const [customWatermark, setCustomWatermark] = useState<string>('');
  const [authorName, setAuthorName] = useState<string>('');
  const [authorBio, setAuthorBio] = useState<string>('');
  const [authorWebsite, setAuthorWebsite] = useState<string>('');
  
  // Alert dialog state for empty chapters warning
  const [showEmptyChaptersAlert, setShowEmptyChaptersAlert] = useState(false);
  const [emptyChaptersList, setEmptyChaptersList] = useState<string[]>([]);
  const [pendingExportFormat, setPendingExportFormat] = useState<ExportFormat | null>(null);
  
  // New export options
  const [includeTOC, setIncludeTOC] = useState<boolean>(true);
  const [includeCopyright, setIncludeCopyright] = useState<boolean>(true);
  const [copyrightPosition, setCopyrightPosition] = useState<'beginning' | 'end'>('end');
  const [chapterNumberStyle, setChapterNumberStyle] = useState<'numeric' | 'roman' | 'none'>('numeric');

  // Load settings from localStorage
  useEffect(() => {
    const settings = localStorage.getItem('ebookCrafterSettings');
    if (settings) {
      const parsed = JSON.parse(settings);
  setCustomWatermark(parsed.customWatermark || '');
  setAuthorName(parsed.authorName || '');
  setAuthorBio(parsed.authorBio || '');
  setAuthorWebsite(parsed.authorWebsite || '');
      setIncludeTOC(parsed.includeTOC ?? true);
      setIncludeCopyright(parsed.includeCopyright ?? true);
      setCopyrightPosition(parsed.copyrightPosition || 'end');
      setChapterNumberStyle(parsed.chapterNumberStyle || 'numeric');
    }
  }, []);

  // Save export preferences to localStorage when they change
  useEffect(() => {
    const settings = JSON.parse(localStorage.getItem('ebookCrafterSettings') || '{}');
    localStorage.setItem('ebookCrafterSettings', JSON.stringify({
      ...settings,
      includeTOC,
      includeCopyright,
      copyrightPosition,
      chapterNumberStyle,
    }));
  }, [includeTOC, includeCopyright, copyrightPosition, chapterNumberStyle]);

  const handleExport = async (format: ExportFormat) => {
    // Check if user has premium access or is within free tier limits
    if (!userProfile?.isPremium) {
      const totalPages = project.chapters.length;
      const freePageLimit = userProfile?.maxPages || 4;
      
      if (totalPages > freePageLimit) {
        toast.error(`Export requires Premium! You have ${totalPages} pages but free tier allows ${freePageLimit}. Upgrade to export.`);
        return;
      }
    }

    // Check for empty or very short chapters
    const emptyChapters = project.chapters.filter(chapter => {
      const textContent = chapter.content?.replace(/<[^>]*>/g, ' ') || '';
      const wordCount = textContent.split(/\s+/).filter(word => word.length > 0).length;
      return wordCount < 50;
    });

    if (emptyChapters.length > 0) {
      // Show warning dialog and wait for user decision
      setEmptyChaptersList(emptyChapters.map(c => c.title));
      setPendingExportFormat(format);
      setShowEmptyChaptersAlert(true);
      return; // Don't continue automatically
    }

    // If no empty chapters, export directly
    performExport(format);
  };

  const performExport = async (format: ExportFormat) => {
    try {
      setExportingFormat(format);
      toast.loading(`Generating ${format.toUpperCase()}...`, { id: 'export' });
      
      // Priority: project watermark > settings watermark > default behavior
      const effectiveWatermark = project.customWatermark || customWatermark;
      
      await exportToFormat(project, format, {
        isPremium: userProfile?.isPremium,
        customWatermark: effectiveWatermark,
        authorName,
        authorBio,
        authorWebsite,
        includeTOC,
        includeCopyright,
        copyrightPosition,
        chapterNumberStyle,
      });
      toast.success(`${format.toUpperCase()} export complete!`, { id: 'export' });
      onClose();
    } catch (error: unknown) {
      console.error('Export failed:', error);
      const message = error instanceof Error ? error.message : 'Export failed. Please try again.';
      toast.error(message, { id: 'export' });
    } finally {
      setExportingFormat(null);
    }
  };

  const getWordCount = () => {
    return project.chapters.reduce((total, chapter) => {
      if (!chapter.content) return total;
      
      // Strip HTML tags for accurate word count
      const textContent = chapter.content.replace(/<[^>]*>/g, ' ');
      const wordCount = textContent.split(/\s+/).filter(word => word.length > 0).length;
      
      return total + wordCount;
    }, 0);
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] border-0 shadow-lg p-6 flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <div className="p-2 rounded-xl neomorph-flat">
              <Download size={24} className="text-primary" />
            </div>
            Export Your Ebook
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            Choose your preferred format to export "{project.title}"
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1">
          <div className="grid lg:grid-cols-[1fr,400px] gap-6">
            {/* Left Column - Export Format Options */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Download size={18} className="text-primary" />
                Choose Export Format
              </h3>
              
              <div className="space-y-3">
                {exportOptions.map((option, index) => {
                  const Icon = option.icon;
                  const isExporting = exportingFormat === option.format;
                  
                  return (
                    <motion.div
                      key={option.format}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="neomorph-flat border-0 hover:neomorph-raised transition-all duration-300">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="p-2 rounded-xl neomorph-inset flex-shrink-0">
                                <Icon size={24} className="text-primary" />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="text-base font-semibold">{option.title}</h4>
                                  {option.recommended && (
                                    <Badge variant="secondary" className="gap-1 neomorph-flat border-0 text-xs">
                                      <Star size={12} weight="fill" />
                                      Best
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {option.description}
                                </p>
                              </div>
                            </div>
                            
                            <Button
                              onClick={() => handleExport(option.format)}
                              disabled={isExporting}
                              className="neomorph-button border-0 gap-2 flex-shrink-0"
                            >
                              {isExporting ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                                  Exporting...
                                </>
                              ) : (
                                <>
                                  <Download size={16} />
                                  Export
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

              <div className="p-3 rounded-xl neomorph-inset bg-muted/30">
                <p className="text-xs text-muted-foreground text-center">
                  💡 <strong>Tip:</strong> PDF is recommended for final distribution, EPUB for e-readers, and DOCX for further editing.
                </p>
              </div>
            </div>

            {/* Right Column - Stats & Settings */}
            <div className="space-y-4">
              {/* Project Stats */}
              <Card className="neomorph-flat border-0">
                <CardContent className="p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Quick Stats</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-3 rounded-lg neomorph-inset">
                      <div className="text-2xl font-bold text-primary">{project.chapters.length}</div>
                      <div className="text-xs text-muted-foreground">Chapters</div>
                    </div>
                    <div className="text-center p-3 rounded-lg neomorph-inset">
                      <div className="text-2xl font-bold text-accent">{getWordCount().toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Words</div>
                    </div>
                    <div className="text-center p-3 rounded-lg neomorph-inset">
                      <div className="text-2xl font-bold text-secondary-foreground">~{Math.ceil(getWordCount() / 250)}</div>
                      <div className="text-xs text-muted-foreground">Pages</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Export Settings */}
              <Card className="neomorph-flat border-0">
                <CardContent className="p-4 space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Export Settings</h3>
                  
                  {/* Table of Contents */}
                  <div className="p-3 rounded-lg neomorph-inset bg-background/50">
                    <div className="flex items-start space-x-3">
                      <Checkbox 
                        id="toc" 
                        checked={includeTOC}
                        onCheckedChange={(checked) => setIncludeTOC(checked as boolean)}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <Label htmlFor="toc" className="cursor-pointer font-medium text-sm">
                          Table of Contents
                        </Label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Auto-generated chapter links
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Copyright Page */}
                  <div className="p-3 rounded-lg neomorph-inset bg-background/50">
                    <div className="flex items-start space-x-3">
                      <Checkbox 
                        id="copyright" 
                        checked={includeCopyright}
                        onCheckedChange={(checked) => setIncludeCopyright(checked as boolean)}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <Label htmlFor="copyright" className="cursor-pointer font-medium text-sm">
                          Copyright Page
                        </Label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Legal protection notice
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Chapter Numbering Style */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Chapter Numbering</Label>
                    <Select
                      value={chapterNumberStyle}
                      onValueChange={(value) => setChapterNumberStyle(value as 'numeric' | 'roman' | 'none')}
                    >
                      <SelectTrigger className="neomorph-inset border-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="neomorph-raised border-0">
                        <SelectItem value="numeric">1, 2, 3...</SelectItem>
                        <SelectItem value="roman">I, II, III...</SelectItem>
                        <SelectItem value="none">No Numbers</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Empty Chapters Warning Alert */}
    <AlertDialog open={showEmptyChaptersAlert} onOpenChange={setShowEmptyChaptersAlert}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Short Chapters Detected</AlertDialogTitle>
          <AlertDialogDescription>
            {emptyChaptersList.length} chapter{emptyChaptersList.length > 1 ? 's have' : ' has'} less than 50 words and may appear blank or incomplete in the exported file.
            <div className="mt-3 p-3 rounded-lg bg-muted max-h-32 overflow-y-auto">
              <p className="text-sm font-medium mb-2">Affected chapters:</p>
              <ul className="text-sm space-y-1">
                {emptyChaptersList.map((title, index) => (
                  <li key={index}>• {title}</li>
                ))}
              </ul>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => {
            setShowEmptyChaptersAlert(false);
            setPendingExportFormat(null);
          }}>
            Cancel Export
          </AlertDialogCancel>
          <AlertDialogAction onClick={() => {
            setShowEmptyChaptersAlert(false);
            if (pendingExportFormat) {
              performExport(pendingExportFormat);
              setPendingExportFormat(null);
            }
          }}>
            Export Anyway
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>
  );
}