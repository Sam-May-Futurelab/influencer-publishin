import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Star, ArrowRight, Copy, Plus, MagicWand, Lightbulb } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { generateAIContent, enhanceContent, type ContentSuggestion } from '@/lib/openai-service';
import { AILoading } from '@/components/AILoading';

interface AIContentAssistantProps {
  chapterTitle: string;
  ebookCategory?: string;
  onContentGenerated: (content: string) => void;
  className?: string;
}

export function AIContentAssistant({ 
  chapterTitle, 
  ebookCategory = 'general',
  onContentGenerated, 
  className = '' 
}: AIContentAssistantProps) {
  const [keywords, setKeywords] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<ContentSuggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<ContentSuggestion | null>(null);

  const generateContent = async () => {
    if (!keywords.trim()) {
      toast.error('Please enter some keywords first');
      return;
    }

    setIsGenerating(true);
    
    try {
      console.log('Starting AI content generation with keywords:', keywords);
      
      // Use real OpenAI service
      const suggestions = await generateAIContent(keywords, chapterTitle, ebookCategory);
      
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
      const enhancedContent = await enhanceContent(content, chapterTitle, ebookCategory);
      
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
    <Card className={`neomorph-raised border-0 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-lg">
          <div className="p-2 rounded-lg neomorph-flat">
            <Star size={20} className="text-primary" />
          </div>
          AI Content Assistant
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Enter keywords or topics to generate intelligent content suggestions for your chapter
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Keyword Input */}
        <div className="space-y-3">
          <div className="flex gap-3">
            <Input
              placeholder="Enter keywords, topics, or main points (e.g., 'nutrition basics, meal planning, healthy habits')"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isGenerating) {
                  generateContent();
                }
              }}
              className="flex-1 neomorph-inset border-0 h-12"
            />
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={generateContent}
                disabled={isGenerating || !keywords.trim()}
                className="gap-2 h-12 px-6 neomorph-button border-0"
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
          
          {/* Help text */}
          <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg neomorph-flat">
            💡 <strong>Tip:</strong> Be specific with your keywords for better results. Try phrases like "beginner workout routines", "healthy meal prep strategies", or "time management techniques".
          </div>
          
          {/* Test button for debugging */}
          {typeof window !== 'undefined' && window.location.hostname === 'localhost' && (
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  console.log('Testing OpenAI connection...');
                  const testSuggestions = await generateAIContent('test keywords', 'Test Chapter', 'general');
                  console.log('Test response:', testSuggestions);
                  toast.success('OpenAI connection working!');
                } catch (error) {
                  console.error('OpenAI test failed:', error);
                  toast.error('OpenAI connection failed - check your API key');
                }
              }}
              className="text-xs"
            >
              Test OpenAI Connection
            </Button>
          )}
          
          {/* Quick keyword suggestions */}
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-muted-foreground">Quick suggestions:</span>
            {['key benefits', 'step-by-step process', 'common mistakes', 'expert tips', 'real examples'].map((suggestion) => (
              <Badge
                key={suggestion}
                variant="outline"
                className="cursor-pointer hover:bg-primary/10 neomorph-flat border-0 text-xs"
                onClick={() => setKeywords(prev => prev ? `${prev}, ${suggestion}` : suggestion)}
              >
                {suggestion}
              </Badge>
            ))}
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
                Content Suggestions
              </h3>
              
              <div className="grid gap-3">
                {suggestions.map((suggestion, index) => (
                  <motion.div
                    key={suggestion.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card
                      className={`cursor-pointer transition-all duration-200 neomorph-flat border-0 hover:neomorph-raised ${
                        selectedSuggestion?.id === suggestion.id ? 'ring-2 ring-primary/30' : ''
                      }`}
                      onClick={() => setSelectedSuggestion(suggestion)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{getTypeIcon(suggestion.type)}</span>
                            <div>
                              <h4 className="font-medium text-foreground">{suggestion.title}</h4>
                              <Badge 
                                variant="secondary" 
                                className={`text-xs mt-1 ${getTypeColor(suggestion.type)} border-0`}
                              >
                                {suggestion.type}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 neomorph-button"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(suggestion.content);
                              }}
                            >
                              <Copy size={14} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 neomorph-button"
                              onClick={(e) => {
                                e.stopPropagation();
                                insertContent(suggestion.content);
                              }}
                            >
                              <Plus size={14} />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {suggestion.content}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selected Suggestion Detail */}
        <AnimatePresence>
          {selectedSuggestion && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <span>{getTypeIcon(selectedSuggestion.type)}</span>
                  {selectedSuggestion.title}
                </h3>
                <div className="flex gap-2">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 neomorph-button border-0"
                      onClick={() => enhanceContentHandler(selectedSuggestion.content)}
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <MagicWand size={14} />
                          </motion.div>
                          <span className="hidden sm:inline">Enhancing...</span>
                          <span className="sm:hidden">...</span>
                        </>
                      ) : (
                        <>
                          <MagicWand size={14} />
                          Enhance
                        </>
                      )}
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      size="sm"
                      className="gap-2 neomorph-button border-0"
                      onClick={() => insertContent(selectedSuggestion.content)}
                    >
                      <ArrowRight size={14} />
                      Add to Chapter
                    </Button>
                  </motion.div>
                </div>
              </div>
              
              <Card className="neomorph-inset border-0">
                <CardContent className="p-4">
                  <Textarea
                    value={selectedSuggestion.content}
                    onChange={(e) => setSelectedSuggestion({
                      ...selectedSuggestion,
                      content: e.target.value
                    })}
                    className="min-h-[200px] resize-none border-0 bg-transparent text-sm leading-relaxed"
                    placeholder="Content will appear here..."
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}