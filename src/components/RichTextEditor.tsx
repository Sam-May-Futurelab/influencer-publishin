import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import CharacterCount from '@tiptap/extension-character-count';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
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
  TextAa
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = 'Start writing...',
  className,
  minHeight = '400px'
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      CharacterCount,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg focus:outline-none max-w-none p-4',
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

      {/* Editor Content */}
      <div 
        className="overflow-auto" 
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
        <div className="flex items-center gap-2">
          {editor.can().undo() && (
            <span className="text-primary">• Unsaved changes</span>
          )}
        </div>
      </div>
    </div>
  );
}
