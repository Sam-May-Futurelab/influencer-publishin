import { createContext, useContext, ReactNode } from 'react';
import { useAchievements, Achievement } from '@/hooks/use-achievements';
import { toast } from 'sonner';

interface AchievementsContextType extends ReturnType<typeof useAchievements> {
  trackWordCount: (words: number) => void;
  trackChapterCreated: () => void;
  trackProjectCreated: () => void;
  trackCoverDesigned: () => void;
  trackAIAssist: () => void;
  trackExport: () => void;
}

const AchievementsContext = createContext<AchievementsContextType | null>(null);

export function AchievementsProvider({ children }: { children: ReactNode }) {
  const achievements = useAchievements();
  const { updateStats, stats } = achievements;

  const showAchievementToast = (newAchievements: Achievement[]) => {
    newAchievements.forEach((achievement) => {
      toast.success(
        `🏆 Achievement Unlocked: ${achievement.title}`,
        {
          description: achievement.description,
          duration: 5000,
        }
      );
    });
  };

  const trackWordCount = (words: number) => {
    const newAchievements = updateStats({ totalWords: words });
    if (newAchievements.length > 0) {
      showAchievementToast(newAchievements);
    }
  };

  const trackChapterCreated = () => {
    const newAchievements = updateStats({ 
      totalChapters: stats.totalChapters + 1 
    });
    if (newAchievements.length > 0) {
      showAchievementToast(newAchievements);
    }
  };

  const trackProjectCreated = () => {
    const newAchievements = updateStats({ 
      totalProjects: stats.totalProjects + 1 
    });
    if (newAchievements.length > 0) {
      showAchievementToast(newAchievements);
    }
  };

  const trackCoverDesigned = () => {
    const newAchievements = updateStats({ 
      coversDesigned: stats.coversDesigned + 1 
    });
    if (newAchievements.length > 0) {
      showAchievementToast(newAchievements);
    }
  };

  const trackAIAssist = () => {
    const newAchievements = updateStats({ 
      aiAssistsUsed: stats.aiAssistsUsed + 1 
    });
    if (newAchievements.length > 0) {
      showAchievementToast(newAchievements);
    }
  };

  const trackExport = () => {
    const newAchievements = updateStats({ 
      exportsCount: stats.exportsCount + 1 
    });
    if (newAchievements.length > 0) {
      showAchievementToast(newAchievements);
    }
  };

  return (
    <AchievementsContext.Provider
      value={{
        ...achievements,
        trackWordCount,
        trackChapterCreated,
        trackProjectCreated,
        trackCoverDesigned,
        trackAIAssist,
        trackExport,
      }}
    >
      {children}
    </AchievementsContext.Provider>
  );
}

export function useAchievementsContext() {
  const context = useContext(AchievementsContext);
  if (!context) {
    throw new Error('useAchievementsContext must be used within AchievementsProvider');
  }
  return context;
}
