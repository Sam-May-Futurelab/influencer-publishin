import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UsageLimit } from '@/lib/types';

const FREE_TIER_LIMIT = 3;
const PREMIUM_TIER_LIMIT = 50;

export function useUsageTracking(userId: string | null, isPremium: boolean) {
  const [usage, setUsage] = useState<UsageLimit | null>(null);
  const [loading, setLoading] = useState(true);

  const dailyLimit = isPremium ? PREMIUM_TIER_LIMIT : FREE_TIER_LIMIT;

  // Get today's date in YYYY-MM-DD format
  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Load usage data from Firestore
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const loadUsage = async () => {
      try {
        const usageRef = doc(db, 'usage', userId);
        const usageDoc = await getDoc(usageRef);
        const today = getTodayString();

        if (usageDoc.exists()) {
          const data = usageDoc.data() as UsageLimit;
          
          // Reset counter if it's a new day
          if (data.lastResetDate !== today) {
            const resetData: UsageLimit = {
              dailyGenerations: dailyLimit,
              usedToday: 0,
              lastResetDate: today,
            };
            await setDoc(usageRef, resetData);
            setUsage(resetData);
          } else {
            setUsage(data);
          }
        } else {
          // First time - create usage document
          const newData: UsageLimit = {
            dailyGenerations: dailyLimit,
            usedToday: 0,
            lastResetDate: today,
          };
          await setDoc(usageRef, newData);
          setUsage(newData);
        }
      } catch (error) {
        console.error('Error loading usage data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUsage();
  }, [userId, dailyLimit]);

  // Increment usage counter
  const incrementUsage = async () => {
    if (!userId || !usage) return false;

    const today = getTodayString();
    const usageRef = doc(db, 'usage', userId);

    try {
      // Check if we need to reset (shouldn't happen, but safety check)
      if (usage.lastResetDate !== today) {
        const resetData: UsageLimit = {
          dailyGenerations: dailyLimit,
          usedToday: 1,
          lastResetDate: today,
        };
        await setDoc(usageRef, resetData);
        setUsage(resetData);
        return true;
      }

      // Check if limit reached
      if (usage.usedToday >= dailyLimit) {
        return false;
      }

      // Increment counter
      const newUsedCount = usage.usedToday + 1;
      await updateDoc(usageRef, {
        usedToday: newUsedCount,
      });

      setUsage({
        ...usage,
        usedToday: newUsedCount,
      });

      return true;
    } catch (error) {
      console.error('Error incrementing usage:', error);
      return false;
    }
  };

  // Check if user can generate
  const canGenerate = () => {
    if (!usage) return false;
    return usage.usedToday < dailyLimit;
  };

  // Get remaining generations
  const remainingGenerations = () => {
    if (!usage) return 0;
    return Math.max(0, dailyLimit - usage.usedToday);
  };

  return {
    usage,
    loading,
    canGenerate: canGenerate(),
    remainingGenerations: remainingGenerations(),
    incrementUsage,
    dailyLimit,
  };
}
