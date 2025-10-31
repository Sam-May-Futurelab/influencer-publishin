import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Label } from '@/components/ui/label';
import { Star, Copy, Plus, MagicWand, Lightbulb, X, Info, FileText, AlignLeft, BookOpen, Crown } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { type Tone, type Length, type Format } from '@/lib/openai-service-secure';
import { AILoading } from '@/components/AILoading';
import { useAuth } from '@/hooks/use-auth';
import { useUsageTracking } from '@/hooks/use-usage-tracking';
import { UpgradeModal } from '@/components/UpgradeModal';

interface AIContentAssistantProps {
  chapterTitle: string;
  ebookCategory?: string;
  targetAudience?: string;
  chapterNumber?: number;
  totalChapters?: number;
  onContentGenerated: (content: string) => void;
  className?: string;
  isPremium?: boolean;
}

export function AIContentAssistant({ 
  chapterTitle, 
  ebookCategory = 'general',
  targetAudience,
  chapterNumber,
  totalChapters,
  onContentGenerated, 
  className = '',
  isPremium = false
}: AIContentAssistantProps) {
  const { user } = useAuth();
  const { canGenerate, remainingGenerations, incrementUsage, loading: usageLoading } = useUsageTracking(user?.uid || null, isPremium);
  
  const [keywords, setKeywords] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  // AI Controls
  const [tone, setTone] = useState<Tone>('friendly');
  const [length, setLength] = useState<Length>('standard');
  const [format, setFormat] = useState<Format>('narrative');
  const [showPromptLibrary, setShowPromptLibrary] = useState(false);

  // Prompt Library Examples
  const promptExamples = [
    {
      category: 'Digital Marketing',
      prompt: 'SEO best practices, content marketing strategies, social media engagement tactics, email marketing automation',
      icon: '📱'
    },
    {
      category: 'Health & Wellness',
      prompt: 'nutrition guidelines, exercise routines, mental health tips, stress management techniques, healthy lifestyle habits',
      icon: '🌱'
    },
    {
      category: 'Business Growth',
      prompt: 'startup strategies, revenue growth tactics, customer acquisition, team building, scaling operations',
      icon: '🚀'
    },
    {
      category: 'Personal Finance',
      prompt: 'budgeting strategies, investment basics, retirement planning, debt management, savings tips',
      icon: '💰'
    },
    {
      category: 'Productivity',
      prompt: 'time management techniques, goal setting methods, focus strategies, workflow optimization, habit building',
      icon: '⚡'
    },
    {
      category: 'Content Creation',
      prompt: 'writing techniques, storytelling methods, audience engagement, content planning, creative process',
      icon: '✍️'
    }
  ];

  // Clear content when chapter changes
  useEffect(() => {
    setKeywords('');
    setGeneratedContent('');
    setIsGenerating(false);
  }, [chapterTitle]);

  const generateChapter = async () => {
    if (!keywords.trim()) {
      toast.error('Please enter some keywords or topics first');
      return;
    }

    // Check usage limit
    if (!canGenerate) {
      if (!isPremium) {
        setShowUpgradeModal(true);
      } else {
        toast.error('Daily limit reached. Try again tomorrow!', { duration: 4000 });
      }
      return;
    }

    setIsGenerating(true);
    
    try {
      // Call API with chapter generation mode
      const endpoint = import.meta.env.PROD 
        ? '/api/ai-generation?type=content'
        : 'http://localhost:3000/api/ai-generation?type=content';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keywords: keywords.split(',').map(k => k.trim()),
          chapterTitle,
          contentType: 'chapter', // Generate full chapter, not snippets
          genre: ebookCategory,
          tone,
          length,
          format,
          context: {
            targetAudience,
            chapterNumber,
            totalChapters,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.content) {
        throw new Error('No content returned');
      }

      // Increment usage counter after successful generation
      await incrementUsage();
      
      setGeneratedContent(data.content);
      toast.success('Chapter content generated!');
      
    } catch (error) {
      console.error('Content generation failed:', error);
      toast.error('AI generation failed. Please try again.');
      
      // Fallback content
      const keywordList = keywords.split(',').map(k => k.trim()).filter(k => k);
      const mainKeyword = keywordList[0] || 'your topic';
      
      const fallback = `In this chapter on ${chapterTitle}, we'll explore ${mainKeyword} and discover how these concepts can transform your understanding.\n\nWhether you're just starting out or looking to deepen your knowledge, you'll find practical insights and actionable strategies throughout this chapter.\n\nUnderstanding ${mainKeyword} requires examining both theory and practice. Through specific examples and detailed explanations, we'll help you build a comprehensive understanding that you can apply in your own context.\n\nLet's dive in and explore the key concepts that will help you master ${mainKeyword}.`;
      
      setGeneratedContent(fallback);
      toast.success('Template content ready!');
      
    } finally {
      setIsGenerating(false);
    }
  };

  const insertContent = () => {
    if (!generatedContent || generatedContent.trim() === '') {
      toast.error('No content to insert');
      return;
    }
    
    onContentGenerated(generatedContent.trim());
    toast.success('Content added to your chapter!');
    setGeneratedContent(''); // Clear after inserting
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedContent);
      toast.success('Content copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy content');
    }
  };

  return (
    <Card className={`neomorph-flat border-0 ${className}`}>
      <CardContent className="p-4 space-y-4">
        {/* Compact Header with Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Star size={16} className="text-primary" weight="fill" />
              <h3 className="text-sm font-semibold">AI Writing Assistant</h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-muted-foreground hover:text-foreground transition-colors">
                      <Info size={14} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs neomorph-flat border-0 p-3">
                    <div className="space-y-2 text-xs">
                      <p className="font-semibold text-primary">How to use AI Assistant:</p>
                      <ol className="space-y-1 list-decimal list-inside">
                        <li>Enter keywords or topics for your chapter</li>
                        <li>Click "Generate" to create AI suggestions</li>
                        <li>Preview different content options</li>
                        <li>Click "Enhance" to improve any suggestion</li>
                        <li>Click "Insert" to add content to your chapter</li>
                      </ol>
                      <p className="text-muted-foreground italic mt-2">
                        💡 Tip: Use specific keywords for better results!
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            {/* Usage Counter */}
            {!usageLoading && (
              <div className="flex items-center gap-1.5">
                <span className={`text-xs font-medium ${remainingGenerations === 0 ? 'text-red-500' : remainingGenerations <= 1 ? 'text-orange-500' : 'text-muted-foreground'}`}>
                  {remainingGenerations} left today
                </span>
                {!isPremium && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Crown size={14} className="text-amber-500" weight="fill" />
                      </TooltipTrigger>
                      <TooltipContent className="neomorph-flat border-0 p-2">
                        <p className="text-xs">Upgrade to Premium for 50/day!</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            )}
          </div>

          {/* Prompt Library Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPromptLibrary(!showPromptLibrary)}
            className="w-full h-8 gap-2 text-xs neomorph-flat border-0 hover:neomorph-inset"
          >
            <Lightbulb size={14} weight={showPromptLibrary ? 'fill' : 'regular'} />
            {showPromptLibrary ? 'Hide' : 'Show'} Example Prompts
          </Button>

          {/* Prompt Library */}
          <AnimatePresence>
            {showPromptLibrary && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-muted/30 rounded-lg">
                  {promptExamples.map((example, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => {
                        setKeywords(example.prompt);
                        setShowPromptLibrary(false);
                        toast.success(`Applied ${example.category} prompt!`);
                      }}
                      className="text-left p-2 rounded-lg bg-background hover:bg-primary/10 transition-colors neomorph-flat hover:neomorph-inset group"
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-lg">{example.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-xs mb-1 group-hover:text-primary transition-colors">
                            {example.category}
                          </p>
                          <p className="text-[10px] text-muted-foreground line-clamp-2">
                            {example.prompt}
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="flex gap-2">
            <Input
              placeholder="e.g., social media marketing, content strategy, engagement tips..."
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isGenerating) {
                  generateChapter();
                }
              }}
              className="flex-1 neomorph-inset border-0 h-10 text-sm"
            />
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={generateChapter}
                disabled={isGenerating || !keywords.trim()}
                size="sm"
                className={`gap-2 h-10 px-4 neomorph-button border-0 ${!canGenerate && !isPremium ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white' : ''}`}
              >
                {isGenerating ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <MagicWand size={16} />
                    </motion.div>
                    <span className="hidden sm:inline">Generating...</span>
                  </>
                ) : !canGenerate && !isPremium ? (
                  <>
                    <Crown size={16} weight="fill" />
                    Upgrade to Premium
                  </>
                ) : (
                  <>
                    <Star size={16} />
                    Generate Chapter
                  </>
                )}
              </Button>
            </motion.div>
          </div>

          {/* AI Settings - Simple Button Toggle */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-muted-foreground">
                Content Length
              </Label>
              <span className="text-xs text-muted-foreground">
                {length === 'brief' && '~150 words'}
                {length === 'standard' && '~250 words'}
                {length === 'detailed' && '~350 words'}
              </span>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button
                type="button"
                variant={length === 'brief' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLength('brief')}
                className="neomorph-button border-0 gap-2"
              >
                <FileText size={14} />
                Brief
              </Button>
              <Button
                type="button"
                variant={length === 'standard' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLength('standard')}
                className="neomorph-button border-0 gap-2"
              >
                <AlignLeft size={14} />
                Standard
              </Button>
              <Button
                type="button"
                variant={length === 'detailed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLength('detailed')}
                className="neomorph-button border-0 gap-2"
              >
                <BookOpen size={14} />
                Detailed
              </Button>
            </div>
          </div>
        </div>
          
        {/* Loading State */}
        <AnimatePresence>
          {isGenerating && (
            <AILoading className="py-8 lg:py-12" />
          )}
        </AnimatePresence>

        {/* Generated Chapter Content */}
        <AnimatePresence>
          {generatedContent && !isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Lightbulb size={16} className="text-accent" />
                  Generated Chapter Content
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setGeneratedContent('')}
                  className="h-8 gap-2 text-xs"
                >
                  <X size={14} />
                  Clear
                </Button>
              </div>
              
              <Textarea
                value={generatedContent}
                onChange={(e) => setGeneratedContent(e.target.value)}
                className="min-h-[300px] neomorph-inset border-0 text-sm bg-background resize-y"
                placeholder="Edit generated content here..."
              />
              
              <div className="flex gap-2">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                  <Button
                    className="w-full gap-2 neomorph-button border-0 bg-gradient-to-r from-primary to-accent text-white"
                    onClick={insertContent}
                  >
                    <Plus size={18} weight="bold" />
                    Add to Chapter
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    className="gap-2 neomorph-button border-0 px-6"
                    onClick={copyToClipboard}
                  >
                    <Copy size={16} />
                    Copy
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Empty State */}
        {!generatedContent && !isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 space-y-3"
          >
            <div className="w-16 h-16 mx-auto rounded-full neomorph-inset flex items-center justify-center">
              <MagicWand size={32} className="text-primary/50" weight="duotone" />
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">AI Chapter Generator</h4>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Describe your chapter topic in the box above, then click <strong>Generate Chapter</strong> to create full content instantly.
              </p>
              <div className="space-y-1 pt-2">
                <p className="text-xs font-medium text-muted-foreground">Example topics:</p>
                <p className="text-xs text-muted-foreground italic">
                  "email marketing automation, segmentation, best practices"
                </p>
                <p className="text-xs text-muted-foreground italic">
                  "productivity tips, time management, focus strategies"
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>

      <UpgradeModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        highlightMessage="Upgrade to Premium for 50 AI generations per day!"
      />
    </Card>
  );
}