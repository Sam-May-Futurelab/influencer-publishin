import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Palette,
  Image as ImageIcon,
  TextT,
  Download,
  Sparkle,
  UploadSimple,
} from '@phosphor-icons/react';
import { toast } from 'sonner';

interface CoverDesign {
  title: string;
  subtitle: string;
  authorName: string;
  backgroundType: 'solid' | 'gradient' | 'image';
  backgroundColor: string;
  gradientStart: string;
  gradientEnd: string;
  gradientDirection: 'to-br' | 'to-tr' | 'to-r' | 'to-b';
  backgroundImage?: string;
  titleFont: string;
  titleSize: number;
  titleColor: string;
  subtitleFont: string;
  subtitleSize: number;
  subtitleColor: string;
  authorFont: string;
  authorSize: number;
  authorColor: string;
  overlay: boolean;
  overlayOpacity: number;
}

interface CoverDesignerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectTitle: string;
  onSave: (design: CoverDesign, imageData: string) => void;
  initialDesign?: Partial<CoverDesign>;
}

const FONTS = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Playfair Display', label: 'Playfair Display' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Lora', label: 'Lora' },
  { value: 'Merriweather', label: 'Merriweather' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Bebas Neue', label: 'Bebas Neue' },
];

const COVER_TEMPLATES = [
  {
    id: 'minimal',
    name: 'Minimal',
    preview: '🎯',
    design: {
      backgroundType: 'solid' as const,
      backgroundColor: '#1a1a1a',
      titleColor: '#ffffff',
      subtitleColor: '#a0a0a0',
      authorColor: '#ffffff',
      titleFont: 'Montserrat',
      subtitleFont: 'Inter',
      authorFont: 'Inter',
      titleSize: 48,
      subtitleSize: 20,
      authorSize: 18,
    },
  },
  {
    id: 'gradient-blue',
    name: 'Ocean Wave',
    preview: '🌊',
    design: {
      backgroundType: 'gradient' as const,
      gradientStart: '#667eea',
      gradientEnd: '#764ba2',
      gradientDirection: 'to-br' as const,
      titleColor: '#ffffff',
      subtitleColor: '#e0e0e0',
      authorColor: '#ffffff',
      titleFont: 'Playfair Display',
      subtitleFont: 'Inter',
      authorFont: 'Inter',
      titleSize: 52,
      subtitleSize: 22,
      authorSize: 18,
    },
  },
  {
    id: 'gradient-sunset',
    name: 'Sunset Glow',
    preview: '🌅',
    design: {
      backgroundType: 'gradient' as const,
      gradientStart: '#f857a6',
      gradientEnd: '#ff5858',
      gradientDirection: 'to-br' as const,
      titleColor: '#ffffff',
      subtitleColor: '#fef0f0',
      authorColor: '#ffffff',
      titleFont: 'Bebas Neue',
      subtitleFont: 'Open Sans',
      authorFont: 'Open Sans',
      titleSize: 56,
      subtitleSize: 20,
      authorSize: 18,
    },
  },
  {
    id: 'gradient-forest',
    name: 'Forest Dream',
    preview: '🌲',
    design: {
      backgroundType: 'gradient' as const,
      gradientStart: '#0f2027',
      gradientEnd: '#2c5364',
      gradientDirection: 'to-br' as const,
      titleColor: '#ffffff',
      subtitleColor: '#b8d4db',
      authorColor: '#ffffff',
      titleFont: 'Merriweather',
      subtitleFont: 'Lora',
      authorFont: 'Lora',
      titleSize: 46,
      subtitleSize: 22,
      authorSize: 18,
    },
  },
  {
    id: 'modern-bold',
    name: 'Bold Modern',
    preview: '⚡',
    design: {
      backgroundType: 'gradient' as const,
      gradientStart: '#ff6b6b',
      gradientEnd: '#4ecdc4',
      gradientDirection: 'to-r' as const,
      titleColor: '#ffffff',
      subtitleColor: '#ffffff',
      authorColor: '#ffffff',
      titleFont: 'Bebas Neue',
      subtitleFont: 'Roboto',
      authorFont: 'Roboto',
      titleSize: 60,
      subtitleSize: 24,
      authorSize: 20,
    },
  },
  {
    id: 'elegant',
    name: 'Elegant Classic',
    preview: '✨',
    design: {
      backgroundType: 'solid' as const,
      backgroundColor: '#2d3748',
      titleColor: '#f7fafc',
      subtitleColor: '#cbd5e0',
      authorColor: '#e2e8f0',
      titleFont: 'Playfair Display',
      subtitleFont: 'Merriweather',
      authorFont: 'Inter',
      titleSize: 50,
      subtitleSize: 20,
      authorSize: 16,
    },
  },
];

