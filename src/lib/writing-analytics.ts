import { WritingGoals, WritingStats, WritingSession, Achievement, EbookProject } from './types';

export const defaultWritingGoals: WritingGoals = {
  dailyWordTarget: 500,
  weeklyWordTarget: 3500,
  monthlyWordTarget: 15000,
  enabled: true,
};

export const defaultWritingStats: WritingStats = {
  totalWordsToday: 0,
  totalWordsThisWeek: 0,
  totalWordsThisMonth: 0,
  currentStreak: 0,
  longestStreak: 0,
  writingDays: [],
  lastWritingDate: null,
};

// Date utilities
export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
};

export const getToday = (): string => formatDate(new Date());

export const getWeekStart = (date: Date = new Date()): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
};

export const getMonthStart = (date: Date = new Date()): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

export const isToday = (dateString: string): boolean => {
  return dateString === getToday();
};

export const isThisWeek = (dateString: string): boolean => {
  const date = new Date(dateString);
  const weekStart = getWeekStart();
  return date >= weekStart;
};

export const isThisMonth = (dateString: string): boolean => {
  const date = new Date(dateString);
  const monthStart = getMonthStart();
  return date >= monthStart;
};

// Calculate writing statistics
export const calculateWritingStats = (
  sessions: WritingSession[],
  previousStats: WritingStats = defaultWritingStats
): WritingStats => {
  const today = getToday();
  
  // Calculate totals
  const totalWordsToday = sessions
    .filter(s => s.date === today)
    .reduce((sum, s) => sum + s.wordsAdded, 0);
  
  const totalWordsThisWeek = sessions
    .filter(s => isThisWeek(s.date))
    .reduce((sum, s) => sum + s.wordsAdded, 0);
  
  const totalWordsThisMonth = sessions
    .filter(s => isThisMonth(s.date))
    .reduce((sum, s) => sum + s.wordsAdded, 0);
  
  // Get unique writing days
  const writingDays = [...new Set(sessions.map(s => s.date))].sort();
  
  // Calculate streak
  const { currentStreak, longestStreak } = calculateStreaks(writingDays);
  
  const lastWritingDate = writingDays.length > 0 ? writingDays[writingDays.length - 1] : null;
  
  return {
    totalWordsToday,
    totalWordsThisWeek,
    totalWordsThisMonth,
    currentStreak,
    longestStreak: Math.max(longestStreak, previousStats.longestStreak),
    writingDays,
    lastWritingDate,
  };
};

