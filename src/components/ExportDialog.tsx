import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FilePdf, FileDoc, BookOpen, Download, Star, Check } from '@phosphor-icons/react';
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
  const { userProfile } = useAuth();
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('pdf');
  const [customWatermark, setCustomWatermark] = useState<string>('');
  const [authorName, setAuthorName] = useState<string>('');
  const [authorBio, setAuthorBio] = useState<string>('');
  const [authorWebsite, setAuthorWebsite] = useState<string>('');
  
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
      setSelectedFormat(parsed.defaultExportFormat || 'pdf');
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
    } catch (error) {
      console.error('Export failed:', error);
      toast.error(`Export failed. Please try again.`, { id: 'export' });
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl lg:max-w-4xl max-h-[90vh] neomorph-raised border-0 p-4 lg:p-6 flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl lg:text-2xl font-bold flex items-center gap-2 lg:gap-3">
            <div className="p-2 rounded-xl neomorph-flat">
              <Download size={20} className="lg:hidden text-primary" />
              <Download size={24} className="hidden lg:block text-primary" />
            </div>
            <span className="text-base lg:text-2xl">Export Your Ebook</span>
          </DialogTitle>
          <p className="text-sm lg:text-base text-muted-foreground">
            Choose your preferred format to export "{project.title}"
          </p>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 space-y-4 lg:space-y-6">
          {/* Project stats */}
          <div className="grid grid-cols-3 gap-2 lg:gap-4">
            <div className="text-center p-2 lg:p-4 rounded-xl neomorph-inset">
              <div className="text-lg lg:text-2xl font-bold text-primary">{project.chapters.length}</div>
              <div className="text-xs lg:text-sm text-muted-foreground">Chapters</div>
            </div>
            <div className="text-center p-2 lg:p-4 rounded-xl neomorph-inset">
              <div className="text-lg lg:text-2xl font-bold text-accent">{getWordCount().toLocaleString()}</div>
              <div className="text-xs lg:text-sm text-muted-foreground">Words</div>
            </div>
            <div className="text-center p-2 lg:p-4 rounded-xl neomorph-inset">
              <div className="text-lg lg:text-2xl font-bold text-secondary-foreground">~{Math.ceil(getWordCount() / 250)}</div>
              <div className="text-xs lg:text-sm text-muted-foreground">Pages</div>
            </div>
          </div>

          {/* Export Customization Options */}
          <Card className="neomorph-inset border-0">
            <CardContent className="p-3 lg:p-6 space-y-4 lg:space-y-6">
              <h3 className="text-base lg:text-lg font-semibold">Customize Export</h3>
              
              {/* Content Options */}
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Checkbox 
                    id="toc" 
                    checked={includeTOC}
                    onCheckedChange={(checked) => setIncludeTOC(checked as boolean)}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <Label htmlFor="toc" className="cursor-pointer font-medium text-sm lg:text-base">
                      Include Table of Contents
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Auto-generated with clickable chapter links
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox 
                    id="copyright" 
                    checked={includeCopyright}
                    onCheckedChange={(checked) => setIncludeCopyright(checked as boolean)}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <Label htmlFor="copyright" className="cursor-pointer font-medium text-sm lg:text-base">
                      Include Copyright Page
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Standard legal protection notice
                    </p>
                  </div>
                </div>

                {/* Copyright Position (only show if copyright is enabled) */}
                {includeCopyright && (
                  <div className="ml-6 lg:ml-8 space-y-2">
                    <Label className="text-xs lg:text-sm font-medium">Position</Label>
                    <RadioGroup 
                      value={copyrightPosition} 
                      onValueChange={(v) => setCopyrightPosition(v as typeof copyrightPosition)}
                      className="space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="beginning" id="copyright-beginning" />
                        <Label htmlFor="copyright-beginning" className="cursor-pointer text-xs lg:text-sm font-normal">
                          At the beginning (after cover)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="end" id="copyright-end" />
                        <Label htmlFor="copyright-end" className="cursor-pointer text-xs lg:text-sm font-normal">
                          At the end (after content)
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}
              </div>

              {/* Chapter Numbering */}
              <div className="space-y-2">
                <Label className="text-sm lg:text-base font-medium">Chapter Numbering</Label>
                <Select 
                  value={chapterNumberStyle} 
                  onValueChange={(v) => setChapterNumberStyle(v as typeof chapterNumberStyle)}
                >
                  <SelectTrigger className="neomorph-flat border-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="numeric">
                      <div className="flex flex-col items-start">
                        <span className="font-medium text-sm">Numeric</span>
                        <span className="text-xs text-muted-foreground">Chapter 1, Chapter 2, Chapter 3...</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="roman">
                      <div className="flex flex-col items-start">
                        <span className="font-medium text-sm">Roman Numerals</span>
                        <span className="text-xs text-muted-foreground">Chapter I, Chapter II, Chapter III...</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="none">
                      <div className="flex flex-col items-start">
                        <span className="font-medium text-sm">No Numbers</span>
                        <span className="text-xs text-muted-foreground">Just chapter titles</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Export options */}
          <div className="space-y-3 lg:space-y-4">
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
                  <Card className="neomorph-flat border-0 hover:neomorph-raised transition-all duration-300">
                    <CardContent className="p-3 lg:p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 lg:gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="p-2 lg:p-3 rounded-xl neomorph-inset">
                            <Icon size={24} className="lg:hidden text-primary" />
                            <Icon size={32} className="hidden lg:block text-primary" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col lg:flex-row lg:items-center gap-1 lg:gap-3 mb-2">
                              <h3 className="text-base lg:text-xl font-semibold">{option.title}</h3>
                              {option.recommended && (
                                <Badge variant="secondary" className="gap-1 neomorph-flat border-0 self-start lg:self-auto">
                                  <Star size={10} className="lg:hidden" />
                                  <Star size={12} className="hidden lg:block" />
                                  <span className="text-xs">Recommended</span>
                                </Badge>
                              )}
                              {selectedFormat === option.format && (
                                <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary border-0 self-start lg:self-auto">
                                  <Check size={10} className="lg:hidden" />
                                  <Check size={12} className="hidden lg:block" />
                                  <span className="text-xs">Default</span>
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-xs lg:text-sm text-muted-foreground mb-3 lg:mb-4">
                              {option.description}
                            </p>
                            
                            <div className="flex flex-wrap gap-1 lg:gap-2">
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
                          className="neomorph-button border-0 gap-2 w-full lg:w-auto min-h-[44px]"
                          size="lg"
                        >
                          {isExporting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                              <span className="text-sm lg:text-base">Exporting...</span>
                            </>
                          ) : (
                            <>
                              <Download size={16} />
                              <span className="text-sm lg:text-base">Export {option.format.toUpperCase()}</span>
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

          <div className="p-3 lg:p-4 rounded-xl neomorph-inset bg-muted/30">
            <p className="text-xs lg:text-sm text-muted-foreground text-center">
              💡 <strong>Tip:</strong> PDF is recommended for final distribution, EPUB for e-readers, and DOCX for further editing.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}