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

const LOADING_MESSAGES = [
  "🎨 Mixing colors and creativity...",
  "✨ Crafting your unique design...",
  "🖼️ Painting your masterpiece...",
  "🌟 Adding artistic touches...",
  "🎭 Perfecting the composition...",
  "💫 Almost there...",
];

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
  onUpgradeClick?: () => void;
  design?: any;
  onDesignUpdate?: (updates: any) => void;
}

export function AICoverGenerator({ onCoverGenerated, projectTitle, onUpgradeClick, design, onDesignUpdate }: AICoverGeneratorProps) {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState(projectTitle ? `${projectTitle}` : '');
  const [style, setStyle] = useState('realistic');
  const [includeText, setIncludeText] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [usage, setUsage] = useState({ used: 0, limit: 1, remaining: 1 });
  const [subscriptionStatus, setSubscriptionStatus] = useState<'free' | 'creator' | 'premium'>('free');
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  // Cycle through loading messages
  useEffect(() => {
    if (generating) {
      const interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 3000);
      return () => clearInterval(interval);
    } else {
      setLoadingMessageIndex(0);
    }
  }, [generating]);

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
          includeText,
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
        description: `${data.remaining} left this month`,
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
            {usage.remaining} left this month
          </p>
        </div>
      </div>

      {/* Generation Form */}
      <Card className="neomorph-flat p-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="prompt">Cover Description</Label>
          <Textarea
            id="prompt"
            placeholder={`Describe the visual concept for your cover... (e.g., "An open book glowing with magical light in a dark library" or "Abstract geometric shapes in gold and navy blue")`}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            maxLength={300}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            {prompt.length}/300 • Focus on: scenery, objects, symbols, colors, mood. Avoid mentioning people/faces unless essential
          </p>
          
          {/* Example Prompts */}
          {!prompt && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Quick examples:</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setPrompt("Ancient leather-bound book with glowing golden edges on dark wooden table")}
                  className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                >
                  📚 Classic Book
                </button>
                <button
                  onClick={() => setPrompt("Abstract flowing waves in deep blue and gold gradient, modern and elegant")}
                  className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                >
                  🎨 Abstract Art
                </button>
                <button
                  onClick={() => setPrompt("Misty mountain landscape at sunrise with golden light breaking through clouds")}
                  className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                >
                  🏔️ Nature Scene
                </button>
                <button
                  onClick={() => setPrompt("Futuristic digital network with glowing nodes and connections in cyan and purple")}
                  className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                >
                  🚀 Tech/Modern
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="style">Art Style</Label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger id="style" className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {COVER_STYLES.map((s) => (
                  <SelectItem key={s.value} value={s.value} className="hover:bg-accent focus:bg-accent">
                    <div>
                      <div className="font-medium">{s.label}</div>
                      <div className="text-xs text-muted-foreground">{s.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="includeText" className="flex items-center gap-2">
              Include Title Text
              <Badge variant="outline" className="text-xs">Beta</Badge>
            </Label>
            <div className="flex items-center gap-3 h-10 px-4 rounded-md border border-input bg-background">
              <span className={`text-sm font-medium ${!includeText ? 'text-foreground' : 'text-muted-foreground'}`}>
                No Text
              </span>
              <button
                id="includeText"
                onClick={() => setIncludeText(!includeText)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  includeText ? 'bg-gradient-to-r from-primary to-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${
                    includeText ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm font-medium ${includeText ? 'text-foreground' : 'text-muted-foreground'}`}>
                With Text
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {includeText ? 'AI will attempt to add your title (may not be perfect)' : 'Pure imagery without text (recommended)'}
            </p>
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={generating || usage.remaining <= 0 || !prompt.trim()}
          className="w-full gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 min-h-[60px]"
        >
          {generating ? (
            <div className="flex flex-col items-center gap-2 py-1">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkle size={20} weight="fill" />
                </motion.div>
                <span className="text-sm font-semibold">Generating Cover...</span>
              </div>
              <AnimatePresence mode="wait">
                <motion.span
                  key={loadingMessageIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="text-xs opacity-90"
                >
                  {LOADING_MESSAGES[loadingMessageIndex]}
                </motion.span>
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Sparkle size={18} weight="fill" />
              Generate Cover
            </>
          )}
        </Button>

        {/* Tips */}
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <p className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-1">💡 Tips for best results:</p>
          <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-0.5 ml-4 list-disc">
            <li>Describe visuals and mood, not the title (e.g., "mystical forest" not "My Book Title")</li>
            <li>Keep text toggle OFF for cleaner results - add your title later in the editor</li>
            <li>Be specific about colors, lighting, and atmosphere</li>
            <li>Mention key visual elements (landscapes, objects, characters)</li>
          </ul>
        </div>

        {usage.remaining === 0 && (
          <p className="text-sm text-center text-muted-foreground">
            You've reached your monthly limit. <button onClick={onUpgradeClick} className="text-primary hover:underline font-medium">Upgrade for more</button>
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
                  AI-generated cover • Adjust settings below to customize
                </p>
                
                {/* Image Adjustment Controls */}
                {design && onDesignUpdate && (
                  <div className="space-y-4 pt-4 border-t">
                    <h5 className="text-sm font-semibold">Fine-tune Your Cover</h5>
                    
                    {/* Overlay Toggle */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Dark Overlay (helps text stand out)</Label>
                        <button
                          onClick={() => onDesignUpdate({ overlay: !design.overlay })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${
                            design.overlay ? 'bg-gradient-to-r from-primary to-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${
                              design.overlay ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      {design.overlay && (
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Overlay Opacity: {design.overlayOpacity}%</Label>
                          <input
                            type="range"
                            min="0"
                            max="80"
                            value={design.overlayOpacity}
                            onChange={(e) => onDesignUpdate({ overlayOpacity: parseInt(e.target.value) })}
                            className="w-full"
                          />
                        </div>
                      )}
                    </div>

                    {/* Brightness */}
                    <div className="space-y-1">
                      <Label className="text-xs">Brightness: {design.imageBrightness}%</Label>
                      <input
                        type="range"
                        min="50"
                        max="150"
                        value={design.imageBrightness}
                        onChange={(e) => onDesignUpdate({ imageBrightness: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    </div>

                    {/* Contrast */}
                    <div className="space-y-1">
                      <Label className="text-xs">Contrast: {design.imageContrast}%</Label>
                      <input
                        type="range"
                        min="50"
                        max="150"
                        value={design.imageContrast}
                        onChange={(e) => onDesignUpdate({ imageContrast: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    </div>

                    {/* Image Fit */}
                    <div className="space-y-2 pt-2 border-t">
                      <Label className="text-sm font-semibold">Image Fit</Label>
                      <Select
                        value={design.imagePosition || 'cover'}
                        onValueChange={(value: any) => onDesignUpdate({ imagePosition: value })}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cover">Cover (Fill & crop to fit)</SelectItem>
                          <SelectItem value="contain">Contain (Fit inside, no crop)</SelectItem>
                          <SelectItem value="fill">Fill (Stretch to fill)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        {design.imagePosition === 'cover' && '• Fills the cover, cropping edges if needed'}
                        {design.imagePosition === 'contain' && '• Shows full image, may have empty space'}
                        {design.imagePosition === 'fill' && '• Stretches to fill, may distort image'}
                      </p>
                    </div>

                    {/* Image Alignment */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Image Alignment</Label>
                      <Select
                        value={design.imageAlignment || 'center'}
                        onValueChange={(value: any) => onDesignUpdate({ imageAlignment: value })}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="top">Top</SelectItem>
                          <SelectItem value="center">Center</SelectItem>
                          <SelectItem value="bottom">Bottom</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        • Position the image vertically on the cover
                      </p>
                    </div>
                  </div>
                )}
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
              <Button variant="outline" size="sm" className="mt-3" onClick={onUpgradeClick}>
                View Plans
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
