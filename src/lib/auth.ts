import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  deleteUser,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  EmailAuthProvider,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  isPremium: boolean;
  subscriptionStatus: 'free' | 'creator' | 'premium' | 'trial';
  subscriptionType?: 'monthly' | 'yearly';
  pagesUsed: number;
  maxPages: number;
  hasCompletedOnboarding: boolean;
  createdAt: any;
  lastLoginAt: any;
  // AI Book Generation Usage
  fullBookGenerationsUsed?: number;
  lastFullBookGenerationReset?: any;
  // Audiobook Generation Usage (chapter-based)
  audiobookChaptersUsed?: number;
  lastAudiobookChaptersReset?: any;
  // Writing Analytics
  writingStats?: {
    totalWords: number;
    currentStreak: number;
    longestStreak: number;
    lastWriteDate: string | null;
  };
  // Writing Goals
  writingGoals?: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  // User Preferences
  preferences?: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    theme: 'light' | 'dark';
  };
}

// Authentication functions
export const signUp = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create user profile in Firestore
    await createUserProfile(user);
    
    return user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Update last login
    await updateLastLogin(userCredential.user.uid);
    
    return userCredential.user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;
    
    // Check if user profile exists, create if not
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      await createUserProfile(user);
    } else {
      await updateLastLogin(user.uid);
    }
    
    return user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// User profile management
