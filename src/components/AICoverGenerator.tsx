import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import { Sparkle, Crown, Download, Image as ImageIcon, Lightning } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const COVER_STYLES = [
  { value: 'realistic', label: 'Realistic', description: 'Photorealistic, professional photography' },
  { value: 'artistic', label: 'Artistic', description: 'Expressive painting with vibrant colors' },
  { value: 'minimalist', label: 'Minimalist', description: 'Clean, modern design' },
  { value: 'dramatic', label: 'Dramatic', description: 'High contrast, moody atmosphere' },
  { value: 'watercolor', label: 'Watercolor', description: 'Soft, artistic illustration' },
  { value: 'vintage', label: 'Vintage', description: 'Retro book cover aesthetic' },
];

const TIER_LIMITS = {
  free: 1,
  creator: 10,
  premium: 50,
};

interface AICoverGeneratorProps {
  onCoverGenerated?: (imageUrl: string) => void;
  projectTitle?: string;
}

export function AICoverGenerator({ onCoverGenerated, projectTitle }: AICoverGeneratorProps) {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState(projectTitle ? `Book cover for: ${projectTitle}` : '');
  const [style, setStyle] = useState('realistic');
  const [generating, setGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [usage, setUsage] = useState({ used: 0, limit: 1, remaining: 1 });
  const [subscriptionStatus, setSubscriptionStatus] = useState<'free' | 'creator' | 'premium'>('free');

  useEffect(() => {
    if (user) {
      loadUsageData();
    }
  }, [user]);

  const loadUsageData = async () => {
    if (!user) return;

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const status = userData.subscriptionStatus || 'free';
        const coverGenerationsUsed = userData.coverGenerationsUsed || 0;
        const lastReset = userData.lastCoverGenerationReset?.toDate() || new Date(0);

        // Check if usage should be reset (new month)
        const now = new Date();
        const monthsSinceReset =
          (now.getFullYear() - lastReset.getFullYear()) * 12 +
          (now.getMonth() - lastReset.getMonth());

        const currentUsage = monthsSinceReset >= 1 ? 0 : coverGenerationsUsed;
        const tierLimit = TIER_LIMITS[status as keyof typeof TIER_LIMITS] || TIER_LIMITS.free;

        setSubscriptionStatus(status);
        setUsage({
          used: currentUsage,
          limit: tierLimit,
          remaining: Math.max(0, tierLimit - currentUsage),
        });
      }
    } catch (error) {
      console.error('Failed to load usage data:', error);
    }
  };

  const handleGenerate = async () => {
    if (!user) {
      toast.error('Please sign in to generate covers');
      return;
    }

    if (!prompt.trim()) {
      toast.error('Please enter a description for your cover');
      return;
    }

    if (usage.remaining <= 0) {
      toast.error(`You've reached your monthly limit of ${usage.limit} cover generations`, {
        description: 'Upgrade your plan for more generations',
      });
      return;
    }

    setGenerating(true);

    try {
      const response = await fetch('/api/generate-cover', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          style,
          userId: user.uid,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          toast.error('Monthly limit reached', {
            description: `You've used all ${data.limit} cover generations this month`,
          });
        } else {
          toast.error(data.error || 'Failed to generate cover');
        }
        return;
      }

      setGeneratedImage(data.imageUrl);
      setUsage({
        used: data.used,
        limit: data.limit,
        remaining: data.remaining,
      });

      toast.success('Cover generated successfully!', {
        description: `${data.remaining} generations remaining this month`,
      });

      if (onCoverGenerated) {
        onCoverGenerated(data.imageUrl);
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Failed to generate cover. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedImage) return;

    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-cover-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Cover downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download cover');
    }
  };

  const getTierBadge = () => {
    switch (subscriptionStatus) {
      case 'premium':
        return <Badge className="bg-gradient-to-r from-amber-400 to-amber-600 text-white"><Crown size={12} className="mr-1" weight="fill" />Premium</Badge>;
      case 'creator':
        return <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"><Sparkle size={12} className="mr-1" weight="fill" />Creator</Badge>;
      default:
        return <Badge variant="outline">Free</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Usage */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Sparkle size={20} className="text-primary" weight="fill" />
            AI Cover Generator
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Create stunning book covers with AI
          </p>
        </div>
        <div className="text-right">
          {getTierBadge()}
          <p className="text-sm font-medium mt-1">
            {usage.remaining} / {usage.limit} left this month
          </p>
        </div>
      </div>

      {/* Generation Form */}
      <Card className="neomorph-flat p-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="prompt">Cover Description</Label>
          <Textarea
            id="prompt"
            placeholder="Describe your book cover... (e.g., 'A mystical forest at twilight with a lone figure walking towards a glowing portal')"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            maxLength={500}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            {prompt.length}/500 characters
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="style">Art Style</Label>
          <Select value={style} onValueChange={setStyle}>
            <SelectTrigger id="style">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COVER_STYLES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  <div>
                    <div className="font-medium">{s.label}</div>
                    <div className="text-xs text-muted-foreground">{s.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={generating || usage.remaining <= 0 || !prompt.trim()}
          className="w-full gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
        >
          {generating ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Lightning size={18} />
              </motion.div>
              Generating...
            </>
          ) : (
            <>
              <Sparkle size={18} weight="fill" />
              Generate Cover
            </>
          )}
        </Button>

        {usage.remaining === 0 && (
          <p className="text-sm text-center text-muted-foreground">
            You've reached your monthly limit. <a href="/pricing" className="text-primary hover:underline">Upgrade for more</a>
          </p>
        )}
      </Card>

      {/* Generated Image Preview */}
      <AnimatePresence>
        {generatedImage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="neomorph-raised p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold flex items-center gap-2">
                    <ImageIcon size={18} className="text-primary" />
                    Generated Cover
                  </h4>
                  <Button
                    onClick={handleDownload}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <Download size={16} />
                    Download
                  </Button>
                </div>
                <div className="relative aspect-square max-w-md mx-auto rounded-lg overflow-hidden neomorph-inset">
                  <img
                    src={generatedImage}
                    alt="Generated book cover"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  Images are hosted temporarily. Download to save permanently.
                </p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tier Info */}
      {subscriptionStatus === 'free' && (
        <Card className="neomorph-flat p-4 bg-gradient-to-br from-primary/5 to-purple-500/5 border border-primary/20">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex-shrink-0">
              <Crown size={20} className="text-white" weight="fill" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold mb-1">Unlock More Generations</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Upgrade to generate more covers per month
              </p>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-normal">Creator</Badge>
                  <span className="text-muted-foreground">10 covers/month</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-gradient-to-r from-amber-400 to-amber-600 text-white font-normal">Premium</Badge>
                  <span className="text-muted-foreground">50 covers/month</span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="mt-3" asChild>
                <a href="/pricing">View Plans</a>
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
