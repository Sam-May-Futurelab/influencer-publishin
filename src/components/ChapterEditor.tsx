import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, PencilSimple, Trash, DotsSixVertical, BookOpen, Star } from '@phosphor-icons/react';
import { AIContentAssistant } from '@/components/AIContentAssistant';
import { SaveIndicator } from '@/components/SaveIndicator';
import { Chapter, InputMode } from '@/lib/types';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useAutoSave } from '@/hooks/use-auto-save';

interface ChapterEditorProps {
  chapters: Chapter[];
  currentChapter: Chapter | null;
  onChapterSelect: (chapter: Chapter) => void;
  onChapterCreate: () => void;
  onChapterUpdate: (id: string, updates: Partial<Chapter>) => void;
  onChapterDelete: (id: string) => void;
  ebookCategory?: string;
}

export function ChapterEditor({
  chapters,
  currentChapter,
  onChapterSelect,
  onChapterCreate,
  onChapterUpdate,
  onChapterDelete,
  ebookCategory = 'general',
}: ChapterEditorProps) {
  const [inputMode, setInputMode] = useState<InputMode>('ai');
  const [editingTitle, setEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState('');
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [pendingContent, setPendingContent] = useState('');

  // Auto-save functionality
  const {
    saving,
    lastSaved,
    hasUnsavedChanges,
    forceSave,
    markAsChanged,
    markAsSaved
  } = useAutoSave({
    onSave: async () => {
      if (currentChapter && pendingContent !== currentChapter.content) {
        onChapterUpdate(currentChapter.id, { 
          content: pendingContent,
          updatedAt: new Date()
        });
      }
    },
    delay: 30000, // 30 seconds
    enabled: !!currentChapter
  });

  const handleTitleEdit = (chapter: Chapter) => {
    setEditingTitle(true);
    setTempTitle(chapter.title);
  };

  const handleTitleSave = () => {
    if (currentChapter && tempTitle.trim()) {
      onChapterUpdate(currentChapter.id, { title: tempTitle.trim() });
      toast.success('Chapter title updated!');
    }
    setEditingTitle(false);
  };

  const handleContentChange = (content: string) => {
    if (currentChapter) {
      setPendingContent(content);
      markAsChanged();
    }
  };

  const handleAIContentGenerated = (generatedContent: string) => {
    if (currentChapter && generatedContent && generatedContent.trim()) {
      const trimmedContent = generatedContent.trim();
      const currentContent = pendingContent || currentChapter.content;
      const newContent = currentContent.trim()
        ? `${currentContent.trim()}\n\n${trimmedContent}`
        : trimmedContent;
      
      setPendingContent(newContent);
      markAsChanged();
      toast.success('AI content added to chapter!');
    } else {
      toast.error('No content to add');
    }
  };

  // Initialize pending content when current chapter changes
  useEffect(() => {
    if (currentChapter) {
      setPendingContent(currentChapter.content);
      markAsSaved(); // Reset auto-save state for new chapter
    }
  }, [currentChapter?.id, currentChapter?.content, markAsSaved]);

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 min-h-0">
      {/* Chapter Sidebar */}
      <motion.div 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-full lg:w-80 flex flex-col"
      >
        <div className="flex items-center justify-between mb-4 lg:mb-6">
          <h2 className="text-lg lg:text-xl font-bold text-foreground">Chapters</h2>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              onClick={onChapterCreate} 
              size="sm" 
              className="gap-2 neomorph-button border-0 h-8 lg:h-10 px-3 lg:px-4 text-sm lg:text-base"
            >
              <Plus size={14} className="lg:hidden" />
              <Plus size={16} className="hidden lg:block" />
              <span className="hidden sm:inline">Add Chapter</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </motion.div>
        </div>
        
        <div className="space-y-2 lg:space-y-3 overflow-auto max-h-60 lg:max-h-96">
          <AnimatePresence>
            {chapters.map((chapter, index) => (
              <motion.div
                key={chapter.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card
                  className={cn(
                    "cursor-pointer transition-all duration-200 neomorph-flat border-0 overflow-hidden",
                    currentChapter?.id === chapter.id && "ring-2 ring-primary/30 neomorph-inset"
                  )}
                  onClick={() => onChapterSelect(chapter)}
                >
                  <CardContent className="p-3 lg:p-5">
                    <div className="flex items-start gap-2 lg:gap-3">
                      <div className="p-1 rounded-lg neomorph-flat mt-1 hidden lg:block">
                        <DotsSixVertical size={14} className="text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 lg:gap-3 mb-1 lg:mb-2">
                          <Badge 
                            variant="secondary" 
                            className="text-xs font-semibold neomorph-flat border-0 px-1.5 lg:px-2 py-0.5 lg:py-1"
                          >
                            {index + 1}
                          </Badge>
                          <h3 className="font-semibold truncate text-foreground text-sm lg:text-base">
                            {chapter.title}
                          </h3>
                        </div>
                        <p className="text-xs lg:text-sm text-muted-foreground line-clamp-2">
                          {chapter.content || 'No content yet...'}
                        </p>
                        <div className="flex justify-between items-center mt-2 lg:mt-3">
                          <span className="text-xs text-muted-foreground">
                            {chapter.content.split(' ').filter(w => w.length > 0).length} words
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 lg:h-6 lg:w-6 p-0 neomorph-button hover:bg-destructive/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              onChapterDelete(chapter.id);
                            }}
                          >
                            <Trash size={10} className="lg:hidden text-muted-foreground hover:text-destructive" />
                            <Trash size={12} className="hidden lg:block text-muted-foreground hover:text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Main Editor */}
      <motion.div 
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="flex-1 flex flex-col w-full"
      >
        {currentChapter ? (
          <>
            {/* Chapter Header */}
            <div className="flex items-center gap-2 lg:gap-4 mb-4 lg:mb-8">
              {editingTitle ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 flex gap-2 lg:gap-3"
                >
                  <Input
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleTitleSave();
                      if (e.key === 'Escape') setEditingTitle(false);
                    }}
                    className="text-xl lg:text-2xl font-bold neomorph-inset border-0 h-12 lg:h-14"
                    autoFocus
                  />
                  <Button 
                    onClick={handleTitleSave} 
                    size="sm"
                    className="neomorph-button border-0 px-4 lg:px-6"
                  >
                    Save
                  </Button>
                </motion.div>
              ) : (
                <div className="flex-1 flex items-center gap-2 lg:gap-3">
                  <h1 className="text-2xl lg:text-3xl font-bold text-foreground truncate">{currentChapter.title}</h1>
                  <div className="flex items-center gap-2">
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="neomorph-button border-0 flex-shrink-0"
                        onClick={() => handleTitleEdit(currentChapter)}
                      >
                        <PencilSimple size={14} className="lg:hidden" />
                        <PencilSimple size={16} className="hidden lg:block" />
                      </Button>
                    </motion.div>
                    {hasUnsavedChanges && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.05 }} 
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={forceSave}
                          disabled={saving}
                          className="neomorph-button border-0 flex-shrink-0 text-xs lg:text-sm px-2 lg:px-3"
                        >
                          {saving ? 'Saving...' : 'Save Now'}
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Input Mode Tabs */}
            <div className="mb-4 lg:mb-6">
              <Tabs value={inputMode} onValueChange={(value) => setInputMode(value as InputMode)}>
                <TabsList className="neomorph-flat border-0 bg-muted/50 p-1 h-10 lg:h-12 w-full lg:w-auto">
                  <TabsTrigger 
                    value="ai" 
                    className="gap-1 lg:gap-2 neomorph-button border-0 data-[state=active]:neomorph-inset data-[state=active]:bg-background text-xs lg:text-sm px-2 lg:px-3"
                  >
                    <Star size={14} className="lg:hidden" />
                    <Star size={16} className="hidden lg:block" />
                    <span className="hidden sm:inline">AI Assistant</span>
                    <span className="sm:hidden">AI</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="text" 
                    className="gap-1 lg:gap-2 neomorph-button border-0 data-[state=active]:neomorph-inset data-[state=active]:bg-background text-xs lg:text-sm px-2 lg:px-3"
                  >
                    <PencilSimple size={14} className="lg:hidden" />
                    <PencilSimple size={16} className="hidden lg:block" />
                    <span className="hidden sm:inline">Text Editor</span>
                    <span className="sm:hidden">Text</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="text" className="mt-4 lg:mt-6">
                  <div className="space-y-3 lg:space-y-4">
                    {/* AI Assistant Toggle */}
                    <div className="flex justify-end">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAIAssistant(!showAIAssistant)}
                          className="gap-1 lg:gap-2 neomorph-button border-0 text-xs lg:text-sm px-2 lg:px-3"
                        >
                          <Star size={12} className="lg:hidden" />
                          <Star size={14} className="hidden lg:block" />
                          <span className="hidden sm:inline">
                            {showAIAssistant ? 'Hide' : 'Show'} AI Assistant
                          </span>
                          <span className="sm:hidden">AI</span>
                        </Button>
                      </motion.div>
                    </div>

                    {/* AI Assistant Panel */}
                    <AnimatePresence>
                      {showAIAssistant && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <AIContentAssistant
                            chapterTitle={currentChapter.title}
                            ebookCategory={ebookCategory}
                            onContentGenerated={handleAIContentGenerated}
                            className="mb-4 lg:mb-6"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <Textarea
                      placeholder="Start writing your chapter content here... or use the AI Assistant above to generate content from keywords"
                      value={pendingContent}
                      onChange={(e) => handleContentChange(e.target.value)}
                      className="min-h-[250px] lg:min-h-[400px] resize-none neomorph-inset border-0 text-sm lg:text-base leading-relaxed"
                    />
                    
                    {/* Word count and save indicator */}
                    <div className="flex justify-between items-center pt-2 text-xs">
                      <div className="flex items-center gap-4">
                        <span className="text-muted-foreground">
                          {pendingContent.split(' ').filter(w => w.length > 0).length} words
                        </span>
                        <SaveIndicator 
                          saving={saving}
                          lastSaved={lastSaved}
                          hasUnsavedChanges={hasUnsavedChanges}
                        />
                      </div>
                      <span className="text-muted-foreground">
                        {pendingContent.length > 0 ? 'Content ready for export' : 'Start typing or use AI to generate content'}
                      </span>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="ai" className="mt-4 lg:mt-6">
                  <div className="space-y-4 lg:space-y-6">
                    <AIContentAssistant
                      chapterTitle={currentChapter.title}
                      ebookCategory={ebookCategory}
                      onContentGenerated={handleAIContentGenerated}
                    />
                    
                    <div className="space-y-2 lg:space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-foreground">Chapter Content</h3>
                        <Badge variant="secondary" className="text-xs neomorph-flat border-0">
                          {pendingContent.split(' ').filter(w => w.length > 0).length} words
                        </Badge>
                      </div>
                      <Textarea
                        placeholder="AI-generated content will appear here, or you can edit directly..."
                        value={pendingContent}
                        onChange={(e) => handleContentChange(e.target.value)}
                        className="min-h-[200px] lg:min-h-[300px] resize-none neomorph-inset border-0 text-sm lg:text-base leading-relaxed"
                      />
                      
                      {/* Content status and save indicator */}
                      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center pt-2 text-xs gap-2 lg:gap-0">
                        <div className="flex items-center gap-4">
                          <span className="text-muted-foreground">
                            {pendingContent.length > 0 ? '✅ Content ready' : '⏳ Waiting for content'}
                          </span>
                          <SaveIndicator 
                            saving={saving}
                            lastSaved={lastSaved}
                            hasUnsavedChanges={hasUnsavedChanges}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">Last updated: {new Date(currentChapter.updatedAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex items-center justify-center"
          >
            <div className="text-center max-w-md">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="p-6 lg:p-8 rounded-full neomorph-flat w-24 lg:w-32 h-24 lg:h-32 flex items-center justify-center mx-auto mb-6 lg:mb-8"
              >
                <BookOpen size={32} className="lg:hidden text-primary" />
                <BookOpen size={48} className="hidden lg:block text-primary" />
              </motion.div>
              <h2 className="text-xl lg:text-2xl font-bold mb-3 lg:mb-4 text-foreground">No Chapter Selected</h2>
              <p className="text-muted-foreground mb-6 lg:mb-8 leading-relaxed text-sm lg:text-base">
                Create or select a chapter to start writing your ebook content
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={onChapterCreate} 
                  className="gap-2 lg:gap-3 h-10 lg:h-12 px-6 lg:px-8 neomorph-button border-0 text-base lg:text-lg"
                  size="lg"
                >
                  <Plus size={16} className="lg:hidden" />
                  <Plus size={18} className="hidden lg:block" />
                  <span className="hidden sm:inline">Create Your First Chapter</span>
                  <span className="sm:hidden">Create Chapter</span>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}