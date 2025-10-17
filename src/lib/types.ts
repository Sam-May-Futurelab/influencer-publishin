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

export interface EbookProject {
  id: string;
  title: string;
  description: string;
  author: string;
  category?: string;
  chapters: Chapter[];
  brandConfig: BrandConfig;
  customWatermark?: string; // Project-specific watermark (overrides global settings)
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

export type InputMode = 'text' | 'ai' | 'preview';