export function CoverDesigner({
  open,
  onOpenChange,
  projectTitle,
  onSave,
  initialDesign,
}: CoverDesignerProps) {
  const [design, setDesign] = useState<CoverDesign>({
    title: projectTitle || 'Your Book Title',
    subtitle: 'A compelling subtitle that draws readers in',
    authorName: 'Author Name',
    backgroundType: 'gradient',
    backgroundColor: '#8B5CF6',
    gradientStart: '#667eea',
    gradientEnd: '#764ba2',
    gradientDirection: 'to-br',
    titleFont: 'Playfair Display',
    titleSize: 52,
    titleColor: '#ffffff',
    subtitleFont: 'Inter',
    subtitleSize: 22,
    subtitleColor: '#e0e0e0',
    authorFont: 'Inter',
    authorSize: 18,
    authorColor: '#ffffff',
    overlay: false,
    overlayOpacity: 40,
    ...initialDesign,
  });

  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateDesign = (updates: Partial<CoverDesign>) => {
    setDesign((prev) => ({ ...prev, ...updates }));
  };

  const applyTemplate = (template: typeof COVER_TEMPLATES[0]) => {
    updateDesign({
      ...template.design,
      title: design.title,
      subtitle: design.subtitle,
      authorName: design.authorName,
    });
    toast.success(`Applied ${template.name} template`);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        updateDesign({
          backgroundType: 'image',
          backgroundImage: event.target?.result as string,
        });
        toast.success('Background image uploaded');
      };
      reader.readAsDataURL(file);
    }
  };

  const exportCover = async () => {
    if (!canvasRef.current) return;

    try {
      // Use html2canvas library or similar - for now we'll use a simple approach
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas dimensions (standard ebook cover: 1600x2560)
      canvas.width = 1600;
      canvas.height = 2560;

      // Draw background
      if (design.backgroundType === 'gradient') {
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, design.gradientStart);
        gradient.addColorStop(1, design.gradientEnd);
        ctx.fillStyle = gradient;
      } else if (design.backgroundType === 'image' && design.backgroundImage) {
        const img = new Image();
        img.src = design.backgroundImage;
        await new Promise((resolve) => {
          img.onload = resolve;
        });
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Add overlay if enabled
        if (design.overlay) {
          ctx.fillStyle = `rgba(0, 0, 0, ${design.overlayOpacity / 100})`;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      } else {
        ctx.fillStyle = design.backgroundColor;
      }
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw text elements
      const drawText = (
        text: string,
        font: string,
        size: number,
        color: string,
        y: number,
        align: 'center' | 'left' | 'right' = 'center'
      ) => {
        ctx.fillStyle = color;
        ctx.font = `${size * 3}px ${font}`;
        ctx.textAlign = align;
        const x = align === 'center' ? canvas.width / 2 : align === 'left' ? 100 : canvas.width - 100;
        ctx.fillText(text, x, y);
      };

      // Title
      drawText(design.title, design.titleFont, design.titleSize, design.titleColor, canvas.height * 0.4);

      // Subtitle
      drawText(design.subtitle, design.subtitleFont, design.subtitleSize, design.subtitleColor, canvas.height * 0.5);

      // Author
      drawText(design.authorName, design.authorFont, design.authorSize, design.authorColor, canvas.height * 0.85);

      const imageData = canvas.toDataURL('image/png');
      onSave(design, imageData);
      toast.success('Cover saved successfully!');
      onOpenChange(false);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export cover');
    }
  };

  const getBackgroundStyle = () => {
    if (design.backgroundType === 'gradient') {
      return {
        background: `linear-gradient(${design.gradientDirection}, ${design.gradientStart}, ${design.gradientEnd})`,
      };
    } else if (design.backgroundType === 'image' && design.backgroundImage) {
      return {
        backgroundImage: `url(${design.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    } else {
      return {
        backgroundColor: design.backgroundColor,
      };
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1800px] w-[98vw] max-h-[95vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 lg:p-8 pb-4 lg:pb-6 border-b">
          <DialogTitle className="text-2xl lg:text-3xl font-bold flex items-center gap-3">
            <div className="p-2.5 rounded-xl neomorph-flat">
              <Palette size={28} className="text-primary" />
            </div>
            Cover Designer
          </DialogTitle>
          <DialogDescription className="text-base mt-2">
            Create a stunning cover for your ebook with templates and customization
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row min-h-0">
          {/* Preview Panel */}
          <div className="lg:w-[45%] p-6 lg:p-10 flex items-center justify-center bg-muted/20 border-r">
            <div className="space-y-6 w-full max-w-xl">
              <div className="text-sm font-semibold text-muted-foreground text-center uppercase tracking-wide">
                Live Preview
              </div>
              <div
                ref={canvasRef}
                className="relative aspect-[5/8] rounded-2xl shadow-2xl overflow-hidden mx-auto max-w-md"
                style={getBackgroundStyle()}
              >
                {/* Overlay */}
                {design.backgroundType === 'image' && design.overlay && (
                  <div
                    className="absolute inset-0"
                    style={{ backgroundColor: `rgba(0, 0, 0, ${design.overlayOpacity / 100})` }}
                  />
                )}

                {/* Text Content */}
                <div className="relative h-full flex flex-col items-center justify-center p-12 text-center">
                  <h1
                    className="font-bold leading-tight mb-6"
                    style={{
                      fontFamily: design.titleFont,
                      fontSize: `${design.titleSize}px`,
                      color: design.titleColor,
                    }}
                  >
                    {design.title}
                  </h1>
                  <p
                    className="mb-auto max-w-md"
                    style={{
                      fontFamily: design.subtitleFont,
                      fontSize: `${design.subtitleSize}px`,
                      color: design.subtitleColor,
                    }}
                  >
                    {design.subtitle}
                  </p>
                  <p
                    className="mt-auto uppercase tracking-wider font-medium"
                    style={{
                      fontFamily: design.authorFont,
                      fontSize: `${design.authorSize}px`,
                      color: design.authorColor,
                    }}
                  >
                    {design.authorName}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Controls Panel */}
          <div className="lg:w-[55%] overflow-y-auto p-6 lg:p-10">
            <Tabs defaultValue="templates" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6 h-12">
                <TabsTrigger value="templates" className="gap-2 text-base">
                  <Sparkle size={18} />
                  <span className="hidden sm:inline">Templates</span>
                </TabsTrigger>
                <TabsTrigger value="background" className="gap-2 text-base">
                  <ImageIcon size={18} />
                  <span className="hidden sm:inline">Background</span>
                </TabsTrigger>
                <TabsTrigger value="text" className="gap-2 text-base">
                  <TextT size={18} />
                  <span className="hidden sm:inline">Text</span>
                </TabsTrigger>
              </TabsList>

              {/* Templates Tab */}
              <TabsContent value="templates" className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Choose a Template</Label>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Start with a professionally designed template and customize it to match your book
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 lg:gap-6">
                  {COVER_TEMPLATES.map((template) => (
                    <Card
                      key={template.id}
                      className="cursor-pointer neomorph-flat border-0 hover:neomorph-raised transition-all hover:scale-[1.02]"
                      onClick={() => applyTemplate(template)}
                    >
                      <CardContent className="p-5 lg:p-6 text-center space-y-3">
                        <div className="text-5xl lg:text-6xl mb-3">{template.preview}</div>
                        <div className="text-base lg:text-lg font-semibold">{template.name}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Background Tab */}
              <TabsContent value="background" className="space-y-6">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Background Type</Label>
                    <Select
                      value={design.backgroundType}
                      onValueChange={(value: any) => updateDesign({ backgroundType: value })}
                    >
                      <SelectTrigger className="h-12 text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="solid" className="text-base py-3">Solid Color</SelectItem>
                        <SelectItem value="gradient" className="text-base py-3">Gradient</SelectItem>
                        <SelectItem value="image" className="text-base py-3">Image</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {design.backgroundType === 'solid' && (
                    <div className="space-y-3">
                      <Label className="text-base font-medium">Background Color</Label>
                      <div className="flex gap-3">
                        <Input
                          type="color"
                          value={design.backgroundColor}
                          onChange={(e) => updateDesign({ backgroundColor: e.target.value })}
                          className="w-24 h-12 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={design.backgroundColor}
                          onChange={(e) => updateDesign({ backgroundColor: e.target.value })}
                          className="flex-1 h-12 text-base"
                        />
                      </div>
                    </div>
                  )}

                  {design.backgroundType === 'gradient' && (
                    <>
                      <div className="space-y-3">
                        <Label className="text-base font-medium">Start Color</Label>
                        <div className="flex gap-3">
                          <Input
                            type="color"
                            value={design.gradientStart}
                            onChange={(e) => updateDesign({ gradientStart: e.target.value })}
                            className="w-24 h-12 cursor-pointer"
                          />
                          <Input
                            type="text"
                            value={design.gradientStart}
                            onChange={(e) => updateDesign({ gradientStart: e.target.value })}
                            className="flex-1 h-12 text-base"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-base font-medium">End Color</Label>
                        <div className="flex gap-3">
                          <Input
                            type="color"
                            value={design.gradientEnd}
                            onChange={(e) => updateDesign({ gradientEnd: e.target.value })}
                            className="w-24 h-12 cursor-pointer"
                          />
                          <Input
                            type="text"
                            value={design.gradientEnd}
                            onChange={(e) => updateDesign({ gradientEnd: e.target.value })}
                            className="flex-1 h-12 text-base"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-base font-medium">Gradient Direction</Label>
                        <Select
                          value={design.gradientDirection}
                          onValueChange={(value: any) => updateDesign({ gradientDirection: value })}
                        >
                          <SelectTrigger className="h-12 text-base">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="to-br" className="text-base py-3">Diagonal (↘)</SelectItem>
                            <SelectItem value="to-tr" className="text-base py-3">Diagonal (↗)</SelectItem>
                            <SelectItem value="to-r" className="text-base py-3">Horizontal (→)</SelectItem>
                            <SelectItem value="to-b" className="text-base py-3">Vertical (↓)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  {design.backgroundType === 'image' && (
                    <>
                      <div className="space-y-3">
                        <Label className="text-base font-medium">Upload Image</Label>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <Button
                          variant="outline"
                          className="w-full h-12 text-base"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <UploadSimple size={20} className="mr-2" />
                          Choose Image
                        </Button>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                          <Label className="text-base font-medium">Dark Overlay</Label>
                          <input
                            type="checkbox"
                            checked={design.overlay}
                            onChange={(e) => updateDesign({ overlay: e.target.checked })}
                            className="w-5 h-5 rounded cursor-pointer"
                          />
                        </div>

                        {design.overlay && (
                          <div className="space-y-3">
                            <Label className="text-base font-medium">Overlay Opacity: {design.overlayOpacity}%</Label>
                            <Slider
                              value={[design.overlayOpacity]}
                              onValueChange={([value]) => updateDesign({ overlayOpacity: value })}
                              min={0}
                              max={100}
                              step={5}
                              className="py-2"
                            />
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </TabsContent>

              {/* Text Tab */}
              <TabsContent value="text" className="space-y-6">
                {/* Title */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Title</Label>
                  <Input
                    value={design.title}
                    onChange={(e) => updateDesign({ title: e.target.value })}
                    placeholder="Your Book Title"
                    className="h-12 text-base"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Font</Label>
                      <Select
                        value={design.titleFont}
                        onValueChange={(value) => updateDesign({ titleFont: value })}
                      >
                        <SelectTrigger className="h-11 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FONTS.map((font) => (
                            <SelectItem key={font.value} value={font.value} className="text-sm py-2.5">
                              {font.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Size: {design.titleSize}px</Label>
                      <Slider
                        value={[design.titleSize]}
                        onValueChange={([value]) => updateDesign({ titleSize: value })}
                        min={24}
                        max={80}
                        step={2}
                        className="py-2"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Color</Label>
                    <div className="flex gap-3">
                      <Input
                        type="color"
                        value={design.titleColor}
                        onChange={(e) => updateDesign({ titleColor: e.target.value })}
                        className="w-24 h-11 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={design.titleColor}
                        onChange={(e) => updateDesign({ titleColor: e.target.value })}
                        className="flex-1 h-11 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Subtitle */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Subtitle</Label>
                  <Input
                    value={design.subtitle}
                    onChange={(e) => updateDesign({ subtitle: e.target.value })}
                    placeholder="Compelling subtitle"
                    className="h-12 text-base"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Font</Label>
                      <Select
                        value={design.subtitleFont}
                        onValueChange={(value) => updateDesign({ subtitleFont: value })}
                      >
                        <SelectTrigger className="h-11 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FONTS.map((font) => (
                            <SelectItem key={font.value} value={font.value} className="text-sm py-2.5">
                              {font.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Size: {design.subtitleSize}px</Label>
                      <Slider
                        value={[design.subtitleSize]}
                        onValueChange={([value]) => updateDesign({ subtitleSize: value })}
                        min={14}
                        max={40}
                        step={2}
                        className="py-2"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Color</Label>
                    <div className="flex gap-3">
                      <Input
                        type="color"
                        value={design.subtitleColor}
                        onChange={(e) => updateDesign({ subtitleColor: e.target.value })}
                        className="w-24 h-11 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={design.subtitleColor}
                        onChange={(e) => updateDesign({ subtitleColor: e.target.value })}
                        className="flex-1 h-11 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Author */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Author</Label>
                  <Input
                    value={design.authorName}
                    onChange={(e) => updateDesign({ authorName: e.target.value })}
                    placeholder="Author Name"
                    className="h-12 text-base"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Font</Label>
                      <Select
                        value={design.authorFont}
                        onValueChange={(value) => updateDesign({ authorFont: value })}
                      >
                        <SelectTrigger className="h-11 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FONTS.map((font) => (
                            <SelectItem key={font.value} value={font.value} className="text-sm py-2.5">
                              {font.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Size: {design.authorSize}px</Label>
                      <Slider
                        value={[design.authorSize]}
                        onValueChange={([value]) => updateDesign({ authorSize: value })}
                        min={12}
                        max={32}
                        step={2}
                        className="py-2"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Color</Label>
                    <div className="flex gap-3">
                      <Input
                        type="color"
                        value={design.authorColor}
                        onChange={(e) => updateDesign({ authorColor: e.target.value })}
                        className="w-24 h-11 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={design.authorColor}
                        onChange={(e) => updateDesign({ authorColor: e.target.value })}
                        className="flex-1 h-11 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 lg:p-8 pt-5 border-t flex items-center justify-between gap-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="h-12 px-6 text-base">
            Cancel
          </Button>
          <Button onClick={exportCover} className="gap-2 h-12 px-6 text-base">
            <Download size={18} />
            Save Cover
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
