export interface Chapter {
  id: string;
  title: string;
  content: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BrandConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl?: string;
  fontFamily: string;
  coverStyle: 'minimal' | 'gradient' | 'image';
  coverImageUrl?: string;
}

export interface CoverDesign {
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
  imagePosition?: 'cover' | 'contain' | 'fill';
  imageAlignment?: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  imageBrightness?: number;
  imageContrast?: number;
  usePreMadeCover?: boolean;
  coverImageData?: string; // Base64 image data
}

export interface EbookProject {
  id: string;
  title: string;
  description: string;
  author: string;
  category?: string;
  targetAudience?: string;
  chapters: Chapter[];
  brandConfig: BrandConfig;
  coverDesign?: CoverDesign;
  customWatermark?: string; // Project-specific watermark (overrides global settings)
  isFavorite?: boolean; // Star/favorite projects to keep them at the top
  createdAt: Date;
  updatedAt: Date;
}

export interface WritingGoals {
  dailyWordTarget: number;
  weeklyWordTarget: number;
  monthlyWordTarget: number;
  enabled: boolean;
}

export interface WritingSession {
  id: string;
  projectId: string;
  chapterId: string;
  wordsAdded: number;
  startTime: Date;
  endTime: Date;
  date: string; // YYYY-MM-DD format for easy grouping
}

export interface WritingStats {
  totalWordsToday: number;
  totalWordsThisWeek: number;
  totalWordsThisMonth: number;
  currentStreak: number;
  longestStreak: number;
  writingDays: string[]; // Array of dates when user wrote (YYYY-MM-DD)
  lastWritingDate: string | null;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  type: 'words' | 'streak' | 'projects' | 'chapters';
}

export interface UsageLimit {
  dailyGenerations: number;
  usedToday: number;
  lastResetDate: string; // YYYY-MM-DD format
}

export interface ContentSnippet {
  id: string;
  userId: string;
  title: string;
  content: string;
  category: 'intro' | 'conclusion' | 'cta' | 'tip' | 'quote' | 'transition' | 'other';
  tags?: string[];
  isFavorite?: boolean; // Star/favorite snippets to keep them at the top
  createdAt: Date;
  updatedAt: Date;
}

export type InputMode = 'text' | 'ai' | 'preview';