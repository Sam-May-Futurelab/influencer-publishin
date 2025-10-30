import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Sparkle, ArrowRight, Check } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export function TryFreePage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [generatedTitle, setGeneratedTitle] = useState<string>('');

  const handleGenerate = async () => {
    if (!title.trim()) {
      toast.error('Please enter a book title');
      return;
    }

    setGenerating(true);

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
          toast.error('You\'ve already tried the free preview today', {
            description: 'Sign up to create unlimited books!',
          });
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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <Sparkle size={24} weight="fill" className="text-primary" />
            <span className="font-bold text-xl">InkfluenceAI</span>
          </div>
          <Button variant="outline" onClick={() => navigate('/login')}>
            Sign In
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
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
              <div className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium"
                >
                  <Sparkle size={16} weight="fill" />
                  Free Preview - No Signup Required
                </motion.div>
                <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  Try AI Book Generation
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  See how our AI can write a chapter for your book in seconds. 
                  No credit card, no commitment.
                </p>
              </div>

              {/* Input Card */}
              <Card className="p-8 neomorph-flat">
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
                    className="w-full h-14 text-lg bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 relative overflow-hidden"
                  >
                    {generating && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                        animate={{
                          x: ['-100%', '200%'],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                      />
                    )}
                    {generating ? (
                      <div className="flex items-center gap-2 relative z-10">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                          <Sparkle size={20} weight="fill" />
                        </motion.div>
                        Generating Preview...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Sparkle size={20} weight="fill" />
                        Generate Free Preview
                        <ArrowRight size={20} weight="bold" />
                      </div>
                    )}
                  </Button>
                </div>
              </Card>

              {/* Features */}
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { icon: '⚡', title: 'Instant Results', desc: 'See AI-generated content in seconds' },
                  { icon: '🎯', title: 'High Quality', desc: 'Professional writing that sounds human' },
                  { icon: '✨', title: 'No Risk', desc: 'Try it free, no credit card needed' },
                ].map((feature, i) => (
                  <Card key={i} className="p-6 text-center">
                    <div className="text-4xl mb-2">{feature.icon}</div>
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </Card>
                ))}
              </div>
            </motion.div>
          ) : (
            /* Generated Content */
            <motion.div
              key="output"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Success Header */}
              <div className="text-center space-y-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.5 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600 dark:text-green-400"
                >
                  <Check size={20} weight="bold" />
                  <span className="font-medium">Preview Generated!</span>
                </motion.div>
                <h2 className="text-3xl font-bold">{generatedTitle}</h2>
                <p className="text-muted-foreground">
                  Here's a sample chapter. Sign up to create your full book!
                </p>
              </div>

              {/* Generated Content Card */}
              <Card className="p-8 neomorph-flat">
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <h3 className="text-2xl font-bold mb-4">Chapter 1</h3>
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {generatedContent}
                  </div>
                </div>
                
                {/* Watermark */}
                <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
                  <Sparkle size={16} weight="fill" className="inline mr-2" />
                  Generated with InkfluenceAI
                </div>
              </Card>

              {/* CTA Section */}
              <Card className="p-8 bg-gradient-to-r from-primary/10 to-purple-600/10 border-primary/20">
                <div className="text-center space-y-4">
                  <h3 className="text-2xl font-bold">Love it? Create Your Full Book</h3>
                  <p className="text-muted-foreground max-w-xl mx-auto">
                    Sign up now to generate complete books with multiple chapters, 
                    create stunning covers, and export to PDF/EPUB.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                    <Button
                      size="lg"
                      onClick={() => navigate('/register')}
                      className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                    >
                      <Sparkle size={20} weight="fill" className="mr-2" />
                      Start Free Trial
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => {
                        setGeneratedContent(null);
                        setTitle('');
                      }}
                    >
                      Try Another Preview
                    </Button>
                  </div>
                  
                  <div className="grid sm:grid-cols-3 gap-4 pt-6 text-sm">
                    <div className="flex items-center justify-center gap-2">
                      <Check size={16} className="text-green-500" />
                      <span>Unlimited books</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Check size={16} className="text-green-500" />
                      <span>AI cover designer</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Check size={16} className="text-green-500" />
                      <span>Export to any format</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
