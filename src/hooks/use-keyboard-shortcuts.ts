import { useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

interface ShortcutConfig {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  handler: () => void;
  description: string;
  context?: 'global' | 'editor' | 'dashboard';
}

export function useKeyboardShortcuts(
  onSave?: () => void,
  onAIAssist?: () => void,
  onExport?: () => void,
  onNewProject?: () => void,
  onSearch?: () => void
) {
  const navigate = useNavigate();
  const location = useLocation();

  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modifierKey = isMac ? '⌘' : 'Ctrl';

  const shortcuts: ShortcutConfig[] = [
    // Universal shortcuts
    {
      key: 's',
      ctrlKey: !isMac,
      metaKey: isMac,
      handler: () => {
        if (onSave) {
          onSave();
          toast.success('Saved!', { duration: 2000 });
        }
      },
      description: `${modifierKey}+S - Save`,
      context: 'global'
    },
    {
      key: 'k',
      ctrlKey: !isMac,
      metaKey: isMac,
      handler: () => {
        if (onAIAssist) {
          onAIAssist();
        }
      },
      description: `${modifierKey}+K - AI Assistant`,
      context: 'editor'
    },
    {
      key: 'e',
      ctrlKey: !isMac,
      metaKey: isMac,
      handler: () => {
        if (onExport) {
          onExport();
        }
      },
      description: `${modifierKey}+E - Export`,
      context: 'global'
    },
    {
      key: 'n',
      ctrlKey: !isMac,
      metaKey: isMac,
      handler: () => {
        if (onNewProject) {
          onNewProject();
        }
      },
      description: `${modifierKey}+N - New Project`,
      context: 'dashboard'
    },
    {
      key: '/',
      ctrlKey: !isMac,
      metaKey: isMac,
      handler: () => {
        // Show shortcuts dialog
        const shortcutsList = shortcuts
          .map(s => s.description)
          .join('\n');
        toast.info('Keyboard Shortcuts', {
          description: shortcutsList,
          duration: 6000,
        });
      },
      description: `${modifierKey}+/ - Show shortcuts`,
      context: 'global'
    },
    {
      key: 'p',
      ctrlKey: !isMac,
      metaKey: isMac,
      shiftKey: true,
      handler: () => {
        if (onSearch) {
          onSearch();
        }
      },
      description: `${modifierKey}+Shift+P - Quick search`,
      context: 'global'
    },
    {
      key: 'd',
      ctrlKey: !isMac,
      metaKey: isMac,
      handler: () => {
        if (!location.pathname.includes('/app/dashboard')) {
          navigate('/app/dashboard');
        }
      },
      description: `${modifierKey}+D - Go to Dashboard`,
      context: 'global'
    },
    {
      key: 'h',
      ctrlKey: !isMac,
      metaKey: isMac,
      handler: () => {
        if (!location.pathname.includes('/app/help')) {
          navigate('/app/help');
        }
      },
      description: `${modifierKey}+H - Help Center`,
      context: 'global'
    }
  ];

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in input fields (except save)
    const target = event.target as HTMLElement;
    const isInput = target.tagName === 'INPUT' || 
                   target.tagName === 'TEXTAREA' || 
                   target.isContentEditable;

    for (const shortcut of shortcuts) {
      const modifierMatch = 
        (shortcut.ctrlKey === undefined || shortcut.ctrlKey === event.ctrlKey) &&
        (shortcut.metaKey === undefined || shortcut.metaKey === event.metaKey) &&
        (shortcut.shiftKey === undefined || shortcut.shiftKey === event.shiftKey) &&
        (shortcut.altKey === undefined || shortcut.altKey === event.altKey);

      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

      if (modifierMatch && keyMatch) {
        // Always allow save shortcut
        if (shortcut.key === 's') {
          event.preventDefault();
          shortcut.handler();
          return;
        }

        // Skip other shortcuts if in input field
        if (isInput) continue;

        // Check context
        if (shortcut.context === 'editor' && !location.pathname.includes('/project/')) {
          continue;
        }
        if (shortcut.context === 'dashboard' && !location.pathname.includes('/dashboard')) {
          continue;
        }

        event.preventDefault();
        shortcut.handler();
        return;
      }
    }
  }, [shortcuts, location.pathname, onSave, onAIAssist, onExport, onNewProject, onSearch, navigate]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return { shortcuts };
}
