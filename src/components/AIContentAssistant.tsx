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
          title: 'Opening Section',
          content: `Welcome to this chapter on ${mainKeyword}. In this section, we'll explore the fundamental concepts and practical applications that will help you understand and implement ${mainKeyword} effectively. Whether you're a beginner or looking to deepen your knowledge, this chapter provides valuable insights and actionable strategies you can apply immediately. Let's begin this journey together and unlock the potential of ${mainKeyword} in your life.`,
          type: 'introduction'
        },
        {
          id: 'fallback-content',
          title: 'Core Content',
          content: `Understanding ${mainKeyword} requires both theoretical knowledge and practical application. Let's break down the key concepts that form the foundation of ${mainKeyword}. First, it's important to recognize that ${mainKeyword} is not just about theory—it's about real-world implementation. Consider how ${mainKeyword} applies to everyday situations and challenges. Through specific examples and detailed explanations, we'll explore the nuances of ${mainKeyword}, helping you build a comprehensive understanding that you can apply in your own context. By examining different perspectives and approaches, you'll develop a well-rounded grasp of ${mainKeyword} that goes beyond surface-level knowledge.`,
          type: 'outline'
        },
        {
          id: 'fallback-takeaways',
          title: 'Practical Takeaways',
          content: `Now that we've covered the fundamentals of ${mainKeyword}, let's focus on actionable insights you can implement immediately. Start by identifying one or two key concepts that resonate most with your situation. Practice applying these concepts in small, manageable steps rather than attempting everything at once. Track your progress and adjust your approach based on what works best for you. Remember that mastery comes through consistent practice and reflection. Connect with others who are also exploring ${mainKeyword}—their perspectives and experiences can provide valuable insights. Finally, be patient with yourself as you develop your skills. Every expert was once a beginner, and your journey with ${mainKeyword} is uniquely yours.`,
          type: 'tips'
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

          {/* AI Settings - Simplified and Always Visible */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-muted-foreground">
                Content Settings
              </Label>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
              >
                <SlidersHorizontal size={14} />
                <span>{showAdvanced ? 'Basic' : 'Advanced'}</span>
              </button>
            </div>

            {!showAdvanced ? (
              // Basic Mode - Just Length
              <div className="space-y-2">
                <Label htmlFor="length" className="text-sm">
                  How much content do you want?
                </Label>
                <Select value={length} onValueChange={(value) => setLength(value as Length)}>
                  <SelectTrigger id="length" className="h-10 neomorph-inset border-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brief">
                      <div className="flex flex-col items-start py-1">
                        <span className="font-medium">📄 Brief</span>
                        <span className="text-xs text-muted-foreground">~75 words each (225 total)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="standard">
                      <div className="flex flex-col items-start py-1">
                        <span className="font-medium">📋 Standard</span>
                        <span className="text-xs text-muted-foreground">~100 words each (300 total)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="detailed">
                      <div className="flex flex-col items-start py-1">
                        <span className="font-medium">� Detailed</span>
                        <span className="text-xs text-muted-foreground">~150 words each (450 total)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="comprehensive">
                      <div className="flex flex-col items-start py-1">
                        <span className="font-medium">📚 Comprehensive</span>
                        <span className="text-xs text-muted-foreground">~200 words each (600 total)</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              // Advanced Mode - All Controls
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {/* Tone Control */}
                  <div className="space-y-2">
                    <Label htmlFor="tone" className="text-sm">
                      Writing Tone
                    </Label>
                    <Select value={tone} onValueChange={(value) => setTone(value as Tone)}>
                      <SelectTrigger id="tone" className="h-10 neomorph-inset border-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="friendly">� Friendly & Conversational</SelectItem>
                        <SelectItem value="professional">� Professional & Polished</SelectItem>
                        <SelectItem value="motivational">� Motivational & Inspiring</SelectItem>
                        <SelectItem value="direct">🎯 Direct & Actionable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Length Control */}
                  <div className="space-y-2">
                    <Label htmlFor="length-advanced" className="text-sm">
                      Content Length
                    </Label>
                    <Select value={length} onValueChange={(value) => setLength(value as Length)}>
                      <SelectTrigger id="length-advanced" className="h-10 neomorph-inset border-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="brief">� Brief (100-150)</SelectItem>
                        <SelectItem value="standard">� Standard (200-300)</SelectItem>
                        <SelectItem value="detailed">📖 Detailed (300-400)</SelectItem>
                        <SelectItem value="comprehensive">📚 Comprehensive (500-700)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Context Display */}
                {(ebookCategory || targetAudience) && (
                  <div className="pt-2 space-y-1">
                    <Label className="text-xs text-muted-foreground">AI Context:</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {ebookCategory && (
                        <Badge variant="secondary" className="text-xs">
                          {ebookCategory}
                        </Badge>
                      )}
                      {targetAudience && (
                        <Badge variant="outline" className="text-xs">
                          {targetAudience}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
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