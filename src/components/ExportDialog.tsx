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

        <div className="overflow-y-auto flex-1 space-y-5 lg:space-y-6">
          {/* Project stats */}
          <div className="grid grid-cols-3 gap-2 lg:gap-4">
            <div className="text-center p-3 lg:p-4 rounded-xl neomorph-inset">
              <div className="text-lg lg:text-2xl font-bold text-primary">{project.chapters.length}</div>
              <div className="text-xs lg:text-sm text-muted-foreground">Chapters</div>
            </div>
            <div className="text-center p-3 lg:p-4 rounded-xl neomorph-inset">
              <div className="text-lg lg:text-2xl font-bold text-accent">{getWordCount().toLocaleString()}</div>
              <div className="text-xs lg:text-sm text-muted-foreground">Words</div>
            </div>
            <div className="text-center p-3 lg:p-4 rounded-xl neomorph-inset">
              <div className="text-lg lg:text-2xl font-bold text-secondary-foreground">~{Math.ceil(getWordCount() / 250)}</div>
              <div className="text-xs lg:text-sm text-muted-foreground">Pages</div>
            </div>
          </div>

          {/* Export Customization Options */}
          <Card className="neomorph-flat border-0">
            <CardContent className="p-4 lg:p-6 space-y-5 lg:space-y-6">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg neomorph-inset">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-base lg:text-lg font-semibold">Export Settings</h3>
              </div>
              
              {/* Content Includes Section */}
              <div className="space-y-4">
                <div className="text-xs lg:text-sm font-medium text-muted-foreground uppercase tracking-wide">What to Include</div>
                
                <div className="space-y-4">
                  <div className="p-3 lg:p-4 rounded-xl neomorph-inset bg-background/50">
                    <div className="flex items-start space-x-3">
                      <Checkbox 
                        id="toc" 
                        checked={includeTOC}
                        onCheckedChange={(checked) => setIncludeTOC(checked as boolean)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label htmlFor="toc" className="cursor-pointer font-medium text-sm lg:text-base block">
                          Table of Contents
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          Auto-generated list with clickable chapter links
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 lg:p-4 rounded-xl neomorph-inset bg-background/50">
                    <div className="flex items-start space-x-3">
                      <Checkbox 
                        id="copyright" 
                        checked={includeCopyright}
                        onCheckedChange={(checked) => setIncludeCopyright(checked as boolean)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label htmlFor="copyright" className="cursor-pointer font-medium text-sm lg:text-base block">
                          Copyright Page
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          Legal protection notice with your name and copyright year
                        </p>
                      </div>
                    </div>

                    {/* Copyright Position (only show if copyright is enabled) */}
                    {includeCopyright && (
                      <div className="mt-4 pt-4 border-t border-border/50">
                        <Label className="text-xs lg:text-sm font-medium block mb-3">Copyright Placement</Label>
                        <RadioGroup 
                          value={copyrightPosition} 
                          onValueChange={(v) => setCopyrightPosition(v as typeof copyrightPosition)}
                          className="space-y-2.5"
                        >
                          <div className="flex items-center space-x-2.5">
                            <RadioGroupItem value="end" id="copyright-end" />
                            <Label htmlFor="copyright-end" className="cursor-pointer text-xs lg:text-sm font-normal">
                              End of book (recommended)
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2.5">
                            <RadioGroupItem value="beginning" id="copyright-beginning" />
                            <Label htmlFor="copyright-beginning" className="cursor-pointer text-xs lg:text-sm font-normal">
                              Beginning (after cover)
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Formatting Section */}
              <div className="space-y-4 pt-2">
                <div className="text-xs lg:text-sm font-medium text-muted-foreground uppercase tracking-wide">Formatting Style</div>
                
                <div className="p-3 lg:p-4 rounded-xl neomorph-inset bg-background/50">
                  <Label className="text-sm lg:text-base font-medium block mb-3">Chapter Numbering</Label>
                  <RadioGroup 
                    value={chapterNumberStyle} 
                    onValueChange={(v) => setChapterNumberStyle(v as typeof chapterNumberStyle)}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-3 p-2.5 rounded-lg hover:bg-accent/30 transition-colors">
                      <RadioGroupItem value="numeric" id="numbering-numeric" />
                      <Label htmlFor="numbering-numeric" className="cursor-pointer flex-1">
                        <div className="font-medium text-sm">Numeric</div>
                        <div className="text-xs text-muted-foreground">Chapter 1, Chapter 2, Chapter 3...</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-2.5 rounded-lg hover:bg-accent/30 transition-colors">
                      <RadioGroupItem value="roman" id="numbering-roman" />
                      <Label htmlFor="numbering-roman" className="cursor-pointer flex-1">
                        <div className="font-medium text-sm">Roman Numerals</div>
                        <div className="text-xs text-muted-foreground">Chapter I, Chapter II, Chapter III...</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-2.5 rounded-lg hover:bg-accent/30 transition-colors">
                      <RadioGroupItem value="none" id="numbering-none" />
                      <Label htmlFor="numbering-none" className="cursor-pointer flex-1">
                        <div className="font-medium text-sm">No Numbers</div>
                        <div className="text-xs text-muted-foreground">Show chapter titles only</div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export Format Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg neomorph-inset">
                <Download size={16} className="text-primary" />
              </div>
              <h3 className="text-base lg:text-lg font-semibold">Choose Export Format</h3>
            </div>
            
            <div className="space-y-3">
              {exportOptions.map((option, index) => {
                const Icon = option.icon;
                const isExporting = exportingFormat === option.format;
                
                return (
                  <motion.div
                    key={option.format}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="neomorph-flat border-0 hover:neomorph-raised transition-all duration-300 overflow-hidden">
                      <CardContent className="p-4 lg:p-5">
                        <div className="flex flex-col gap-4">
                          {/* Header with icon, title, and button */}
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="p-2.5 rounded-xl neomorph-inset flex-shrink-0">
                                <Icon size={28} className="text-primary" />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <h3 className="text-base lg:text-lg font-semibold">{option.title}</h3>
                                  {option.recommended && (
                                    <Badge variant="secondary" className="gap-1 neomorph-flat border-0 text-xs">
                                      <Star size={12} weight="fill" />
                                      Best
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs lg:text-sm text-muted-foreground">
                                  {option.description}
                                </p>
                              </div>
                            </div>
                            
                            <Button
                              onClick={() => handleExport(option.format)}
                              disabled={isExporting}
                              className="neomorph-button border-0 gap-2 flex-shrink-0"
                              size="lg"
                            >
                              {isExporting ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                                  <span className="hidden sm:inline">Exporting...</span>
                                </>
                              ) : (
                                <>
                                  <Download size={16} />
                                  <span className="hidden sm:inline">Export</span>
                                  <span className="sm:hidden">{option.format.toUpperCase()}</span>
                                </>
                              )}
                            </Button>
                          </div>
                          
                          {/* Features - Only show on larger screens to reduce clutter */}
                          <div className="hidden lg:flex flex-wrap gap-1.5 pt-2 border-t border-border/30">
                            {option.features.map((feature) => (
                              <Badge 
                                key={feature} 
                                variant="outline" 
                                className="text-xs neomorph-inset border-0 font-normal"
                              >
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
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