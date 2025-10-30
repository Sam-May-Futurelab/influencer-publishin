import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { 
  Sparkle, 
  ArrowRight, 
  Check, 
  Lightning, 
  BookOpen, 
  Rocket, 
  Target,
  ShieldCheck,
  Clock,
  Brain,
  PenNib,
  MagicWand
} from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { LandingHeader } from '@/components/LandingHeader';
import { LandingFooter } from '@/components/LandingFooter';
import { AuthModal } from '@/components/AuthModal';

const LOADING_MESSAGES = [
  { text: 'Analyzing your book idea...', icon: Brain },
  { text: 'Crafting the perfect opening...', icon: PenNib },
  { text: 'Generating engaging content...', icon: MagicWand },
  { text: 'Polishing your chapter...', icon: Sparkle },
  { text: 'Almost ready...', icon: Rocket },
];

export function TryFreePage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [generatedTitle, setGeneratedTitle] = useState<string>('');
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  // Cycle through loading messages
  useEffect(() => {
    if (!generating) return;
    
    const interval = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2000); // Change message every 2 seconds

    return () => clearInterval(interval);
  }, [generating]);

  const handleGenerate = async () => {
    if (!title.trim()) {
      toast.error('Please enter a book title');
      return;
    }

    setGenerating(true);
    setLoadingMessageIndex(0); // Reset to first message

    try {
      const response = await fetch('/api/preview-chapter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          // Open auth modal instead of toast for rate limit
          setShowAuthModal(true);
        } else {
          toast.error(data.error || 'Failed to generate preview');
        }
        return;
      }

      setGeneratedContent(data.content);
      setGeneratedTitle(title.trim());

      // Save to localStorage for migration after signup
      localStorage.setItem('preview_book', JSON.stringify({
        title: title.trim(),
        chapter1: data.content,
        timestamp: Date.now(),
      }));

      toast.success('Preview generated!', {
        description: 'Sign up to create your full book',
      });
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Failed to generate preview. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader 
        onGetStarted={() => navigate('/register')}
        onSignIn={() => navigate('/login')}
        showNavLinks={true}
      />

      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <AnimatePresence mode="wait">
          {!generatedContent ? (
            /* Input Form */
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Hero Section */}
              <div className="text-center space-y-6">
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-purple-600/10 border border-primary/20 text-primary text-sm font-semibold"
                >
                  <Lightning size={18} weight="fill" />
                  Free Preview - No Signup Required
                </motion.div>
                
                <div className="space-y-4">
                  <h1 className="text-4xl md:text-6xl font-bold">
                    Experience AI Book Writing
                    <span className="block bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
                      In Seconds
                    </span>
                  </h1>
                  <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    Watch our AI craft a complete chapter for your book idea. 
                    No credit card, no commitment - just pure creativity.
                  </p>
                </div>

                {/* Trust Indicators */}
                <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground pt-4">
                  <div className="flex items-center gap-2">
                    <Clock size={18} weight="duotone" className="text-primary" />
                    <span>30 second generation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={18} weight="duotone" className="text-primary" />
                    <span>No registration needed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target size={18} weight="duotone" className="text-primary" />
                    <span>500-750 words</span>
                  </div>
                </div>
              </div>

              {/* Input Card */}
              <Card className="p-8 md:p-10 neomorph-flat border-2 border-primary/10 bg-gradient-to-br from-background to-muted/20">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      What's your book about?
                    </label>
                    <Input
                      placeholder="e.g., A guide to starting a successful online business"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
                      className="h-14 text-lg"
                      maxLength={100}
                      disabled={generating}
                    />
                    <p className="text-xs text-muted-foreground">
                      {title.length}/100 characters
                    </p>
                  </div>

                  <Button
                    onClick={handleGenerate}
                    disabled={generating || !title.trim()}
                    className="w-full h-16 text-lg bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 relative overflow-hidden"
                  >
                    {generating && (
                      <>
                        {/* Shimmer effect */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0"
                          animate={{
                            x: ['-100%', '200%'],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: 'linear',
                          }}
                        />
                        {/* Pulse background */}
                        <motion.div
                          className="absolute inset-0 bg-white/10"
                          animate={{
                            opacity: [0.1, 0.3, 0.1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        />
                      </>
                    )}
                    {generating ? (
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={loadingMessageIndex}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                          className="flex items-center gap-3 relative z-10"
                        >
                          <motion.div
                            animate={{ 
                              rotate: 360,
                              scale: [1, 1.2, 1]
                            }}
                            transition={{ 
                              rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
                              scale: { duration: 1, repeat: Infinity, ease: 'easeInOut' }
                            }}
                          >
                            {(() => {
                              const Icon = LOADING_MESSAGES[loadingMessageIndex].icon;
                              return <Icon size={24} weight="fill" />;
                            })()}
                          </motion.div>
                          <span className="font-semibold">
                            {LOADING_MESSAGES[loadingMessageIndex].text}
                          </span>
                        </motion.div>
                      </AnimatePresence>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Lightning size={22} weight="fill" />
                        Generate Free Preview
                        <ArrowRight size={22} weight="bold" />
                      </div>
                    )}
                  </Button>
                </div>
              </Card>

              {/* Features */}
              <div className="grid md:grid-cols-3 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="p-6 h-full border-2 border-primary/10 hover:border-primary/30 transition-all hover:shadow-lg">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-purple-600/20">
                        <Lightning size={24} weight="duotone" className="text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2">Instant Results</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Watch AI generate professional content in real-time. Your chapter appears in 30 seconds.
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="p-6 h-full border-2 border-primary/10 hover:border-primary/30 transition-all hover:shadow-lg">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-purple-600/20 to-pink-600/20">
                        <Target size={24} weight="duotone" className="text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2">High Quality</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Professional writing that reads naturally. No robotic text or awkward phrasing.
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="p-6 h-full border-2 border-primary/10 hover:border-primary/30 transition-all hover:shadow-lg">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20">
                        <ShieldCheck size={24} weight="duotone" className="text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2">Zero Risk</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Try it completely free. No credit card, no email, no strings attached.
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            /* Generated Content */
            <motion.div
              key="output"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Success Header */}
              <div className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.6, bounce: 0.4 }}
                  className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-2 border-green-500/30"
                >
                  <Check size={24} weight="bold" className="text-green-600" />
                  <span className="font-bold text-lg text-green-600 dark:text-green-400">Your Preview is Ready!</span>
                </motion.div>
                
                <div className="space-y-3">
                  <h2 className="text-3xl md:text-4xl font-bold">{generatedTitle}</h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    This is just the beginning. Sign up free to turn this into a complete book.
                  </p>
                </div>

                {/* Quick Action CTAs - Above Content */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-col sm:flex-row gap-3 justify-center pt-4"
                >
                  <Button
                    size="lg"
                    onClick={() => setShowAuthModal(true)}
                    className="text-lg h-14 px-10 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-xl hover:shadow-2xl transition-all font-bold"
                  >
                    <Rocket size={24} weight="fill" className="mr-2" />
                    Save to My Account - Sign Up Free
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => {
                      setShowAuthModal(true);
                      // TODO: Set initialMode to 'signin' when AuthModal supports it
                    }}
                    className="text-lg h-14 px-8 border-2 font-semibold"
                  >
                    Already have an account? Sign In
                  </Button>
                </motion.div>
              </div>

              {/* Generated Content Card */}
              <Card className="p-8 md:p-12 neomorph-flat border-2 border-primary/10 bg-gradient-to-br from-background to-muted/10">
                <div className="prose prose-lg prose-slate dark:prose-invert max-w-none">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <BookOpen size={24} weight="duotone" className="text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold m-0">Chapter 1</h3>
                  </div>
                  <div className="whitespace-pre-wrap leading-relaxed text-foreground/90">
                    {generatedContent}
                  </div>
                </div>
                
                {/* Watermark */}
                <div className="mt-10 pt-6 border-t flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Sparkle size={18} weight="fill" className="text-primary" />
                  <span className="font-medium">Powered by InkfluenceAI</span>
                </div>
              </Card>

              {/* CTA Section */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Primary CTA - Continue with this book */}
                <Card className="p-8 bg-gradient-to-br from-primary/10 via-purple-600/10 to-pink-600/10 border-2 border-primary/30 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
                  <div className="relative space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold">
                      <Lightning size={14} weight="fill" />
                      RECOMMENDED
                    </div>
                    <h3 className="text-2xl font-bold">Save & Continue This Book</h3>
                    <p className="text-muted-foreground">
                      Sign up free to save your preview and continue writing. Add more chapters, 
                      design a cover, and export your complete book.
                    </p>
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Check size={18} weight="bold" className="text-green-600" />
                        <span>Keep this chapter in your library</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Check size={18} weight="bold" className="text-green-600" />
                        <span>Add unlimited additional chapters</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Check size={18} weight="bold" className="text-green-600" />
                        <span>AI cover designer & export tools</span>
                      </div>
                    </div>
                    <Button
                      size="lg"
                      onClick={() => setShowAuthModal(true)}
                      className="w-full text-lg h-14 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg font-bold"
                    >
                      <BookOpen size={22} weight="fill" className="mr-2" />
                      Sign Up & Save This Book
                    </Button>
                  </div>
                </Card>

                {/* Secondary Options */}
                <div className="space-y-6">
                  <Card className="p-6 border-2 border-muted hover:border-primary/30 transition-all">
                    <div className="space-y-3">
                      <h3 className="text-xl font-bold">Already Have an Account?</h3>
                      <p className="text-sm text-muted-foreground">
                        Sign in to add this preview to your existing library.
                      </p>
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={() => {
                          setShowAuthModal(true);
                          // TODO: Set initialMode to 'signin' when AuthModal supports it
                        }}
                        className="w-full text-lg h-12 border-2"
                      >
                        Sign In to Continue
                      </Button>
                    </div>
                  </Card>

                  <Card className="p-6 border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-purple-600/5">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Clock size={20} weight="duotone" className="text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold">Free Preview Used Today</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            You get 1 free preview per day. Sign up for unlimited AI generations!
                          </p>
                        </div>
                      </div>
                      <Button
                        size="lg"
                        onClick={() => setShowAuthModal(true)}
                        className="w-full text-lg h-12 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                      >
                        <Rocket size={20} weight="fill" className="mr-2" />
                        Unlock Unlimited Access
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>

              {/* Value Props */}
              <Card className="p-8 bg-muted/30 border-0">
                <div className="text-center space-y-6">
                  <h3 className="text-2xl font-bold">What You'll Get with a Free Account</h3>
                  <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
                    <div className="space-y-2">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
                        <BookOpen size={24} className="text-primary" weight="duotone" />
                      </div>
                      <h4 className="font-bold">5 Pages Free</h4>
                      <p className="text-sm text-muted-foreground">Create multiple short books or one longer project</p>
                    </div>
                    <div className="space-y-2">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
                        <Sparkle size={24} className="text-primary" weight="duotone" />
                      </div>
                      <h4 className="font-bold">AI Tools</h4>
                      <p className="text-sm text-muted-foreground">3 AI generations/day plus 1 AI cover per month</p>
                    </div>
                    <div className="space-y-2">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
                        <Rocket size={24} className="text-primary" weight="duotone" />
                      </div>
                      <h4 className="font-bold">Export Ready</h4>
                      <p className="text-sm text-muted-foreground">Download your book as PDF anytime</p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <LandingFooter />

      {/* Auth Modal for Rate Limit */}
      <AuthModal 
        isOpen={showAuthModal} 
        onOpenChange={setShowAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={() => {
          // Navigate to dashboard after successful authentication
          navigate('/app/dashboard');
        }}
        initialMode="register"
        customMessage="You've used your free preview for today! Sign up to create unlimited books with AI."
      />
    </div>
  );
}
