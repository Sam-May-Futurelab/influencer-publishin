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
}

const steps = [
  {
    title: "Welcome to Inkfluence AI! 🎉",
    description: "Your AI-powered writing assistant for creating amazing ebooks, guides, and content.",
    icon: Sparkle,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Inkfluence AI helps you write faster and better with:
        </p>
        <ul className="space-y-2 text-muted-foreground">
          <li className="flex items-center gap-2">
            <CheckCircle size={20} className="text-green-500" weight="fill" />
            <span>AI-powered content generation</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle size={20} className="text-green-500" weight="fill" />
            <span>Beautiful chapter organization</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle size={20} className="text-green-500" weight="fill" />
            <span>Export to PDF with custom branding</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle size={20} className="text-green-500" weight="fill" />
            <span>Writing analytics and goals</span>
          </li>
        </ul>
      </div>
    )
  },
  {
    title: "Create Your First Project",
    description: "Start by creating a project for your ebook or guide",
    icon: BookOpen,
    content: (
      <div className="space-y-4">
        <img 
          src="/images/InkfluenceAILogo.png" 
          alt="Create Project" 
          className="w-full rounded-lg neomorph-flat border-0"
        />
        <p className="text-muted-foreground">
          Click <strong>"New Project"</strong> to create your first ebook. Add a title, 
          description, and start adding chapters.
        </p>
        <div className="bg-primary/10 p-3 rounded-lg">
          <p className="text-sm text-primary">
            💡 <strong>Pro tip:</strong> Free users get 4 pages to start. Upgrade to Premium for unlimited!
          </p>
        </div>
      </div>
    )
  },
  {
    title: "AI Writing Assistant",
    description: "Let AI help you write amazing content",
    icon: MagicWand,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Our AI Assistant can generate content for any topic:
        </p>
        <ol className="space-y-3 text-muted-foreground list-decimal list-inside">
          <li>Enter keywords or topics for your chapter</li>
          <li>Choose your preferred tone and length</li>
          <li>Click <strong>"Generate"</strong> to create suggestions</li>
          <li>Insert content into your chapter with one click</li>
        </ol>
        <div className="bg-primary/10 p-3 rounded-lg">
          <p className="text-sm text-primary">
            🎯 <strong>Free tier:</strong> 3 AI generations per day<br />
            👑 <strong>Premium:</strong> 50 generations per day
          </p>
        </div>
      </div>
    )
  },
  {
    title: "Export & Share",
    description: "Export your finished work as a beautiful PDF",
    icon: FileArrowDown,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          When you're ready to share your ebook:
        </p>
        <ul className="space-y-2 text-muted-foreground">
          <li className="flex items-start gap-2">
            <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" weight="fill" />
            <span>Click <strong>"Export to PDF"</strong> from your project</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" weight="fill" />
            <span>Customize colors, fonts, and branding</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" weight="fill" />
            <span>Download and share your professional ebook</span>
          </li>
        </ul>
        <div className="bg-green-500/10 p-3 rounded-lg">
          <p className="text-sm text-green-600">
            ✨ You're all set! Start creating amazing content now.
          </p>
        </div>
      </div>
    )
  }
];

export function Onboarding({ open, onComplete, onSkip }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);

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
      <DialogContent className="max-w-2xl neomorph-flat border-0 p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon size={24} className="text-primary" weight="duotone" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl">{currentStepData.title}</DialogTitle>
              <DialogDescription className="text-sm">
                {currentStepData.description}
              </DialogDescription>
            </div>
          </div>
          
          {/* Progress Indicator */}
          <div className="flex gap-1.5 mt-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
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
            className="px-6 py-4"
          >
            <Card className="neomorph-inset border-0 p-6">
              {currentStepData.content}
            </Card>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between p-6 pt-4 bg-muted/30">
          <Button
            variant="ghost"
            onClick={onSkip}
            className="text-muted-foreground hover:text-foreground"
          >
            Skip Tutorial
          </Button>
          
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={handleBack}
                className="neomorph-button border-0"
              >
                Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              className="gap-2 neomorph-button border-0"
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
