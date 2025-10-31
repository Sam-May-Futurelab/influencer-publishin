import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  where,
  serverTimestamp,
  updateDoc 
} from 'firebase/firestore';
import { db } from './firebase';
import { EbookProject } from './types';
import { compressToLimit, isWithinSizeLimit } from './image-compression';

// Helper to remove undefined values from objects (Firestore doesn't allow undefined)
const sanitizeForFirestore = (obj: any): any => {
  if (obj === null || obj === undefined) return null;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeForFirestore);
  
  const sanitized: any = {};
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    if (value !== undefined) {
      sanitized[key] = sanitizeForFirestore(value);
    }
  });
  return sanitized;
};

// Save a project to Firestore
export const saveProject = async (userId: string, project: EbookProject): Promise<void> => {
  try {
    const projectRef = doc(db, 'users', userId, 'projects', project.id);
    
    const prepareImageForStorage = async (source?: string): Promise<string | undefined> => {
      if (!source) return undefined;
      // Only attempt compression for data URLs to avoid CORS issues with remote images
      if (!source.startsWith('data:')) {
        return source;
      }

      try {
        if (!isWithinSizeLimit(source)) {
          const compressed = await compressToLimit(source, 400);
          return compressed.dataUrl;
        }
        return source;
      } catch (error) {
        console.warn('Failed to compress cover image, storing original data URL.', error);
        return source;
      }
    };

    // Handle uploaded/background image data and the rendered cover with text separately
    const uploadedCoverData = await prepareImageForStorage(project.coverDesign?.uploadedCoverImage);
    const coverImageData = await prepareImageForStorage(project.coverDesign?.coverImageData);
    
    // Prepare coverDesign - store design parameters and compressed uploaded image (if any)
    let coverDesignData: any = null;
    if (project.coverDesign) {
      coverDesignData = {
        title: String(project.coverDesign.title || ''),
        subtitle: String(project.coverDesign.subtitle || ''),
        authorName: String(project.coverDesign.authorName || ''),
        backgroundType: String(project.coverDesign.backgroundType || 'gradient'),
        backgroundColor: String(project.coverDesign.backgroundColor || '#ffffff'),
        gradientStart: String(project.coverDesign.gradientStart || '#667eea'),
        gradientEnd: String(project.coverDesign.gradientEnd || '#764ba2'),
        gradientDirection: String(project.coverDesign.gradientDirection || 'to-br'),
        // NOTE: backgroundImage is NOT saved - it's either a temporary base64 (AI-generated) 
        // or will be regenerated from coverImageData during export
        titleFont: String(project.coverDesign.titleFont || 'Inter'),
        titleSize: Number(project.coverDesign.titleSize || 48),
        titleColor: String(project.coverDesign.titleColor || '#ffffff'),
        subtitleFont: String(project.coverDesign.subtitleFont || 'Inter'),
        subtitleSize: Number(project.coverDesign.subtitleSize || 24),
        subtitleColor: String(project.coverDesign.subtitleColor || '#e0e0e0'),
        authorFont: String(project.coverDesign.authorFont || 'Inter'),
        authorSize: Number(project.coverDesign.authorSize || 18),
        authorColor: String(project.coverDesign.authorColor || '#ffffff'),
        titlePosition: Number(project.coverDesign.titlePosition ?? 40),
        subtitlePosition: Number(project.coverDesign.subtitlePosition ?? 50),
        authorPosition: Number(project.coverDesign.authorPosition ?? 80),
        textShadowEnabled: Boolean(project.coverDesign.textShadowEnabled ?? false),
        shadowBlur: Number(project.coverDesign.shadowBlur ?? 8),
        shadowOffsetX: Number(project.coverDesign.shadowOffsetX ?? 2),
        shadowOffsetY: Number(project.coverDesign.shadowOffsetY ?? 2),
        shadowColor: String(project.coverDesign.shadowColor || 'rgba(0, 0, 0, 0.8)'),
        overlay: Boolean(project.coverDesign.overlay),
        overlayOpacity: Number(project.coverDesign.overlayOpacity ?? 40),
        imagePosition: String(project.coverDesign.imagePosition || 'cover'),
        imageAlignment: String(project.coverDesign.imageAlignment || 'center'),
        imageBrightness: Number(project.coverDesign.imageBrightness ?? 100),
        imageContrast: Number(project.coverDesign.imageContrast ?? 100),
        usePreMadeCover: Boolean(project.coverDesign.usePreMadeCover),
      };

      if (uploadedCoverData) {
        coverDesignData.uploadedCoverImage = uploadedCoverData;
      }

      if (coverImageData) {
        coverDesignData.coverImageData = coverImageData;
      }
    }
    
    // Convert Date objects to timestamps for Firestore
    const projectData = {
      ...project,
      createdAt: project.createdAt,
      updatedAt: serverTimestamp(),
      chapters: project.chapters.map(chapter => ({
        ...chapter,
        createdAt: chapter.createdAt,
        updatedAt: chapter.updatedAt
      })),
      coverDesign: coverDesignData
    };
    
    // Remove any undefined values before saving to Firestore
    const sanitizedData = sanitizeForFirestore(projectData);
    
    await setDoc(projectRef, sanitizedData);
  } catch (error) {
    console.error('Error saving project:', error);
    throw new Error('Failed to save project');
  }
};