export const createUserProfile = async (user: User) => {
  const userProfile: UserProfile = {
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName || '',
    isPremium: false,
    subscriptionStatus: 'free',
    pagesUsed: 0,
    maxPages: 4, // Free tier limit
    hasCompletedOnboarding: false,
    createdAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
    // Initialize writing analytics
    writingStats: {
      totalWords: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastWriteDate: null,
    },
    // Initialize writing goals
    writingGoals: {
      daily: 500,
      weekly: 3500,
      monthly: 15000,
    },
    // Initialize preferences
    preferences: {
      emailNotifications: true,
      pushNotifications: true,
      theme: 'light',
    },
  };
  
  await setDoc(doc(db, 'users', user.uid), userProfile);
  return userProfile;
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const profile = userDoc.data() as UserProfile;
      
      // Auto-fix corrupted data: if maxPages is -1 but user is not premium
      if (profile.maxPages === -1 && !profile.isPremium) {
        await setDoc(doc(db, 'users', uid), {
          maxPages: 4,
          pagesUsed: 0
        }, { merge: true });
        profile.maxPages = 4;
        profile.pagesUsed = 0;
      }
      
      return profile;
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

export const updateLastLogin = async (uid: string) => {
  try {
    await setDoc(doc(db, 'users', uid), {
      lastLoginAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error('Error updating last login:', error);
  }
};

// Usage tracking
export const incrementPageUsage = async (uid: string) => {
  try {
    const userProfile = await getUserProfile(uid);
    if (!userProfile) return false;
    
    // Fix corrupted data: if maxPages is -1 but user is not premium, reset to free tier limit
    if (userProfile.maxPages === -1 && !userProfile.isPremium) {
      await setDoc(doc(db, 'users', uid), {
        maxPages: 4,
        pagesUsed: 0
      }, { merge: true });
      return true; // Allow the first page after fix
    }
    
    if (userProfile.isPremium) {
      // Premium users have unlimited pages
      return true;
    }
    
    if (userProfile.pagesUsed >= userProfile.maxPages) {
      // Free tier limit reached
      return false;
    }
    
    // Increment page usage
    await setDoc(doc(db, 'users', uid), {
      pagesUsed: userProfile.pagesUsed + 1
    }, { merge: true });
    
    return true;
  } catch (error) {
    console.error('Error incrementing page usage:', error);
    return false;
  }
};

export const upgradeToPremium = async (uid: string) => {
  try {
    await setDoc(doc(db, 'users', uid), {
      isPremium: true,
      subscriptionStatus: 'premium',
      maxPages: -1 // Unlimited
    }, { merge: true });
    
    return true;
  } catch (error) {
    console.error('Error upgrading to premium:', error);
    return false;
  }
};

// Auth state observer
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Update user profile
export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>) => {
  try {
    // If displayName is being updated, also update Firebase Auth first
    if (updates.displayName && auth.currentUser) {
      await updateProfile(auth.currentUser, { 
        displayName: updates.displayName 
      });
    }
    
    // Update in Firestore
    await setDoc(doc(db, 'users', uid), {
      ...updates,
      lastLoginAt: serverTimestamp()
    }, { merge: true });
    
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return false;
  }
};

// Sync page usage with actual project data (for migration/correction)
export const syncPageUsage = async (uid: string, actualPagesUsed: number) => {
  try {
    await setDoc(doc(db, 'users', uid), {
      pagesUsed: actualPagesUsed,
      lastLoginAt: serverTimestamp()
    }, { merge: true });
    
    return true;
  } catch (error) {
    console.error('Error syncing page usage:', error);
    return false;
  }
};

// Writing Analytics Functions
export const updateWritingStats = async (uid: string, stats: UserProfile['writingStats']) => {
  try {
    await setDoc(doc(db, 'users', uid), {
      writingStats: stats,
      lastLoginAt: serverTimestamp()
    }, { merge: true });
    
    return true;
  } catch (error) {
    console.error('Error updating writing stats:', error);
    return false;
  }
};

export const updateWritingGoals = async (uid: string, goals: UserProfile['writingGoals']) => {
  try {
    await setDoc(doc(db, 'users', uid), {
      writingGoals: goals,
      lastLoginAt: serverTimestamp()
    }, { merge: true });
    
    return true;
  } catch (error) {
    console.error('Error updating writing goals:', error);
    return false;
  }
};

export const updateUserPreferences = async (uid: string, preferences: UserProfile['preferences']) => {
  try {
    await setDoc(doc(db, 'users', uid), {
      preferences: preferences,
      lastLoginAt: serverTimestamp()
    }, { merge: true });
    
    return true;
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return false;
  }
};

// AI Book Generation Usage Tracking
export const incrementFullBookGeneration = async (uid: string): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data() as UserProfile;
    
    await setDoc(userRef, {
      fullBookGenerationsUsed: (userData.fullBookGenerationsUsed || 0) + 1,
      lastFullBookGenerationReset: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error('Error incrementing full book generation:', error);
    throw error;
  }
};

export const canGenerateFullBook = (profile: UserProfile | null): boolean => {
  if (!profile) return false;
  
  const { subscriptionStatus, fullBookGenerationsUsed = 0 } = profile;
  
  // Free tier: NO full book generations (premium feature only)
  if (subscriptionStatus === 'free') return false;
  
  // Premium tier: Unlimited
  if (subscriptionStatus === 'premium') return true;
  
  // Creator tier: 5 books/month
  if (subscriptionStatus === 'creator') return fullBookGenerationsUsed < 5;
  
  return false;
};

export const getRemainingFullBooks = (profile: UserProfile | null): number | 'unlimited' => {
  if (!profile) return 0;
  
  const { subscriptionStatus, fullBookGenerationsUsed = 0 } = profile;
  
  if (subscriptionStatus === 'free') return 0;
  if (subscriptionStatus === 'premium') return 'unlimited';
  if (subscriptionStatus === 'creator') return Math.max(0, 5 - fullBookGenerationsUsed);
  
  return 0;
};

// Delete user account (handles both email/password and Google sign-in)
export const deleteUserAccount = async (currentUser: User, password?: string) => {
  try {
    // Check if user signed in with Google (providerData will show google.com)
    const isGoogleUser = currentUser.providerData.some(
      provider => provider.providerId === 'google.com'
    );

    if (isGoogleUser) {
      // Re-authenticate with Google popup
      const provider = new GoogleAuthProvider();
      await reauthenticateWithPopup(currentUser, provider);
    } else if (currentUser.email && password) {
      // Re-authenticate with email/password
      const credential = EmailAuthProvider.credential(currentUser.email, password);
      await reauthenticateWithCredential(currentUser, credential);
    }
    
    // Delete the Firebase Auth account
    await deleteUser(currentUser);
    return true;
  } catch (error) {
    console.error('Error deleting user account:', error);
    throw error;
  }
};
