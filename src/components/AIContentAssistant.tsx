import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Star, ArrowRight, Copy, Plus, MagicWand, Lightbulb, X, Info, SlidersHorizontal, FileText, AlignLeft, BookOpen, Crown } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { generateAIContent, enhanceContent, type ContentSuggestion, type Tone, type Length, type Format } from '@/lib/openai-service-secure';
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
  const [suggestions, setSuggestions] = useState<ContentSuggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<ContentSuggestion | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  // AI Enhancement Controls
  const [tone, setTone] = useState<Tone>('friendly');
  const [length, setLength] = useState<Length>('standard');
  const [format, setFormat] = useState<Format>('narrative');
  const [showAdvanced, setShowAdvanced] = useState(false);
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

  // Clear suggestions when chapter changes
  useEffect(() => {
    setKeywords('');
    setSuggestions([]);
    setSelectedSuggestion(null);
    setIsGenerating(false);
  }, [chapterTitle]);

  const generateContent = async () => {
    if (!keywords.trim()) {
      toast.error('Please enter some keywords first');
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
      // Use enhanced AI service with new parameters
      const newSuggestions = await generateAIContent({
        keywords,
        chapterTitle,
        genre: ebookCategory,
        tone,
        length,
        format,
        context: {
          targetAudience,
          chapterNumber,
          totalChapters,
        }
      });
      
      // Increment usage counter after successful generation
      await incrementUsage();
      
      // Add to existing suggestions instead of replacing (allows multiple clicks)
      setSuggestions(prev => [...newSuggestions, ...prev]);
      toast.success(`Generated ${newSuggestions.length} new suggestion!`);
      
    } catch (error) {
      console.error('Content generation failed:', error);
      toast.error('AI generation failed. Please check your API key and try again.');
      
      // Provide fallback content on error
      const keywordList = keywords.split(',').map(k => k.trim()).filter(k => k);
      const mainKeyword = keywordList[0] || 'your topic';
      
      const fallbackSuggestions: ContentSuggestion[] = [
        {
          id: 'fallback-1',
          title: 'Content Suggestion',
          content: `In this chapter on ${chapterTitle}, we'll explore ${mainKeyword} and discover how these concepts can transform your understanding. Whether you're just starting out or looking to deepen your knowledge, you'll find practical insights and actionable strategies. Understanding ${mainKeyword} requires examining both theory and practice. Through specific examples and detailed explanations, we'll help you build a comprehensive understanding that you can apply in your own context.`,
          type: 'introduction'
        }
      ];
      
      setSuggestions(prev => [...fallbackSuggestions, ...prev]);
      toast.success('Template content ready!');
      
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success('Content copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy content');
    }
  };

  const insertContent = (content: string) => {
    if (!content || content.trim() === '') {
      toast.error('No content to insert');
      return;
    }
    
    onContentGenerated(content.trim());
    toast.success('Content added to your chapter!');
  };

  const enhanceContentHandler = async (content: string) => {
    setIsGenerating(true);
    try {
      const enhancedContent = await enhanceContent(content, chapterTitle, {
        genre: ebookCategory,
        tone,
        length,
        format,
        context: {
          targetAudience,
        }
      });
      
      if (!enhancedContent || enhancedContent.trim() === '') {
        throw new Error('Empty response from AI service');
      }
      
      if (selectedSuggestion) {
        const updatedSuggestion = {
          ...selectedSuggestion,
          content: enhancedContent.trim(),
          title: selectedSuggestion.title.includes('(Enhanced)') 
            ? selectedSuggestion.title 
            : selectedSuggestion.title + ' (Enhanced)'
        };
        setSelectedSuggestion(updatedSuggestion);
        setSuggestions(prev => prev.map(s => 
          s.id === selectedSuggestion.id ? updatedSuggestion : s
        ));
      }
      
      toast.success('Content enhanced!');
    } catch (error) {
      console.error('Enhancement failed:', error);
      toast.error('Failed to enhance content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'outline': return '📋';
      case 'introduction': return '👋';
      case 'tips': return '💡';
      case 'conclusion': return '🎯';
      default: return '📝';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'outline': return 'bg-blue-100 text-blue-800';
      case 'introduction': return 'bg-green-100 text-green-800';
      case 'tips': return 'bg-yellow-100 text-yellow-800';
      case 'conclusion': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
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
                  {remainingGenerations}/{isPremium ? 50 : 3} left today
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
              placeholder="Enter topics or keywords..."
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isGenerating) {
                  generateContent();
                }
              }}
              className="flex-1 neomorph-inset border-0 h-10 text-sm"
            />
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={generateContent}
                disabled={isGenerating || !keywords.trim()}
                size="sm"
                className={`gap-2 h-10 px-4 neomorph-button border-0 ${!canGenerate && !isPremium ? 'bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50' : ''}`}
              >
                {isGenerating ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <MagicWand size={16} />
                    </motion.div>
                    <span className="hidden sm:inline">Creating...</span>
                  </>
                ) : !canGenerate && !isPremium ? (
                  <>
                    <Crown size={16} weight="fill" />
                    {suggestions.length > 0 ? 'Upgrade for More' : 'Upgrade to Premium'}
                  </>
                ) : (
                  <>
                    <Star size={16} />
                    {suggestions.length > 0 ? 'Generate More' : 'Generate'}
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
                {length === 'brief' && '~100 words - Quick snippets'}
                {length === 'standard' && '~150 words - Balanced content'}
                {length === 'detailed' && '~200 words - In-depth writing'}
                {length === 'comprehensive' && '~300 words - Premium depth'}
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
              {isPremium && (
                <Button
                  type="button"
                  variant={length === 'comprehensive' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLength('comprehensive')}
                  className="neomorph-button border-0 gap-2"
                >
                  <Crown size={14} />
                  Comprehensive
                </Button>
              )}
            </div>
          </div>
        </div>
          
        {/* Loading State */}
        <AnimatePresence>
          {isGenerating && (
            <AILoading className="py-8 lg:py-12" />
          )}
        </AnimatePresence>

        {/* Generated Suggestions */}
        <AnimatePresence>
          {suggestions.length > 0 && !isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Lightbulb size={16} className="text-accent" />
                AI Generated Content
                <span className="text-xs font-normal text-muted-foreground">(Click any card to expand and preview)</span>
              </h3>
              
              <div className="space-y-3">
                {suggestions.map((suggestion, index) => (
                  <motion.div
                    key={suggestion.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="space-y-2"
                  >
                    {/* Suggestion Card */}
                    <Card
                      className={`cursor-pointer transition-all duration-200 neomorph-flat border-0 hover:neomorph-raised ${
                        selectedSuggestion?.id === suggestion.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedSuggestion(selectedSuggestion?.id === suggestion.id ? null : suggestion)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className="text-2xl flex-shrink-0">{getTypeIcon(suggestion.type)}</span>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-foreground mb-1">{suggestion.title}</h4>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {suggestion.content}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button
                                size="sm"
                                className="gap-2 neomorph-button border-0 bg-primary text-primary-foreground hover:bg-primary/90"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  insertContent(suggestion.content);
                                }}
                              >
                                <Plus size={16} weight="bold" />
                                <span className="hidden sm:inline">Add to Chapter</span>
                                <span className="sm:hidden">Add</span>
                              </Button>
                            </motion.div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-9 w-9 p-0 neomorph-button border-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(suggestion.content);
                              }}
                            >
                              <Copy size={16} />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Inline Preview - Appears right under clicked suggestion */}
                    <AnimatePresence>
                      {selectedSuggestion?.id === suggestion.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <Card className="neomorph-inset border-0 bg-muted/30">
                            <CardContent className="p-4 space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary" className="text-xs border-0">
                                    Full Preview
                                  </Badge>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedSuggestion(null);
                                  }}
                                >
                                  <X size={16} />
                                </Button>
                              </div>
                              
                              <Textarea
                                value={suggestion.content}
                                readOnly
                                className="min-h-[150px] resize-none neomorph-inset border-0 text-sm bg-background"
                              />
                              
                              <div className="flex gap-2 pt-2">
                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                                  <Button
                                    className="w-full gap-2 neomorph-button border-0 bg-gradient-to-r from-primary to-accent text-white"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      insertContent(suggestion.content);
                                    }}
                                  >
                                    <Plus size={18} weight="bold" />
                                    Add This Content to My Chapter
                                  </Button>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                  <Button
                                    variant="outline"
                                    className="gap-2 neomorph-button border-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      copyToClipboard(suggestion.content);
                                    }}
                                  >
                                    <Copy size={16} />
                                    Copy
                                  </Button>
                                </motion.div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Empty State - Show when no suggestions and not generating */}
        {suggestions.length === 0 && !isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 space-y-3"
          >
            <div className="w-16 h-16 mx-auto rounded-full neomorph-inset flex items-center justify-center">
              <MagicWand size={32} className="text-primary/50" weight="duotone" />
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">AI Content Generator</h4>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Enter keywords above and click Generate to create content suggestions.
              </p>
              <p className="text-xs text-muted-foreground">
                Example: "public speaking, confidence, presentation skills"
              </p>
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