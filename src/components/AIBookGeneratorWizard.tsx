import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkle, ArrowLeft, ArrowRight, Check } from '@phosphor-icons/react';
import { UserProfile } from '@/lib/auth';
import { EbookProject } from '@/lib/types';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

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
      if (bookData.description.length < 50) {
        toast.error('Please provide a more detailed description (at least 50 characters)');
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
    else {
      // Placeholder for other steps
      toast.info('Next step implementation');
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

  const stepTitles = {
    1: 'Book Details',
    2: 'Generate Outline',
    3: 'Review & Edit',
    4: 'Generate Chapters'
  };

  const progressPercent = (step / 4) * 100;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-600 to-primary shadow-lg">
              <Sparkle size={24} className="text-white" weight="fill" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl">AI Book Generator</DialogTitle>
              <DialogDescription>
                Create a complete {numChapters}-chapter ebook with AI assistance
              </DialogDescription>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Step {step} of 4: {stepTitles[step]}</span>
              <span>{Math.round(progressPercent)}% Complete</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>

          {/* Step Indicators */}
          <div className="flex items-center justify-between mt-4 px-4">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all
                  ${step > s ? 'bg-primary text-white' : step === s ? 'bg-primary text-white ring-4 ring-primary/20' : 'bg-muted text-muted-foreground'}
                `}>
                  {step > s ? <Check size={20} weight="bold" /> : s}
                </div>
                {s < 4 && (
                  <div className={`w-16 md:w-24 h-1 mx-2 rounded ${step > s ? 'bg-primary' : 'bg-muted'}`} />
                )}
              </div>
            ))}
          </div>
        </DialogHeader>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h3 className="text-xl font-semibold mb-2">Let's start with the basics</h3>
                  <p className="text-muted-foreground">Tell us about the book you want to create</p>
                </div>

                <div className="max-w-2xl mx-auto space-y-6">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">
                      Book Title <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="e.g., The Complete Guide to Social Media Marketing"
                      value={bookData.title}
                      onChange={(e) => setBookData({ ...bookData, title: e.target.value })}
                      className="text-lg"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">
                      Book Description <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Describe what your book will cover, who it's for, and what readers will learn..."
                      value={bookData.description}
                      onChange={(e) => setBookData({ ...bookData, description: e.target.value })}
                      rows={5}
                      className="resize-none"
                    />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {bookData.description.length < 100 && bookData.description.length > 0 && (
                          <span className="text-orange-500">At least 100 characters recommended</span>
                        )}
                        {bookData.description.length >= 100 && bookData.description.length < 500 && (
                          <span className="text-green-500">Good length!</span>
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
                  <div className="space-y-2">
                    <Label htmlFor="genre">Genre (Optional)</Label>
                    <Select value={bookData.genre} onValueChange={(value) => setBookData({ ...bookData, genre: value })}>
                      <SelectTrigger id="genre">
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
                  <div className="space-y-2">
                    <Label htmlFor="targetAudience">Target Audience (Optional)</Label>
                    <Input
                      id="targetAudience"
                      placeholder="e.g., Small business owners, Beginners, Professionals..."
                      value={bookData.targetAudience}
                      onChange={(e) => setBookData({ ...bookData, targetAudience: e.target.value })}
                    />
                    <p className="text-sm text-muted-foreground">
                      Who is this book for? This helps tailor the content and tone.
                    </p>
                  </div>

                  {/* Number of Chapters */}
                  <div className="space-y-3">
                    <Label>Number of Chapters</Label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="6"
                        max="15"
                        value={numChapters}
                        onChange={(e) => setNumChapters(parseInt(e.target.value))}
                        className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                      <Badge variant="secondary" className="text-base font-semibold min-w-[3rem] justify-center">
                        {numChapters}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Recommended: 8-12 chapters for most ebooks
                    </p>
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

                    {/* Number of Chapters Slider */}
                    <div className="space-y-3">
                      <Label>Number of Chapters</Label>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min="6"
                          max="15"
                          value={numChapters}
                          onChange={(e) => setNumChapters(parseInt(e.target.value))}
                          className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                          disabled={isGeneratingOutline}
                        />
                        <Badge variant="secondary" className="text-base font-semibold min-w-[3rem] justify-center">
                          {numChapters}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Adjust the number of chapters before generating
                      </p>
                    </div>

                    {/* Generate Button */}
                    <Button
                      onClick={generateOutline}
                      disabled={isGeneratingOutline}
                      size="lg"
                      className="w-full bg-gradient-to-r from-purple-600 to-primary hover:from-purple-700 hover:to-primary/90"
                    >
                      {isGeneratingOutline ? (
                        <>
                          <span className="animate-spin mr-2">⚡</span>
                          Generating Outline...
                        </>
                      ) : (
                        <>
                          <Sparkle size={20} weight="fill" className="mr-2" />
                          Generate {numChapters}-Chapter Outline
                        </>
                      )}
                    </Button>
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
                <p className="text-muted-foreground text-center">Step 3: Review & Edit - Coming next</p>
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
                <p className="text-muted-foreground text-center">Step 4: Generate Book - Coming next</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer with Navigation */}
        <div className="border-t p-6 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={step === 1 ? handleClose : handleBack}
            disabled={isGeneratingOutline || isGeneratingBook}
          >
            {step === 1 ? 'Cancel' : (
              <>
                <ArrowLeft size={16} />
                Back
              </>
            )}
          </Button>

          <div className="flex gap-3">
            <Button
              onClick={handleContinue}
              disabled={isGeneratingOutline || isGeneratingBook}
              className="bg-gradient-to-r from-purple-600 to-primary hover:from-purple-700 hover:to-primary/90"
            >
              {step === 4 ? 'Generate Book' : 'Continue'}
              <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
