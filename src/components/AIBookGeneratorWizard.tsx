import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Sparkle, ArrowLeft, ArrowRight, Check, CaretDown } from '@phosphor-icons/react';
import { UserProfile } from '@/lib/auth';
import { EbookProject } from '@/lib/types';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { AILoading, useLoadingMessages } from '@/components/ui/ai-loading';

interface AIBookGeneratorWizardProps {
  open: boolean;
  onClose: () => void;
  onComplete: (project: EbookProject) => void;
  userProfile: UserProfile;
}

interface BookData {
  title: string;
  description: string;
  genre: string;
  targetAudience: string;
}

interface ChapterOutline {
  order: number;
  title: string;
  description: string;
}

export function AIBookGeneratorWizard({ 
  open, 
  onClose, 
  onComplete,
  userProfile 
}: AIBookGeneratorWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [bookData, setBookData] = useState<BookData>({
    title: '',
    description: '',
    genre: '',
    targetAudience: ''
  });
  const [numChapters, setNumChapters] = useState(10);
  const [outline, setOutline] = useState<ChapterOutline[]>([]);
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);
  const [isGeneratingBook, setIsGeneratingBook] = useState(false);
  const [generationProgress, setGenerationProgress] = useState({ current: 0, total: 0 });
  const [completedChapters, setCompletedChapters] = useState<Array<{ title: string; content: string; order: number }>>([]);
  const [expandedChapterId, setExpandedChapterId] = useState<number | null>(null);

  // Loading messages for book generation
  const loadingMessages = [
    'Analyzing your book structure...',
    'Crafting engaging introductions...',
    'Writing comprehensive content...',
    'Adding practical examples...',
    'Polishing the narrative flow...',
    'Creating smooth transitions...',
    'Ensuring consistency...',
    'Almost there...',
  ];

  const currentLoadingMessage = useLoadingMessages(loadingMessages, 3000);

  const handleClose = () => {
    if (isGeneratingOutline || isGeneratingBook) {
      toast.error('Please wait for generation to complete');
      return;
    }
    onClose();
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as 1 | 2 | 3 | 4);
    }
  };

  const handleContinue = () => {
    // Step 1: Validate book details
    if (step === 1) {
      if (!bookData.title.trim()) {
        toast.error('Please enter a book title');
        return;
      }
      if (!bookData.description.trim()) {
        toast.error('Please enter a book description');
        return;
      }
      if (bookData.description.length < 20) {
        toast.error('Please provide a brief description (at least 20 characters)');
        return;
      }
      setStep(2);
    } 
    // Step 2: Generate outline
    else if (step === 2) {
      if (outline.length === 0) {
        toast.error('Please generate an outline first');
        return;
      }
      setStep(3);
    }
    // Step 3: Review outline
    else if (step === 3) {
      // Validate that all chapters have titles
      const emptyChapters = outline.filter(ch => !ch.title.trim());
      if (emptyChapters.length > 0) {
        toast.error('All chapters must have titles');
        return;
      }
      setStep(4);
    }
    // Step 4: Generate book
    else if (step === 4) {
      generateBook();
    }
  };

  const generateOutline = async () => {
    setIsGeneratingOutline(true);
    try {
      const response = await fetch('/api/generate-book-outline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: bookData.title,
          description: bookData.description,
          genre: bookData.genre,
          targetAudience: bookData.targetAudience,
          numChapters,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate outline');
      }

      setOutline(data.outline);
      toast.success(`Generated ${data.outline.length}-chapter outline!`);
    } catch (error) {
      console.error('Error generating outline:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate outline');
    } finally {
      setIsGeneratingOutline(false);
    }
  };

  const updateChapter = (order: number, field: 'title' | 'description', value: string) => {
    setOutline(prev => prev.map(ch => 
      ch.order === order ? { ...ch, [field]: value } : ch
    ));
  };

  const generateBook = async () => {
    setIsGeneratingBook(true);
    setGenerationProgress({ current: 0, total: outline.length });
    setCompletedChapters([]); // Reset completed chapters

    try {
      // Create the project first
      const projectId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newProject: EbookProject = {
        id: projectId,
        title: bookData.title,
        description: bookData.description,
        category: bookData.genre || 'general',
        targetAudience: bookData.targetAudience,
        author: userProfile.displayName || 'Author',
        createdAt: new Date(),
        updatedAt: new Date(),
        chapters: [],
        brandConfig: {
          primaryColor: '#9b87b8',
          secondaryColor: '#b89ed6',
          accentColor: '#d4c4e8',
          fontFamily: 'Inter',
          coverStyle: 'gradient',
        },
      };

      // Generate each chapter
      for (let i = 0; i < outline.length; i++) {
        const chapterOutline = outline[i];
        setGenerationProgress({ current: i + 1, total: outline.length });

        let retries = 0;
        const maxRetries = 3;
        let success = false;

        while (retries < maxRetries && !success) {
          try {
            const response = await fetch('/api/generate-ai-content', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId: userProfile.uid,
                keywords: [`Chapter ${chapterOutline.order}: ${chapterOutline.title}`],
                chapterTitle: chapterOutline.title,
                contentType: 'enhance',
                genre: bookData.genre || 'general',
                tone: 'professional',
                length: 'detailed',
                format: 'narrative',
                context: {
                  bookDescription: bookData.description,
                  targetAudience: bookData.targetAudience,
                },
                prompt: `Write a complete chapter for an ebook titled "${bookData.title}".

Chapter ${chapterOutline.order}: ${chapterOutline.title}
${chapterOutline.description ? `Description: ${chapterOutline.description}` : ''}

Book Context:
${bookData.description}
${bookData.targetAudience ? `Target Audience: ${bookData.targetAudience}` : ''}
${bookData.genre ? `Genre: ${bookData.genre}` : ''}

Write a comprehensive, well-structured chapter (500-750 words) that:
1. Opens with an engaging introduction
2. Covers the topic thoroughly with clear explanations
3. Includes practical examples or actionable insights
4. Flows naturally and maintains reader engagement
5. Concludes with a smooth transition to the next chapter

Write in a professional, engaging tone appropriate for the target audience.`,
              }),
            });

            if (response.status === 429) {
              // Rate limit hit - wait longer and retry
              retries++;
              if (retries < maxRetries) {
                const waitTime = 20000 * retries; // 20s, 40s, 60s
                toast.info(`Rate limit hit. Waiting ${waitTime / 1000}s before retry ${retries}/${maxRetries}...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                continue;
              } else {
                throw new Error(`Rate limit exceeded after ${maxRetries} retries`);
              }
            }

            if (!response.ok) {
              throw new Error(`Failed to generate chapter ${i + 1}`);
            }

            const data = await response.json();
            
            // Add chapter to project
            const newChapter = {
              id: `${projectId}-chapter-${i + 1}`,
              title: chapterOutline.title,
              content: data.content || '',
              order: chapterOutline.order,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            
            newProject.chapters.push(newChapter);
            
            // Add to completed chapters for preview
            setCompletedChapters(prev => [...prev, {
              title: chapterOutline.title,
              content: data.content || '',
              order: chapterOutline.order
            }]);

            success = true;

            // Add 20 second delay between API calls to respect TPM limits
            // gpt-4o-mini has 200k TPM limit, but need to spread requests out
            if (i < outline.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 20000));
            }

          } catch (error) {
            console.error(`Error generating chapter ${i + 1}:`, error);
            
            // Check if it's a rate limit error
            const isRateLimitError = error instanceof Error && error.message.includes('429');
            
            if (isRateLimitError && retries < maxRetries) {
              // Will retry on next loop iteration
              const waitTime = 20000 * retries;
              toast.info(`Rate limit error. Waiting ${waitTime / 1000}s before retry...`);
              await new Promise(resolve => setTimeout(resolve, waitTime));
              retries++;
              continue;
            }
            
            // Final failure after retries
            toast.error(
              isRateLimitError 
                ? `Rate limit reached. Please wait a few minutes and try again.`
                : `Failed to generate chapter ${i + 1}. Continuing...`
            );
            
            // Add placeholder chapter
            newProject.chapters.push({
              id: `${projectId}-chapter-${i + 1}`,
              title: chapterOutline.title,
              content: `# ${chapterOutline.title}\n\n_Chapter generation failed. Please edit and add content manually._`,
              order: chapterOutline.order,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            
            break; // Exit retry loop
          }
        }

        // Delay between chapters (success or failure) - 20 seconds to respect TPM limits
        if (i < outline.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 20000));
        }
      }

      // Update project timestamp
      newProject.updatedAt = new Date();

      // Complete and pass to parent
      toast.success(`Book generated! ${newProject.chapters.length} chapters created.`);
      onComplete(newProject);
      
    } catch (error) {
      console.error('Error generating book:', error);
      toast.error('Failed to generate book. Please try again.');
      setIsGeneratingBook(false);
    }
  };

  const stepTitles = {
    1: 'Book Details',
    2: 'Generate Outline',
    3: 'Review & Edit',
    4: 'Generate Chapters'
  };

  const progressPercent = (step / 4) * 100;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-8 pb-6 border-b bg-gradient-to-br from-background to-muted/20">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-600 via-primary to-purple-600 shadow-xl">
              <Sparkle size={28} className="text-white" weight="fill" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-primary bg-clip-text text-transparent">
                AI Book Generator
              </DialogTitle>
              <DialogDescription className="text-base">
                Create a complete {numChapters}-chapter ebook with AI assistance
              </DialogDescription>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-foreground">Step {step} of 4: {stepTitles[step]}</span>
              <span className="text-primary">{Math.round(progressPercent)}% Complete</span>
            </div>
            <div className="relative">
              <Progress value={progressPercent} className="h-3" />
            </div>
          </div>

          {/* Step Indicators */}
          <div className="flex items-center justify-between mt-6 px-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <motion.div 
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all shadow-lg
                    ${step > s ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white' : step === s ? 'bg-gradient-to-br from-purple-600 to-primary text-white ring-4 ring-primary/30' : 'bg-muted text-muted-foreground'}
                  `}
                  animate={step === s ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {step > s ? <Check size={20} weight="bold" /> : s}
                </motion.div>
                {s < 4 && (
                  <div className={`w-16 md:w-20 lg:w-24 h-1.5 mx-2 rounded-full transition-all ${step > s ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-muted'}`} />
                )}
              </div>
            ))}
          </div>
        </DialogHeader>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 bg-gradient-to-b from-transparent to-muted/10">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center mb-10">
                  <h3 className="text-2xl font-bold mb-3">Let's start with the basics</h3>
                  <p className="text-muted-foreground text-lg">Tell us about the book you want to create</p>
                </div>

                <div className="max-w-3xl mx-auto space-y-8">
                  {/* Title */}
                  <div className="space-y-3">
                    <Label htmlFor="title" className="text-base font-semibold">
                      Book Title <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="e.g., The Complete Guide to Social Media Marketing"
                      value={bookData.title}
                      onChange={(e) => setBookData({ ...bookData, title: e.target.value })}
                      className="text-lg h-12"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-3">
                    <Label htmlFor="description" className="text-base font-semibold">
                      Book Description <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Describe what your book will cover, who it's for, and what readers will learn..."
                      value={bookData.description}
                      onChange={(e) => setBookData({ ...bookData, description: e.target.value })}
                      rows={6}
                      className="resize-none text-base"
                    />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {bookData.description.length < 20 && bookData.description.length > 0 && (
                          <span className="text-orange-500">At least 20 characters needed</span>
                        )}
                        {bookData.description.length >= 20 && bookData.description.length < 100 && (
                          <span className="text-green-500">Good! More detail = better AI results</span>
                        )}
                        {bookData.description.length >= 100 && bookData.description.length < 500 && (
                          <span className="text-green-500">Excellent detail!</span>
                        )}
                        {bookData.description.length >= 500 && (
                          <span className="text-orange-500">Consider keeping it under 500 characters</span>
                        )}
                      </span>
                      <span className={bookData.description.length > 500 ? 'text-orange-500' : 'text-muted-foreground'}>
                        {bookData.description.length} / 500
                      </span>
                    </div>
                  </div>

                  {/* Genre */}
                  <div className="space-y-3">
                    <Label htmlFor="genre" className="text-base font-semibold">Genre (Optional)</Label>
                    <Select value={bookData.genre} onValueChange={(value) => setBookData({ ...bookData, genre: value })}>
                      <SelectTrigger id="genre" className="h-12">
                        <SelectValue placeholder="Select a genre..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="business">Business & Entrepreneurship</SelectItem>
                        <SelectItem value="marketing">Marketing & Sales</SelectItem>
                        <SelectItem value="self-help">Self-Help & Personal Development</SelectItem>
                        <SelectItem value="health">Health & Wellness</SelectItem>
                        <SelectItem value="finance">Finance & Investing</SelectItem>
                        <SelectItem value="technology">Technology & Programming</SelectItem>
                        <SelectItem value="creative">Creative & Arts</SelectItem>
                        <SelectItem value="education">Education & Teaching</SelectItem>
                        <SelectItem value="lifestyle">Lifestyle & Hobbies</SelectItem>
                        <SelectItem value="fiction">Fiction</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Target Audience */}
                  <div className="space-y-3">
                    <Label htmlFor="targetAudience" className="text-base font-semibold">Target Audience (Optional)</Label>
                    <Input
                      id="targetAudience"
                      placeholder="e.g., Small business owners, Beginners, Professionals..."
                      value={bookData.targetAudience}
                      onChange={(e) => setBookData({ ...bookData, targetAudience: e.target.value })}
                      className="h-12"
                    />
                    <p className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary">💡</span>
                      <span>Who is this book for? This helps tailor the content and tone.</span>
                    </p>
                  </div>

                  {/* Number of Chapters - Enhanced Slider */}
                  <div className="space-y-4 p-6 rounded-xl bg-gradient-to-br from-primary/5 to-purple-500/5 border border-primary/10">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">Number of Chapters</Label>
                      <motion.div
                        key={numChapters}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                        className="px-4 py-2 rounded-full bg-primary text-primary-foreground font-bold text-lg shadow-lg"
                      >
                        {numChapters}
                      </motion.div>
                    </div>
                    
                    <div className="relative pt-2 pb-3">
                      {/* Custom slider with gradient track */}
                      <div className="relative">
                        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-3 bg-gradient-to-r from-muted via-primary/20 to-muted rounded-full" />
                        <div 
                          className="absolute top-1/2 -translate-y-1/2 left-0 h-3 bg-gradient-to-r from-primary to-purple-500 rounded-full transition-all duration-300"
                          style={{ width: `${((numChapters - 6) / (15 - 6)) * 100}%` }}
                        />
                        <input
                          type="range"
                          min="6"
                          max="15"
                          value={numChapters}
                          onChange={(e) => setNumChapters(parseInt(e.target.value))}
                          className="relative w-full h-3 bg-transparent appearance-none cursor-pointer z-10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:border-primary [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:transition-transform [&::-moz-range-thumb]:hover:scale-110"
                        />
                      </div>
                      
                      {/* Range markers */}
                      <div className="flex justify-between mt-3 px-1">
                        <span className="text-xs text-muted-foreground font-medium">6</span>
                        <span className="text-xs text-muted-foreground font-medium">10</span>
                        <span className="text-xs text-muted-foreground font-medium">15</span>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2 text-sm">
                      <span className="text-primary mt-0.5">💡</span>
                      <span className="text-muted-foreground">
                        <strong className="text-foreground">Recommended:</strong> 8-12 chapters for most ebooks. Longer books work better for comprehensive guides.
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h3 className="text-xl font-semibold mb-2">Generate Your Book Outline</h3>
                  <p className="text-muted-foreground">AI will create a structured chapter outline for your book</p>
                </div>

                {outline.length === 0 ? (
                  <div className="max-w-2xl mx-auto space-y-6">
                    {isGeneratingOutline ? (
                      <AILoading
                        variant="brain"
                        messages={[
                          "Analyzing your book concept...",
                          "Structuring chapters and sections...",
                          "Creating engaging chapter titles...",
                          "Organizing content flow...",
                          "Finalizing your outline..."
                        ]}
                        funFacts={[
                          "Our AI reads thousands of books to learn structure patterns",
                          "Chapter organization can make or break reader engagement",
                          "A good outline saves hours during the writing process"
                        ]}
                        currentOperation="Generating outline"
                      />
                    ) : (
                      <>
                        {/* Book Summary */}
                        <div className="bg-muted/50 rounded-lg p-6 space-y-3">
                          <h4 className="font-semibold text-lg">{bookData.title}</h4>
                          <p className="text-muted-foreground text-sm">{bookData.description}</p>
                          {bookData.genre && (
                            <div className="flex gap-2 flex-wrap">
                              <Badge variant="secondary">{bookData.genre}</Badge>
                              {bookData.targetAudience && (
                                <Badge variant="outline">{bookData.targetAudience}</Badge>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Number of Chapters Slider - Enhanced */}
                        <div className="space-y-4 p-6 rounded-xl bg-gradient-to-br from-primary/5 to-purple-500/5 border border-primary/10">
                          <div className="flex items-center justify-between">
                            <Label className="text-base font-semibold">Number of Chapters</Label>
                            <motion.div
                              key={numChapters}
                              initial={{ scale: 1.2 }}
                              animate={{ scale: 1 }}
                              className="px-4 py-2 rounded-full bg-primary text-primary-foreground font-bold text-lg shadow-lg"
                            >
                              {numChapters}
                            </motion.div>
                          </div>
                          
                          <div className="relative pt-2 pb-3">
                            {/* Custom slider with gradient track */}
                            <div className="relative">
                              <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-3 bg-gradient-to-r from-muted via-primary/20 to-muted rounded-full" />
                              <div 
                                className="absolute top-1/2 -translate-y-1/2 left-0 h-3 bg-gradient-to-r from-primary to-purple-500 rounded-full transition-all duration-300"
                                style={{ width: `${((numChapters - 6) / (15 - 6)) * 100}%` }}
                              />
                              <input
                                type="range"
                                min="6"
                                max="15"
                                value={numChapters}
                                onChange={(e) => setNumChapters(parseInt(e.target.value))}
                                className="relative w-full h-3 bg-transparent appearance-none cursor-pointer z-10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:border-primary [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:transition-transform [&::-moz-range-thumb]:hover:scale-110"
                                disabled={isGeneratingOutline}
                              />
                            </div>
                            
                            {/* Range markers */}
                            <div className="flex justify-between mt-3 px-1">
                              <span className="text-xs text-muted-foreground font-medium">6</span>
                              <span className="text-xs text-muted-foreground font-medium">10</span>
                              <span className="text-xs text-muted-foreground font-medium">15</span>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-2 text-sm">
                            <span className="text-primary mt-0.5">💡</span>
                            <span className="text-muted-foreground">
                              Adjust the number of chapters before generating your outline
                            </span>
                          </div>
                        </div>

                        {/* Generate Button */}
                        <Button
                          onClick={generateOutline}
                          disabled={isGeneratingOutline}
                          size="lg"
                          className="w-full bg-gradient-to-r from-purple-600 to-primary hover:from-purple-700 hover:to-primary/90"
                        >
                          <Sparkle size={20} weight="fill" className="mr-2" />
                          Generate {numChapters}-Chapter Outline
                        </Button>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="max-w-3xl mx-auto space-y-6">
                    {/* Regenerate Controls */}
                    <div className="flex items-center justify-between bg-muted/50 rounded-lg p-4">
                      <div className="flex items-center gap-4">
                        <Label>Chapters:</Label>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="6"
                            max="15"
                            value={numChapters}
                            onChange={(e) => setNumChapters(parseInt(e.target.value))}
                            className="w-32 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                            disabled={isGeneratingOutline}
                          />
                          <Badge variant="secondary" className="text-base font-semibold min-w-[3rem] justify-center">
                            {numChapters}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        onClick={generateOutline}
                        disabled={isGeneratingOutline}
                        variant="outline"
                        size="sm"
                      >
                        {isGeneratingOutline ? 'Regenerating...' : 'Regenerate'}
                      </Button>
                    </div>

                    {/* Generated Outline */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">Generated Outline</h4>
                        <Badge variant="secondary">{outline.length} Chapters</Badge>
                      </div>
                      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                        {outline.map((chapter) => (
                          <motion.div
                            key={chapter.order}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: chapter.order * 0.05 }}
                            className="bg-background border rounded-lg p-4 space-y-2"
                          >
                            <div className="flex items-start gap-3">
                              <Badge className="mt-0.5">{chapter.order}</Badge>
                              <div className="flex-1 space-y-1">
                                <h5 className="font-semibold">{chapter.title}</h5>
                                <p className="text-sm text-muted-foreground">{chapter.description}</p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h3 className="text-xl font-semibold mb-2">Review & Edit Your Outline</h3>
                  <p className="text-muted-foreground">Customize chapter titles and descriptions before generating</p>
                </div>

                <div className="max-w-3xl mx-auto space-y-4">
                  <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{outline.length} Chapters</Badge>
                      <span className="text-sm text-muted-foreground">Ready to generate</span>
                    </div>
                  </div>

                  {/* Editable Chapters */}
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                    {outline.map((chapter) => (
                      <motion.div
                        key={chapter.order}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: chapter.order * 0.03 }}
                        className="bg-background border rounded-lg p-4 space-y-3"
                      >
                        <div className="flex items-start gap-3">
                          <Badge className="mt-1">{chapter.order}</Badge>
                          <div className="flex-1 space-y-3">
                            <div className="space-y-1.5">
                              <Label htmlFor={`chapter-${chapter.order}-title`} className="text-sm">
                                Chapter Title
                              </Label>
                              <Input
                                id={`chapter-${chapter.order}-title`}
                                value={chapter.title}
                                onChange={(e) => updateChapter(chapter.order, 'title', e.target.value)}
                                placeholder="Enter chapter title..."
                                className="font-semibold"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label htmlFor={`chapter-${chapter.order}-desc`} className="text-sm">
                                Description (Optional)
                              </Label>
                              <Textarea
                                id={`chapter-${chapter.order}-desc`}
                                value={chapter.description}
                                onChange={(e) => updateChapter(chapter.order, 'description', e.target.value)}
                                placeholder="What will this chapter cover..."
                                rows={2}
                                className="resize-none text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="bg-muted/50 rounded-lg p-3 border text-center">
                    <p className="text-sm text-muted-foreground">
                      💡 <strong>Tip:</strong> Better chapter details help AI generate more relevant content
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h3 className="text-xl font-semibold mb-2">
                    {isGeneratingBook ? 'Generating Your Book...' : 'Ready to Generate'}
                  </h3>
                  <p className="text-muted-foreground">
                    {isGeneratingBook 
                      ? `Creating chapter ${generationProgress.current} of ${generationProgress.total}`
                      : `AI will generate ${outline.length} complete chapters`
                    }
                  </p>
                </div>

                <div className="max-w-2xl mx-auto space-y-6">
                  {!isGeneratingBook ? (
                    <>
                      {/* Book Summary */}
                      <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                        <div>
                          <h4 className="font-semibold text-lg mb-2">{bookData.title}</h4>
                          <p className="text-sm text-muted-foreground">{bookData.description}</p>
                        </div>
                        
                        <div className="flex gap-2 flex-wrap">
                          {bookData.genre && <Badge variant="secondary">{bookData.genre}</Badge>}
                          {bookData.targetAudience && <Badge variant="outline">{bookData.targetAudience}</Badge>}
                          <Badge className="bg-primary">{outline.length} Chapters</Badge>
                        </div>
                      </div>

                      {/* What to Expect */}
                      <div className="space-y-3">
                        <h4 className="font-semibold">What happens next:</h4>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2 text-sm">
                            <span className="text-primary mt-0.5">✓</span>
                            <span>AI will generate {outline.length} complete chapters (500-750 words each)</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <span className="text-primary mt-0.5">✓</span>
                            <span>Estimated time: {Math.ceil(outline.length * 0.5)} - {Math.ceil(outline.length * 1)} minutes</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <span className="text-primary mt-0.5">✓</span>
                            <span>Your new project will be created automatically</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <span className="text-primary mt-0.5">✓</span>
                            <span>You can edit, export, and customize everything after generation</span>
                          </li>
                        </ul>
                      </div>

                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                        <p className="text-sm text-primary">
                          <strong>⏳ Please wait:</strong> Generating {outline.length} chapters with 20-second delays between each to respect API limits. Total time: ~{Math.ceil(outline.length * 20 / 60)} minutes. Don't close this window.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Generation Progress with Enhanced AILoading Component */}
                      <div className="relative">
                        <AILoading
                          progress={(generationProgress.current / generationProgress.total) * 100}
                          currentMessage={currentLoadingMessage}
                          variant="book"
                          messages={[
                            'AI is trained on millions of books and articles',
                            'Each chapter takes about 30-60 seconds to generate',
                            'You can edit everything after generation completes',
                            'Your book will be automatically saved',
                          ]}
                        />
                        
                        {/* Enhanced Status Card */}
                        <motion.div 
                          className="mt-6 p-5 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2 border-primary/20 shadow-lg"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                              <Sparkle size={20} weight="fill" className="text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">AI is creating your content</p>
                              <p className="text-xs text-muted-foreground">Chapter {generationProgress.current} of {generationProgress.total}</p>
                            </div>
                          </div>
                          
                          {generationProgress.current > 0 && generationProgress.current <= outline.length && (
                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="pl-2 border-l-4 border-primary"
                            >
                              <p className="text-sm font-medium mb-1">Currently writing:</p>
                              <p className="text-base font-semibold text-primary">
                                {outline[generationProgress.current - 1]?.title}
                              </p>
                            </motion.div>
                          )}
                        </motion.div>
                      </div>

                      {/* Completed Chapters - Enhanced with Animations */}
                      {completedChapters.length > 0 && (
                        <motion.div 
                          className="mt-8 space-y-4"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-2">
                              <motion.div
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
                              >
                                <Check size={20} weight="bold" className="text-green-600 dark:text-green-400" />
                              </motion.div>
                              <h4 className="text-base font-semibold">
                                Completed Chapters
                              </h4>
                            </div>
                            <motion.div
                              key={completedChapters.length}
                              initial={{ scale: 1.3, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                            >
                              <Badge variant="secondary" className="bg-green-500/15 text-green-700 dark:text-green-400 border border-green-500/30 px-3 py-1">
                                {completedChapters.length} / {outline.length}
                              </Badge>
                            </motion.div>
                          </div>
                          
                          {/* Helpful hint */}
                          <motion.div 
                            className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                          >
                            <span className="text-lg">👇</span>
                            <p className="text-sm text-muted-foreground">
                              <strong className="text-foreground">Click any chapter below</strong> to preview the generated content while you wait
                            </p>
                          </motion.div>
                          
                          <Accordion type="single" collapsible className="space-y-3">
                            {completedChapters.map((chapter, index) => (
                              <motion.div
                                key={chapter.order}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                              >
                                <AccordionItem 
                                  value={`chapter-${chapter.order}`}
                                  className="border-2 border-green-500/20 rounded-xl px-5 py-1 bg-gradient-to-br from-card to-green-500/5 shadow-sm hover:shadow-md hover:border-green-500/30 transition-all"
                                >
                                  <AccordionTrigger className="hover:no-underline py-4">
                                    <div className="flex items-center gap-4 text-left w-full">
                                      <motion.div 
                                        className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg"
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        transition={{ type: "spring", stiffness: 400 }}
                                      >
                                        <Check size={20} weight="bold" className="text-white" />
                                      </motion.div>
                                      <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-base mb-1">Chapter {chapter.order}</p>
                                        <p className="text-sm text-muted-foreground line-clamp-1">{chapter.title}</p>
                                      </div>
                                      <Badge variant="outline" className="hidden sm:flex text-xs">
                                        ~{chapter.content.split(' ').length} words
                                      </Badge>
                                    </div>
                                  </AccordionTrigger>
                                  <AccordionContent>
                                    <div className="pt-4 pb-3 text-sm">
                                      <div className="prose prose-sm dark:prose-invert max-w-none max-h-[400px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-muted [&::-webkit-scrollbar-thumb]:bg-primary/30 [&::-webkit-scrollbar-thumb]:rounded-full">
                                        {chapter.content.split('\n\n').map((paragraph, idx) => (
                                          <motion.p 
                                            key={idx} 
                                            className="mb-4 leading-relaxed"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                          >
                                            {paragraph}
                                          </motion.p>
                                        ))}
                                      </div>
                                      <div className="mt-5 pt-4 border-t border-green-500/20 flex items-center justify-between text-xs text-muted-foreground">
                                        <span>Generated with AI • Editable after completion</span>
                                        <span className="font-medium">{chapter.content.split(' ').length} words</span>
                                      </div>
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>
                              </motion.div>
                            ))}
                          </Accordion>
                        </motion.div>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer with Navigation */}
        <div className="border-t bg-gradient-to-br from-background to-muted/20 p-8 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={step === 1 ? handleClose : handleBack}
            disabled={isGeneratingOutline || isGeneratingBook}
            size="lg"
            className="px-6"
          >
            {step === 1 ? 'Cancel' : (
              <>
                <ArrowLeft size={18} className="mr-2" />
                Back
              </>
            )}
          </Button>

          <div className="flex gap-3">
            {/* Only show Continue button if outline exists (Step 2) or for other steps */}
            {(step !== 2 || outline.length > 0) && (
              <Button
                onClick={handleContinue}
                disabled={isGeneratingOutline || isGeneratingBook}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-primary hover:from-purple-700 hover:to-primary/90 px-8 shadow-lg hover:shadow-xl transition-all"
              >
                {step === 4 ? 'Generate Book' : 'Continue'}
                <ArrowRight size={18} className="ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
