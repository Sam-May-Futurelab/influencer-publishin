import { useState, useEffect } from 'react';
import { BrandConfig } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Palette, TextT, Image, Eye, Check } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';

interface BrandCustomizerProps {
  brandConfig: BrandConfig;
  onUpdate: (config: BrandConfig) => void;
  isOpen: boolean;
  onClose: () => void;
}

const presetColors = [
  { name: 'Purple', primary: '#8B5CF6', secondary: '#A78BFA', accent: '#C4B5FD' },
  { name: 'Blue', primary: '#3B82F6', secondary: '#60A5FA', accent: '#93C5FD' },
  { name: 'Green', primary: '#10B981', secondary: '#34D399', accent: '#6EE7B7' },
  { name: 'Pink', primary: '#EC4899', secondary: '#F472B6', accent: '#F9A8D4' },
  { name: 'Orange', primary: '#F59E0B', secondary: '#FBBF24', accent: '#FCD34D' },
  { name: 'Red', primary: '#EF4444', secondary: '#F87171', accent: '#FCA5A5' },
];

const fontOptions = [
  { name: 'Inter', value: 'Inter, sans-serif' },
  { name: 'Roboto', value: 'Roboto, sans-serif' },
  { name: 'Open Sans', value: 'Open Sans, sans-serif' },
  { name: 'Lato', value: 'Lato, sans-serif' },
  { name: 'Montserrat', value: 'Montserrat, sans-serif' },
  { name: 'Playfair Display', value: 'Playfair Display, serif' },
  { name: 'Merriweather', value: 'Merriweather, serif' },
];

