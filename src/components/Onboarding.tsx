import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, BookOpen, MagicWand, FileArrowDown, CheckCircle, Sparkle } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';

interface OnboardingProps {
  open: boolean;
  onComplete: () => void;
  onSkip: () => void;
  onShowTemplates?: () => void;
  onShowAIGenerate?: () => void;
}

export function Onboarding({ open, onComplete, onSkip, onShowTemplates, onShowAIGenerate }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleStepAction = (action: 'templates' | 'ai-generate') => {
    if (action === 'templates' && onShowTemplates) {
      onShowTemplates();
      onComplete(); // Close onboarding after action
    } else if (action === 'ai-generate' && onShowAIGenerate) {
      onShowAIGenerate();
      onComplete(); // Close onboarding after action
    }
  };

  // Create steps with action handlers
  const steps = [
    {
      title: "Welcome to Inkfluence AI",
      description: "AI-powered writing for professional ebooks and content",
      icon: Sparkle,
      content: (
        <div className="space-y-6">
          <div className="grid gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MagicWand size={20} className="text-primary" weight="duotone" />
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">AI Content Generation</h4>
                <p className="text-sm text-muted-foreground">Generate chapters, outlines, and content suggestions instantly</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <BookOpen size={20} className="text-primary" weight="duotone" />
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">Organized Writing</h4>
                <p className="text-sm text-muted-foreground">Chapters, drag-and-drop reordering, and auto-save</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FileArrowDown size={20} className="text-primary" weight="duotone" />
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">Professional Export</h4>
                <p className="text-sm text-muted-foreground">Export to PDF, EPUB, and DOCX with custom branding</p>
              </div>
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg border">
            <p className="text-sm font-medium mb-1">Free Plan Includes:</p>
            <p className="text-xs text-muted-foreground">4 pages per ebook • 3 AI generations per day • Basic templates</p>
          </div>
        </div>
      )
    },
    {
      title: "Create Your First Project",
      description: "Three ways to get started",
      icon: BookOpen,
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <button
              onClick={() => handleStepAction('templates')}
              className="w-full flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/10 hover:border-primary/30 transition-all cursor-pointer text-left"
            >
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold text-sm">1</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm mb-1">Use a Template</p>
                <p className="text-xs text-muted-foreground">
                  Pre-built structures for common ebook types (how-to guides, lead magnets, courses)
                </p>
              </div>
            </button>

            <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold text-sm">2</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm mb-1">Start From Scratch</p>
                <p className="text-xs text-muted-foreground">
                  Click "New Project" on the dashboard and build your ebook chapter by chapter
                </p>
              </div>
            </div>

            <button
              onClick={() => handleStepAction('ai-generate')}
              className="w-full flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/10 hover:border-primary/30 transition-all cursor-pointer text-left"
            >
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold text-sm">3</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm mb-1">AI-Assisted Setup</p>
                <p className="text-xs text-muted-foreground">
                  Describe your topic and let AI generate a complete chapter outline
                </p>
              </div>
            </button>
          </div>

          <div className="bg-muted/50 p-3 rounded-lg border text-center">
            <p className="text-xs text-muted-foreground">
              💡 Tip: Templates are the fastest way to get started
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Using AI to Write",
      description: "Get AI help whenever you need it",
      icon: MagicWand,
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-primary font-bold text-sm">1</span>
              </div>
              <div className="flex-1">
                <p className="text-sm">Click the <strong>AI button (✨)</strong> in any chapter</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-primary font-bold text-sm">2</span>
              </div>
              <div className="flex-1">
                <p className="text-sm">Describe what you need (outline, intro, etc.)</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-primary font-bold text-sm">3</span>
              </div>
              <div className="flex-1">
                <p className="text-sm">Review and insert AI suggestions with one click</p>
              </div>
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg border">
            <p className="text-sm font-medium mb-2">AI Usage Limits:</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p><strong>Free:</strong> 3 generations per day</p>
              <p><strong>Creator:</strong> 50 generations per month</p>
              <p><strong>Pro:</strong> Unlimited generations</p>
            </div>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;
  const isLastStep = currentStep === steps.length - 1;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onSkip()}>
      <DialogContent className="max-w-xl border shadow-lg p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon size={22} className="text-primary" weight="duotone" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-lg font-semibold">{currentStepData.title}</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {currentStepData.description}
              </DialogDescription>
            </div>
          </div>
          
          {/* Progress Indicator */}
          <div className="flex gap-2 mt-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  index <= currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </DialogHeader>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="p-6"
          >
            {currentStepData.content}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between p-6 pt-4 border-t bg-muted/30">
          <Button
            variant="ghost"
            onClick={onSkip}
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            Skip Tutorial
          </Button>
          
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={handleBack}
                size="sm"
              >
                Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              className="gap-2"
              size="sm"
            >
              {isLastStep ? (
                <>
                  <CheckCircle size={16} weight="fill" />
                  Get Started
                </>
              ) : (
                <>
                  Next
                  <ArrowRight size={16} />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
