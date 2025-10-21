import { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import CharacterCount from '@tiptap/extension-character-count';
import TextAlign from '@tiptap/extension-text-align';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  TextB, 
  TextItalic, 
  TextUnderline, 
  TextHOne, 
  TextHTwo,
  ListBullets,
  ListNumbers,
  ArrowULeftUp,
  ArrowURightUp,
  TextAa,
  Sparkle,
  TextAlignLeft,
  TextAlignCenter,
  TextAlignRight,
  TextAlignJustify,
  Microphone,
  MicrophoneSlash
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoiceInput } from '@/hooks/use-voice-input';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
  onAIAssistantClick?: () => void;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = 'Start writing...',
  className,
  minHeight = '400px',
  onAIAssistantClick
}: RichTextEditorProps) {
  const [lineHeight, setLineHeight] = useState('1.6');

  // Voice input hook
  const {
    transcript,
    interimTranscript,
    isListening,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    error
  } = useVoiceInput();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      CharacterCount,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg focus:outline-none max-w-none p-4',
        style: `line-height: ${lineHeight}`,
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Update editor content when prop changes (e.g., switching chapters)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Insert voice transcript into editor
  useEffect(() => {
    if (editor && transcript) {
      // Show transcript briefly before inserting
      const timeoutId = setTimeout(() => {
        const cursorPosition = editor.state.selection.from;
        
        // Insert transcript at cursor position
        editor.chain().focus().insertContentAt(cursorPosition, transcript + ' ').run();
        
        // Reset transcript after inserting
        resetTranscript();
      }, 1500); // Show for 1.5 seconds before inserting

      return () => clearTimeout(timeoutId);
    }
  }, [transcript, editor, resetTranscript]);

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Update line height dynamically
  useEffect(() => {
    if (editor) {
      editor.view.dom.style.lineHeight = lineHeight;
    }
  }, [lineHeight, editor]);

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({ 
    onClick, 
    isActive, 
    icon: Icon, 
    label,
    disabled = false
  }: { 
    onClick: () => void; 
    isActive?: boolean; 
    icon: any; 
    label: string;
    disabled?: boolean;
  }) => (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant="ghost"
      size="sm"
      className={cn(
        "h-8 w-8 p-0 neomorph-button border-0",
        isActive && "neomorph-inset bg-primary/10 text-primary"
      )}
      title={label}
      type="button"
    >
      <Icon size={16} weight={isActive ? "fill" : "regular"} />
    </Button>
  );

  return (
    <div className={cn("neomorph-inset rounded-lg border-0 bg-background", className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border/50">
        {/* AI Assistant Button - Prominent placement */}
        {onAIAssistantClick && (
          <>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={onAIAssistantClick}
                className="h-8 px-3 gap-1.5 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 border-0"
                size="sm"
                type="button"
              >
                <Sparkle size={16} weight="fill" />
                <span className="font-medium">AI Assistant</span>
              </Button>
            </motion.div>
            <Separator orientation="vertical" className="h-6 mx-1" />
          </>
        )}

        {/* Voice Input Button */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={handleVoiceToggle}
            className={cn(
              "h-8 px-3 gap-1.5 border-0",
              isListening 
                ? "bg-gradient-to-r from-red-500 to-red-600 text-white animate-pulse" 
                : "bg-muted hover:bg-muted/80"
            )}
            size="sm"
            type="button"
            disabled={!isSupported}
            title={isSupported ? (isListening ? "Stop recording" : "Start voice input") : "Voice input not supported"}
          >
            {isListening ? (
              <MicrophoneSlash size={16} weight="fill" />
            ) : (
              <Microphone size={16} weight="fill" />
            )}
            <span className="font-medium">
              {isListening ? "Recording..." : "Voice"}
            </span>
          </Button>
        </motion.div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Undo/Redo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          icon={ArrowULeftUp}
          label="Undo (⌘Z)"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          icon={ArrowURightUp}
          label="Redo (⌘⇧Z)"
        />

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Text Formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          icon={TextB}
          label="Bold (⌘B)"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          icon={TextItalic}
          label="Italic (⌘I)"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          icon={TextUnderline}
          label="Underline (⌘U)"
        />

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Headings */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          icon={TextHOne}
          label="Heading 1"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          icon={TextHTwo}
          label="Heading 2"
        />

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          icon={ListBullets}
          label="Bullet List"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          icon={ListNumbers}
          label="Numbered List"
        />

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Text Alignment */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          icon={TextAlignLeft}
          label="Align Left"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          icon={TextAlignCenter}
          label="Align Center"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
          icon={TextAlignRight}
          label="Align Right"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          isActive={editor.isActive({ textAlign: 'justify' })}
          icon={TextAlignJustify}
          label="Justify"
        />

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Line Spacing */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground hidden md:inline">Line:</span>
          <Select value={lineHeight} onValueChange={setLineHeight}>
            <SelectTrigger className="h-8 w-16 neomorph-button border-0 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1.0">1.0</SelectItem>
              <SelectItem value="1.2">1.2</SelectItem>
              <SelectItem value="1.4">1.4</SelectItem>
              <SelectItem value="1.6">1.6</SelectItem>
              <SelectItem value="1.8">1.8</SelectItem>
              <SelectItem value="2.0">2.0</SelectItem>
              <SelectItem value="2.5">2.5</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Clear Formatting */}
        <Button
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs neomorph-button border-0"
          title="Clear formatting"
          type="button"
        >
          <TextAa size={16} />
          <span className="ml-1 hidden sm:inline">Clear</span>
        </Button>
      </div>

      {/* Voice Feedback Overlay */}
      <AnimatePresence>
        {(isListening || interimTranscript || transcript) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative"
          >
            <div className="absolute inset-x-0 top-0 z-10 mx-4 mt-2">
              <div className="neomorph-card bg-background/95 backdrop-blur-sm border border-border/50 rounded-lg p-3 shadow-lg">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {isListening && (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="w-3 h-3 bg-red-500 rounded-full"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-muted-foreground mb-1">
                      {isListening ? "Listening..." : "Voice Input"}
                    </div>
                    {interimTranscript && (
                      <div className="text-sm text-muted-foreground italic">
                        {interimTranscript}
                      </div>
                    )}
                    {transcript && (
                      <div className="text-sm font-medium text-foreground">
                        {transcript}
                      </div>
                    )}
                    {isListening && !interimTranscript && (
                      <div className="text-sm text-muted-foreground">
                        Start speaking...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor Content */}
      <div 
        className="overflow-auto relative" 
        style={{ minHeight }}
      >
        <EditorContent editor={editor} />
      </div>

      {/* Status Bar */}
      <div className="flex justify-between items-center px-4 py-2 border-t border-border/50 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>{editor.storage.characterCount?.words() || 0} words</span>
          <span>{editor.storage.characterCount?.characters() || 0} characters</span>
        </div>
      </div>
    </div>
  );
}
