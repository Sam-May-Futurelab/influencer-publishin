import { useEffect, useRef, useState, useCallback } from 'react';
import { toast } from 'sonner';

interface UseAutoSaveOptions {
  onSave: () => Promise<void> | void;
  delay?: number; // milliseconds
  enabled?: boolean;
}

interface UseAutoSaveReturn {
  saving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  forceSave: () => Promise<void>;
  markAsChanged: () => void;
  markAsSaved: () => void;
}

export function useAutoSave({
  onSave,
  delay = 30000, // 30 seconds default
  enabled = true
}: UseAutoSaveOptions): UseAutoSaveReturn {
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const savingRef = useRef(false);

  const performSave = useCallback(async () => {
    if (savingRef.current || !hasUnsavedChanges) return;
    
    try {
      savingRef.current = true;
      setSaving(true);
      
      await onSave();
      
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      
      // Subtle success indication
      console.log('Auto-saved successfully');
    } catch (error) {
      console.error('Auto-save failed:', error);
      toast.error('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
      savingRef.current = false;
    }
  }, [onSave, hasUnsavedChanges]);

  const forceSave = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    await performSave();
  }, [performSave]);

  const markAsChanged = useCallback(() => {
    if (!enabled) return;
    
    setHasUnsavedChanges(true);
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set new timeout for auto-save
    timeoutRef.current = setTimeout(() => {
      performSave();
    }, delay);
  }, [enabled, delay, performSave]);

  const markAsSaved = useCallback(() => {
    setHasUnsavedChanges(false);
    setLastSaved(new Date());
    
    // Clear timeout since we're manually marking as saved
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Save on page unload if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  // Auto-save on visibility change (when tab becomes hidden)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && hasUnsavedChanges) {
        forceSave();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [hasUnsavedChanges, forceSave]);

  return {
    saving,
    lastSaved,
    hasUnsavedChanges,
    forceSave,
    markAsChanged,
    markAsSaved
  };
}
