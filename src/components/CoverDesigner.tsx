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
  imagePosition: 'cover' | 'contain' | 'fill';
  imageBrightness: number;
  imageContrast: number;
  usePreMadeCover: boolean;
}

interface CoverDesignerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectTitle: string;
  authorName?: string;
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
      gradientStart: '#1e3a8a',
      gradientEnd: '#1e40af',
      gradientDirection: 'to-br' as const,
      titleColor: '#ffffff',
      subtitleColor: '#e0e7ff',
      authorColor: '#f0f9ff',
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
      gradientStart: '#dc2626',
      gradientEnd: '#ea580c',
      gradientDirection: 'to-br' as const,
      titleColor: '#ffffff',
      subtitleColor: '#fef2f2',
      authorColor: '#fffbeb',
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
      gradientStart: '#7c2d12',
      gradientEnd: '#0f766e',
      gradientDirection: 'to-r' as const,
      titleColor: '#ffffff',
      subtitleColor: '#f0fdfa',
      authorColor: '#fef2f2',
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

// Stock background images - you can host these on your CDN or use Unsplash API
const STOCK_IMAGES = [
  {
    id: 'abstract-1',
    name: 'Abstract Purple',
    url: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=800&h=1280&fit=crop',
    category: 'abstract',
  },
  {
    id: 'abstract-2',
    name: 'Cosmic Purple',
    url: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&h=1280&fit=crop',
    category: 'abstract',
  },
  {
    id: 'nature-1',
    name: 'Mountain Landscape',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=1280&fit=crop',
    category: 'nature',
  },
  {
    id: 'nature-2',
    name: 'Forest Path',
    url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=1280&fit=crop',
    category: 'nature',
  },
  {
    id: 'texture-1',
    name: 'Gold Marble',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=1280&fit=crop',
    category: 'texture',
  },
  {
    id: 'texture-2',
    name: 'Dark Texture',
    url: 'https://images.unsplash.com/photo-1618172193763-c511deb635ca?w=800&h=1280&fit=crop',
    category: 'texture',
  },
  {
    id: 'artistic-1',
    name: 'Watercolor',
    url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=1280&fit=crop',
    category: 'artistic',
  },
  {
    id: 'artistic-2',
    name: 'Ink Art',
    url: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&h=1280&fit=crop',
    category: 'artistic',
  },
  {
    id: 'minimal-1',
    name: 'Minimal Gradient',
    url: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=800&h=1280&fit=crop',
    category: 'minimal',
  },
  {
    id: 'minimal-2',
    name: 'Soft Clouds',
    url: 'https://images.unsplash.com/photo-1517483000871-1dbf64a6e1c6?w=800&h=1280&fit=crop',
    category: 'minimal',
  },
  {
    id: 'urban-1',
    name: 'City Night',
    url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&h=1280&fit=crop',
    category: 'urban',
  },
  {
    id: 'urban-2',
    name: 'Neon Lights',
    url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=1280&fit=crop',
    category: 'urban',
  },
  {
    id: 'book-1',
    name: 'Book Shelf',
    url: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&h=1280&fit=crop',
    category: 'book-themed',
  },
  {
    id: 'book-2',
    name: 'Old Books',
    url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=1280&fit=crop',
    category: 'book-themed',
  },
  {
    id: 'vintage-1',
    name: 'Vintage Paper',
    url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&h=1280&fit=crop',
    category: 'vintage',
  },
  {
    id: 'vintage-2',
    name: 'Aged Texture',
    url: 'https://images.unsplash.com/photo-1534670007418-fbb7f6cf32c3?w=800&h=1280&fit=crop',
    category: 'vintage',
  },
];