export function BrandCustomizer({ brandConfig, onUpdate, isOpen, onClose }: BrandCustomizerProps) {
  const [localConfig, setLocalConfig] = useState<BrandConfig>(brandConfig);
  const [showSaved, setShowSaved] = useState(false);

  const handleUpdate = (updates: Partial<BrandConfig>) => {
    const newConfig = { ...localConfig, ...updates };
    setLocalConfig(newConfig);
    onUpdate(newConfig);
    
    // Show saved indicator
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  const applyPreset = (preset: typeof presetColors[0]) => {
    handleUpdate({
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      accentColor: preset.accent,
    });
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="neomorph-raised border-0">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl neomorph-flat">
                <Palette size={24} className="text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Brand Customization</CardTitle>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  Customize your ebook's visual identity
                  <AnimatePresence>
                    {showSaved && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="inline-flex items-center gap-1 text-green-600 font-medium"
                      >
                        <Check size={14} weight="bold" />
                        Saved
                      </motion.span>
                    )}
                  </AnimatePresence>
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="neomorph-button">
              ×
            </Button>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Color Presets */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Palette size={16} />
                Color Presets
              </Label>
              <div className="grid grid-cols-3 gap-3">
                {presetColors.map((preset) => (
                  <Button
                    key={preset.name}
                    variant="outline"
                    className="h-16 neomorph-button border-0 relative overflow-hidden"
                    onClick={() => applyPreset(preset)}
                  >
                    <div className="absolute inset-0 flex">
                      <div 
                        className="flex-1" 
                        style={{ backgroundColor: preset.primary }} 
                      />
                      <div 
                        className="flex-1" 
                        style={{ backgroundColor: preset.secondary }} 
                      />
                      <div 
                        className="flex-1" 
                        style={{ backgroundColor: preset.accent }} 
                      />
                    </div>
                    <span className="relative z-10 text-white font-medium text-sm drop-shadow">
                      {preset.name}
                    </span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Colors */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primary-color">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="primary-color"
                    type="color"
                    value={localConfig.primaryColor}
                    onChange={(e) => handleUpdate({ primaryColor: e.target.value })}
                    className="w-12 h-10 p-1 neomorph-inset"
                  />
                  <Input
                    value={localConfig.primaryColor}
                    onChange={(e) => handleUpdate({ primaryColor: e.target.value })}
                    className="flex-1 neomorph-inset border-0"
                    placeholder="#8B5CF6"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondary-color">Secondary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="secondary-color"
                    type="color"
                    value={localConfig.secondaryColor}
                    onChange={(e) => handleUpdate({ secondaryColor: e.target.value })}
                    className="w-12 h-10 p-1 neomorph-inset"
                  />
                  <Input
                    value={localConfig.secondaryColor}
                    onChange={(e) => handleUpdate({ secondaryColor: e.target.value })}
                    className="flex-1 neomorph-inset border-0"
                    placeholder="#A78BFA"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accent-color">Accent Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="accent-color"
                    type="color"
                    value={localConfig.accentColor}
                    onChange={(e) => handleUpdate({ accentColor: e.target.value })}
                    className="w-12 h-10 p-1 neomorph-inset"
                  />
                  <Input
                    value={localConfig.accentColor}
                    onChange={(e) => handleUpdate({ accentColor: e.target.value })}
                    className="flex-1 neomorph-inset border-0"
                    placeholder="#C4B5FD"
                  />
                </div>
              </div>
            </div>

            {/* Typography */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <TextT size={16} />
                Typography
              </Label>
              <Select 
                value={localConfig.fontFamily} 
                onValueChange={(value) => handleUpdate({ fontFamily: value })}
              >
                <SelectTrigger className="neomorph-inset border-0">
                  <SelectValue placeholder="Select font family" />
                </SelectTrigger>
                <SelectContent>
                  {fontOptions.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      <span style={{ fontFamily: font.value }}>{font.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Cover Style */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Image size={16} />
                Cover Style
              </Label>
              <div className="grid grid-cols-3 gap-3">
                {(['minimal', 'gradient', 'image'] as const).map((style) => (
                  <Button
                    key={style}
                    variant={localConfig.coverStyle === style ? 'default' : 'outline'}
                    className="h-20 neomorph-button border-0 capitalize"
                    onClick={() => handleUpdate({ coverStyle: style })}
                  >
                    {style}
                  </Button>
                ))}
              </div>
            </div>

            {/* Logo Upload */}
            <div className="space-y-3">
              <Label htmlFor="logo-url">Logo URL (optional)</Label>
              <Input
                id="logo-url"
                value={localConfig.logoUrl || ''}
                onChange={(e) => handleUpdate({ logoUrl: e.target.value })}
                placeholder="https://example.com/logo.png"
                className="neomorph-inset border-0"
              />
            </div>

            {/* Cover Image */}
            {localConfig.coverStyle === 'image' && (
              <div className="space-y-3">
                <Label htmlFor="cover-image-url">Cover Image URL</Label>
                <Input
                  id="cover-image-url"
                  value={localConfig.coverImageUrl || ''}
                  onChange={(e) => handleUpdate({ coverImageUrl: e.target.value })}
                  placeholder="https://example.com/cover.jpg"
                  className="neomorph-inset border-0"
                />
              </div>
            )}

            {/* Preview */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Eye size={16} />
                Preview
              </Label>
              <div 
                className="p-6 rounded-xl neomorph-inset min-h-[120px] flex items-center justify-center"
                style={{
                  background: localConfig.coverStyle === 'gradient' 
                    ? `linear-gradient(135deg, ${localConfig.primaryColor}, ${localConfig.secondaryColor})`
                    : localConfig.coverStyle === 'image' && localConfig.coverImageUrl
                    ? `url(${localConfig.coverImageUrl}) center/cover`
                    : localConfig.primaryColor
                }}
              >
                <div className="text-center text-white">
                  <h3 
                    className="text-xl font-bold mb-2 drop-shadow-lg"
                    style={{ fontFamily: localConfig.fontFamily }}
                  >
                    Your Ebook Title
                  </h3>
                  <p 
                    className="text-sm opacity-90 drop-shadow"
                    style={{ fontFamily: localConfig.fontFamily }}
                  >
                    Preview of your brand style
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}