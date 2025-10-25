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
import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase';
import { EbookProject } from './types';

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
    
    // Handle cover image upload to Storage if it exists
    let coverImageUrl = '';
    if (project.coverDesign?.coverImageData) {
      try {
        // Create a reference to the cover image in Storage
        const coverImageRef = ref(storage, `users/${userId}/projects/${project.id}/cover.png`);
        
        // Upload the base64 image data
        await uploadString(coverImageRef, project.coverDesign.coverImageData, 'data_url');
        
        // Get the download URL
        coverImageUrl = await getDownloadURL(coverImageRef);
      } catch (uploadError) {
        console.error('Error uploading cover image to Storage:', uploadError);
        // Continue saving without the image rather than failing completely
      }
    }
    
    // Prepare coverDesign - flatten completely and store image URL instead of data
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
        backgroundImage: project.coverDesign.backgroundImage ? String(project.coverDesign.backgroundImage) : '',
        titleFont: String(project.coverDesign.titleFont || 'Inter'),
        titleSize: Number(project.coverDesign.titleSize || 48),
        titleColor: String(project.coverDesign.titleColor || '#ffffff'),
        subtitleFont: String(project.coverDesign.subtitleFont || 'Inter'),
        subtitleSize: Number(project.coverDesign.subtitleSize || 24),
        subtitleColor: String(project.coverDesign.subtitleColor || '#e0e0e0'),
        authorFont: String(project.coverDesign.authorFont || 'Inter'),
        authorSize: Number(project.coverDesign.authorSize || 18),
        authorColor: String(project.coverDesign.authorColor || '#ffffff'),
        overlay: Boolean(project.coverDesign.overlay),
        overlayOpacity: Number(project.coverDesign.overlayOpacity || 40),
        imagePosition: String(project.coverDesign.imagePosition || 'cover'),
        imageBrightness: Number(project.coverDesign.imageBrightness || 100),
        imageContrast: Number(project.coverDesign.imageContrast || 100),
        usePreMadeCover: Boolean(project.coverDesign.usePreMadeCover),
        // Store URL instead of base64 data
        coverImageUrl: coverImageUrl,
      };
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
    
    for (const docSnapshot of querySnapshot.docs) {
      const data = docSnapshot.data();
      
      // Helper to safely convert timestamps or dates
      const toDate = (field: any): Date => {
        if (!field) return new Date();
        if (field instanceof Date) return field;
        if (typeof field.toDate === 'function') return field.toDate();
        if (typeof field === 'string') return new Date(field);
        if (typeof field === 'number') return new Date(field);
        return new Date();
      };
      
      // Load cover image from Storage if URL exists and convert to base64
      let coverDesign = data.coverDesign;
      if (coverDesign?.coverImageUrl) {
        try {
          // Fetch the image and convert to base64
          const response = await fetch(coverDesign.coverImageUrl);
          const blob = await response.blob();
          const base64data = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
          
          // Add base64 data to coverDesign for local use
          coverDesign = {
            ...coverDesign,
            coverImageData: base64data
          };
        } catch (error) {
          console.error('Error loading cover image:', error);
          // Continue without the image
        }
      }
      
      projects.push({
        ...data,
        id: docSnapshot.id,
        createdAt: toDate(data.createdAt),
        updatedAt: toDate(data.updatedAt),
        coverDesign,
        chapters: data.chapters?.map((chapter: any) => ({
          ...chapter,
          createdAt: toDate(chapter.createdAt),
          updatedAt: toDate(chapter.updatedAt)
        })) || []
      } as EbookProject);
    }
    
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
      
      // Load cover image from Storage if URL exists and convert to base64
      let coverDesign = data.coverDesign;
      if (coverDesign?.coverImageUrl) {
        try {
          // Fetch the image and convert to base64
          const response = await fetch(coverDesign.coverImageUrl);
          const blob = await response.blob();
          const base64data = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
          
          // Add base64 data to coverDesign for local use
          coverDesign = {
            ...coverDesign,
            coverImageData: base64data
          };
        } catch (error) {
          console.error('Error loading cover image:', error);
          // Continue without the image
        }
      }
      
      return {
        ...data,
        id: projectDoc.id,
        createdAt: toDate(data.createdAt),
        updatedAt: toDate(data.updatedAt),
        coverDesign,
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
    // Delete cover image from Storage if it exists
    try {
      const coverImageRef = ref(storage, `users/${userId}/projects/${projectId}/cover.png`);
      await deleteObject(coverImageRef);
    } catch (storageError) {
      // Image might not exist, continue with project deletion
      console.log('No cover image to delete or error deleting:', storageError);
    }
    
    // Delete the project document
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
