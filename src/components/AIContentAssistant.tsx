import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Star, ArrowRight, Copy, Plus, MagicWand, Lightbulb, X, Info, SlidersHorizontal } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { generateAIContent, enhanceContent, type ContentSuggestion, type Tone, type Length, type Format } from '@/lib/openai-service-secure';
import { AILoading } from '@/components/AILoading';

interface AIContentAssistantProps {
  chapterTitle: string;
  ebookCategory?: string;
  targetAudience?: string;
  onContentGenerated: (content: string) => void;
  className?: string;
}

export function AIContentAssistant({ 
  chapterTitle, 
  ebookCategory = 'general',
  targetAudience,
  onContentGenerated, 
  className = '' 
}: AIContentAssistantProps) {
  const [keywords, setKeywords] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<ContentSuggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<ContentSuggestion | null>(null);
  
  // AI Enhancement Controls
  const [tone, setTone] = useState<Tone>('friendly');
  const [length, setLength] = useState<Length>('standard');
  const [format, setFormat] = useState<Format>('narrative');
  const [showAdvanced, setShowAdvanced] = useState(false);

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

    setIsGenerating(true);
    
    try {
      console.log('Starting AI content generation with enhanced options:', {
        keywords,
        genre: ebookCategory,
        tone,
        length,
        format
      });
      
      // Use enhanced AI service with new parameters
      const suggestions = await generateAIContent({
        keywords,
        chapterTitle,
        genre: ebookCategory,
        tone,
        length,
        format,
        context: {
          targetAudience,
        }
      });
      
      setSuggestions(suggestions);
      toast.success(`Generated ${suggestions.length} AI content suggestions!`);
      
    } catch (error) {
      console.error('Content generation failed:', error);
      toast.error('AI generation failed. Please check your API key and try again.');
      
      // Provide fallback content on error
      const keywordList = keywords.split(',').map(k => k.trim()).filter(k => k);
      const mainKeyword = keywordList[0] || 'your topic';
      
      const fallbackSuggestions: ContentSuggestion[] = [
        {
          id: 'fallback-intro',
          title: 'Chapter Introduction',
          content: `Welcome to this chapter on ${mainKeyword}. In this section, we'll explore the fundamental concepts and practical applications that will help you understand and implement ${mainKeyword} effectively. Whether you're a beginner or looking to deepen your knowledge, this chapter provides valuable insights and actionable strategies you can apply immediately. Let's begin this journey together and unlock the potential of ${mainKeyword} in your life.`,
          type: 'introduction'
        },
        {
          id: 'fallback-outline',
          title: 'Chapter Outline',
          content: `Chapter Outline:\n\n1. Introduction to ${mainKeyword}\n   • Definition and core concepts\n   • Why ${mainKeyword} matters\n   • Common misconceptions\n\n2. Getting Started\n   • Essential prerequisites\n   • Basic principles\n   • First steps\n\n3. Practical Application\n   • Real-world examples\n   • Step-by-step implementation\n   • Common challenges and solutions\n\n4. Advanced Strategies\n   • Expert tips and techniques\n   • Optimization methods\n   • Best practices\n\n5. Next Steps\n   • Continuing your journey\n   • Additional resources\n   • Key takeaways`,
          type: 'outline'
        },
        {
          id: 'fallback-tips',
          title: 'Key Tips & Insights',
          content: `Essential Tips for ${mainKeyword}:\n\n• Start with the fundamentals: Build a solid foundation before moving to advanced concepts\n• Practice consistently: Regular application leads to better results and deeper understanding\n• Learn from examples: Study real-world applications and case studies\n• Stay curious: Ask questions and explore different perspectives\n• Track your progress: Monitor your development and celebrate small wins\n• Connect with others: Join communities and learn from peers\n• Be patient: Mastery takes time, so embrace the learning process`,
          type: 'tips'
        },
        {
          id: 'fallback-conclusion',
          title: 'Chapter Conclusion',
          content: `As we conclude this chapter on ${mainKeyword}, remember that knowledge without action is merely potential. The concepts and strategies we've explored are tools waiting to be used. Take what resonates with you and begin implementing it today, even in small ways. Every expert was once a beginner, and every master was once a disaster. Your journey with ${mainKeyword} is unique, and the key is to start where you are, use what you have, and do what you can. The next chapter awaits, but the real transformation happens when you close this book and begin applying what you've learned.`,
          type: 'conclusion'
        }
      ];
      
      setSuggestions(fallbackSuggestions);
      toast.success('Template content suggestions ready!');
      
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
          <div className="flex items-center gap-2 mb-2">
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
                className="gap-2 h-10 px-4 neomorph-button border-0"
              >
                {isGenerating ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <MagicWand size={16} />
                    </motion.div>
                    <span className="hidden sm:inline">Creating magic...</span>
                    <span className="sm:hidden">Creating...</span>
                  </>
                ) : (
                  <>
                    <Star size={16} />
                    Generate
                  </>
                )}
              </Button>
            </motion.div>
          </div>

          {/* Advanced AI Controls */}
          <div className="space-y-2">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <SlidersHorizontal size={12} />
              <span>{showAdvanced ? 'Hide' : 'Show'} AI Controls</span>
            </button>

            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    {/* Tone Control */}
                    <div className="space-y-1">
                      <Label htmlFor="tone" className="text-xs text-muted-foreground">
                        Tone
                      </Label>
                      <Select value={tone} onValueChange={(value) => setTone(value as Tone)}>
                        <SelectTrigger id="tone" className="h-8 text-xs neomorph-inset border-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="friendly">😊 Friendly</SelectItem>
                          <SelectItem value="professional">💼 Professional</SelectItem>
                          <SelectItem value="motivational">🚀 Motivational</SelectItem>
                          <SelectItem value="direct">🎯 Direct</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Length Control */}
                    <div className="space-y-1">
                      <Label htmlFor="length" className="text-xs text-muted-foreground">
                        Length
                      </Label>
                      <Select value={length} onValueChange={(value) => setLength(value as Length)}>
                        <SelectTrigger id="length" className="h-8 text-xs neomorph-inset border-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="brief">📄 Brief</SelectItem>
                          <SelectItem value="standard">📋 Standard</SelectItem>
                          <SelectItem value="detailed">📖 Detailed</SelectItem>
                          <SelectItem value="comprehensive">📚 Comprehensive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Format Control */}
                    <div className="space-y-1">
                      <Label htmlFor="format" className="text-xs text-muted-foreground">
                        Format
                      </Label>
                      <Select value={format} onValueChange={(value) => setFormat(value as Format)}>
                        <SelectTrigger id="format" className="h-8 text-xs neomorph-inset border-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="narrative">📝 Narrative</SelectItem>
                          <SelectItem value="intro">👋 Introduction</SelectItem>
                          <SelectItem value="bullets">• Bullet Points</SelectItem>
                          <SelectItem value="steps">1️⃣ Step-by-Step</SelectItem>
                          <SelectItem value="qa">❓ Q&A Format</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Current Settings Display */}
                  <div className="mt-2 flex flex-wrap gap-1">
                    <Badge variant="secondary" className="text-xs">
                      {ebookCategory || 'General'}
                    </Badge>
                    {targetAudience && (
                      <Badge variant="outline" className="text-xs">
                        {targetAudience}
                      </Badge>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
              <Star size={32} className="text-primary/50" weight="fill" />
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">Ready to Create Amazing Content?</h4>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Enter keywords or topics above and click "Generate" to let AI create content suggestions for your chapter.
              </p>
              <div className="pt-2 space-y-1 text-xs text-muted-foreground">
                <p>💡 <strong>Example:</strong> "email marketing, lead generation, conversion"</p>
                <p>✨ AI will generate intros, outlines, tips, and conclusions</p>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}