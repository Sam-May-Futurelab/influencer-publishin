import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Info } from '@phosphor-icons/react';

interface AudiobookSplitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  originalChapterCount: number;
  newChapterCount: number;
  projectTitle: string;
}

export function AudiobookSplitDialog({
  open,
  onOpenChange,
  onConfirm,
  originalChapterCount,
  newChapterCount,
  projectTitle
}: AudiobookSplitDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-500" />
            Split Chapters for Audiobook?
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3 pt-2">
            <p>
              Some chapters in <span className="font-semibold text-foreground">"{projectTitle}"</span> are too long for audiobook generation.
            </p>
            
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current chapters:</span>
                <span className="font-semibold text-foreground">{originalChapterCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">After splitting:</span>
                <span className="font-semibold text-foreground">{newChapterCount}</span>
              </div>
            </div>
            
            <p className="text-sm">
              We'll create a new project called <span className="font-semibold text-foreground">"{projectTitle} (Audiobook)"</span> with optimized chapter lengths. Your original project will remain unchanged.
            </p>
            
            <p className="text-xs text-muted-foreground">
              Long chapters will be split into parts (e.g., "Chapter 1 (Part 1)", "Chapter 1 (Part 2)"). The generated audio files will be automatically merged back into single files per chapter.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-primary hover:bg-primary/90">
            Create Audio Version
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
