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

                {/* Step 1 content will go here */}
                <p className="text-muted-foreground text-center">Step 1: Book Details Form - Coming next</p>
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
                <p className="text-muted-foreground text-center">Step 2: Outline Generation - Coming next</p>
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
              onClick={() => toast.info('Next step implementation')}
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
