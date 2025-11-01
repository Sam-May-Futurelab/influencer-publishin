import { useState, useEffect, useRef, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen, MagicWand, FileArrowDown, CheckCircle, Sparkle } from '@phosphor-icons/react';
import { Badge } from '@/components/ui/badge';
import { UserProfile } from '@/lib/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { analytics } from '@/lib/firebase';
import { logEvent } from 'firebase/analytics';

interface OnboardingProps {
  open: boolean;
  onComplete: () => void;
  onSkip: () => void;
  onShowTemplates?: () => void;
  onShowAIGenerate?: () => void;
  onStartProject?: () => Promise<void> | void;
  subscriptionStatus?: UserProfile['subscriptionStatus'];
}

type OnboardingAction = 'templates' | 'start-project' | 'ai-generate';

export function Onboarding({ open, onComplete, onSkip, onShowTemplates, onShowAIGenerate, onStartProject, subscriptionStatus }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const closingReasonRef = useRef<'skip' | 'complete' | null>(null);
  const stepTitles = useMemo(() => [
    'Welcome to Inkfluence AI',
    'Create Your First Project',
    'Using AI to Write'
  ], []);

  const subscriptionTier = subscriptionStatus ?? 'free';
  const isAiGeneratorPremium = subscriptionTier !== 'creator' && subscriptionTier !== 'premium';

  const logOnboardingEvent = (eventName: string, params?: Record<string, any>) => {
    if (!analytics) return;
    logEvent(analytics, eventName, params);
  };

  const handleStepAction = async (action: OnboardingAction) => {
    logOnboardingEvent('onboarding_action_selected', {
      action,
      step_index: currentStep,
      step_title: stepTitles[currentStep] ?? 'unknown'
    });

    if (action === 'templates' && onShowTemplates) {
      onShowTemplates();
      closingReasonRef.current = 'complete';
      logOnboardingEvent('onboarding_completed', { completion_type: action });
      onComplete();
    } else if (action === 'ai-generate' && onShowAIGenerate) {
      onShowAIGenerate();
      closingReasonRef.current = 'complete';
      logOnboardingEvent('onboarding_completed', { completion_type: action });
      onComplete();
    } else if (action === 'start-project' && onStartProject) {
      await Promise.resolve(onStartProject());
      closingReasonRef.current = 'complete';
      logOnboardingEvent('onboarding_completed', { completion_type: action });
      onComplete();
    }
  };

  // Create steps with action handlers
  const steps = [
    {
      title: stepTitles[0],
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
      title: stepTitles[1],
      description: "Three ways to get started",
      icon: BookOpen,
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => void handleStepAction('templates')}
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

            <button
              type="button"
              onClick={() => void handleStepAction('start-project')}
              disabled={!onStartProject}
              className={`w-full flex items-start gap-4 p-4 rounded-lg border bg-card transition-all text-left ${
                onStartProject
                  ? 'hover:bg-accent/10 hover:border-primary/30 cursor-pointer'
                  : 'opacity-60 cursor-not-allowed'
              }`}
            >
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold text-sm">2</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm mb-1">Start From Scratch</p>
                <p className="text-xs text-muted-foreground">
                  Create a blank project and begin writing your first chapter instantly
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => void handleStepAction('ai-generate')}
              className="w-full flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/10 hover:border-primary/30 transition-all cursor-pointer text-left"
            >
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold text-sm">3</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-sm">AI Book Generator ✨</p>
                  {isAiGeneratorPremium && (
                    <Badge className="text-[10px] uppercase tracking-wide bg-gradient-to-r from-purple-500 to-primary text-white border-0">Premium Feature</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Let AI create a complete book outline and generate all chapters automatically
                </p>
                {isAiGeneratorPremium && (
                  <p className="mt-2 text-[11px] text-muted-foreground/80">
                    Requires a Creator or Premium plan. Upgrade to unlock full-book generation.
                  </p>
                )}
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
      title: stepTitles[2],
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
      logOnboardingEvent('onboarding_next_clicked', {
        step_index: currentStep,
        step_title: stepTitles[currentStep]
      });
      setCurrentStep(prev => prev + 1);
    } else {
      closingReasonRef.current = 'complete';
      logOnboardingEvent('onboarding_completed', { completion_type: 'steps' });
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      logOnboardingEvent('onboarding_back_clicked', {
        step_index: currentStep,
        step_title: stepTitles[currentStep]
      });
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    closingReasonRef.current = 'skip';
    logOnboardingEvent('onboarding_skipped', {
      step_index: currentStep,
      step_title: stepTitles[currentStep]
    });
    onSkip();
  };

  const handleDialogOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      if (closingReasonRef.current === null) {
        logOnboardingEvent('onboarding_skipped', {
          step_index: currentStep,
          step_title: stepTitles[currentStep],
          reason: 'dismiss'
        });
        onSkip();
      }
      closingReasonRef.current = null;
    }
  };

  const currentStepData = steps[currentStep];
  useEffect(() => {
    if (open) {
      logOnboardingEvent('onboarding_step_viewed', {
        step_index: currentStep,
        step_title: stepTitles[currentStep] ?? 'unknown'
      });
    } else {
      setCurrentStep(0);
    }
  }, [open, currentStep]);

  useEffect(() => {
    if (open) {
      logOnboardingEvent('onboarding_opened');
    }
  }, [open]);
  const Icon = currentStepData.icon;
  const isLastStep = currentStep === steps.length - 1;

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
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
            onClick={handleSkip}
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
