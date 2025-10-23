import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, PencilSimple, Trash, DotsSixVertical, BookOpen, Star, Eye, FloppyDisk, CaretLeft, CaretRight, ArrowUp, ArrowDown, BookmarkSimple } from '@phosphor-icons/react';
import { AIContentAssistant } from '@/components/AIContentAssistant';
import { SaveIndicator } from '@/components/SaveIndicator';
import { RichTextEditor } from '@/components/RichTextEditor';
import { Chapter, InputMode, ContentSnippet } from '@/lib/types';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useAutoSave } from '@/hooks/use-auto-save';
import { useAuth } from '@/hooks/use-auth';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { saveSnippet } from '@/lib/snippets';
import { enhanceContent } from '@/lib/openai-service-secure';

interface ChapterEditorProps {
  chapters: Chapter[];
  currentChapter: Chapter | null;
  onChapterSelect: (chapter: Chapter) => void;
  onChapterCreate: () => void;
  onChapterUpdate: (id: string, updates: Partial<Chapter>) => void;
  onChapterDelete: (id: string) => void;
  onChapterReorder: (startIndex: number, endIndex: number) => void;
  onRecordWritingSession?: (projectId: string, chapterId: string, wordsAdded: number) => void;
  projectId?: string;
  ebookCategory?: string;
  targetAudience?: string;
  projectTitle?: string;
  projectAuthor?: string;
  projectDescription?: string;
  brandConfig?: any;
}

