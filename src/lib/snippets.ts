import { collection, doc, setDoc, getDoc, getDocs, deleteDoc, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { ContentSnippet } from './types';

// Save a new snippet
export const saveSnippet = async (userId: string, snippet: Omit<ContentSnippet, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const snippetRef = doc(collection(db, 'snippets'));
    const newSnippet: ContentSnippet = {
      ...snippet,
      id: snippetRef.id,
      userId,
      createdAt: Timestamp.now() as any,
      updatedAt: Timestamp.now() as any,
    };

    await setDoc(snippetRef, newSnippet);
    return snippetRef.id;
  } catch (error) {
    console.error('Error saving snippet:', error);
    throw error;
  }
};

// Get all snippets for a user
export const getUserSnippets = async (userId: string): Promise<ContentSnippet[]> => {
  try {
    const snippetsQuery = query(
      collection(db, 'snippets'),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );

    const querySnapshot = await getDocs(snippetsQuery);
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    } as ContentSnippet));
  } catch (error) {
    console.error('Error getting snippets:', error);
    return [];
  }
};

// Get snippets by category
export const getSnippetsByCategory = async (userId: string, category: ContentSnippet['category']): Promise<ContentSnippet[]> => {
  try {
    const snippetsQuery = query(
      collection(db, 'snippets'),
      where('userId', '==', userId),
      where('category', '==', category),
      orderBy('updatedAt', 'desc')
    );

    const querySnapshot = await getDocs(snippetsQuery);
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    } as ContentSnippet));
  } catch (error) {
    console.error('Error getting snippets by category:', error);
    return [];
  }
};

// Update a snippet
export const updateSnippet = async (snippetId: string, updates: Partial<Omit<ContentSnippet, 'id' | 'userId' | 'createdAt'>>): Promise<void> => {
  try {
    const snippetRef = doc(db, 'snippets', snippetId);
    await setDoc(snippetRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    }, { merge: true });
  } catch (error) {
    console.error('Error updating snippet:', error);
    throw error;
  }
};

// Delete a snippet
export const deleteSnippet = async (snippetId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'snippets', snippetId));
  } catch (error) {
    console.error('Error deleting snippet:', error);
    throw error;
  }
};

// Get a single snippet
export const getSnippet = async (snippetId: string): Promise<ContentSnippet | null> => {
  try {
    const snippetDoc = await getDoc(doc(db, 'snippets', snippetId));
    if (snippetDoc.exists()) {
      return {
        ...snippetDoc.data(),
        createdAt: snippetDoc.data().createdAt?.toDate(),
        updatedAt: snippetDoc.data().updatedAt?.toDate(),
      } as ContentSnippet;
    }
    return null;
  } catch (error) {
    console.error('Error getting snippet:', error);
    return null;
  }
};
