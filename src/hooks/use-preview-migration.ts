import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';
import { saveProject } from '@/lib/projects';
import type { EbookProject } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

interface PreviewData {
  title: string;
  chapter1: string;
  timestamp: number;
}

interface MigrationState {
  hasPreview: boolean;
  previewData: PreviewData | null;
  isMigrating: boolean;
  error: string | null;
}

export function usePreviewMigration() {
  const { user } = useAuth();
  const [state, setState] = useState<MigrationState>({
    hasPreview: false,
    previewData: null,
    isMigrating: false,
    error: null,
  });

  // Check for preview data on mount and when user changes
  useEffect(() => {
    checkForPreview();
  }, [user]);

  const checkForPreview = (): PreviewData | null => {
    try {
      const stored = localStorage.getItem('preview_book');
      if (!stored) {
        setState(prev => ({ ...prev, hasPreview: false, previewData: null }));
        return null;
      }

      const data: PreviewData = JSON.parse(stored);
      
      // Check if expired (24 hours)
      const now = Date.now();
      const expiryTime = 24 * 60 * 60 * 1000; // 24 hours
      
      if (!data.timestamp || now - data.timestamp > expiryTime) {
        // Expired, remove it
        localStorage.removeItem('preview_book');
        setState(prev => ({ ...prev, hasPreview: false, previewData: null }));
        return null;
      }

      // Valid preview data exists
      setState(prev => ({ ...prev, hasPreview: true, previewData: data }));
      return data;

    } catch (error) {
      console.error('Error checking preview data:', error);
      localStorage.removeItem('preview_book'); // Clean up corrupted data
      setState(prev => ({ ...prev, hasPreview: false, previewData: null }));
      return null;
    }
  };

  const migrateToAccount = async (): Promise<EbookProject | null> => {
    if (!user) {
      setState(prev => ({ ...prev, error: 'Must be logged in to migrate preview' }));
      return null;
    }

    const previewData = checkForPreview();
    if (!previewData) {
      setState(prev => ({ ...prev, error: 'No preview data found or expired' }));
      return null;
    }

    setState(prev => ({ ...prev, isMigrating: true, error: null }));

    try {
      // Create a new project from the preview data
      const projectId = uuidv4();
      const now = new Date();
      
      const newProject: EbookProject = {
        id: projectId,
        title: previewData.title,
        description: '',
        author: user.displayName || 'Author',
        chapters: [
          {
            id: uuidv4(),
            title: 'Chapter 1',
            content: previewData.chapter1,
            order: 0,
            createdAt: now,
            updatedAt: now,
          }
        ],
        brandConfig: {
          primaryColor: '#9b87b8',
          secondaryColor: '#b89ed6',
          accentColor: '#7a5f96',
          fontFamily: 'Inter',
          coverStyle: 'minimal',
        },
        coverDesign: {
          title: previewData.title,
          subtitle: '',
          authorName: user.displayName || 'Author',
          backgroundType: 'solid',
          backgroundColor: '#FFFFFF',
          gradientStart: '#9b87b8',
          gradientEnd: '#b89ed6',
          gradientDirection: 'to-br',
          titleColor: '#000000',
          titleFont: 'Playfair Display',
          titleSize: 48,
          subtitleColor: '#666666',
          subtitleFont: 'Inter',
          subtitleSize: 24,
          authorColor: '#333333',
          authorFont: 'Inter',
          authorSize: 18,
          overlay: false,
          overlayOpacity: 0.5,
          imagePosition: 'cover',
          imageAlignment: 'center',
          imageBrightness: 100,
          imageContrast: 100,
          usePreMadeCover: false,
        },
        createdAt: now,
        updatedAt: now,
      };

      // Save to Firestore
      await saveProject(user.uid, newProject);

      // Clear the preview data
      localStorage.removeItem('preview_book');

      setState(prev => ({ 
        ...prev, 
        isMigrating: false, 
        hasPreview: false, 
        previewData: null 
      }));

      return newProject;

    } catch (error) {
      console.error('Error migrating preview:', error);
      setState(prev => ({ 
        ...prev, 
        isMigrating: false, 
        error: error instanceof Error ? error.message : 'Failed to migrate preview' 
      }));
      return null;
    }
  };

  const dismissPreview = () => {
    localStorage.removeItem('preview_book');
    setState(prev => ({ 
      ...prev, 
      hasPreview: false, 
      previewData: null 
    }));
  };

  return {
    ...state,
    checkForPreview,
    migrateToAccount,
    dismissPreview,
  };
}
