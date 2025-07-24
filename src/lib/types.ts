export interface Chapter {
  id: string;
  title: string;
  content: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface EbookProject {
  id: string;
  title: string;
  description: string;
  chapters: Chapter[];
  createdAt: Date;
  updatedAt: Date;
}

export type InputMode = 'text' | 'voice';

export interface VoiceRecording {
  isRecording: boolean;
  transcript: string;
  isProcessing: boolean;
}