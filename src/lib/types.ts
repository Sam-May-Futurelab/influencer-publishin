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
  chapters: Chapter[];
  brandConfig: BrandConfig;
  createdAt: Date;
  updatedAt: Date;
}

export type InputMode = 'text' | 'voice';

export interface VoiceRecording {
  isRecording: boolean;
  transcript: string;
  isProcessing: boolean;
}