export function ChapterEditor({
  chapters,
  currentChapter,
  onChapterSelect,
  onChapterCreate,
  onChapterUpdate,
  onChapterDelete,
  onChapterReorder,
  onRecordWritingSession,
  projectId,
  ebookCategory = 'general',
  targetAudience,
  projectTitle = 'Untitled Project',
  projectAuthor = '',
  projectDescription = '',
  brandConfig,
}: ChapterEditorProps) {
  const { userProfile, user } = useAuth();
  const isPremium = userProfile?.isPremium || false;
  
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [editingTitle, setEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState('');
  const [pendingContent, setPendingContent] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [autoSaveInterval, setAutoSaveInterval] = useState(30000); // Default 30 seconds
  
  // Snippet saving state
  const [showSnippetDialog, setShowSnippetDialog] = useState(false);
  const [snippetTitle, setSnippetTitle] = useState('');
  const [snippetCategory, setSnippetCategory] = useState<ContentSnippet['category']>('other');
  const [snippetContent, setSnippetContent] = useState('');
  const [savingSnippet, setSavingSnippet] = useState(false);

  // Load auto-save interval from settings
  useEffect(() => {
    const settings = localStorage.getItem('ebookCrafterSettings');
    if (settings) {
      const parsed = JSON.parse(settings);
      // Convert seconds to milliseconds
      setAutoSaveInterval((parsed.autoSaveInterval || 30) * 1000);
    }
  }, []);

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
        // Calculate words added/removed
        const oldWordCount = currentChapter.content?.split(/\s+/).filter(word => word.length > 0).length || 0;
        const newWordCount = pendingContent?.split(/\s+/).filter(word => word.length > 0).length || 0;
        const wordsAdded = newWordCount - oldWordCount;

        onChapterUpdate(currentChapter.id, { 
          content: pendingContent,
          updatedAt: new Date()
        });

        // Record writing session if words were added
        if (wordsAdded > 0 && onRecordWritingSession && projectId) {
          onRecordWritingSession(projectId, currentChapter.id, wordsAdded);
        }
      }
    },
    delay: autoSaveInterval,
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
      toast.success('✨ AI magic added to your chapter!', {
        description: 'Your new content is ready to edit and customize.',
        duration: 3000
      });
    } else {
      toast.error('No content to add');
    }
  };

  const handleSaveAsSnippet = () => {
    // Get selected text from the editor
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim() || '';
    
    if (!selectedText) {
      toast.error('Please select some text first');
      return;
    }
    
    // Set the content and open dialog
    setSnippetContent(selectedText);
    setSnippetTitle(''); // Reset title
    setSnippetCategory('other'); // Reset category
    setShowSnippetDialog(true);
  };

  const handleSnippetSave = async () => {
    if (!user?.uid) {
      toast.error('You must be logged in to save snippets');
      return;
    }
    
    if (!snippetTitle.trim()) {
      toast.error('Please enter a title for your snippet');
      return;
    }
    
    setSavingSnippet(true);
    try {
      await saveSnippet(user.uid, {
        title: snippetTitle.trim(),
        content: snippetContent,
        category: snippetCategory,
        tags: []
      });
      
      toast.success('Snippet saved successfully!');
      setShowSnippetDialog(false);
      setSnippetTitle('');
      setSnippetContent('');
      setSnippetCategory('other');
    } catch (error) {
      console.error('Failed to save snippet:', error);
      toast.error('Failed to save snippet. Please try again.');
    } finally {
      setSavingSnippet(false);
    }
  };

  // Handle AI text enhancement
  const handleAIEnhancement = async (selectedText: string): Promise<string> => {
    if (!currentChapter) {
      throw new Error('No active chapter');
    }

    try {
      const enhanced = await enhanceContent(selectedText, currentChapter.title, {
        genre: ebookCategory || 'general',
        context: {
          targetAudience: targetAudience || 'general audience',
          bookDescription: projectDescription
        }
      });
      
      return enhanced;
    } catch (error) {
      console.error('AI enhancement failed:', error);
      throw error;
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
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 min-h-0 relative">
      {/* Collapse/Expand Toggle - Always visible */}
      <div className="flex items-start pt-2 lg:relative lg:w-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="neomorph-button border-0 h-10 w-10 p-0 rounded-full shadow-lg hover:scale-110 transition-transform"
          title={sidebarCollapsed ? "Show chapters" : "Hide chapters"}
        >
          {sidebarCollapsed ? <CaretRight size={18} weight="bold" /> : <CaretLeft size={18} weight="bold" />}
        </Button>
      </div>

      {/* Collapsible Chapter Sidebar */}
      <AnimatePresence>
        {!sidebarCollapsed && (
          <motion.div 
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="w-full lg:w-72 flex flex-col neomorph-inset rounded-xl p-4 bg-background/50 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-foreground">Chapters</h2>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={onChapterCreate} 
                  size="sm" 
                  className="gap-1.5 neomorph-button border-0 h-8 px-3 text-xs"
                >
                  <Plus size={14} weight="bold" />
                  Add
                </Button>
              </motion.div>
            </div>
            
            <div className="space-y-2 overflow-auto flex-1 chapter-list">
              <AnimatePresence>
                {chapters.map((chapter, index) => (
                  <motion.div
                    key={chapter.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="group relative"
                  >
                    <div
                      className={cn(
                        "flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-all",
                        currentChapter?.id === chapter.id 
                          ? "neomorph-inset bg-primary/10 ring-2 ring-primary/30" 
                          : "neomorph-flat hover:neomorph-hover"
                      )}
                      onClick={() => onChapterSelect(chapter)}
                    >
                      {/* Reorder Arrows */}
                      <div className="flex flex-col gap-0.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={index === 0}
                          className="h-4 w-4 p-0 hover:bg-muted/50 disabled:opacity-30"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (index > 0) onChapterReorder(index, index - 1);
                          }}
                        >
                          <ArrowUp size={10} weight="bold" className="text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={index === chapters.length - 1}
                          className="h-4 w-4 p-0 hover:bg-muted/50 disabled:opacity-30"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (index < chapters.length - 1) onChapterReorder(index, index + 1);
                          }}
                        >
                          <ArrowDown size={10} weight="bold" className="text-muted-foreground" />
                        </Button>
                      </div>

                      {/* Chapter Number */}
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          "text-xs font-bold border-0 px-1.5 py-0.5 min-w-[24px] justify-center",
                          currentChapter?.id === chapter.id ? "bg-primary text-primary-foreground" : "neomorph-flat"
                        )}
                      >
                        {index + 1}
                      </Badge>

                      {/* Chapter Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">
                          {chapter.title}
                        </h3>
                        <span className="text-xs text-muted-foreground">
                          {chapter.content?.split(' ').filter(w => w.length > 0).length || 0} words
                        </span>
                      </div>

                      {/* Delete Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          onChapterDelete(chapter.id);
                        }}
                      >
                        <Trash size={12} className="text-destructive" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
                  <div className="flex items-center gap-1 lg:gap-2 flex-shrink-0">
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="neomorph-button border-0 flex-shrink-0 h-9 w-9 p-0"
                        onClick={() => handleTitleEdit(currentChapter)}
                      >
                        <PencilSimple size={16} />
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
                          size="sm"
                          onClick={forceSave}
                          disabled={saving}
                          className="neomorph-button border-0 flex-shrink-0 text-xs lg:text-sm px-2 lg:px-4 h-9 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold shadow-lg gap-1 lg:gap-2"
                        >
                          <FloppyDisk size={16} weight="fill" />
                          <span className="hidden sm:inline">{saving ? 'Saving...' : 'Save Now'}</span>
                          <span className="sm:hidden">{saving ? '...' : 'Save'}</span>
                        </Button>
                      </motion.div>
                    )}
                    
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        size="sm"
                        onClick={handleSaveAsSnippet}
                        variant="outline"
                        className="neomorph-button border-0 flex-shrink-0 text-xs lg:text-sm px-2 lg:px-4 h-9 gap-1 lg:gap-2"
                        title="Save selected text as a reusable snippet"
                      >
                        <BookmarkSimple size={16} weight="bold" />
                        <span className="hidden md:inline">Snippet</span>
                      </Button>
                    </motion.div>
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
                  <TabsTrigger 
                    value="preview" 
                    className="gap-1 lg:gap-2 neomorph-button border-0 data-[state=active]:neomorph-inset data-[state=active]:bg-background text-xs lg:text-sm px-2 lg:px-3"
                  >
                    <Eye size={14} className="lg:hidden" />
                    <Eye size={16} className="hidden lg:block" />
                    <span className="hidden sm:inline">Chapter Preview</span>
                    <span className="sm:hidden">Preview</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="text" className="mt-4 lg:mt-6">
                  <RichTextEditor
                    content={pendingContent}
                    onChange={handleContentChange}
                    placeholder="Start writing your chapter content here..."
                    minHeight="250px"
                    className="lg:min-h-[400px]"
                    onAIAssistantClick={() => setInputMode('ai')}
                    chapterTitle={currentChapter?.title}
                    onAIEnhanceSelected={handleAIEnhancement}
                  />
                  
                  {/* Save indicator */}
                  <div className="flex justify-end items-center pt-2 text-xs">
                    <SaveIndicator 
                      saving={saving}
                      lastSaved={lastSaved}
                      hasUnsavedChanges={hasUnsavedChanges}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="ai" className="mt-4 lg:mt-6">
                  <div className="space-y-4 lg:space-y-6">
                    <AIContentAssistant
                      chapterTitle={currentChapter.title}
                      ebookCategory={ebookCategory}
                      targetAudience={targetAudience}
                      chapterNumber={chapters.findIndex(ch => ch.id === currentChapter.id) + 1}
                      totalChapters={chapters.length}
                      onContentGenerated={handleAIContentGenerated}
                      isPremium={isPremium}
                    />
                    
                    <div className="space-y-2 lg:space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-foreground">Chapter Content</h3>
                      </div>
                      <RichTextEditor
                        content={pendingContent}
                        onChange={handleContentChange}
                        placeholder="AI-generated content will appear here, or you can edit directly..."
                        minHeight="200px"
                        className="lg:min-h-[300px]"
                        chapterTitle={currentChapter.title}
                        onAIEnhanceSelected={handleAIEnhancement}
                      />
                      
                      {/* Content status and save indicator */}
                      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center pt-2 text-xs gap-2 lg:gap-0">
                        <div className="flex items-center gap-4">
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

                <TabsContent value="preview" className="mt-4 lg:mt-6">
                  <div className="max-w-4xl mx-auto">
                    {/* Ebook Preview - Title Page */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-8 mb-8 neomorph-inset rounded-xl p-8"
                    >
                      <h1 
                        className="text-3xl lg:text-4xl font-bold mb-4"
                        style={{ color: brandConfig?.primaryColor || '#8B5CF6' }}
                      >
                        {projectTitle}
                      </h1>
                      {projectAuthor && (
                        <p className="text-lg text-muted-foreground mb-4">
                          by {projectAuthor}
                        </p>
                      )}
                      {projectDescription && (
                        <p className="text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                          {projectDescription}
                        </p>
                      )}
                      
                      <div className="flex justify-center gap-4 mt-6">
                        <Badge 
                          variant="secondary" 
                          className="neomorph-flat border-0"
                          style={{ 
                            backgroundColor: brandConfig?.accentColor || '#EDE9FE',
                            color: brandConfig?.primaryColor || '#8B5CF6'
                          }}
                        >
                          {chapters.length} {chapters.length === 1 ? 'Chapter' : 'Chapters'}
                        </Badge>
                        <Badge 
                          variant="secondary" 
                          className="neomorph-flat border-0"
                          style={{ 
                            backgroundColor: brandConfig?.accentColor || '#EDE9FE',
                            color: brandConfig?.primaryColor || '#8B5CF6'
                          }}
                        >
                          {chapters.reduce((total, ch) => {
                            if (!ch.content) return total;
                            // Strip HTML tags for accurate word count
                            const textContent = ch.content.replace(/<[^>]*>/g, ' ');
                            return total + textContent.split(/\s+/).filter(w => w.length > 0).length;
                          }, 0).toLocaleString()} Words
                        </Badge>
                      </div>
                    </motion.div>

                    {/* Current Chapter Preview */}
                    {currentChapter && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6 neomorph-inset rounded-xl p-6 lg:p-8"
                      >
                        <div className="flex items-center gap-3 mb-6">
                          <Badge 
                            variant="outline"
                            className="neomorph-flat border-0 px-3 py-1"
                            style={{ 
                              backgroundColor: brandConfig?.secondaryColor || '#A78BFA',
                              color: 'white'
                            }}
                          >
                            Chapter {chapters.findIndex(ch => ch.id === currentChapter.id) + 1}
                          </Badge>
                          <h2 
                            className="text-xl lg:text-2xl font-bold"
                            style={{ color: brandConfig?.primaryColor || '#8B5CF6' }}
                          >
                            {currentChapter.title}
                          </h2>
                        </div>

                        {pendingContent ? (
                          <div 
                            className="prose prose-sm sm:prose lg:prose-lg max-w-none"
                            style={{ 
                              fontFamily: brandConfig?.fontFamily || 'Inter, sans-serif',
                            }}
                            dangerouslySetInnerHTML={{ __html: pendingContent }}
                          />
                        ) : (
                          <div className="text-center py-12 text-muted-foreground">
                            <Eye size={48} className="mx-auto mb-4 opacity-50" />
                            <p className="text-lg">No content yet</p>
                            <p className="text-sm mt-2">Start writing in the Text Editor or use AI Assistant</p>
                          </div>
                        )}
                      </motion.div>
                    )}
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
      
      {/* Floating Save Button - Always accessible when changes exist */}
      <AnimatePresence>
        {hasUnsavedChanges && currentChapter && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-6 right-6 z-50"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              size="lg"
              onClick={forceSave}
              disabled={saving}
              className="neomorph-button border-0 h-14 w-14 rounded-full shadow-2xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white p-0 relative group"
              title={saving ? 'Saving...' : 'Save Now'}
            >
              <motion.div
                animate={saving ? { rotate: 360 } : {}}
                transition={saving ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
              >
                <FloppyDisk size={24} weight="fill" />
              </motion.div>
              
              {/* Tooltip */}
              <span className="absolute right-full mr-3 px-3 py-1.5 bg-foreground text-background text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {saving ? 'Saving changes...' : 'Click to save now'}
              </span>
              
              {/* Pulse effect when unsaved */}
              {!saving && (
                <motion.span
                  className="absolute inset-0 rounded-full bg-green-500"
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save Snippet Dialog */}
      <Dialog open={showSnippetDialog} onOpenChange={setShowSnippetDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Save as Snippet</DialogTitle>
            <DialogDescription>
              Save this content as a reusable snippet. You can quickly insert it into any chapter from the AI Assistant.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="snippet-title">Title</Label>
              <Input
                id="snippet-title"
                placeholder="e.g., Welcome Message, Chapter Conclusion"
                value={snippetTitle}
                onChange={(e) => setSnippetTitle(e.target.value)}
                className="neomorph-inset border-0"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="snippet-category">Category</Label>
              <Select value={snippetCategory} onValueChange={(value) => setSnippetCategory(value as ContentSnippet['category'])}>
                <SelectTrigger id="snippet-category" className="neomorph-inset border-0">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="intro">Introduction</SelectItem>
                  <SelectItem value="conclusion">Conclusion</SelectItem>
                  <SelectItem value="cta">Call-to-Action</SelectItem>
                  <SelectItem value="tip">Tip/Advice</SelectItem>
                  <SelectItem value="quote">Quote</SelectItem>
                  <SelectItem value="transition">Transition</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Content Preview */}
            <div className="space-y-2">
              <Label>Content Preview</Label>
              <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground max-h-32 overflow-y-auto neomorph-inset">
                {snippetContent}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSnippetDialog(false)}
              disabled={savingSnippet}
              className="neomorph-button border-0"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSnippetSave}
              disabled={savingSnippet || !snippetTitle.trim()}
              className="neomorph-button border-0 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white gap-2"
            >
              <BookmarkSimple size={16} weight="fill" />
              {savingSnippet ? 'Saving...' : 'Save Snippet'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}