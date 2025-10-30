import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen } from '@phosphor-icons/react';

interface ProjectSetupData {
  title: string;
  category: string;
  targetAudience: string;
  description: string;
}

interface ProjectSetupDialogProps {
  open: boolean;
  initialTitle: string;
  onComplete: (data: ProjectSetupData) => void;
  onSkip: () => void;
}

const categories = [
  { value: 'business', label: '💼 Business & Finance' },
  { value: 'marketing', label: '📈 Marketing & Sales' },
  { value: 'self-help', label: '✨ Self-Help & Personal Growth' },
  { value: 'health', label: '🏃 Health & Wellness' },
  { value: 'technology', label: '💻 Technology & Programming' },
  { value: 'fiction', label: '📚 Fiction & Creative Writing' },
  { value: 'education', label: '🎓 Education & Teaching' },
  { value: 'cookbook', label: '🍳 Food & Recipes' },
  { value: 'travel', label: '✈️ Travel & Adventure' },
  { value: 'parenting', label: '👶 Parenting & Family' },
  { value: 'general', label: '📖 General Non-Fiction' },
];

export function ProjectSetupDialog({ open, initialTitle, onComplete, onSkip }: ProjectSetupDialogProps) {
  
  const [formData, setFormData] = useState<ProjectSetupData>({
    title: initialTitle,
    category: 'general',
    targetAudience: '',
    description: '',
  });

  // Update title when initialTitle changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, title: initialTitle }));
  }, [initialTitle]);

  const handleSubmit = () => {
    // Validate title length
    if (formData.title.length > 100) {
      return; // Prevent submission if title too long
    }
    onComplete(formData);
  };

  const isValid = formData.title.trim().length > 0 && 
                  formData.title.length <= 100;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[550px]" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <BookOpen className="w-5 h-5 text-primary" weight="duotone" />
            Set Up Your Project
          </DialogTitle>
          <DialogDescription className="text-sm">
            Add details to help AI generate better content suggestions
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Project Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., The Ultimate Guide to Digital Marketing"
              maxLength={120}
            />
            {formData.title.length > 0 && (
              <p className={`text-xs ${formData.title.length > 100 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {formData.title.length}/100 characters
              </p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">
              Category <span className="text-muted-foreground text-xs font-normal">(Optional)</span>
            </Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Target Audience */}
          <div className="space-y-2">
            <Label htmlFor="audience" className="text-sm font-medium">
              Target Audience <span className="text-muted-foreground text-xs font-normal">(Optional)</span>
            </Label>
            <Input
              id="audience"
              value={formData.targetAudience}
              onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
              placeholder="e.g., Small business owners, aspiring entrepreneurs"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description <span className="text-muted-foreground text-xs font-normal">(Optional)</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What's this ebook about? This helps AI understand your goals..."
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Info Note */}
          <div className="bg-muted/50 rounded-lg p-3 border">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Tip:</strong> These details help AI generate content tailored to your audience
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 mt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onSkip}
            className="flex-1 sm:flex-none"
          >
            Skip for Now
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={!isValid}
            className="flex-1 sm:flex-none"
          >
            Save & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
