import { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Mic, MicOff, Edit3, Trash2, GripVertical } from '@phosphor-icons/react';
import { useVoiceRecording } from '@/hooks/use-voice-recording';
import { Chapter, InputMode } from '@/lib/types';
import { cn } from '@/lib/utils';

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
    <div className="flex h-full gap-6">
      {/* Chapter Sidebar */}
      <div className="w-80 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Chapters</h2>
          <Button onClick={onChapterCreate} size="sm" className="gap-2">
            <Plus size={16} />
            Add Chapter
          </Button>
        </div>
        
        <div className="space-y-2 flex-1 overflow-auto">
          {chapters.map((chapter, index) => (
            <Card
              key={chapter.id}
              className={cn(
                "cursor-pointer transition-colors hover:bg-accent/50",
                currentChapter?.id === chapter.id && "bg-accent"
              )}
              onClick={() => onChapterSelect(chapter)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <GripVertical size={16} className="text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {index + 1}
                      </Badge>
                      <h3 className="font-medium truncate">{chapter.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {chapter.content || 'No content yet...'}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onChapterDelete(chapter.id);
                    }}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 flex flex-col">
        {currentChapter ? (
          <>
            {/* Chapter Header */}
            <div className="flex items-center gap-4 mb-6">
              {editingTitle ? (
                <div className="flex-1 flex gap-2">
                  <Input
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleTitleSave();
                      if (e.key === 'Escape') setEditingTitle(false);
                    }}
                    className="text-2xl font-bold"
                    autoFocus
                  />
                  <Button onClick={handleTitleSave} size="sm">Save</Button>
                </div>
              ) : (
                <div className="flex-1 flex items-center gap-2">
                  <h1 className="text-2xl font-bold">{currentChapter.title}</h1>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTitleEdit(currentChapter)}
                  >
                    <Edit3 size={16} />
                  </Button>
                </div>
              )}
            </div>

            {/* Input Mode Tabs */}
            <Tabs value={inputMode} onValueChange={(value) => setInputMode(value as InputMode)} className="mb-4">
              <TabsList>
                <TabsTrigger value="text" className="gap-2">
                  <Edit3 size={16} />
                  Text
                </TabsTrigger>
                <TabsTrigger value="voice" className="gap-2" disabled={!isSupported}>
                  <Mic size={16} />
                  Voice
                  {!isSupported && <Badge variant="destructive" className="ml-2 text-xs">Not Supported</Badge>}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="mt-4">
                <Textarea
                  placeholder="Start writing your chapter content..."
                  value={currentChapter.content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  className="min-h-[400px] resize-none"
                />
              </TabsContent>

              <TabsContent value="voice" className="mt-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={handleVoiceToggle}
                      variant={isRecording ? "destructive" : "default"}
                      className="gap-2"
                      disabled={!isSupported}
                    >
                      {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
                      {isRecording ? 'Stop Recording' : 'Start Recording'}
                    </Button>
                    
                    {isRecording && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        Recording...
                      </div>
                    )}
                  </div>

                  {transcript && (
                    <Card>
                      <CardHeader>
                        <h3 className="text-sm font-medium">Live Transcript</h3>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{transcript}</p>
                      </CardContent>
                    </Card>
                  )}

                  <Textarea
                    placeholder="Your voice content will appear here, or type directly..."
                    value={currentChapter.content}
                    onChange={(e) => handleContentChange(e.target.value)}
                    className="min-h-[400px] resize-none"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">No Chapter Selected</h2>
              <p className="text-muted-foreground mb-4">
                Create or select a chapter to start writing your ebook
              </p>
              <Button onClick={onChapterCreate} className="gap-2">
                <Plus size={16} />
                Create Your First Chapter
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}