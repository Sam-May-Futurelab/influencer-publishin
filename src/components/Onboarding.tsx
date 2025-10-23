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
        <ul className="space-y-3 text-muted-foreground">
          <li className="flex items-start gap-3">
            <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" weight="fill" />
            <div>
              <strong>AI-powered content generation</strong>
              <p className="text-sm text-gray-500 mt-0.5">Get suggestions for any topic in seconds</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" weight="fill" />
            <div>
              <strong>Beautiful chapter organization</strong>
              <p className="text-sm text-gray-500 mt-0.5">Drag & drop to reorder, easy navigation</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" weight="fill" />
            <div>
              <strong>Professional PDF exports</strong>
              <p className="text-sm text-gray-500 mt-0.5">Custom branding, fonts, and colors</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" weight="fill" />
            <div>
              <strong>Writing streak tracking</strong>
              <p className="text-sm text-gray-500 mt-0.5">Stay motivated with daily goals</p>
            </div>
          </li>
        </ul>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 mt-4">
          <p className="text-sm text-purple-900 font-medium">
            💡 Quick Tip: Start with a template or create from scratch - both work great!
          </p>
        </div>
      </div>
    )
  },
  {
    title: "Create Your First Project",
    description: "Let's get you started with your first ebook",
    icon: BookOpen,
    content: (
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-xl border border-purple-100">
          <h4 className="font-semibold text-lg mb-3">Three Ways to Start:</h4>
          
          <div className="space-y-3">
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 font-bold">1</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Use a Template</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Choose from pre-made templates for your niche
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Start From Scratch</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Click "New Project" and build your own
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold">3</span>
                </div>
                <div>
                  <p className="font-medium text-sm">AI-Assisted Setup</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Tell AI your topic, get instant chapter structure
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
          <p className="text-sm">
            <strong>Free Tier:</strong> 4 pages to start<br />
            <strong>Premium:</strong> Unlimited pages & 50 AI generations/day
          </p>
        </div>
      </div>
    )
  },
  {
    title: "AI Writing Assistant",
    description: "Your 24/7 co-author that never gets tired",
    icon: MagicWand,
    content: (
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-4 rounded-xl">
          <p className="font-semibold mb-2">✨ AI Can Help You:</p>
          <ul className="space-y-1 text-sm">
            <li>• Beat writer's block instantly</li>
            <li>• Generate chapter outlines</li>
            <li>• Create engaging introductions</li>
            <li>• Write compelling conclusions</li>
            <li>• Brainstorm ideas</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-sm">How to Use:</h4>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
              <p className="text-sm text-gray-700">Click the AI button (✨) in any chapter</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
              <p className="text-sm text-gray-700">Enter your topic or keywords</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
              <p className="text-sm text-gray-700">Choose content type & tone</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">4</div>
              <p className="text-sm text-gray-700">Insert AI suggestions with one click</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <p className="text-xs">
            <strong>🆓 Free:</strong> 3 generations/day<br />
            <strong>👑 Premium:</strong> 50 generations/day + priority processing
          </p>
        </div>

        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
          <p className="text-xs text-green-900">
            💡 <strong>Pro Tip:</strong> AI works best with specific prompts. Instead of "write about dogs", try "write an intro about choosing the right dog breed for families"
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
