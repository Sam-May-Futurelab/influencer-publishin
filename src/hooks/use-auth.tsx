import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { 
  onAuthStateChange, 
  getUserProfile, 
  UserProfile, 
  updateUserProfile as updateUserProfileAPI, 
  updateUserAvatar as updateUserAvatarAPI 
} from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  updateUserAvatar: (photoURL: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    if (user) {
      const profile = await getUserProfile(user.uid);
      setUserProfile(profile);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      setUser(user);
      
      if (user) {
        // Get user profile from Firestore
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signOut = async () => {
    const { logOut } = await import('@/lib/auth');
    await logOut();
    setUser(null);
    setUserProfile(null);
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return false;
    
    const success = await updateUserProfileAPI(user.uid, updates);
    if (success) {
      await refreshProfile();
    }
    return success;
  };

  const updateUserAvatar = async (photoURL: string) => {
    if (!user) return false;
    
    const success = await updateUserAvatarAPI(user.uid, photoURL);
    if (success) {
      await refreshProfile();
    }
    return success;
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signOut,
    refreshProfile,
    updateUserProfile,
    updateUserAvatar
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
