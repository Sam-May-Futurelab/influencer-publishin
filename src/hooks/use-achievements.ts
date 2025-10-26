import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: number;
  read: boolean;
}

interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  check: (stats: UserStats) => boolean;
}

export interface UserStats {
  totalWords: number;
  totalChapters: number;
  totalProjects: number;
  coversDesigned: number;
  aiAssistsUsed: number;
  exportsCount: number;
}

const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  {
    id: 'first_words',
    title: 'First Words',
    description: 'Wrote your first 100 words',
    icon: '✍️',
    check: (stats) => stats.totalWords >= 100,
  },
  {
    id: 'wordsmith',
    title: 'Wordsmith',
    description: 'Wrote 1,000 words',
    icon: '📝',
    check: (stats) => stats.totalWords >= 1000,
  },
  {
    id: 'author',
    title: 'Author',
    description: 'Wrote 10,000 words',
    icon: '📚',
    check: (stats) => stats.totalWords >= 10000,
  },
  {
    id: 'novelist',
    title: 'Novelist',
    description: 'Wrote 50,000 words',
    icon: '🏆',
    check: (stats) => stats.totalWords >= 50000,
  },
  {
    id: 'first_chapter',
    title: 'Chapter One',
    description: 'Created your first chapter',
    icon: '📖',
    check: (stats) => stats.totalChapters >= 1,
  },
  {
    id: 'five_chapters',
    title: 'Building Momentum',
    description: 'Created 5 chapters',
    icon: '🚀',
    check: (stats) => stats.totalChapters >= 5,
  },
  {
    id: 'ten_chapters',
    title: 'Prolific Writer',
    description: 'Created 10 chapters',
    icon: '⭐',
    check: (stats) => stats.totalChapters >= 10,
  },
  {
    id: 'first_project',
    title: 'Project Started',
    description: 'Created your first project',
    icon: '🎯',
    check: (stats) => stats.totalProjects >= 1,
  },
  {
    id: 'first_cover',
    title: 'Cover Artist',
    description: 'Designed your first book cover',
    icon: '🎨',
    check: (stats) => stats.coversDesigned >= 1,
  },
  {
    id: 'ai_explorer',
    title: 'AI Explorer',
    description: 'Used AI assistant 10 times',
    icon: '🤖',
    check: (stats) => stats.aiAssistsUsed >= 10,
  },
  {
    id: 'ai_master',
    title: 'AI Master',
    description: 'Used AI assistant 50 times',
    icon: '🧠',
    check: (stats) => stats.aiAssistsUsed >= 50,
  },
  {
    id: 'first_export',
    title: 'Published',
    description: 'Exported your first book',
    icon: '📤',
    check: (stats) => stats.exportsCount >= 1,
  },
];

export function useAchievements() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalWords: 0,
    totalChapters: 0,
    totalProjects: 0,
    coversDesigned: 0,
    aiAssistsUsed: 0,
    exportsCount: 0,
  });

  // Load achievements from localStorage
  useEffect(() => {
    if (!user) return;
    
    const stored = localStorage.getItem(`achievements_${user.uid}`);
    if (stored) {
      setAchievements(JSON.parse(stored));
    }

    const storedStats = localStorage.getItem(`stats_${user.uid}`);
    if (storedStats) {
      setStats(JSON.parse(storedStats));
    }
  }, [user]);

  // Save achievements to localStorage
  const saveAchievements = (newAchievements: Achievement[]) => {
    if (!user) return;
    localStorage.setItem(`achievements_${user.uid}`, JSON.stringify(newAchievements));
    setAchievements(newAchievements);
  };

  // Save stats to localStorage
  const saveStats = (newStats: UserStats) => {
    if (!user) return;
    localStorage.setItem(`stats_${user.uid}`, JSON.stringify(newStats));
    setStats(newStats);
  };

  // Check for newly unlocked achievements
  const checkAchievements = (newStats: UserStats) => {
    const newAchievements: Achievement[] = [];
    
    ACHIEVEMENT_DEFINITIONS.forEach((def) => {
      // Check if already unlocked
      const alreadyUnlocked = achievements.some((a) => a.id === def.id);
      
      // Check if conditions are met
      if (!alreadyUnlocked && def.check(newStats)) {
        newAchievements.push({
          id: def.id,
          title: def.title,
          description: def.description,
          icon: def.icon,
          unlockedAt: Date.now(),
          read: false,
        });
      }
    });

    if (newAchievements.length > 0) {
      const updated = [...achievements, ...newAchievements];
      saveAchievements(updated);
      return newAchievements;
    }

    return [];
  };

  // Update stats and check for achievements
  const updateStats = (updates: Partial<UserStats>) => {
    const newStats = { ...stats, ...updates };
    saveStats(newStats);
    return checkAchievements(newStats);
  };

  // Mark achievement as read
  const markAsRead = (achievementId: string) => {
    const updated = achievements.map((a) =>
      a.id === achievementId ? { ...a, read: true } : a
    );
    saveAchievements(updated);
  };

  // Mark all as read
  const markAllAsRead = () => {
    const updated = achievements.map((a) => ({ ...a, read: true }));
    saveAchievements(updated);
  };

  // Delete achievement
  const deleteAchievement = (achievementId: string) => {
    const updated = achievements.filter((a) => a.id !== achievementId);
    saveAchievements(updated);
  };

  // Get unread count
  const unreadCount = achievements.filter((a) => !a.read).length;

  return {
    achievements,
    stats,
    unreadCount,
    updateStats,
    markAsRead,
    markAllAsRead,
    deleteAchievement,
  };
}
