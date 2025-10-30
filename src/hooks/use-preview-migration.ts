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
      const newProject: EbookProject = {
        id: projectId,
        userId: user.uid,
        title: previewData.title,
        chapters: [
          {
            id: uuidv4(),
            title: 'Chapter 1',
            content: previewData.chapter1,
            order: 0,
          }
        ],
        coverDesign: {
          title: previewData.title,
          subtitle: '',
          author: user.displayName || 'Author',
          titleColor: '#000000',
          subtitleColor: '#666666',
          authorColor: '#333333',
          backgroundColor: '#FFFFFF',
          backgroundImage: '',
          titleFont: 'Playfair Display',
          bodyFont: 'Lora',
          titleSize: 'text-5xl',
          layout: 'centered',
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
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
