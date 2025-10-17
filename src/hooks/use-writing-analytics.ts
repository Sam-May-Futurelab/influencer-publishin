import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './use-local-storage';
import { useAuth } from './use-auth';
import { updateWritingStats, updateWritingGoals } from '@/lib/auth';
import { 
  WritingGoals, 
  WritingStats, 
  WritingSession, 
  Achievement,
  EbookProject 
} from '@/lib/types';
import { 
  defaultWritingGoals, 
  defaultWritingStats, 
  calculateWritingStats, 
  checkAchievements,
  calculateGoalProgress,
  createWritingSession,
  getToday
} from '@/lib/writing-analytics';
import { toast } from 'sonner';

export function useWritingAnalytics(projects: EbookProject[]) {
  const { user, userProfile } = useAuth();
  const [goals, setGoals] = useLocalStorage<WritingGoals>('writing-goals', defaultWritingGoals);
  const [sessions, setSessions] = useLocalStorage<WritingSession[]>('writing-sessions', []);
  const [achievements, setAchievements] = useLocalStorage<Achievement[]>('achievements', []);
  const [stats, setStats] = useState<WritingStats>(defaultWritingStats);

  // Initialize from Firebase if available
  useEffect(() => {
    if (userProfile?.writingGoals) {
      setGoals({ ...goals, ...userProfile.writingGoals, enabled: goals.enabled });
    }
    if (userProfile?.writingStats) {
      setStats({ ...stats, ...userProfile.writingStats });
    }
  }, [userProfile]);

  // Calculate total words across all projects
  const totalWords = projects.reduce((total, project) => {
    return total + project.chapters.reduce((chapterTotal, chapter) => {
      return chapterTotal + (chapter.content?.split(/\s+/).filter(word => word.length > 0).length || 0);
    }, 0);
  }, 0);

  const totalProjects = projects.length;
  const totalChapters = projects.reduce((total, project) => total + project.chapters.length, 0);

  // Recalculate stats when sessions change
  useEffect(() => {
    const newStats = calculateWritingStats(sessions, stats);
    setStats(newStats);
    
    // Sync to Firebase
    if (user && newStats) {
      updateWritingStats(user.uid, {
        totalWords: totalWords,
        currentStreak: newStats.currentStreak,
        longestStreak: newStats.longestStreak,
        lastWriteDate: newStats.lastWritingDate,
      });
    }
  }, [sessions]);

  // Check for new achievements
  useEffect(() => {
    const newAchievements = checkAchievements(
      stats,
      totalWords,
      totalProjects,
      totalChapters,
      achievements
    );

    if (newAchievements.length > 0) {
      setAchievements(prev => [...prev, ...newAchievements]);
      
      // Show achievement toasts
      newAchievements.forEach(achievement => {
        toast.success(`🎉 Achievement Unlocked: ${achievement.title}!`, {
          description: achievement.description,
          duration: 5000,
        });
      });
    }
  }, [stats, totalWords, totalProjects, totalChapters, achievements, setAchievements]);

  // Record writing session
  const recordWritingSession = useCallback((
    projectId: string,
    chapterId: string,
    wordsAdded: number
  ) => {
    if (wordsAdded <= 0) return;

    const session = createWritingSession(projectId, chapterId, wordsAdded);
    setSessions(prev => [...prev, session]);

    // Show encouragement for daily goal progress
    const todaysWords = stats.totalWordsToday + wordsAdded;
    if (todaysWords >= goals.dailyWordTarget && stats.totalWordsToday < goals.dailyWordTarget) {
      toast.success('🎯 Daily goal achieved!', {
        description: `You've written ${todaysWords} words today!`,
        duration: 4000,
      });
    }
  }, [setSessions, stats.totalWordsToday, goals.dailyWordTarget]);

  // Update goals
  const updateGoals = useCallback((newGoals: Partial<WritingGoals>) => {
    const updatedGoals = { ...goals, ...newGoals };
    setGoals(updatedGoals);
    
    // Sync to Firebase
    if (user) {
      updateWritingGoals(user.uid, {
        daily: updatedGoals.dailyWordTarget,
        weekly: updatedGoals.weeklyWordTarget,
        monthly: updatedGoals.monthlyWordTarget,
      });
    }
  }, [setGoals, goals, user]);

  // Get progress toward goals
  const progress = calculateGoalProgress(stats, goals);

  // Get recent achievements (last 7 days)
  const recentAchievements = achievements.filter(achievement => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(achievement.unlockedAt) >= weekAgo;
  });

  // Check if user wrote today
  const wroteToday = stats.totalWordsToday > 0;

  // Get writing calendar data (last 365 days)
  const getWritingCalendar = useCallback(() => {
    const calendar: { [date: string]: number } = {};
    const today = new Date();
    
    // Initialize last 365 days
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      calendar[dateStr] = 0;
    }
    
    // Fill in actual writing data
    sessions.forEach(session => {
      if (calendar.hasOwnProperty(session.date)) {
        calendar[session.date] += session.wordsAdded;
      }
    });
    
    return calendar;
  }, [sessions]);

  return {
    // State
    goals,
    stats,
    achievements,
    sessions,
    progress,
    
    // Computed values
    totalWords,
    totalProjects,
    totalChapters,
    recentAchievements,
    wroteToday,
    
    // Actions
    recordWritingSession,
    updateGoals,
    getWritingCalendar,
  };
}