export function CoverDesigner({
  open,
  onOpenChange,
  projectTitle,
  authorName,
  onSave,
  initialDesign,
}: CoverDesignerProps) {
  const [design, setDesign] = useState<CoverDesign>({
    title: projectTitle || 'Your Book Title',
    subtitle: 'A compelling subtitle that draws readers in',
    authorName: authorName || 'Author Name',
    backgroundType: 'gradient',
    backgroundColor: '#8B5CF6',
    gradientStart: '#1e3a8a',
    gradientEnd: '#1e40af',
    gradientDirection: 'to-br',
    titleFont: 'Playfair Display',
    titleSize: 52,
    titleColor: '#ffffff',
    subtitleFont: 'Inter',
    subtitleSize: 22,
    subtitleColor: '#e0e7ff',
    authorFont: 'Inter',
    authorSize: 18,
    authorColor: '#f0f9ff',
    overlay: false,
    overlayOpacity: 40,
    imagePosition: 'cover',
    imageBrightness: 100,
    imageContrast: 100,
    usePreMadeCover: false,
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
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (design.backgroundType === 'image' && design.backgroundImage) {
        const img = new Image();
        img.crossOrigin = 'anonymous'; // Enable CORS for Unsplash images
        img.src = design.backgroundImage;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = () => {
            console.error('Failed to load image, using fallback');
            resolve(null);
          };
        });
        
        if (img.complete && img.naturalHeight !== 0) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        } else {
          // Fallback to gradient if image fails
          ctx.fillStyle = design.gradientStart || '#667eea';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        // Add overlay if enabled
        if (design.overlay) {
          ctx.fillStyle = `rgba(0, 0, 0, ${design.overlayOpacity / 100})`;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      } else {
        ctx.fillStyle = design.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

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

  const getBackgroundStyle = (): React.CSSProperties => {
    if (design.usePreMadeCover && design.backgroundImage) {
      return {
        backgroundImage: `url(${design.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      } as React.CSSProperties;
    }

    if (design.backgroundType === 'gradient') {
      return {
        background: `linear-gradient(${design.gradientDirection}, ${design.gradientStart}, ${design.gradientEnd})`,
      } as React.CSSProperties;
    } else if (design.backgroundType === 'image' && design.backgroundImage) {
      const filterValue = `brightness(${design.imageBrightness}%) contrast(${design.imageContrast}%)`;
      return {
        backgroundImage: `url(${design.backgroundImage})`,
        backgroundSize: design.imagePosition,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        filter: filterValue,
      } as React.CSSProperties;
    } else {
      return {
        backgroundColor: design.backgroundColor,
      } as React.CSSProperties;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[1800px] sm:!max-w-[1800px] w-[98vw] max-h-[95vh] flex flex-col p-0 gap-0">
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
          <div className="lg:w-[45%] p-6 lg:p-8 flex flex-col items-center justify-center bg-muted/20 border-r overflow-y-auto">
            <div className="text-xs font-semibold text-muted-foreground text-center uppercase tracking-wide mb-4">
              Live Preview
            </div>
            <div className="w-full flex justify-center items-center">
              <div
                ref={canvasRef}
                className="relative aspect-[5/8] rounded-2xl shadow-2xl overflow-hidden w-full max-w-[280px] sm:max-w-sm bg-white"
                style={getBackgroundStyle()}
              >
                {/* Overlay */}
                {design.backgroundType === 'image' && design.overlay && (
                  <div
                    className="absolute inset-0"
                    style={{ backgroundColor: `rgba(0, 0, 0, ${design.overlayOpacity / 100})` }}
                  />
                )}

                {/* Text Content - Always show so users can add text to custom covers */}
                <div className="relative h-full flex flex-col items-center justify-center p-8 text-center">
                  <h1
                    className="font-bold leading-tight mb-4"
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
            <Tabs defaultValue="quick" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6 h-12 gap-2">
                <TabsTrigger value="quick" className="gap-2 text-base px-4">
                  <UploadSimple size={16} />
                  <span className="hidden sm:inline">Quick Upload</span>
                  <span className="sm:hidden">Upload</span>
                </TabsTrigger>
                <TabsTrigger value="stock" className="gap-2 text-base px-4">
                  <ImageIcon size={16} />
                  <span className="hidden sm:inline">Stock Images</span>
                  <span className="sm:hidden">Images</span>
                </TabsTrigger>
                <TabsTrigger value="background" className="gap-2 text-base px-4">
                  <Palette size={16} />
                  <span className="hidden sm:inline">Background</span>
                  <span className="sm:hidden">BG</span>
                </TabsTrigger>
                <TabsTrigger value="text" className="gap-2 text-base px-4">
                  <TextT size={16} />
                  <span>Text</span>
                </TabsTrigger>
              </TabsList>

              {/* Quick Upload Tab */}
              <TabsContent value="quick" className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Upload Your Own Cover</Label>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Already have a cover designed? Upload it here and skip the customization
                  </p>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        updateDesign({
                          usePreMadeCover: true,
                          backgroundImage: event.target?.result as string,
                        });
                        toast.success('Cover uploaded! Click Save to apply');
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  className="w-full h-32 text-base border-2 border-dashed hover:border-primary hover:bg-primary/5"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="flex flex-col items-center gap-2">
                    <UploadSimple size={32} />
                    <span className="font-medium">Click to upload your cover image</span>
                    <span className="text-xs text-muted-foreground">Recommended: 1600x2560px (PNG or JPG)</span>
                  </div>
                </Button>

                {design.usePreMadeCover && design.backgroundImage && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800 font-medium">✓ Cover uploaded successfully!</p>
                    <p className="text-xs text-green-600 mt-1">You can now save this cover or customize it using the other tabs</p>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-3">Or use the templates and customization tools below →</p>
                  <Button
                    variant="outline"
                    onClick={() => updateDesign({ usePreMadeCover: false })}
                    className="w-full"
                  >
                    Design Custom Cover Instead
                  </Button>
                </div>
              </TabsContent>

              {/* Stock Images Tab */}
              <TabsContent value="stock" className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Professional Stock Images</Label>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Choose from {STOCK_IMAGES.length} curated high-quality background images
                  </p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
                  {STOCK_IMAGES.map((image) => (
                    <Card
                      key={image.id}
                      className="cursor-pointer neomorph-flat border-0 overflow-hidden hover:neomorph-raised transition-all hover:scale-[1.02] rounded-lg"
                      onClick={() => {
                        updateDesign({
                          backgroundType: 'image',
                          backgroundImage: image.url,
                          usePreMadeCover: false,
                        });
                        toast.success(`Applied ${image.name}`);
                      }}
                    >
                      <div className="relative aspect-[5/8] overflow-hidden rounded-lg">
                        <img 
                          src={image.url} 
                          alt={image.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                          <p className="text-white text-sm font-medium">{image.name}</p>
                          <p className="text-white/70 text-xs capitalize">{image.category.replace('-', ' ')}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium">💡 Pro Tip</p>
                  <p className="text-xs text-blue-600 mt-1">After selecting a stock image, use the Background tab to adjust colors and the Text tab to customize your title and author.</p>
                </div>
              </TabsContent>

              {/* Background Tab */}
              <TabsContent value="background" className="space-y-6">
                <Tabs defaultValue={design.backgroundType} onValueChange={(value: any) => updateDesign({ backgroundType: value })} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 h-12 mb-6">
                    <TabsTrigger value="solid" className="text-sm font-medium">Solid Color</TabsTrigger>
                    <TabsTrigger value="gradient" className="text-sm font-medium">Gradient</TabsTrigger>
                    <TabsTrigger value="image" className="text-sm font-medium">Image</TabsTrigger>
                  </TabsList>

                  {/* Solid Color Sub-Tab */}
                  <TabsContent value="solid" className="space-y-6">
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
                          placeholder="#ffffff"
                        />
                      </div>
                    </div>

                    {/* Quick Color Presets for Solid */}
                    <div className="space-y-3 pt-4 border-t">
                      <Label className="text-base font-medium">Quick Color Presets</Label>
                      <div className="grid grid-cols-4 gap-3">
                        <button
                          onClick={() => updateDesign({ backgroundType: 'solid', backgroundColor: '#000000' })}
                          className="h-16 rounded-lg border-2 border-border hover:border-primary transition-colors bg-black"
                          title="Black"
                        />
                        <button
                          onClick={() => updateDesign({ backgroundType: 'solid', backgroundColor: '#ffffff' })}
                          className="h-16 rounded-lg border-2 border-border hover:border-primary transition-colors bg-white"
                          title="White"
                        />
                        <button
                          onClick={() => updateDesign({ backgroundType: 'solid', backgroundColor: '#1e293b' })}
                          className="h-16 rounded-lg border-2 border-border hover:border-primary transition-colors bg-slate-800"
                          title="Slate Gray"
                        />
                        <button
                          onClick={() => updateDesign({ backgroundType: 'solid', backgroundColor: '#7c3aed' })}
                          className="h-16 rounded-lg border-2 border-border hover:border-primary transition-colors bg-violet-600"
                          title="Purple"
                        />
                        <button
                          onClick={() => updateDesign({ backgroundType: 'solid', backgroundColor: '#dc2626' })}
                          className="h-16 rounded-lg border-2 border-border hover:border-primary transition-colors bg-red-600"
                          title="Red"
                        />
                        <button
                          onClick={() => updateDesign({ backgroundType: 'solid', backgroundColor: '#2563eb' })}
                          className="h-16 rounded-lg border-2 border-border hover:border-primary transition-colors bg-blue-600"
                          title="Blue"
                        />
                        <button
                          onClick={() => updateDesign({ backgroundType: 'solid', backgroundColor: '#059669' })}
                          className="h-16 rounded-lg border-2 border-border hover:border-primary transition-colors bg-emerald-600"
                          title="Green"
                        />
                        <button
                          onClick={() => updateDesign({ backgroundType: 'solid', backgroundColor: '#d97706' })}
                          className="h-16 rounded-lg border-2 border-border hover:border-primary transition-colors bg-amber-600"
                          title="Amber"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  {/* Gradient Sub-Tab */}
                  <TabsContent value="gradient" className="space-y-6">
                      <div className="space-y-3">
                        <Label className="text-base font-medium">Color 1 (Start)</Label>
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
                            placeholder="#667eea"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-base font-medium">Color 2 (End)</Label>
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
                            placeholder="#764ba2"
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
                            <SelectItem value="to-br" className="text-base py-3">Diagonal Down-Right (↘)</SelectItem>
                            <SelectItem value="to-tr" className="text-base py-3">Diagonal Up-Right (↗)</SelectItem>
                            <SelectItem value="to-r" className="text-base py-3">Horizontal Right (→)</SelectItem>
                            <SelectItem value="to-b" className="text-base py-3">Vertical Down (↓)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Quick Gradient Presets */}
                      <div className="space-y-3 pt-4 border-t">
                        <Label className="text-base font-medium">Quick Gradient Presets</Label>
                        <div className="grid grid-cols-3 gap-3">
                          <button
                            onClick={() => updateDesign({ backgroundType: 'gradient', gradientStart: '#667eea', gradientEnd: '#764ba2', gradientDirection: 'to-br' })}
                            className="h-16 rounded-lg border-2 border-border hover:border-primary transition-colors"
                            style={{ background: 'linear-gradient(to bottom right, #667eea, #764ba2)' }}
                            title="Purple Dream"
                          />
                          <button
                            onClick={() => updateDesign({ backgroundType: 'gradient', gradientStart: '#f857a6', gradientEnd: '#ff5858', gradientDirection: 'to-br' })}
                            className="h-16 rounded-lg border-2 border-border hover:border-primary transition-colors"
                            style={{ background: 'linear-gradient(to bottom right, #f857a6, #ff5858)' }}
                            title="Sunset"
                          />
                          <button
                            onClick={() => updateDesign({ backgroundType: 'gradient', gradientStart: '#00c6ff', gradientEnd: '#0072ff', gradientDirection: 'to-br' })}
                            className="h-16 rounded-lg border-2 border-border hover:border-primary transition-colors"
                            style={{ background: 'linear-gradient(to bottom right, #00c6ff, #0072ff)' }}
                            title="Ocean Blue"
                          />
                          <button
                            onClick={() => updateDesign({ backgroundType: 'gradient', gradientStart: '#f093fb', gradientEnd: '#f5576c', gradientDirection: 'to-r' })}
                            className="h-16 rounded-lg border-2 border-border hover:border-primary transition-colors"
                            style={{ background: 'linear-gradient(to right, #f093fb, #f5576c)' }}
                            title="Pink Lemonade"
                          />
                          <button
                            onClick={() => updateDesign({ backgroundType: 'gradient', gradientStart: '#4facfe', gradientEnd: '#00f2fe', gradientDirection: 'to-r' })}
                            className="h-16 rounded-lg border-2 border-border hover:border-primary transition-colors"
                            style={{ background: 'linear-gradient(to right, #4facfe, #00f2fe)' }}
                            title="Fresh Air"
                          />
                          <button
                            onClick={() => updateDesign({ backgroundType: 'gradient', gradientStart: '#43e97b', gradientEnd: '#38f9d7', gradientDirection: 'to-r' })}
                            className="h-16 rounded-lg border-2 border-border hover:border-primary transition-colors"
                            style={{ background: 'linear-gradient(to right, #43e97b, #38f9d7)' }}
                            title="Mint Fresh"
                          />
                          <button
                            onClick={() => updateDesign({ backgroundType: 'gradient', gradientStart: '#fa709a', gradientEnd: '#fee140', gradientDirection: 'to-b' })}
                            className="h-16 rounded-lg border-2 border-border hover:border-primary transition-colors"
                            style={{ background: 'linear-gradient(to bottom, #fa709a, #fee140)' }}
                            title="Summer Warmth"
                          />
                          <button
                            onClick={() => updateDesign({ backgroundType: 'gradient', gradientStart: '#30cfd0', gradientEnd: '#330867', gradientDirection: 'to-b' })}
                            className="h-16 rounded-lg border-2 border-border hover:border-primary transition-colors"
                            style={{ background: 'linear-gradient(to bottom, #30cfd0, #330867)' }}
                            title="Deep Ocean"
                          />
                          <button
                            onClick={() => updateDesign({ backgroundType: 'gradient', gradientStart: '#a8edea', gradientEnd: '#fed6e3', gradientDirection: 'to-b' })}
                            className="h-16 rounded-lg border-2 border-border hover:border-primary transition-colors"
                            style={{ background: 'linear-gradient(to bottom, #a8edea, #fed6e3)' }}
                            title="Pastel Dream"
                          />
                        </div>
                      </div>
                    </TabsContent>

                  {/* Image Sub-Tab */}
                  <TabsContent value="image" className="space-y-6">
                      <div className="space-y-3">
                        <Label className="text-base font-medium">Upload Background Image</Label>
                        <Button
                          variant="outline"
                          className="w-full h-12 text-base"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <UploadSimple size={20} className="mr-2" />
                          Choose Image
                        </Button>
                      </div>

                      {design.backgroundImage && (
                        <>
                          <div className="space-y-3">
                            <Label className="text-base font-medium">Image Fit</Label>
                            <Select
                              value={design.imagePosition}
                              onValueChange={(value: any) => updateDesign({ imagePosition: value })}
                            >
                              <SelectTrigger className="h-12 text-base">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="cover" className="text-base py-3">Cover (Fill entire area)</SelectItem>
                                <SelectItem value="contain" className="text-base py-3">Contain (Fit inside)</SelectItem>
                                <SelectItem value="fill" className="text-base py-3">Stretch (Fill completely)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-3">
                            <Label className="text-base font-medium">Brightness: {design.imageBrightness}%</Label>
                            <Slider
                              value={[design.imageBrightness]}
                              onValueChange={([value]) => updateDesign({ imageBrightness: value })}
                              min={50}
                              max={150}
                              step={5}
                              className="py-2"
                            />
                          </div>

                          <div className="space-y-3">
                            <Label className="text-base font-medium">Contrast: {design.imageContrast}%</Label>
                            <Slider
                              value={[design.imageContrast]}
                              onValueChange={([value]) => updateDesign({ imageContrast: value })}
                              min={50}
                              max={150}
                              step={5}
                              className="py-2"
                            />
                          </div>
                        </>
                      )}

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
                    </TabsContent>
                  </Tabs>
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

                {/* Quick Color Palettes */}
                <div className="space-y-3 pt-4 border-t">
                  <Label className="text-base font-medium">Quick Color Palettes</Label>
                  <p className="text-xs text-muted-foreground">Apply coordinated colors to title, subtitle, and author</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => updateDesign({ 
                        titleColor: '#ffffff', 
                        subtitleColor: '#e0e0e0', 
                        authorColor: '#ffffff' 
                      })}
                      className="h-14 rounded-lg border-2 border-border hover:border-primary transition-colors flex items-center gap-3 px-4"
                    >
                      <div className="flex gap-1">
                        <div className="w-6 h-6 rounded-full bg-white border border-gray-300" />
                        <div className="w-6 h-6 rounded-full bg-gray-200 border border-gray-300" />
                      </div>
                      <span className="text-sm font-medium">Classic White</span>
                    </button>
                    <button
                      onClick={() => updateDesign({ 
                        titleColor: '#000000', 
                        subtitleColor: '#333333', 
                        authorColor: '#000000' 
                      })}
                      className="h-14 rounded-lg border-2 border-border hover:border-primary transition-colors flex items-center gap-3 px-4"
                    >
                      <div className="flex gap-1">
                        <div className="w-6 h-6 rounded-full bg-black border border-gray-300" />
                        <div className="w-6 h-6 rounded-full bg-gray-700 border border-gray-300" />
                      </div>
                      <span className="text-sm font-medium">Bold Black</span>
                    </button>
                    <button
                      onClick={() => updateDesign({ 
                        titleColor: '#ffd700', 
                        subtitleColor: '#fff8dc', 
                        authorColor: '#ffd700' 
                      })}
                      className="h-14 rounded-lg border-2 border-border hover:border-primary transition-colors flex items-center gap-3 px-4"
                    >
                      <div className="flex gap-1">
                        <div className="w-6 h-6 rounded-full bg-yellow-400 border border-gray-300" />
                        <div className="w-6 h-6 rounded-full bg-yellow-100 border border-gray-300" />
                      </div>
                      <span className="text-sm font-medium">Elegant Gold</span>
                    </button>
                    <button
                      onClick={() => updateDesign({ 
                        titleColor: '#e91e63', 
                        subtitleColor: '#fce4ec', 
                        authorColor: '#c2185b' 
                      })}
                      className="h-14 rounded-lg border-2 border-border hover:border-primary transition-colors flex items-center gap-3 px-4"
                    >
                      <div className="flex gap-1">
                        <div className="w-6 h-6 rounded-full bg-pink-600 border border-gray-300" />
                        <div className="w-6 h-6 rounded-full bg-pink-100 border border-gray-300" />
                      </div>
                      <span className="text-sm font-medium">Vibrant Pink</span>
                    </button>
                    <button
                      onClick={() => updateDesign({ 
                        titleColor: '#2196f3', 
                        subtitleColor: '#e3f2fd', 
                        authorColor: '#1976d2' 
                      })}
                      className="h-14 rounded-lg border-2 border-border hover:border-primary transition-colors flex items-center gap-3 px-4"
                    >
                      <div className="flex gap-1">
                        <div className="w-6 h-6 rounded-full bg-blue-500 border border-gray-300" />
                        <div className="w-6 h-6 rounded-full bg-blue-100 border border-gray-300" />
                      </div>
                      <span className="text-sm font-medium">Ocean Blue</span>
                    </button>
                    <button
                      onClick={() => updateDesign({ 
                        titleColor: '#8b5cf6', 
                        subtitleColor: '#ede9fe', 
                        authorColor: '#7c3aed' 
                      })}
                      className="h-14 rounded-lg border-2 border-border hover:border-primary transition-colors flex items-center gap-3 px-4"
                    >
                      <div className="flex gap-1">
                        <div className="w-6 h-6 rounded-full bg-violet-500 border border-gray-300" />
                        <div className="w-6 h-6 rounded-full bg-violet-100 border border-gray-300" />
                      </div>
                      <span className="text-sm font-medium">Royal Purple</span>
                    </button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 lg:p-8 pt-5 border-t">
          <div className="flex items-center justify-between gap-4 mb-3">
            <p className="text-xs text-muted-foreground">
              💡 Cover will be saved to your project and can be exported later
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              className="h-12 px-6 text-base"
            >
              Cancel
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => {
                updateDesign({
                  title: projectTitle,
                  subtitle: '',
                  authorName: '',
                  backgroundType: 'gradient',
                  backgroundColor: '#ffffff',
                  gradientStart: '#667eea',
                  gradientEnd: '#764ba2',
                  gradientDirection: 'to-br',
                  titleColor: '#ffffff',
                  subtitleColor: '#e0e0e0',
                  authorColor: '#ffffff',
                  titleSize: 48,
                  subtitleSize: 24,
                  authorSize: 18,
                });
                toast.success('Reset to default design');
              }}
              className="h-12 px-6 text-base"
            >
              Reset Design
            </Button>
            <Button 
              onClick={exportCover} 
              className="gap-2 h-12 px-8 text-base font-semibold ml-auto"
            >
              <Download size={20} />
              Save to Project
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
