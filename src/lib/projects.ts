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

// Save a project to Firestore
export const saveProject = async (userId: string, project: EbookProject): Promise<void> => {
  try {
    const projectRef = doc(db, 'users', userId, 'projects', project.id);
    
    // Convert Date objects to timestamps for Firestore
    // Note: serverTimestamp() cannot be used inside arrays, so we use regular Date objects
    const projectData = {
      ...project,
      createdAt: project.createdAt,
      updatedAt: serverTimestamp(),
      chapters: project.chapters.map(chapter => ({
        ...chapter,
        createdAt: chapter.createdAt,
        updatedAt: chapter.updatedAt // Use the Date object directly, not serverTimestamp()
      }))
    };
    
    await setDoc(projectRef, projectData);
    console.log('✅ Successfully saved project to Firestore');
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
      projects.push({
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        chapters: data.chapters?.map((chapter: any) => ({
          ...chapter,
          createdAt: chapter.createdAt?.toDate() || new Date(),
          updatedAt: chapter.updatedAt?.toDate() || new Date()
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
      return {
        ...data,
        id: projectDoc.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        chapters: data.chapters?.map((chapter: any) => ({
          ...chapter,
          createdAt: chapter.createdAt?.toDate() || new Date(),
          updatedAt: chapter.updatedAt?.toDate() || new Date()
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
