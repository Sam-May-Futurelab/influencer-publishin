import { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Mic, MicOff, Edit3, Trash2, GripVertical, BookOpen } from '@phosphor-icons/react';
import { useVoiceRecording } from '@/hooks/use-voice-recording';
import { Chapter, InputMode } from '@/lib/types';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ChapterEditorProps {
  chapters: Chapter[];
  currentChapter: Chapter | null;
  onChapterSelect: (chapter: Chapter) => void;
  onChapterCreate: () => void;
  onChapterUpdate: (id: string, updates: Partial<Chapter>) => void;
  onChapterDelete: (id: string) => void;
}

export function ChapterEditor({
  chapters,
  currentChapter,
  onChapterSelect,
  onChapterCreate,
  onChapterUpdate,
  onChapterDelete,
}: ChapterEditorProps) {
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [editingTitle, setEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState('');
  
  const {
    isRecording,
    transcript,
    isSupported,
    startRecording,
    stopRecording,
    clearTranscript,
  } = useVoiceRecording();

  const handleTitleEdit = (chapter: Chapter) => {
    setEditingTitle(true);
    setTempTitle(chapter.title);
  };

  const handleTitleSave = () => {
    if (currentChapter && tempTitle.trim()) {
      onChapterUpdate(currentChapter.id, { title: tempTitle.trim() });
    }
    setEditingTitle(false);
  };

  const handleVoiceToggle = () => {
    if (isRecording) {
      stopRecording();
      if (transcript && currentChapter) {
        const newContent = currentChapter.content + (currentChapter.content ? '\n\n' : '') + transcript;
        onChapterUpdate(currentChapter.id, { content: newContent });
        clearTranscript();
      }
    } else {
      startRecording();
    }
  };

  const handleContentChange = (content: string) => {
    if (currentChapter) {
      onChapterUpdate(currentChapter.id, { content });
    }
  };

  return (
    <div className="flex h-full gap-8">
      {/* Chapter Sidebar */}
      <motion.div 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-80 flex flex-col"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Chapters</h2>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              onClick={onChapterCreate} 
              size="sm" 
              className="gap-2 neomorph-button border-0 h-10 px-4"
            >
              <Plus size={16} />
              Add Chapter
            </Button>
          </motion.div>
        </div>
        
        <div className="space-y-3 flex-1 overflow-auto">
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
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="p-1 rounded-lg neomorph-flat mt-1">
                        <GripVertical size={14} className="text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge 
                            variant="secondary" 
                            className="text-xs font-semibold neomorph-flat border-0 px-2 py-1"
                          >
                            {index + 1}
                          </Badge>
                          <h3 className="font-semibold truncate text-foreground">
                            {chapter.title}
                          </h3>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {chapter.content || 'No content yet...'}
                        </p>
                        <div className="flex justify-between items-center mt-3">
                          <span className="text-xs text-muted-foreground">
                            {chapter.content.split(' ').filter(w => w.length > 0).length} words
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 neomorph-button hover:bg-destructive/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              onChapterDelete(chapter.id);
                            }}
                          >
                            <Trash2 size={12} className="text-muted-foreground hover:text-destructive" />
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
        className="flex-1 flex flex-col"
      >
        {currentChapter ? (
          <>
            {/* Chapter Header */}
            <div className="flex items-center gap-4 mb-8">
              {editingTitle ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 flex gap-3"
                >
                  <Input
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleTitleSave();
                      if (e.key === 'Escape') setEditingTitle(false);
                    }}
                    className="text-2xl font-bold neomorph-inset border-0 h-14"
                    autoFocus
                  />
                  <Button 
                    onClick={handleTitleSave} 
                    size="sm"
                    className="neomorph-button border-0 px-6"
                  >
                    Save
                  </Button>
                </motion.div>
              ) : (
                <div className="flex-1 flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-foreground">{currentChapter.title}</h1>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="neomorph-button border-0"
                      onClick={() => handleTitleEdit(currentChapter)}
                    >
                      <Edit3 size={16} />
                    </Button>
                  </motion.div>
                </div>
              )}
            </div>

            {/* Input Mode Tabs */}
            <div className="mb-6">
              <Tabs value={inputMode} onValueChange={(value) => setInputMode(value as InputMode)}>
                <TabsList className="neomorph-flat border-0 bg-muted/50 p-1 h-12">
                  <TabsTrigger 
                    value="text" 
                    className="gap-2 neomorph-button border-0 data-[state=active]:neomorph-inset data-[state=active]:bg-background"
                  >
                    <Edit3 size={16} />
                    Text Editor
                  </TabsTrigger>
                  <TabsTrigger 
                    value="voice" 
                    className="gap-2 neomorph-button border-0 data-[state=active]:neomorph-inset data-[state=active]:bg-background" 
                    disabled={!isSupported}
                  >
                    <Mic size={16} />
                    Voice Input
                    {!isSupported && (
                      <Badge variant="destructive" className="ml-2 text-xs">
                        Not Supported
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="text" className="mt-6">
                  <Textarea
                    placeholder="Start writing your chapter content here..."
                    value={currentChapter.content}
                    onChange={(e) => handleContentChange(e.target.value)}
                    className="min-h-[500px] resize-none neomorph-inset border-0 text-base leading-relaxed"
                  />
                </TabsContent>

                <TabsContent value="voice" className="mt-6">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          onClick={handleVoiceToggle}
                          variant={isRecording ? "destructive" : "default"}
                          className="gap-3 h-12 px-6 neomorph-button border-0"
                          disabled={!isSupported}
                        >
                          {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
                          {isRecording ? 'Stop Recording' : 'Start Recording'}
                        </Button>
                      </motion.div>
                      
                      <AnimatePresence>
                        {isRecording && (
                          <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex items-center gap-3 text-sm text-muted-foreground"
                          >
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                            <span className="font-medium">Recording in progress...</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <AnimatePresence>
                      {transcript && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                        >
                          <Card className="neomorph-flat border-0">
                            <CardHeader className="pb-3">
                              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <div className="w-2 h-2 bg-accent rounded-full" />
                                Live Transcript
                              </h3>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <p className="text-sm leading-relaxed">{transcript}</p>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <Textarea
                      placeholder="Your voice content will appear here, or type directly..."
                      value={currentChapter.content}
                      onChange={(e) => handleContentChange(e.target.value)}
                      className="min-h-[400px] resize-none neomorph-inset border-0 text-base leading-relaxed"
                    />
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
                className="p-8 rounded-full neomorph-flat w-32 h-32 flex items-center justify-center mx-auto mb-8"
              >
                <BookOpen size={48} className="text-primary" />
              </motion.div>
              <h2 className="text-2xl font-bold mb-4 text-foreground">No Chapter Selected</h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Create or select a chapter to start writing your ebook content
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={onChapterCreate} 
                  className="gap-3 h-12 px-8 neomorph-button border-0 text-lg"
                  size="lg"
                >
                  <Plus size={18} />
                  Create Your First Chapter
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}