// Calculate writing streaks
export const calculateStreaks = (writingDays: string[]): { currentStreak: number; longestStreak: number } => {
  if (writingDays.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }
  
  const sortedDays = writingDays.sort();
  const today = getToday();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatDate(yesterday);
  
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;
  
  // Calculate longest streak
  for (let i = 1; i < sortedDays.length; i++) {
    const prevDate = new Date(sortedDays[i - 1]);
    const currDate = new Date(sortedDays[i]);
    const dayDiff = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (dayDiff === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);
  
  // Calculate current streak
  const lastWritingDay = sortedDays[sortedDays.length - 1];
  if (lastWritingDay === today || lastWritingDay === yesterdayStr) {
    currentStreak = 1;
    for (let i = sortedDays.length - 2; i >= 0; i--) {
      const prevDate = new Date(sortedDays[i]);
      const currDate = new Date(sortedDays[i + 1]);
      const dayDiff = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (dayDiff === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }
  
  return { currentStreak, longestStreak };
};

// Check for new achievements
export const checkAchievements = (
  stats: WritingStats,
  totalWords: number,
  totalProjects: number,
  totalChapters: number,
  existingAchievements: Achievement[] = []
): Achievement[] => {
  const newAchievements: Achievement[] = [];
  const existingIds = new Set(existingAchievements.map(a => a.id));
  
  const achievements = [
    // Word milestones
    { id: 'first-words', threshold: 1, type: 'words' as const, title: 'First Words', description: 'Write your first words', icon: '✍️' },
    { id: 'hundred-words', threshold: 100, type: 'words' as const, title: 'Century Writer', description: 'Write 100 words', icon: '💯' },
    { id: 'thousand-words', threshold: 1000, type: 'words' as const, title: 'Thousand Club', description: 'Write 1,000 words', icon: '🎯' },
    { id: 'five-thousand-words', threshold: 5000, type: 'words' as const, title: 'Prolific Writer', description: 'Write 5,000 words', icon: '📝' },
    { id: 'ten-thousand-words', threshold: 10000, type: 'words' as const, title: 'Word Master', description: 'Write 10,000 words', icon: '🏆' },
    { id: 'fifty-thousand-words', threshold: 50000, type: 'words' as const, title: 'Novel Length', description: 'Write 50,000 words', icon: '📚' },
    
    // Streak milestones
    { id: 'three-day-streak', threshold: 3, type: 'streak' as const, title: 'Getting Started', description: 'Write for 3 days in a row', icon: '🔥' },
    { id: 'week-streak', threshold: 7, type: 'streak' as const, title: 'Week Warrior', description: 'Write for 7 days in a row', icon: '⚡' },
    { id: 'two-week-streak', threshold: 14, type: 'streak' as const, title: 'Habit Former', description: 'Write for 14 days in a row', icon: '💪' },
    { id: 'month-streak', threshold: 30, type: 'streak' as const, title: 'Consistency King', description: 'Write for 30 days in a row', icon: '👑' },
    
    // Project milestones
    { id: 'first-project', threshold: 1, type: 'projects' as const, title: 'Creator', description: 'Start your first project', icon: '🌟' },
    { id: 'multi-project', threshold: 3, type: 'projects' as const, title: 'Multi-Author', description: 'Create 3 projects', icon: '📖' },
    { id: 'project-master', threshold: 10, type: 'projects' as const, title: 'Project Master', description: 'Create 10 projects', icon: '🎨' },
    
    // Chapter milestones
    { id: 'first-chapter', threshold: 1, type: 'chapters' as const, title: 'Chapter One', description: 'Write your first chapter', icon: '📄' },
    { id: 'ten-chapters', threshold: 10, type: 'chapters' as const, title: 'Storyteller', description: 'Write 10 chapters', icon: '📋' },
    { id: 'fifty-chapters', threshold: 50, type: 'chapters' as const, title: 'Chapter Champion', description: 'Write 50 chapters', icon: '📜' },
  ];
  
  for (const achievement of achievements) {
    if (existingIds.has(achievement.id)) continue;
    
    let shouldUnlock = false;
    
    switch (achievement.type) {
      case 'words':
        shouldUnlock = totalWords >= achievement.threshold;
        break;
      case 'streak':
        shouldUnlock = stats.currentStreak >= achievement.threshold;
        break;
      case 'projects':
        shouldUnlock = totalProjects >= achievement.threshold;
        break;
      case 'chapters':
        shouldUnlock = totalChapters >= achievement.threshold;
        break;
    }
    
    if (shouldUnlock) {
      newAchievements.push({
        id: achievement.id,
        title: achievement.title,
        description: achievement.description,
        icon: achievement.icon,
        unlockedAt: new Date(),
        type: achievement.type,
      });
    }
  }
  
  return newAchievements;
};

// Calculate progress toward goals
export const calculateGoalProgress = (stats: WritingStats, goals: WritingGoals) => {
  return {
    daily: {
      current: stats.totalWordsToday,
      target: goals.dailyWordTarget,
      percentage: Math.min(100, (stats.totalWordsToday / goals.dailyWordTarget) * 100),
    },
    weekly: {
      current: stats.totalWordsThisWeek,
      target: goals.weeklyWordTarget,
      percentage: Math.min(100, (stats.totalWordsThisWeek / goals.weeklyWordTarget) * 100),
    },
    monthly: {
      current: stats.totalWordsThisMonth,
      target: goals.monthlyWordTarget,
      percentage: Math.min(100, (stats.totalWordsThisMonth / goals.monthlyWordTarget) * 100),
    },
  };
};

// Create writing session
export const createWritingSession = (
  projectId: string,
  chapterId: string,
  wordsAdded: number
): WritingSession => {
  const now = new Date();
  return {
    id: crypto.randomUUID(),
    projectId,
    chapterId,
    wordsAdded,
    startTime: now,
    endTime: now,
    date: formatDate(now),
  };
};
