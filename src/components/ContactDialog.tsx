import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Send, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface ContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
}

const CONTACT_CATEGORIES = [
  { value: 'support', label: 'Technical Support' },
  { value: 'billing', label: 'Billing & Refunds' },
  { value: 'feature', label: 'Feature Request' },
  { value: 'general', label: 'General Inquiry' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'bug', label: 'Bug Report' },
];

export function ContactDialog({ open, onOpenChange }: ContactDialogProps) {
  const { user } = useAuth();
  const [form, setForm] = useState<ContactForm>({
    name: user?.displayName || '',
    email: user?.email || '',
    subject: '',
    category: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name || !form.email || !form.subject || !form.message || !form.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/contact-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }
      
      toast.success('Message sent! Check your email for confirmation.');
      setForm({ 
        name: user?.displayName || '', 
        email: user?.email || '', 
        subject: '', 
        category: '', 
        message: '' 
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Contact form error:', error);
      toast.error('Failed to send message. Please try again or email us directly at hello@inkfluenceai.com');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ContactForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Contact Support
          </DialogTitle>
          <DialogDescription>
            Send us a message and we'll get back to you within 24 hours
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="Your name"
                value={form.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={form.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={form.category} onValueChange={(value) => handleInputChange('category', value)}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CONTACT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              placeholder="Brief description"
              value={form.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              placeholder="Please provide as much detail as possible..."
              rows={6}
              value={form.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              required
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