// Get all projects for a user
export const getUserProjects = async (userId: string): Promise<EbookProject[]> => {
  try {
    const projectsRef = collection(db, 'users', userId, 'projects');
    const querySnapshot = await getDocs(projectsRef);
    
    const projects: EbookProject[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Helper to safely convert timestamps or dates
      const toDate = (field: any): Date => {
        if (!field) return new Date();
        if (field instanceof Date) return field;
        if (typeof field.toDate === 'function') return field.toDate();
        if (typeof field === 'string') return new Date(field);
        if (typeof field === 'number') return new Date(field);
        return new Date();
      };
      
      projects.push({
        ...data,
        id: doc.id,
        createdAt: toDate(data.createdAt),
        updatedAt: toDate(data.updatedAt),
        // Restore uploaded cover image to coverImageData if it exists
        coverDesign: data.coverDesign ? {
          ...data.coverDesign,
          uploadedCoverImage: data.coverDesign.uploadedCoverImage || undefined,
          coverImageData: data.coverDesign.coverImageData || data.coverDesign.uploadedCoverImage || undefined
        } : undefined,
        chapters: data.chapters?.map((chapter: any) => ({
          ...chapter,
          createdAt: toDate(chapter.createdAt),
          updatedAt: toDate(chapter.updatedAt)
        })) || []
      } as EbookProject);
    });
    
    return projects.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  } catch (error) {
    console.error('Error getting user projects:', error);
    return [];
  }
};

// Get a single project
export const getProject = async (userId: string, projectId: string): Promise<EbookProject | null> => {
  try {
    const projectRef = doc(db, 'users', userId, 'projects', projectId);
    const projectDoc = await getDoc(projectRef);
    
    if (projectDoc.exists()) {
      const data = projectDoc.data();
      
      // Helper to safely convert timestamps or dates
      const toDate = (field: any): Date => {
        if (!field) return new Date();
        if (field instanceof Date) return field;
        if (typeof field.toDate === 'function') return field.toDate();
        if (typeof field === 'string') return new Date(field);
        if (typeof field === 'number') return new Date(field);
        return new Date();
      };
      
      return {
        ...data,
        id: projectDoc.id,
        createdAt: toDate(data.createdAt),
        updatedAt: toDate(data.updatedAt),
        // Restore uploaded cover image to coverImageData if it exists
        coverDesign: data.coverDesign ? {
          ...data.coverDesign,
          uploadedCoverImage: data.coverDesign.uploadedCoverImage || undefined,
          coverImageData: data.coverDesign.coverImageData || data.coverDesign.uploadedCoverImage || undefined
        } : undefined,
        chapters: data.chapters?.map((chapter: any) => ({
          ...chapter,
          createdAt: toDate(chapter.createdAt),
          updatedAt: toDate(chapter.updatedAt)
        })) || []
      } as EbookProject;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting project:', error);
    return null;
  }
};

// Delete a project
export const deleteProject = async (userId: string, projectId: string): Promise<void> => {
  try {
    const projectRef = doc(db, 'users', userId, 'projects', projectId);
    await deleteDoc(projectRef);
  } catch (error) {
    console.error('Error deleting project:', error);
    throw new Error('Failed to delete project');
  }
};

// Update project (chapters, content, etc.)
export const updateProject = async (userId: string, projectId: string, updates: Partial<EbookProject>): Promise<void> => {
  try {
    const projectRef = doc(db, 'users', userId, 'projects', projectId);
    
    // Convert Date objects to timestamps
    const updateData: any = {
      ...updates,
      updatedAt: serverTimestamp()
    };
    
    if (updates.chapters) {
      updateData.chapters = updates.chapters.map(chapter => ({
        ...chapter,
        createdAt: chapter.createdAt,
        updatedAt: serverTimestamp()
      }));
    }
    
    await updateDoc(projectRef, updateData);
  } catch (error) {
    console.error('Error updating project:', error);
    throw new Error('Failed to update project');
  }
};

// Split text into chunks at sentence boundaries (max 4000 chars per chunk)
const splitIntoChunks = (text: string, maxChars: number = 4000): string[] => {
  if (text.length <= maxChars) return [text];
  
  const chunks: string[] = [];
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  let currentChunk = '';
  
  for (const sentence of sentences) {
    if ((currentChunk + sentence).length <= maxChars) {
      currentChunk += sentence;
    } else {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = sentence;
    }
  }
  
  if (currentChunk) chunks.push(currentChunk.trim());
  return chunks;
};

// Create an audio-ready version of a project with split chapters
export const createAudioVersionProject = async (
  userId: string, 
  originalProject: EbookProject
): Promise<EbookProject> => {
  const BUFFER = 200; // Allow 200 chars buffer for minor edits
  const MAX_CHARS = 4000 + BUFFER;
  
  // Split chapters that are too long
  const splitChapters = originalProject.chapters.flatMap(chapter => {
    const cleanContent = chapter.content
      ?.replace(/<[^>]*>/g, ' ') // Remove HTML
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim() || '';
    
    // If chapter is within limit (with buffer), keep as-is
    if (cleanContent.length <= MAX_CHARS) {
      return [chapter];
    }
    
    // Split into chunks (use 3800 to be extra safe and account for any remaining HTML)
    const chunks = splitIntoChunks(cleanContent, 3800);
    
    // Create new chapters for each chunk
    return chunks.map((chunk, index) => ({
      ...chapter,
      id: `${chapter.id}-part-${index + 1}`,
      title: `${chapter.title} (Part ${index + 1})`,
      content: chunk, // Use the cleaned chunk content
      order: chapter.order + (index * 0.01) // Maintain order with decimals
    }));
  });
  
  // Create new project
  const audioProject: EbookProject = {
    ...originalProject,
    id: `${originalProject.id}-audio-${Date.now()}`,
    title: `${originalProject.title} (Audiobook)`,
    description: `Audio-ready version of "${originalProject.title}" with optimized chapter lengths for audiobook generation.`,
    chapters: splitChapters,
    isAudioVersion: true,
    originalProjectId: originalProject.id,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  // Save to Firebase
  await saveProject(userId, audioProject);
  
  return audioProject;
};

