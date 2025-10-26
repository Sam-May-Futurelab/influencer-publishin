import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Keyboard } from '@phosphor-icons/react';

export function KeyboardShortcutsDialog() {
  const [open, setOpen] = useState(false);
  
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modKey = isMac ? '⌘' : 'Ctrl';

  // Listen for Cmd/Ctrl + /
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        setOpen(true);
      }
      // ESC to close
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  const shortcuts = [
    {
      category: 'General',
      items: [
        { keys: [modKey, 'S'], description: 'Save current project' },
        { keys: [modKey, '/'], description: 'Show keyboard shortcuts' },
        { keys: [modKey, 'D'], description: 'Go to Dashboard' },
        { keys: [modKey, 'H'], description: 'Open Help Center' },
        { keys: ['ESC'], description: 'Close dialogs' },
      ]
    },
    {
      category: 'Dashboard',
      items: [
        { keys: [modKey, 'N'], description: 'Focus new project input' },
      ]
    },
    {
      category: 'Editor',
      items: [
        { keys: [modKey, 'K'], description: 'Open AI Assistant' },
        { keys: [modKey, 'B'], description: 'Bold text' },
        { keys: [modKey, 'I'], description: 'Italic text' },
        { keys: [modKey, 'U'], description: 'Underline text' },
        { keys: [modKey, 'Z'], description: 'Undo' },
        { keys: [modKey, 'Shift', 'Z'], description: 'Redo' },
      ]
    },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Keyboard className="w-5 h-5 text-primary" />
            </div>
            <DialogTitle>Keyboard Shortcuts</DialogTitle>
          </div>
          <DialogDescription>
            Speed up your workflow with these keyboard shortcuts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {shortcuts.map((section) => (
            <div key={section.category}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                {section.category}
              </h3>
              <div className="space-y-2">
                {section.items.map((shortcut, index) => (
                  <Card key={index} className="neomorph-flat border-0">
                    <CardContent className="p-3 flex items-center justify-between">
                      <span className="text-sm">{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <div key={keyIndex} className="flex items-center gap-1">
                            <Badge 
                              variant="secondary" 
                              className="font-mono text-xs px-2 py-1"
                            >
                              {key}
                            </Badge>
                            {keyIndex < shortcut.keys.length - 1 && (
                              <span className="text-muted-foreground text-xs">+</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground text-center">
            Press {modKey}+/ anytime to show this dialog
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
