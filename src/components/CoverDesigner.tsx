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
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
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
  ArrowsOut,
  ArrowsIn,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { UpgradeModal } from './UpgradeModal';

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
  uploadedCoverImage?: string; // Persisted uploaded/AI cover image
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
  imageAlignment?: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  imageBrightness: number;
  imageContrast: number;
  usePreMadeCover: boolean;
  titlePosition?: number;
  subtitlePosition?: number;
  authorPosition?: number;
  textShadowEnabled?: boolean;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  shadowColor?: string;
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
  // Abstract & Artistic
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
    id: 'abstract-3',
    name: 'Fluid Colors',
    url: 'https://images.unsplash.com/photo-1550859492-d5da9d8e45f3?w=800&h=1280&fit=crop',
    category: 'abstract',
  },
  {
    id: 'abstract-4',
    name: 'Geometric Waves',
    url: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=800&h=1280&fit=crop',
    category: 'abstract',
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
    id: 'artistic-3',
    name: 'Paint Strokes',
    url: 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800&h=1280&fit=crop',
    category: 'artistic',
  },
  
  // Nature & Landscapes
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
    id: 'nature-3',
    name: 'Ocean Waves',
    url: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&h=1280&fit=crop',
    category: 'nature',
  },
  {
    id: 'nature-4',
    name: 'Desert Dunes',
    url: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&h=1280&fit=crop',
    category: 'nature',
  },
  {
    id: 'nature-5',
    name: 'Northern Lights',
    url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&h=1280&fit=crop',
    category: 'nature',
  },
  
  // Business & Professional
  {
    id: 'business-1',
    name: 'Modern Office',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=1280&fit=crop',
    category: 'business',
  },
  {
    id: 'business-2',
    name: 'Workspace',
    url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=1280&fit=crop',
    category: 'business',
  },
  {
    id: 'business-3',
    name: 'City Skyline',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=1280&fit=crop',
    category: 'business',
  },
  {
    id: 'business-4',
    name: 'Glass Building',
    url: 'https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?w=800&h=1280&fit=crop',
    category: 'business',
  },
  
  // Textures & Patterns
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
    id: 'texture-3',
    name: 'Watercolor Texture',
    url: 'https://images.unsplash.com/photo-1553356084-58ef4a67b2a7?w=800&h=1280&fit=crop',
    category: 'texture',
  },
  {
    id: 'texture-4',
    name: 'Concrete Wall',
    url: 'https://images.unsplash.com/photo-1510936111840-65e151ad71bb?w=800&h=1280&fit=crop',
    category: 'texture',
  },
  
  // Minimal & Clean
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
    id: 'minimal-3',
    name: 'White Space',
    url: 'https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?w=800&h=1280&fit=crop',
    category: 'minimal',
  },
  {
    id: 'minimal-4',
    name: 'Pastel Sky',
    url: 'https://images.unsplash.com/photo-1557682268-e3955ed5d83f?w=800&h=1280&fit=crop',
    category: 'minimal',
  },
  
  // Urban & Modern
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
    id: 'urban-3',
    name: 'Urban Graffiti',
    url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=1280&fit=crop',
    category: 'urban',
  },
  {
    id: 'urban-4',
    name: 'Architecture',
    url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=1280&fit=crop',
    category: 'urban',
  },
  
  // Book-Themed
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
    id: 'book-3',
    name: 'Library',
    url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&h=1280&fit=crop',
    category: 'book-themed',
  },
  
  // Vintage & Classic
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
  {
    id: 'vintage-3',
    name: 'Retro Pattern',
    url: 'https://images.unsplash.com/photo-1484417894907-623942c8ee29?w=800&h=1280&fit=crop',
    category: 'vintage',
  },
  
  // Tech & Digital
  {
    id: 'tech-1',
    name: 'Digital Code',
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=1280&fit=crop',
    category: 'tech',
  },
  {
    id: 'tech-2',
    name: 'Circuit Board',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=1280&fit=crop',
    category: 'tech',
  },
  {
    id: 'tech-3',
    name: 'Data Visualization',
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=1280&fit=crop',
    category: 'tech',
  },
  
  // Additional Abstract
  {
    id: 'abstract-5',
    name: 'Neon Waves',
    url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&h=1280&fit=crop',
    category: 'abstract',
  },
  {
    id: 'abstract-6',
    name: 'Gradient Mesh',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=1280&fit=crop',
    category: 'abstract',
  },
  {
    id: 'abstract-7',
    name: 'Liquid Colors',
    url: 'https://images.unsplash.com/photo-1553356084-58ef4a67b2a7?w=800&h=1280&fit=crop',
    category: 'abstract',
  },
  {
    id: 'abstract-8',
    name: 'Digital Aurora',
    url: 'https://images.unsplash.com/photo-1558470598-a5dda9640f68?w=800&h=1280&fit=crop',
    category: 'abstract',
  },
  
  // Additional Nature
  {
    id: 'nature-6',
    name: 'Sunset Sky',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=1280&fit=crop',
    category: 'nature',
  },
  {
    id: 'nature-7',
    name: 'Misty Mountains',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=1280&fit=crop',
    category: 'nature',
  },
  {
    id: 'nature-8',
    name: 'Tropical Beach',
    url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=1280&fit=crop',
    category: 'nature',
  },
  {
    id: 'nature-9',
    name: 'Aurora Borealis',
    url: 'https://images.unsplash.com/photo-1483347756197-71ef80e95f73?w=800&h=1280&fit=crop',
    category: 'nature',
  },
  {
    id: 'nature-10',
    name: 'Lavender Field',
    url: 'https://images.unsplash.com/photo-1499002238440-d264edd596ec?w=800&h=1280&fit=crop',
    category: 'nature',
  },
  
  // Additional Artistic
  {
    id: 'artistic-4',
    name: 'Abstract Painting',
    url: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800&h=1280&fit=crop',
    category: 'artistic',
  },
  {
    id: 'artistic-5',
    name: 'Oil Paint Texture',
    url: 'https://images.unsplash.com/photo-1533158326339-7f3cf2404354?w=800&h=1280&fit=crop',
    category: 'artistic',
  },
  {
    id: 'artistic-6',
    name: 'Color Splash',
    url: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=800&h=1280&fit=crop',
    category: 'artistic',
  },
  
  // Additional Business
  {
    id: 'business-5',
    name: 'Corporate Meeting',
    url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=1280&fit=crop',
    category: 'business',
  },
  {
    id: 'business-6',
    name: 'Financial Charts',
    url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=1280&fit=crop',
    category: 'business',
  },
  {
    id: 'business-7',
    name: 'Modern Desk',
    url: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=1280&fit=crop',
    category: 'business',
  },
  
  // Additional Minimal
  {
    id: 'minimal-5',
    name: 'Soft Beige',
    url: 'https://images.unsplash.com/photo-1511884642898-4c92249e20b6?w=800&h=1280&fit=crop',
    category: 'minimal',
  },
  {
    id: 'minimal-6',
    name: 'Clean White',
    url: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=800&h=1280&fit=crop',
    category: 'minimal',
  },
  {
    id: 'minimal-7',
    name: 'Soft Pink',
    url: 'https://images.unsplash.com/photo-1506260408121-e353d10b87c7?w=800&h=1280&fit=crop',
    category: 'minimal',
  },
  
  // Additional Textures
  {
    id: 'texture-5',
    name: 'Wood Grain',
    url: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800&h=1280&fit=crop',
    category: 'texture',
  },
  {
    id: 'texture-6',
    name: 'Fabric Texture',
    url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=1280&fit=crop',
    category: 'texture',
  },
  {
    id: 'texture-7',
    name: 'Stone Surface',
    url: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=800&h=1280&fit=crop',
    category: 'texture',
  },
  {
    id: 'texture-8',
    name: 'Metal Texture',
    url: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800&h=1280&fit=crop',
    category: 'texture',
  },
  
  // Additional Urban
  {
    id: 'urban-5',
    name: 'City Street',
    url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&h=1280&fit=crop',
    category: 'urban',
  },
  {
    id: 'urban-6',
    name: 'Subway Station',
    url: 'https://images.unsplash.com/photo-1496568816309-51d7c20e3b21?w=800&h=1280&fit=crop',
    category: 'urban',
  },
  {
    id: 'urban-7',
    name: 'Industrial',
    url: 'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=800&h=1280&fit=crop',
    category: 'urban',
  },
  
  // Additional Book-Themed
  {
    id: 'book-4',
    name: 'Reading Corner',
    url: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&h=1280&fit=crop',
    category: 'book-themed',
  },
  {
    id: 'book-5',
    name: 'Open Book',
    url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&h=1280&fit=crop',
    category: 'book-themed',
  },
  {
    id: 'book-6',
    name: 'Antique Books',
    url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&h=1280&fit=crop',
    category: 'book-themed',
  },
  
  // Additional Vintage
  {
    id: 'vintage-4',
    name: 'Old Map',
    url: 'https://images.unsplash.com/photo-1526243741027-444d633d7365?w=800&h=1280&fit=crop',
    category: 'vintage',
  },
  {
    id: 'vintage-5',
    name: 'Sepia Tone',
    url: 'https://images.unsplash.com/photo-1495001258031-d1b407bc1776?w=800&h=1280&fit=crop',
    category: 'vintage',
  },
  
  // Additional Tech
  {
    id: 'tech-4',
    name: 'Neural Network',
    url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=1280&fit=crop',
    category: 'tech',
  },
  {
    id: 'tech-5',
    name: 'Server Room',
    url: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=800&h=1280&fit=crop',
    category: 'tech',
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
  // Helper to check if an image URL is usable (not an expired OpenAI URL)
  const isUsableImageUrl = (url: string | undefined): boolean => {
    if (!url) return false;
    // Data URLs are always usable
    if (url.startsWith('data:')) return true;
    // OpenAI blob URLs will cause CORS issues, treat as unusable
    if (url.includes('oaidalleapiprodscus.blob.core.windows.net')) return false;
    // Other URLs (Unsplash, uploaded images) are fine
    return true;
  };

  const [design, setDesign] = useState<CoverDesign>({
    // Use saved design values, only fallback to project/defaults if not present
    title: initialDesign?.title !== undefined ? initialDesign.title : (projectTitle || 'Your Book Title'),
    subtitle: initialDesign?.subtitle !== undefined ? initialDesign.subtitle : 'A compelling subtitle that draws readers in',
    authorName: initialDesign?.authorName !== undefined ? initialDesign.authorName : (authorName || 'Author Name'),
    backgroundType: initialDesign?.backgroundType || 'gradient',
    backgroundColor: initialDesign?.backgroundColor || '#8B5CF6',
    gradientStart: initialDesign?.gradientStart || '#1e3a8a',
    gradientEnd: initialDesign?.gradientEnd || '#1e40af',
    gradientDirection: initialDesign?.gradientDirection || 'to-br',
    titleFont: initialDesign?.titleFont || 'Playfair Display',
    titleSize: initialDesign?.titleSize || 52,
    titleColor: initialDesign?.titleColor || '#ffffff',
    titlePosition: initialDesign?.titlePosition || 40,
    subtitleFont: initialDesign?.subtitleFont || 'Inter',
    subtitleSize: initialDesign?.subtitleSize || 22,
    subtitleColor: initialDesign?.subtitleColor || '#e0e7ff',
    subtitlePosition: initialDesign?.subtitlePosition || 50,
    authorFont: initialDesign?.authorFont || 'Inter',
    authorSize: initialDesign?.authorSize || 18,
    authorColor: initialDesign?.authorColor || '#f0f9ff',
    authorPosition: initialDesign?.authorPosition || 80,
    textShadowEnabled: initialDesign?.textShadowEnabled ?? true,
    shadowBlur: initialDesign?.shadowBlur ?? 8,
    shadowOffsetX: initialDesign?.shadowOffsetX ?? 2,
    shadowOffsetY: initialDesign?.shadowOffsetY ?? 2,
    shadowColor: initialDesign?.shadowColor || 'rgba(0, 0, 0, 0.8)',
    overlay: initialDesign?.overlay ?? false,
    overlayOpacity: initialDesign?.overlayOpacity || 40,
    imagePosition: initialDesign?.imagePosition || 'cover',
    imageAlignment: initialDesign?.imageAlignment || 'center',
    imageBrightness: initialDesign?.imageBrightness ?? 100,
    imageContrast: initialDesign?.imageContrast ?? 100,
    usePreMadeCover: initialDesign?.usePreMadeCover ?? false,
    // Only use background image if it's a usable URL (not expired OpenAI URL)
    backgroundImage: isUsableImageUrl(initialDesign?.uploadedCoverImage) 
      ? initialDesign?.uploadedCoverImage 
      : isUsableImageUrl(initialDesign?.backgroundImage)
        ? initialDesign?.backgroundImage
        : undefined,
    uploadedCoverImage: isUsableImageUrl(initialDesign?.uploadedCoverImage) 
      ? initialDesign?.uploadedCoverImage 
      : undefined,
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
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

  const saveCover = async () => {
    try {
      // Generate the complete cover image with text baked in
      const coverImageData = await generateCoverImageWithText();
      
      if (!coverImageData) {
        toast.error('Failed to generate cover image');
        return;
      }

      // Save both the design settings AND the final rendered image
      const designToSave = {
        ...design,
        uploadedCoverImage: design.backgroundImage || design.uploadedCoverImage,
      };
      
      // Pass the complete baked image
      onSave(designToSave, coverImageData);
      toast.success('Cover saved successfully!');
      onOpenChange(false);
    } catch (error) {
      console.error('Save failed:', error);
      toast.error('Failed to save cover');
    }
  };

  // Helper function to generate cover with text baked in
  const generateCoverImageWithText = async (): Promise<string | null> => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

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
        img.crossOrigin = 'anonymous';
        img.src = design.backgroundImage;
        await new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = () => {
            console.error('Failed to load image');
            resolve(null);
          };
        });
        
        if (img.complete && img.naturalHeight !== 0) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          if (design.overlay) {
            ctx.fillStyle = `rgba(0, 0, 0, ${design.overlayOpacity / 100})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
        } else {
          ctx.fillStyle = design.gradientStart || '#667eea';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      } else {
        ctx.fillStyle = design.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Draw text
      const drawText = (text: string, font: string, size: number, color: string, y: number) => {
        // Apply shadow if enabled
        if (design.textShadowEnabled) {
          ctx.shadowColor = design.shadowColor || 'rgba(0, 0, 0, 0.8)';
          ctx.shadowBlur = (design.shadowBlur || 8) * 3; // Scale for high-res canvas
          ctx.shadowOffsetX = (design.shadowOffsetX || 2) * 3;
          ctx.shadowOffsetY = (design.shadowOffsetY || 2) * 3;
        } else {
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
        }
        
        ctx.fillStyle = color;
        ctx.font = `${size * 3}px ${font}`;
        ctx.textAlign = 'center';
        ctx.fillText(text, canvas.width / 2, y);
      };

      const titleY = canvas.height * ((design.titlePosition || 40) / 100);
      const subtitleY = canvas.height * ((design.subtitlePosition || 50) / 100);
      const authorY = canvas.height * ((design.authorPosition || 80) / 100);

      drawText(design.title, design.titleFont, design.titleSize, design.titleColor, titleY);
      drawText(design.subtitle, design.subtitleFont, design.subtitleSize, design.subtitleColor, subtitleY);
      drawText(design.authorName, design.authorFont, design.authorSize, design.authorColor, authorY);

      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Error generating cover:', error);
      return null;
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

      // Draw text elements with word wrapping
      const drawText = (
        text: string,
        font: string,
        size: number,
        color: string,
        y: number,
        align: 'center' | 'left' | 'right' = 'center',
        maxWidth?: number
      ) => {
        // Apply shadow if enabled
        if (design.textShadowEnabled) {
          ctx.shadowColor = design.shadowColor || 'rgba(0, 0, 0, 0.8)';
          ctx.shadowBlur = (design.shadowBlur || 8) * 3; // Scale for high-res canvas
          ctx.shadowOffsetX = (design.shadowOffsetX || 2) * 3;
          ctx.shadowOffsetY = (design.shadowOffsetY || 2) * 3;
        } else {
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
        }
        
        ctx.fillStyle = color;
        ctx.font = `${size * 3}px ${font}`;
        ctx.textAlign = align;
        const x = align === 'center' ? canvas.width / 2 : align === 'left' ? 100 : canvas.width - 100;
        
        // If no maxWidth or text fits, draw normally
        const actualMaxWidth = maxWidth || canvas.width - 200;
        if (ctx.measureText(text).width <= actualMaxWidth) {
          ctx.fillText(text, x, y);
          return;
        }
        
        // Word wrap for long text
        const words = text.split(' ');
        const lines: string[] = [];
        let currentLine = words[0];
        
        for (let i = 1; i < words.length; i++) {
          const testLine = currentLine + ' ' + words[i];
          const metrics = ctx.measureText(testLine);
          
          if (metrics.width > actualMaxWidth) {
            lines.push(currentLine);
            currentLine = words[i];
          } else {
            currentLine = testLine;
          }
        }
        lines.push(currentLine);
        
        // Draw each line
        const lineHeight = size * 3.5; // 1.2x line height
        const startY = y - ((lines.length - 1) * lineHeight) / 2;
        
        lines.forEach((line, index) => {
          ctx.fillText(line, x, startY + (index * lineHeight));
        });
      };

      // Title with word wrapping (max 80% of canvas width)
      const titleY = canvas.height * ((design.titlePosition || 40) / 100);
      const subtitleY = canvas.height * ((design.subtitlePosition || 50) / 100);
      const authorY = canvas.height * ((design.authorPosition || 80) / 100);
      
      drawText(design.title, design.titleFont, design.titleSize, design.titleColor, titleY, 'center', canvas.width * 0.8);

      // Subtitle
      drawText(design.subtitle, design.subtitleFont, design.subtitleSize, design.subtitleColor, subtitleY, 'center', canvas.width * 0.8);

      // Author
      drawText(design.authorName, design.authorFont, design.authorSize, design.authorColor, authorY, 'center', canvas.width * 0.8);

      const imageData = canvas.toDataURL('image/png');
      
      // This is for export/preview - don't save, just return the full image with text
      return imageData;
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export cover');
      return null;
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
      
      // Map alignment to CSS background-position
      let bgPosition = 'center';
      const alignment = design.imageAlignment || 'center';
      switch (alignment) {
        case 'top': bgPosition = 'top center'; break;
        case 'bottom': bgPosition = 'bottom center'; break;
        case 'left': bgPosition = 'center left'; break;
        case 'right': bgPosition = 'center right'; break;
        case 'top-left': bgPosition = 'top left'; break;
        case 'top-right': bgPosition = 'top right'; break;
        case 'bottom-left': bgPosition = 'bottom left'; break;
        case 'bottom-right': bgPosition = 'bottom right'; break;
        default: bgPosition = 'center';
      }
      
      return {
        backgroundImage: `url(${design.backgroundImage})`,
        backgroundSize: 'cover', // Always cover for AI-generated images
        backgroundPosition: bgPosition,
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
      <DialogContent className="!max-w-[1800px] sm:!max-w-[1800px] w-[98vw] max-h-[95vh] flex flex-col p-0 gap-0" aria-describedby="cover-designer-description">
        <DialogHeader className="p-4 lg:p-6 pb-3 lg:pb-4 border-b">
          <DialogTitle className="text-lg lg:text-xl font-bold flex items-center gap-2">
            <div className="p-1.5 rounded-lg neomorph-flat">
              <Palette size={20} className="text-primary" />
            </div>
            Cover Designer
          </DialogTitle>
          <DialogDescription id="cover-designer-description" className="sr-only">
            Design your ebook cover with AI generation, templates, and customization tools
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row min-h-0">
          {/* Preview Panel */}
          <div 
            className={`p-6 lg:p-8 flex flex-col items-center bg-muted/20 border-r overflow-y-auto transition-all ${
              isPreviewExpanded ? 'flex-1 lg:w-[45%] pb-28' : 'lg:w-[45%]'
            } ${!isPreviewExpanded ? 'lg:flex' : ''}`}
            onClick={() => {
              // Only toggle on mobile (not lg screens)
              if (window.innerWidth < 1024) {
                setIsPreviewExpanded(!isPreviewExpanded);
              }
            }}
          >
            <div className="flex items-center justify-between w-full mb-4">
              <div className="text-xs font-semibold text-muted-foreground text-center uppercase tracking-wide flex-1">
                Live Preview
              </div>
              <button 
                className="lg:hidden flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-muted/50"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPreviewExpanded(!isPreviewExpanded);
                }}
              >
                {isPreviewExpanded ? (
                  <>
                    <ArrowsIn size={14} weight="bold" />
                    <span>Back</span>
                  </>
                ) : (
                  <>
                    <span>Expand</span>
                    <ArrowsOut size={14} weight="bold" />
                  </>
                )}
              </button>
            </div>
            <div className="w-full flex justify-center items-start py-4">
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
                    className="font-bold leading-tight mb-4 break-words px-2"
                    style={{
                      fontFamily: design.titleFont,
                      fontSize: `${design.titleSize}px`,
                      color: design.titleColor,
                      wordBreak: 'break-word',
                      hyphens: 'auto',
                      maxWidth: '90%',
                      textShadow: design.textShadowEnabled 
                        ? `${design.shadowOffsetX}px ${design.shadowOffsetY}px ${design.shadowBlur}px ${design.shadowColor}` 
                        : 'none'
                    }}
                  >
                    {design.title}
                  </h1>
                  <p
                    className="mb-auto max-w-md break-words px-2"
                    style={{
                      fontFamily: design.subtitleFont,
                      fontSize: `${design.subtitleSize}px`,
                      color: design.subtitleColor,
                      wordBreak: 'break-word',
                      hyphens: 'auto',
                      textShadow: design.textShadowEnabled 
                        ? `${design.shadowOffsetX}px ${design.shadowOffsetY}px ${design.shadowBlur}px ${design.shadowColor}` 
                        : 'none'
                    }}
                  >
                    {design.subtitle}
                  </p>
                  <p
                    className="mt-auto mb-8 tracking-wider font-medium break-words px-2"
                    style={{
                      fontFamily: design.authorFont,
                      fontSize: `${design.authorSize}px`,
                      color: design.authorColor,
                      wordBreak: 'break-word',
                      maxWidth: '90%',
                      textShadow: design.textShadowEnabled 
                        ? `${design.shadowOffsetX}px ${design.shadowOffsetY}px ${design.shadowBlur}px ${design.shadowColor}` 
                        : 'none'
                    }}
                  >
                    {design.authorName}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Controls Panel */}
          <div className={`lg:w-[55%] overflow-y-auto p-6 lg:p-10 ${
            isPreviewExpanded ? 'hidden lg:block' : 'block'
          }`}>
            <Tabs defaultValue="stock" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6 h-auto gap-1">
                <TabsTrigger value="stock" className="gap-1 text-xs sm:text-sm px-2 py-2 flex-col sm:flex-row">
                  <ImageIcon size={14} />
                  <span className="hidden md:inline">Stock</span>
                  <span className="md:hidden">Stock</span>
                </TabsTrigger>
                <TabsTrigger value="quick" className="gap-1 text-xs sm:text-sm px-2 py-2 flex-col sm:flex-row">
                  <UploadSimple size={14} />
                  <span className="hidden md:inline">Upload</span>
                  <span className="md:hidden">Upload</span>
                </TabsTrigger>
                <TabsTrigger value="background" className="gap-1 text-xs sm:text-sm px-2 py-2 flex-col sm:flex-row">
                  <Palette size={14} />
                  <span className="hidden lg:inline">Colors</span>
                  <span className="lg:hidden">Colors</span>
                </TabsTrigger>
                <TabsTrigger value="text" className="gap-1 text-xs sm:text-sm px-2 py-2">
                  <TextT size={14} />
                  <span>Text</span>
                </TabsTrigger>
              </TabsList>

              {/* Quick Upload Tab */}
              <TabsContent value="quick" className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Upload Your Cover Image</Label>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Upload a complete pre-made cover OR upload a background image to customize
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
                  <div className="flex flex-col items-center gap-2 text-foreground">
                    <UploadSimple size={32} />
                    <span className="font-medium text-foreground">Click to upload your cover image</span>
                    <span className="text-xs text-muted-foreground">Recommended: 1600x2560px (PNG or JPG)</span>
                  </div>
                </Button>

                {design.backgroundImage && (
                  <div className="space-y-6 pt-4 border-t">
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
                          <SelectItem value="cover" className="text-base py-3">Cover (Fill & crop to fit)</SelectItem>
                          <SelectItem value="contain" className="text-base py-3">Contain (Fit inside, no crop)</SelectItem>
                          <SelectItem value="fill" className="text-base py-3">Fill (Stretch to fill)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        {design.imagePosition === 'cover' && '• Fills the cover, cropping edges if needed'}
                        {design.imagePosition === 'contain' && '• Shows full image, may have empty space'}
                        {design.imagePosition === 'fill' && '• Stretches to fill, may distort image'}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-base font-medium">Image Alignment</Label>
                      <Select
                        value={design.imageAlignment || 'center'}
                        onValueChange={(value: any) => updateDesign({ imageAlignment: value })}
                      >
                        <SelectTrigger className="h-12 text-base">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="center" className="text-base py-3">Center</SelectItem>
                          <SelectItem value="top" className="text-base py-3">Top</SelectItem>
                          <SelectItem value="bottom" className="text-base py-3">Bottom</SelectItem>
                          <SelectItem value="left" className="text-base py-3">Left</SelectItem>
                          <SelectItem value="right" className="text-base py-3">Right</SelectItem>
                          <SelectItem value="top-left" className="text-base py-3">Top Left</SelectItem>
                          <SelectItem value="top-right" className="text-base py-3">Top Right</SelectItem>
                          <SelectItem value="bottom-left" className="text-base py-3">Bottom Left</SelectItem>
                          <SelectItem value="bottom-right" className="text-base py-3">Bottom Right</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Position the image within the cover area
                      </p>
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
                )}
              </TabsContent>

              {/* Stock Images Tab */}
              <TabsContent value="stock" className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Professional Stock Images</Label>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Choose from {STOCK_IMAGES.length} curated high-quality background images
                  </p>
                </div>

                {/* Category Filter */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Filter by Category</Label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={selectedCategory === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory('all')}
                      className="text-xs"
                    >
                      All ({STOCK_IMAGES.length})
                    </Button>
                    <Button
                      variant={selectedCategory === 'abstract' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory('abstract')}
                      className="text-xs"
                    >
                      Abstract ({STOCK_IMAGES.filter(img => img.category === 'abstract').length})
                    </Button>
                    <Button
                      variant={selectedCategory === 'nature' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory('nature')}
                      className="text-xs"
                    >
                      Nature ({STOCK_IMAGES.filter(img => img.category === 'nature').length})
                    </Button>
                    <Button
                      variant={selectedCategory === 'business' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory('business')}
                      className="text-xs"
                    >
                      Business ({STOCK_IMAGES.filter(img => img.category === 'business').length})
                    </Button>
                    <Button
                      variant={selectedCategory === 'minimal' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory('minimal')}
                      className="text-xs"
                    >
                      Minimal ({STOCK_IMAGES.filter(img => img.category === 'minimal').length})
                    </Button>
                    <Button
                      variant={selectedCategory === 'urban' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory('urban')}
                      className="text-xs"
                    >
                      Urban ({STOCK_IMAGES.filter(img => img.category === 'urban').length})
                    </Button>
                    <Button
                      variant={selectedCategory === 'artistic' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory('artistic')}
                      className="text-xs"
                    >
                      Artistic ({STOCK_IMAGES.filter(img => img.category === 'artistic').length})
                    </Button>
                    <Button
                      variant={selectedCategory === 'texture' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory('texture')}
                      className="text-xs"
                    >
                      Texture ({STOCK_IMAGES.filter(img => img.category === 'texture').length})
                    </Button>
                    <Button
                      variant={selectedCategory === 'book-themed' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory('book-themed')}
                      className="text-xs"
                    >
                      Books ({STOCK_IMAGES.filter(img => img.category === 'book-themed').length})
                    </Button>
                    <Button
                      variant={selectedCategory === 'vintage' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory('vintage')}
                      className="text-xs"
                    >
                      Vintage ({STOCK_IMAGES.filter(img => img.category === 'vintage').length})
                    </Button>
                    <Button
                      variant={selectedCategory === 'tech' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory('tech')}
                      className="text-xs"
                    >
                      Tech ({STOCK_IMAGES.filter(img => img.category === 'tech').length})
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
                  {STOCK_IMAGES.filter(img => selectedCategory === 'all' || img.category === selectedCategory).map((image) => (
                    <Card
                      key={image.id}
                      className="cursor-pointer neomorph-flat border-0 overflow-hidden hover:neomorph-raised transition-all hover:scale-[1.02] rounded-lg bg-card"
                      onClick={() => {
                        updateDesign({
                          backgroundType: 'image',
                          backgroundImage: image.url,
                          usePreMadeCover: false,
                        });
                        toast.success(`Applied ${image.name}`);
                      }}
                    >
                      <div className="relative aspect-[5/8] overflow-hidden rounded-lg bg-card">
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

                <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <p className="text-sm text-primary font-medium">💡 Pro Tip</p>
                  <p className="text-xs text-muted-foreground mt-1">After selecting a stock image, go to Upload Cover tab to adjust image placement, or use Text tab to customize your title.</p>
                </div>
              </TabsContent>

              {/* Background Tab */}
              <TabsContent value="background" className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-bold">Background Colors</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Choose from stunning gradient presets or create your own custom colors
                  </p>
                </div>

                <Tabs defaultValue={design.backgroundType === 'image' ? 'gradient' : design.backgroundType} onValueChange={(value: any) => updateDesign({ backgroundType: value })} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 h-12 mb-6">
                    <TabsTrigger value="gradient" className="text-sm font-medium">Gradient</TabsTrigger>
                    <TabsTrigger value="solid" className="text-sm font-medium">Solid Color</TabsTrigger>
                  </TabsList>

                  {/* Gradient Sub-Tab - NOW FIRST */}
                  <TabsContent value="gradient" className="space-y-6">
                      {/* Gradient Preset Gallery */}
                      <div className="space-y-4">
                        <Label className="text-base font-bold">Gradient Presets</Label>
                        <p className="text-sm text-muted-foreground">Click any gradient to apply instantly</p>
                        
                        {/* Premium Gradients Category */}
                        <div className="space-y-3">
                          <Label className="text-sm font-semibold text-primary">✨ Premium Collection</Label>
                          <div className="grid grid-cols-3 gap-3">
                            <button
                              onClick={() => updateDesign({ backgroundType: 'gradient', gradientStart: '#667eea', gradientEnd: '#764ba2', gradientDirection: 'to-br' })}
                              className="h-20 rounded-xl border-2 border-border hover:border-primary hover:scale-105 transition-all shadow-md"
                              style={{ background: 'linear-gradient(to bottom right, #667eea, #764ba2)' }}
                              title="Purple Dream"
                            />
                            <button
                              onClick={() => updateDesign({ backgroundType: 'gradient', gradientStart: '#f857a6', gradientEnd: '#ff5858', gradientDirection: 'to-br' })}
                              className="h-20 rounded-xl border-2 border-border hover:border-primary hover:scale-105 transition-all shadow-md"
                              style={{ background: 'linear-gradient(to bottom right, #f857a6, #ff5858)' }}
                              title="Sunset Bliss"
                            />
                            <button
                              onClick={() => updateDesign({ backgroundType: 'gradient', gradientStart: '#00c6ff', gradientEnd: '#0072ff', gradientDirection: 'to-br' })}
                              className="h-20 rounded-xl border-2 border-border hover:border-primary hover:scale-105 transition-all shadow-md"
                              style={{ background: 'linear-gradient(to bottom right, #00c6ff, #0072ff)' }}
                              title="Ocean Blue"
                            />
                            <button
                              onClick={() => updateDesign({ backgroundType: 'gradient', gradientStart: '#f093fb', gradientEnd: '#f5576c', gradientDirection: 'to-r' })}
                              className="h-20 rounded-xl border-2 border-border hover:border-primary hover:scale-105 transition-all shadow-md"
                              style={{ background: 'linear-gradient(to right, #f093fb, #f5576c)' }}
                              title="Pink Lemonade"
                            />
                            <button
                              onClick={() => updateDesign({ backgroundType: 'gradient', gradientStart: '#4facfe', gradientEnd: '#00f2fe', gradientDirection: 'to-r' })}
                              className="h-20 rounded-xl border-2 border-border hover:border-primary hover:scale-105 transition-all shadow-md"
                              style={{ background: 'linear-gradient(to right, #4facfe, #00f2fe)' }}
                              title="Fresh Air"
                            />
                            <button
                              onClick={() => updateDesign({ backgroundType: 'gradient', gradientStart: '#43e97b', gradientEnd: '#38f9d7', gradientDirection: 'to-r' })}
                              className="h-20 rounded-xl border-2 border-border hover:border-primary hover:scale-105 transition-all shadow-md"
                              style={{ background: 'linear-gradient(to right, #43e97b, #38f9d7)' }}
                              title="Mint Fresh"
                            />
                          </div>
                        </div>

                        {/* Warm Tones Category */}
                        <div className="space-y-3">
                          <Label className="text-sm font-semibold text-orange-600 dark:text-orange-400">🔥 Warm & Energetic</Label>
                          <div className="grid grid-cols-3 gap-3">
                            <button
                              onClick={() => updateDesign({ backgroundType: 'gradient', gradientStart: '#fa709a', gradientEnd: '#fee140', gradientDirection: 'to-b' })}
                              className="h-20 rounded-xl border-2 border-border hover:border-primary hover:scale-105 transition-all shadow-md"
                              style={{ background: 'linear-gradient(to bottom, #fa709a, #fee140)' }}
                              title="Summer Warmth"
                            />
                            <button
                              onClick={() => updateDesign({ backgroundType: 'gradient', gradientStart: '#ff6a00', gradientEnd: '#ee0979', gradientDirection: 'to-br' })}
                              className="h-20 rounded-xl border-2 border-border hover:border-primary hover:scale-105 transition-all shadow-md"
                              style={{ background: 'linear-gradient(to bottom right, #ff6a00, #ee0979)' }}
                              title="Burning Fire"
                            />
                            <button
                              onClick={() => updateDesign({ backgroundType: 'gradient', gradientStart: '#f83600', gradientEnd: '#f9d423', gradientDirection: 'to-r' })}
                              className="h-20 rounded-xl border-2 border-border hover:border-primary hover:scale-105 transition-all shadow-md"
                              style={{ background: 'linear-gradient(to right, #f83600, #f9d423)' }}
                              title="Fiery Sunset"
                            />
                            <button
                              onClick={() => updateDesign({ backgroundType: 'gradient', gradientStart: '#eb3349', gradientEnd: '#f45c43', gradientDirection: 'to-r' })}
                              className="h-20 rounded-xl border-2 border-border hover:border-primary hover:scale-105 transition-all shadow-md"
                              style={{ background: 'linear-gradient(to right, #eb3349, #f45c43)' }}
                              title="Cherry Red"
                            />
                            <button
                              onClick={() => updateDesign({ backgroundType: 'gradient', gradientStart: '#ff9966', gradientEnd: '#ff5e62', gradientDirection: 'to-br' })}
                              className="h-20 rounded-xl border-2 border-border hover:border-primary hover:scale-105 transition-all shadow-md"
                              style={{ background: 'linear-gradient(to bottom right, #ff9966, #ff5e62)' }}
                              title="Peach Flame"
                            />
                            <button
                              onClick={() => updateDesign({ backgroundType: 'gradient', gradientStart: '#fc4a1a', gradientEnd: '#f7b733', gradientDirection: 'to-r' })}
                              className="h-20 rounded-xl border-2 border-border hover:border-primary hover:scale-105 transition-all shadow-md"
                              style={{ background: 'linear-gradient(to right, #fc4a1a, #f7b733)' }}
                              title="Golden Hour"
                            />
                          </div>
                        </div>

                        {/* Cool Tones Category */}
                        <div className="space-y-3">
                          <Label className="text-sm font-semibold text-blue-600 dark:text-blue-400">❄️ Cool & Calm</Label>
                          <div className="grid grid-cols-3 gap-3">
                            <button
                              onClick={() => updateDesign({ backgroundType: 'gradient', gradientStart: '#30cfd0', gradientEnd: '#330867', gradientDirection: 'to-b' })}
                              className="h-20 rounded-xl border-2 border-border hover:border-primary hover:scale-105 transition-all shadow-md"
                              style={{ background: 'linear-gradient(to bottom, #30cfd0, #330867)' }}
                              title="Deep Ocean"
                            />
                            <button
                              onClick={() => updateDesign({ backgroundType: 'gradient', gradientStart: '#a8edea', gradientEnd: '#fed6e3', gradientDirection: 'to-b' })}
                              className="h-20 rounded-xl border-2 border-border hover:border-primary hover:scale-105 transition-all shadow-md"
                              style={{ background: 'linear-gradient(to bottom, #a8edea, #fed6e3)' }}
                              title="Pastel Dream"
                            />
                            <button
                              onClick={() => updateDesign({ backgroundType: 'gradient', gradientStart: '#89f7fe', gradientEnd: '#66a6ff', gradientDirection: 'to-br' })}
                              className="h-20 rounded-xl border-2 border-border hover:border-primary hover:scale-105 transition-all shadow-md"
                              style={{ background: 'linear-gradient(to bottom right, #89f7fe, #66a6ff)' }}
                              title="Sky Blue"
                            />
                            <button
                              onClick={() => updateDesign({ backgroundType: 'gradient', gradientStart: '#06beb6', gradientEnd: '#48b1bf', gradientDirection: 'to-r' })}
                              className="h-20 rounded-xl border-2 border-border hover:border-primary hover:scale-105 transition-all shadow-md"
                              style={{ background: 'linear-gradient(to right, #06beb6, #48b1bf)' }}
                              title="Teal Breeze"
                            />
                            <button
                              onClick={() => updateDesign({ backgroundType: 'gradient', gradientStart: '#16a085', gradientEnd: '#f4d03f', gradientDirection: 'to-br' })}
                              className="h-20 rounded-xl border-2 border-border hover:border-primary hover:scale-105 transition-all shadow-md"
                              style={{ background: 'linear-gradient(to bottom right, #16a085, #f4d03f)' }}
                              title="Tropical"
                            />
                            <button
                              onClick={() => updateDesign({ backgroundType: 'gradient', gradientStart: '#2193b0', gradientEnd: '#6dd5ed', gradientDirection: 'to-r' })}
                              className="h-20 rounded-xl border-2 border-border hover:border-primary hover:scale-105 transition-all shadow-md"
                              style={{ background: 'linear-gradient(to right, #2193b0, #6dd5ed)' }}
                              title="Crystal Water"
                            />
                          </div>
                        </div>

                        {/* Dark & Elegant Category */}
                        <div className="space-y-3">
                          <Label className="text-sm font-semibold text-purple-600 dark:text-purple-400">🌙 Dark & Elegant</Label>
                          <div className="grid grid-cols-3 gap-3">
                            <button
                              onClick={() => updateDesign({ backgroundType: 'gradient', gradientStart: '#141e30', gradientEnd: '#243b55', gradientDirection: 'to-br' })}
                              className="h-20 rounded-xl border-2 border-border hover:border-primary hover:scale-105 transition-all shadow-md"
                              style={{ background: 'linear-gradient(to bottom right, #141e30, #243b55)' }}
                              title="Midnight"
                            />
                            <button
                              onClick={() => updateDesign({ backgroundType: 'gradient', gradientStart: '#000000', gradientEnd: '#434343', gradientDirection: 'to-r' })}
                              className="h-20 rounded-xl border-2 border-border hover:border-primary hover:scale-105 transition-all shadow-md"
                              style={{ background: 'linear-gradient(to right, #000000, #434343)' }}
                              title="Carbon"
                            />
                            <button
                              onClick={() => updateDesign({ backgroundType: 'gradient', gradientStart: '#4b6cb7', gradientEnd: '#182848', gradientDirection: 'to-b' })}
                              className="h-20 rounded-xl border-2 border-border hover:border-primary hover:scale-105 transition-all shadow-md"
                              style={{ background: 'linear-gradient(to bottom, #4b6cb7, #182848)' }}
                              title="Navy Night"
                            />
                            <button
                              onClick={() => updateDesign({ backgroundType: 'gradient', gradientStart: '#2c3e50', gradientEnd: '#4ca1af', gradientDirection: 'to-br' })}
                              className="h-20 rounded-xl border-2 border-border hover:border-primary hover:scale-105 transition-all shadow-md"
                              style={{ background: 'linear-gradient(to bottom right, #2c3e50, #4ca1af)' }}
                              title="Steel Blue"
                            />
                            <button
                              onClick={() => updateDesign({ backgroundType: 'gradient', gradientStart: '#2c3e50', gradientEnd: '#fd746c', gradientDirection: 'to-r' })}
                              className="h-20 rounded-xl border-2 border-border hover:border-primary hover:scale-105 transition-all shadow-md"
                              style={{ background: 'linear-gradient(to right, #2c3e50, #fd746c)' }}
                              title="Dark Coral"
                            />
                            <button
                              onClick={() => updateDesign({ backgroundType: 'gradient', gradientStart: '#232526', gradientEnd: '#414345', gradientDirection: 'to-br' })}
                              className="h-20 rounded-xl border-2 border-border hover:border-primary hover:scale-105 transition-all shadow-md"
                              style={{ background: 'linear-gradient(to bottom right, #232526, #414345)' }}
                              title="Graphite"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Custom Gradient Controls */}
                      <div className="space-y-4 pt-4 border-t">
                        <Label className="text-base font-bold">Custom Gradient</Label>
                        <p className="text-sm text-muted-foreground">Fine-tune your gradient colors and direction</p>
                        
                        <div className="space-y-3">
                          <Label className="text-sm font-medium">Start Color</Label>
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
                          <Label className="text-sm font-medium">End Color</Label>
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
                          <Label className="text-sm font-medium">Gradient Direction</Label>
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
                      </div>
                    </TabsContent>

                  {/* Solid Color Sub-Tab - NOW SECOND */}
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
                        <button
                          onClick={() => updateDesign({ backgroundType: 'solid', backgroundColor: '#ec4899' })}
                          className="h-16 rounded-lg border-2 border-border hover:border-primary transition-colors bg-pink-600"
                          title="Pink"
                        />
                        <button
                          onClick={() => updateDesign({ backgroundType: 'solid', backgroundColor: '#8b5cf6' })}
                          className="h-16 rounded-lg border-2 border-border hover:border-primary transition-colors bg-purple-600"
                          title="Purple"
                        />
                        <button
                          onClick={() => updateDesign({ backgroundType: 'solid', backgroundColor: '#0891b2' })}
                          className="h-16 rounded-lg border-2 border-border hover:border-primary transition-colors bg-cyan-600"
                          title="Cyan"
                        />
                        <button
                          onClick={() => updateDesign({ backgroundType: 'solid', backgroundColor: '#65a30d' })}
                          className="h-16 rounded-lg border-2 border-border hover:border-primary transition-colors bg-lime-600"
                          title="Lime"
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </TabsContent>

              {/* Text Tab */}
              <TabsContent value="text" className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-bold">Text Content & Styling</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Customize your title, subtitle, and author text with live preview
                  </p>
                </div>

                {/* Layout Presets */}
                <Card className="p-5 border-2">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Label className="text-base font-bold">Text Layout</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">Choose a preset or customize positions</p>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => updateDesign({ 
                          titlePosition: 40,
                          subtitlePosition: 50,
                          authorPosition: 80
                        })}
                        className="group h-20 rounded-xl border-2 border-border hover:border-primary hover:shadow-md transition-all flex flex-col items-center justify-center gap-1 px-4 bg-card"
                      >
                        <div className="flex flex-col gap-1 w-full items-center">
                          <div className="w-16 h-1.5 bg-primary rounded"></div>
                          <div className="w-12 h-1 bg-muted-foreground/50 rounded"></div>
                          <div className="w-10 h-1 bg-muted-foreground/30 rounded mt-2"></div>
                        </div>
                        <span className="text-xs font-semibold mt-1">Classic</span>
                      </button>
                      
                      <button
                        onClick={() => updateDesign({ 
                          titlePosition: 50,
                          subtitlePosition: 58,
                          authorPosition: 90
                        })}
                        className="group h-20 rounded-xl border-2 border-border hover:border-primary hover:shadow-md transition-all flex flex-col items-center justify-center gap-1 px-4 bg-card"
                      >
                        <div className="flex flex-col gap-1 w-full items-center">
                          <div className="w-16 h-1.5 bg-primary rounded mt-3"></div>
                          <div className="w-12 h-1 bg-muted-foreground/50 rounded"></div>
                          <div className="w-10 h-1 bg-muted-foreground/30 rounded mt-4"></div>
                        </div>
                        <span className="text-xs font-semibold mt-1">Modern</span>
                      </button>
                      
                      <button
                        onClick={() => updateDesign({ 
                          titlePosition: 30,
                          subtitlePosition: 50,
                          authorPosition: 70
                        })}
                        className="group h-20 rounded-xl border-2 border-border hover:border-primary hover:shadow-md transition-all flex flex-col items-center justify-center gap-1 px-4 bg-card"
                      >
                        <div className="flex flex-col gap-1 w-full items-center">
                          <div className="w-16 h-1.5 bg-primary rounded"></div>
                          <div className="w-12 h-1 bg-muted-foreground/50 rounded mt-2"></div>
                          <div className="w-10 h-1 bg-muted-foreground/30 rounded mt-2"></div>
                        </div>
                        <span className="text-xs font-semibold mt-1">Balanced</span>
                      </button>
                      
                      <button
                        onClick={() => updateDesign({ 
                          titlePosition: 20,
                          subtitlePosition: 28,
                          authorPosition: 85
                        })}
                        className="group h-20 rounded-xl border-2 border-border hover:border-primary hover:shadow-md transition-all flex flex-col items-center justify-center gap-1 px-4 bg-card"
                      >
                        <div className="flex flex-col gap-1 w-full items-center">
                          <div className="w-16 h-1.5 bg-primary rounded"></div>
                          <div className="w-12 h-1 bg-muted-foreground/50 rounded"></div>
                          <div className="w-10 h-1 bg-muted-foreground/30 rounded mt-6"></div>
                        </div>
                        <span className="text-xs font-semibold mt-1">Top Heavy</span>
                      </button>
                    </div>
                  </div>
                </Card>

                {/* Title Section */}
                <Card className="p-5 border-2">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-600"></div>
                      <Label className="text-base font-bold">Title</Label>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Text</Label>
                      <Input
                        value={design.title}
                        onChange={(e) => updateDesign({ title: e.target.value })}
                        placeholder="Your Book Title"
                        className="h-12 text-base font-semibold border-2"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Font</Label>
                        <Select
                          value={design.titleFont}
                          onValueChange={(value) => updateDesign({ titleFont: value })}
                        >
                          <SelectTrigger className="h-12 text-base border-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px]">
                            {FONTS.map((font) => (
                              <SelectItem 
                                key={font.value} 
                                value={font.value} 
                                className="text-base py-3 cursor-pointer hover:bg-accent"
                                style={{ fontFamily: font.value }}
                              >
                                <span style={{ fontFamily: font.value, fontSize: '16px' }}>
                                  {font.label}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Color</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={design.titleColor}
                            onChange={(e) => updateDesign({ titleColor: e.target.value })}
                            className="w-16 h-12 cursor-pointer border-2"
                          />
                          <Input
                            type="text"
                            value={design.titleColor}
                            onChange={(e) => updateDesign({ titleColor: e.target.value })}
                            className="flex-1 h-12 text-sm border-2 font-mono"
                            placeholder="#ffffff"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm text-muted-foreground">Size</Label>
                        <Badge variant="secondary" className="text-xs">{design.titleSize}px</Badge>
                      </div>
                      <Slider
                        value={[design.titleSize]}
                        onValueChange={([value]) => updateDesign({ titleSize: value })}
                        min={24}
                        max={80}
                        step={2}
                        className="py-3"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground pt-1">
                        <span>Small (24px)</span>
                        <span>Large (80px)</span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm text-muted-foreground">Vertical Position</Label>
                        <Badge variant="secondary" className="text-xs">{design.titlePosition || 40}%</Badge>
                      </div>
                      <Slider
                        value={[design.titlePosition || 40]}
                        onValueChange={([value]) => updateDesign({ titlePosition: value })}
                        min={10}
                        max={90}
                        step={1}
                        className="py-3"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground pt-1">
                        <span>Top (10%)</span>
                        <span>Bottom (90%)</span>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Subtitle Section */}
                <Card className="p-5 border-2">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                      <Label className="text-base font-bold">Subtitle</Label>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Text</Label>
                      <Input
                        value={design.subtitle}
                        onChange={(e) => updateDesign({ subtitle: e.target.value })}
                        placeholder="A compelling subtitle"
                        className="h-12 text-base border-2"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Font</Label>
                        <Select
                          value={design.subtitleFont}
                          onValueChange={(value) => updateDesign({ subtitleFont: value })}
                        >
                          <SelectTrigger className="h-12 text-base border-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px]">
                            {FONTS.map((font) => (
                              <SelectItem 
                                key={font.value} 
                                value={font.value} 
                                className="text-base py-3 cursor-pointer hover:bg-accent"
                                style={{ fontFamily: font.value }}
                              >
                                <span style={{ fontFamily: font.value, fontSize: '16px' }}>
                                  {font.label}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Color</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={design.subtitleColor}
                            onChange={(e) => updateDesign({ subtitleColor: e.target.value })}
                            className="w-16 h-12 cursor-pointer border-2"
                          />
                          <Input
                            type="text"
                            value={design.subtitleColor}
                            onChange={(e) => updateDesign({ subtitleColor: e.target.value })}
                            className="flex-1 h-12 text-sm border-2 font-mono"
                            placeholder="#e0e7ff"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm text-muted-foreground">Size</Label>
                        <Badge variant="secondary" className="text-xs">{design.subtitleSize}px</Badge>
                      </div>
                      <Slider
                        value={[design.subtitleSize]}
                        onValueChange={([value]) => updateDesign({ subtitleSize: value })}
                        min={14}
                        max={40}
                        step={2}
                        className="py-3"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground pt-1">
                        <span>Small (14px)</span>
                        <span>Large (40px)</span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm text-muted-foreground">Vertical Position</Label>
                        <Badge variant="secondary" className="text-xs">{design.subtitlePosition || 50}%</Badge>
                      </div>
                      <Slider
                        value={[design.subtitlePosition || 50]}
                        onValueChange={([value]) => updateDesign({ subtitlePosition: value })}
                        min={10}
                        max={90}
                        step={1}
                        className="py-3"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground pt-1">
                        <span>Top (10%)</span>
                        <span>Bottom (90%)</span>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Author Section */}
                <Card className="p-5 border-2">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-600"></div>
                      <Label className="text-base font-bold">Author Name</Label>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Text</Label>
                      <Input
                        value={design.authorName}
                        onChange={(e) => updateDesign({ authorName: e.target.value })}
                        placeholder="Author Name"
                        className="h-12 text-base border-2"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Font</Label>
                        <Select
                          value={design.authorFont}
                          onValueChange={(value) => updateDesign({ authorFont: value })}
                        >
                          <SelectTrigger className="h-12 text-base border-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px]">
                            {FONTS.map((font) => (
                              <SelectItem 
                                key={font.value} 
                                value={font.value} 
                                className="text-base py-3 cursor-pointer hover:bg-accent"
                                style={{ fontFamily: font.value }}
                              >
                                <span style={{ fontFamily: font.value, fontSize: '16px' }}>
                                  {font.label}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Color</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={design.authorColor}
                            onChange={(e) => updateDesign({ authorColor: e.target.value })}
                            className="w-16 h-12 cursor-pointer border-2"
                          />
                          <Input
                            type="text"
                            value={design.authorColor}
                            onChange={(e) => updateDesign({ authorColor: e.target.value })}
                            className="flex-1 h-12 text-sm border-2 font-mono"
                            placeholder="#f0f9ff"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm text-muted-foreground">Size</Label>
                        <Badge variant="secondary" className="text-xs">{design.authorSize}px</Badge>
                      </div>
                      <Slider
                        value={[design.authorSize]}
                        onValueChange={([value]) => updateDesign({ authorSize: value })}
                        min={12}
                        max={32}
                        step={2}
                        className="py-3"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground pt-1">
                        <span>Small (12px)</span>
                        <span>Large (32px)</span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm text-muted-foreground">Vertical Position</Label>
                        <Badge variant="secondary" className="text-xs">{design.authorPosition || 80}%</Badge>
                      </div>
                      <Slider
                        value={[design.authorPosition || 80]}
                        onValueChange={([value]) => updateDesign({ authorPosition: value })}
                        min={10}
                        max={90}
                        step={1}
                        className="py-3"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground pt-1">
                        <span>Top (10%)</span>
                        <span>Bottom (90%)</span>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Text Shadow Controls */}
                <Card className="p-5 border-2">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-base font-bold">Text Shadow</Label>
                        <p className="text-sm text-muted-foreground">Add depth and readability to your text</p>
                      </div>
                      <Switch
                        checked={design.textShadowEnabled ?? true}
                        onCheckedChange={(checked) => updateDesign({ textShadowEnabled: checked })}
                      />
                    </div>
                    
                    {design.textShadowEnabled && (
                      <div className="space-y-4 pt-2 border-t">
                        {/* Shadow Blur */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Blur Amount</Label>
                            <Badge variant="secondary" className="text-xs">{design.shadowBlur ?? 8}px</Badge>
                          </div>
                          <Slider
                            value={[design.shadowBlur ?? 8]}
                            onValueChange={([value]) => updateDesign({ shadowBlur: value })}
                            min={0}
                            max={20}
                            step={1}
                            className="py-3"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Sharp (0px)</span>
                            <span>Soft (20px)</span>
                          </div>
                        </div>

                        {/* Shadow Offset X */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Horizontal Offset</Label>
                            <Badge variant="secondary" className="text-xs">{design.shadowOffsetX ?? 2}px</Badge>
                          </div>
                          <Slider
                            value={[design.shadowOffsetX ?? 2]}
                            onValueChange={([value]) => updateDesign({ shadowOffsetX: value })}
                            min={-10}
                            max={10}
                            step={1}
                            className="py-3"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>← Left (-10px)</span>
                            <span>Right (10px) →</span>
                          </div>
                        </div>

                        {/* Shadow Offset Y */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Vertical Offset</Label>
                            <Badge variant="secondary" className="text-xs">{design.shadowOffsetY ?? 2}px</Badge>
                          </div>
                          <Slider
                            value={[design.shadowOffsetY ?? 2]}
                            onValueChange={([value]) => updateDesign({ shadowOffsetY: value })}
                            min={-10}
                            max={10}
                            step={1}
                            className="py-3"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>↑ Up (-10px)</span>
                            <span>Down (10px) ↓</span>
                          </div>
                        </div>

                        {/* Shadow Color */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Shadow Color</Label>
                          <div className="flex gap-3">
                            <Input
                              type="color"
                              value={design.shadowColor?.startsWith('rgba') ? '#000000' : (design.shadowColor || '#000000')}
                              onChange={(e) => updateDesign({ shadowColor: e.target.value })}
                              className="w-20 h-12 cursor-pointer"
                            />
                            <Input
                              type="text"
                              value={design.shadowColor || 'rgba(0, 0, 0, 0.8)'}
                              onChange={(e) => updateDesign({ shadowColor: e.target.value })}
                              className="flex-1 h-12 text-sm"
                              placeholder="rgba(0, 0, 0, 0.8)"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">Use rgba() for transparency or hex colors</p>
                        </div>

                        {/* Shadow Presets */}
                        <div className="space-y-2 pt-2 border-t">
                          <Label className="text-sm font-medium">Quick Presets</Label>
                          <div className="grid grid-cols-3 gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateDesign({ 
                                shadowBlur: 8, 
                                shadowOffsetX: 2, 
                                shadowOffsetY: 2, 
                                shadowColor: 'rgba(0, 0, 0, 0.8)' 
                              })}
                              className="text-xs"
                            >
                              Subtle
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateDesign({ 
                                shadowBlur: 15, 
                                shadowOffsetX: 4, 
                                shadowOffsetY: 4, 
                                shadowColor: 'rgba(0, 0, 0, 0.9)' 
                              })}
                              className="text-xs"
                            >
                              Bold
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateDesign({ 
                                shadowBlur: 20, 
                                shadowOffsetX: 0, 
                                shadowOffsetY: 0, 
                                shadowColor: 'rgba(0, 0, 0, 0.7)' 
                              })}
                              className="text-xs"
                            >
                              Glow
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Quick Color Palettes */}
                <Card className="p-5 border-2">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Label className="text-base font-bold">Quick Color Themes</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">Apply professional color combinations instantly</p>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => updateDesign({ 
                          titleColor: '#ffffff', 
                          subtitleColor: '#e0e0e0', 
                          authorColor: '#ffffff' 
                        })}
                        className="group h-16 rounded-xl border-2 border-border hover:border-primary hover:shadow-md transition-all flex items-center gap-3 px-4 bg-card"
                      >
                        <div className="flex gap-1.5">
                          <div className="w-7 h-7 rounded-lg bg-white border-2 border-gray-300 shadow-sm" />
                          <div className="w-7 h-7 rounded-lg bg-gray-200 border-2 border-gray-300 shadow-sm" />
                        </div>
                        <span className="text-sm font-semibold group-hover:text-primary transition-colors">Classic White</span>
                      </button>
                      
                      <button
                        onClick={() => updateDesign({ 
                          titleColor: '#000000', 
                          subtitleColor: '#333333', 
                          authorColor: '#000000' 
                        })}
                        className="group h-16 rounded-xl border-2 border-border hover:border-primary hover:shadow-md transition-all flex items-center gap-3 px-4 bg-card"
                      >
                        <div className="flex gap-1.5">
                          <div className="w-7 h-7 rounded-lg bg-black border-2 border-gray-300 shadow-sm" />
                          <div className="w-7 h-7 rounded-lg bg-gray-700 border-2 border-gray-300 shadow-sm" />
                        </div>
                        <span className="text-sm font-semibold group-hover:text-primary transition-colors">Bold Black</span>
                      </button>
                      
                      <button
                        onClick={() => updateDesign({ 
                          titleColor: '#ffd700', 
                          subtitleColor: '#fff8dc', 
                          authorColor: '#ffd700' 
                        })}
                        className="group h-16 rounded-xl border-2 border-border hover:border-primary hover:shadow-md transition-all flex items-center gap-3 px-4 bg-card"
                      >
                        <div className="flex gap-1.5">
                          <div className="w-7 h-7 rounded-lg bg-yellow-400 border-2 border-gray-300 shadow-sm" />
                          <div className="w-7 h-7 rounded-lg bg-yellow-100 border-2 border-gray-300 shadow-sm" />
                        </div>
                        <span className="text-sm font-semibold group-hover:text-primary transition-colors">Elegant Gold</span>
                      </button>
                      
                      <button
                        onClick={() => updateDesign({ 
                          titleColor: '#e91e63', 
                          subtitleColor: '#fce4ec', 
                          authorColor: '#c2185b' 
                        })}
                        className="group h-16 rounded-xl border-2 border-border hover:border-primary hover:shadow-md transition-all flex items-center gap-3 px-4 bg-card"
                      >
                        <div className="flex gap-1.5">
                          <div className="w-7 h-7 rounded-lg bg-pink-600 border-2 border-gray-300 shadow-sm" />
                          <div className="w-7 h-7 rounded-lg bg-pink-100 border-2 border-gray-300 shadow-sm" />
                        </div>
                        <span className="text-sm font-semibold group-hover:text-primary transition-colors">Vibrant Pink</span>
                      </button>
                      
                      <button
                        onClick={() => updateDesign({ 
                          titleColor: '#2196f3', 
                          subtitleColor: '#e3f2fd', 
                          authorColor: '#1976d2' 
                        })}
                        className="group h-16 rounded-xl border-2 border-border hover:border-primary hover:shadow-md transition-all flex items-center gap-3 px-4 bg-card"
                      >
                        <div className="flex gap-1.5">
                          <div className="w-7 h-7 rounded-lg bg-blue-500 border-2 border-gray-300 shadow-sm" />
                          <div className="w-7 h-7 rounded-lg bg-blue-100 border-2 border-gray-300 shadow-sm" />
                        </div>
                        <span className="text-sm font-semibold group-hover:text-primary transition-colors">Ocean Blue</span>
                      </button>
                      
                      <button
                        onClick={() => updateDesign({ 
                          titleColor: '#8b5cf6', 
                          subtitleColor: '#ede9fe', 
                          authorColor: '#7c3aed' 
                        })}
                        className="group h-16 rounded-xl border-2 border-border hover:border-primary hover:shadow-md transition-all flex items-center gap-3 px-4 bg-card"
                      >
                        <div className="flex gap-1.5">
                          <div className="w-7 h-7 rounded-lg bg-violet-500 border-2 border-gray-300 shadow-sm" />
                          <div className="w-7 h-7 rounded-lg bg-violet-100 border-2 border-gray-300 shadow-sm" />
                        </div>
                        <span className="text-sm font-semibold group-hover:text-primary transition-colors">Royal Purple</span>
                      </button>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Footer Actions - Hidden on mobile when preview expanded */}
        <div className={`p-4 lg:p-6 border-t ${
          isPreviewExpanded ? 'hidden lg:block' : 'block'
        }`}>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              className="h-10 px-4 order-3 sm:order-1"
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
              className="h-10 px-4 order-2"
            >
              Reset
            </Button>
            <Button 
              onClick={saveCover} 
              className="gap-2 h-10 px-6 font-semibold sm:ml-auto order-1 sm:order-3"
            >
              <Download size={18} />
              Save Cover
            </Button>
          </div>
        </div>

        {/* Floating Save Button - Only visible on mobile when preview is expanded */}
        {isPreviewExpanded && (
          <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex gap-3">
            <Button 
              variant="outline"
              onClick={() => setIsPreviewExpanded(false)}
              className="h-12 px-6 text-base shadow-lg bg-background"
            >
              Edit Design
            </Button>
            <Button 
              onClick={saveCover}
              className="gap-2 h-12 px-8 text-base font-semibold shadow-lg"
            >
              <Download size={18} />
              Save Cover
            </Button>
          </div>
        )}
      </DialogContent>

      {/* Upgrade Modal */}
      <UpgradeModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        highlightMessage="Upgrade to Premium for unlimited projects"
      />
    </Dialog>
  );
}
