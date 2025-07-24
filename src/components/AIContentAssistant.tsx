import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, ArrowRight, Copy, Plus, Wand2, Lightbulb } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface AIContentAssistantProps {
  chapterTitle: string;
  ebookCategory?: string;
  onContentGenerated: (content: string) => void;
  className?: string;
}

interface ContentSuggestion {
  id: string;
  title: string;
  content: string;
  type: 'outline' | 'introduction' | 'tips' | 'conclusion';
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
      // Create enhanced prompt for content generation
      const prompt = spark.llmPrompt`
        You are an expert content creator helping to write an engaging chapter for an ebook.
        
        Chapter Title: ${chapterTitle}
        Ebook Category: ${ebookCategory}
        Keywords/Topics: ${keywords}
        
        Please generate 4 different content suggestions:
        1. A detailed chapter outline with main points and subpoints
        2. An engaging introduction paragraph that hooks the reader
        3. A list of 5-7 practical tips or key insights related to the keywords
        4. A compelling conclusion that summarizes and motivates action
        
        Each suggestion should be substantial (100-300 words), well-structured, and directly relevant to the keywords provided. 
        Make the content actionable, insightful, and engaging for readers interested in ${ebookCategory}.
        
        Format your response as a JSON array with objects containing:
        - id: unique identifier
        - title: descriptive title for the suggestion
        - content: the actual content text
        - type: one of "outline", "introduction", "tips", "conclusion"
      `;

      const response = await spark.llm(prompt, "gpt-4o", true);
      const generatedSuggestions = JSON.parse(response) as ContentSuggestion[];
      
      setSuggestions(generatedSuggestions);
      toast.success('AI content suggestions generated!');
    } catch (error) {
      console.error('Content generation failed:', error);
      toast.error('Failed to generate content. Please try again.');
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
    onContentGenerated(content);
    toast.success('Content inserted into chapter!');
  };

  const enhanceContent = async (content: string) => {
    setIsGenerating(true);
    try {
      const prompt = spark.llmPrompt`
        Please enhance and expand the following content to be more detailed, engaging, and actionable.
        Keep the same structure but add more depth, examples, and practical insights.
        Target length: 300-500 words.
        
        Original content:
        ${content}
        
        Chapter context: ${chapterTitle}
        Category: ${ebookCategory}
        
        Make it more compelling and valuable for readers.
      `;

      const enhancedContent = await spark.llm(prompt, "gpt-4o");
      
      if (selectedSuggestion) {
        const updatedSuggestion = {
          ...selectedSuggestion,
          content: enhancedContent,
          title: selectedSuggestion.title + ' (Enhanced)'
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
            <Sparkles size={20} className="text-primary" />
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
                      <Wand2 size={16} />
                    </motion.div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Generate
                  </>
                )}
              </Button>
            </motion.div>
          </div>
          
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

        {/* Generated Suggestions */}
        <AnimatePresence>
          {suggestions.length > 0 && (
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
                      onClick={() => enhanceContent(selectedSuggestion.content)}
                      disabled={isGenerating}
                    >
                      <Wand2 size={14} />
                      Enhance
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      size="sm"
                      className="gap-2 neomorph-button border-0"
                      onClick={() => insertContent(selectedSuggestion.content)}
                    >
                      <ArrowRight size={14} />
                      Use This Content
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