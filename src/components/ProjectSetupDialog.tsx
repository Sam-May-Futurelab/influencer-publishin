import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, User, Target, FileText } from '@phosphor-icons/react';
import { useAuth } from '@/hooks/use-auth';

interface ProjectSetupData {
  title: string;
  author: string;
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
  const { userProfile } = useAuth();
  
  const [formData, setFormData] = useState<ProjectSetupData>({
    title: initialTitle,
    author: userProfile?.displayName || '',
    category: 'general',
    targetAudience: '',
    description: '',
  });

  // Update author when userProfile changes
  useEffect(() => {
    if (userProfile?.displayName && !formData.author) {
      setFormData(prev => ({ ...prev, author: userProfile.displayName || '' }));
    }
  }, [userProfile]);

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
                  formData.title.length <= 100 && 
                  formData.author.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[600px]" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <BookOpen className="w-6 h-6 text-blue-600" weight="fill" />
            Set Up Your Project
          </DialogTitle>
          <DialogDescription>
            Optional: Add details to get better AI suggestions (you can skip and add this later)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Project Title * {formData.title.length > 0 && (
                <span className={`text-xs ${formData.title.length > 100 ? 'text-red-500' : 'text-muted-foreground'}`}>
                  ({formData.title.length}/100)
                </span>
              )}
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., The Ultimate Guide to Digital Marketing"
              className="text-base"
              maxLength={120}
            />
            {formData.title.length > 100 && (
              <p className="text-xs text-red-500">Title should be 100 characters or less for best compatibility</p>
            )}
          </div>

          {/* Author */}
          <div className="space-y-2">
            <Label htmlFor="author" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Author Name *
            </Label>
            <Input
              id="author"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              placeholder="Your name"
              className="text-base"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Category
            </Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger id="category" className="text-base">
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
            <Label htmlFor="audience" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Target Audience
              <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
            </Label>
            <Input
              id="audience"
              value={formData.targetAudience}
              onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
              placeholder="e.g., Small business owners, aspiring entrepreneurs"
              className="text-base"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Short Description
              <span className="text-xs text-muted-foreground font-normal ml-2">(Optional)</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What's this ebook about? This helps the AI understand your goals..."
              rows={3}
              className="text-base resize-none"
            />
          </div>

          {/* Tip */}
          <div className="space-y-1">
            <p className="text-sm text-foreground">
              <strong>💡 Pro Tip:</strong> Adding more details helps our AI generate more relevant content suggestions tailored to your specific audience and goals.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={onSkip}
            className="flex-1 sm:flex-none"
          >
            Skip - Start Writing Now
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
