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
  createdAt: Date;
  updatedAt: Date;
}

export type InputMode = 'text' | 'ai';