import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { ProgressRing, ProgressBar } from '@/components/ui/progress-ring';
import { Target, Flame, Trophy, Gear, Calendar, TrendUp } from '@phosphor-icons/react';
import { WritingGoals, WritingStats } from '@/lib/types';
import { cn } from '@/lib/utils';

interface WritingGoalsProps {
  goals: WritingGoals;
  stats: WritingStats;
  progress: {
    daily: { current: number; target: number; percentage: number };
    weekly: { current: number; target: number; percentage: number };
    monthly: { current: number; target: number; percentage: number };
  };
  onUpdateGoals: (goals: Partial<WritingGoals>) => void;
  className?: string;
}

export function WritingGoalsComponent({
  goals,
  stats,
  progress,
  onUpdateGoals,
  className
}: WritingGoalsProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [tempGoals, setTempGoals] = useState(goals);

  const handleSaveGoals = () => {
    onUpdateGoals(tempGoals);
    setShowSettings(false);
  };

  const getStreakLabel = (streak: number) => {
    if (streak >= 30) return 'Legendary';
    if (streak >= 14) return 'Excellent';
    if (streak >= 7) return 'Building';
    if (streak >= 3) return 'Growing';
    return 'Starting';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'hsl(var(--primary))'; // Use theme primary
    if (percentage >= 75) return 'hsl(var(--primary))';
    if (percentage >= 50) return 'hsl(var(--primary))';
    return 'hsl(var(--primary))'; // Consistent primary color
  };

  if (!goals.enabled) {
    return (
      <Card className={cn("neomorph-flat border-0", className)}>
        <CardContent className="p-6 text-center">
          <Target size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Set Writing Goals</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Track your progress and stay motivated with daily writing targets.
          </p>
          <Button
            onClick={() => onUpdateGoals({ enabled: true })}
            className="neomorph-button border-0"
          >
            <Target size={16} />
            Enable Goals
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl neomorph-inset">
            <Target size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Writing Goals</h2>
            <p className="text-sm text-muted-foreground">Track your daily progress</p>
          </div>
        </div>
        
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="neomorph-button border-0">
              <Gear size={16} />
            </Button>
          </DialogTrigger>
          <DialogContent className="neomorph-raised border-0 max-w-md">
            <DialogHeader>
              <DialogTitle>Writing Goals Settings</DialogTitle>
              <DialogDescription>
                Set your daily, weekly, and monthly word count targets to stay on track
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Daily Word Target</label>
                <Input
                  type="number"
                  value={tempGoals.dailyWordTarget}
                  onChange={(e) => setTempGoals(prev => ({ 
                    ...prev, 
                    dailyWordTarget: parseInt(e.target.value) || 0 
                  }))}
                  className="neomorph-inset border-0"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Weekly Word Target</label>
                <Input
                  type="number"
                  value={tempGoals.weeklyWordTarget}
                  onChange={(e) => setTempGoals(prev => ({ 
                    ...prev, 
                    weeklyWordTarget: parseInt(e.target.value) || 0 
                  }))}
                  className="neomorph-inset border-0"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Monthly Word Target</label>
                <Input
                  type="number"
                  value={tempGoals.monthlyWordTarget}
                  onChange={(e) => setTempGoals(prev => ({ 
                    ...prev, 
                    monthlyWordTarget: parseInt(e.target.value) || 0 
                  }))}
                  className="neomorph-inset border-0"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowSettings(false)}
                  className="neomorph-button border-0"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveGoals}
                  className="neomorph-button border-0"
                >
                  Save Goals
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Progress Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Daily Goal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="neomorph-flat border-0 h-full">
            <CardContent className="p-4 lg:p-6 flex flex-col items-center text-center">
              <div className="mb-4">
                <ProgressRing
                  progress={progress.daily.percentage}
                  size={80}
                  strokeWidth={6}
                  color={getProgressColor(progress.daily.percentage)}
                >
                  <div className="text-center">
                    <div className="text-lg font-bold text-foreground">
                      {Math.round(progress.daily.percentage)}%
                    </div>
                  </div>
                </ProgressRing>
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-sm">Daily Goal</h3>
                <div className="text-xs text-muted-foreground">
                  {progress.daily.current.toLocaleString()} / {progress.daily.target.toLocaleString()} words
                </div>
                {progress.daily.percentage >= 100 && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-0 text-xs font-medium">
                    Complete
                  </Badge>
                )}
                {progress.daily.percentage < 100 && progress.daily.percentage > 0 && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {(progress.daily.target - progress.daily.current).toLocaleString()} words remaining
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Weekly Goal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="neomorph-flat border-0 h-full">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center gap-3 mb-4">
                <Calendar size={20} className="text-primary" weight="duotone" />
                <div>
                  <h3 className="font-semibold text-sm">Weekly Goal</h3>
                  <div className="text-xs text-muted-foreground">
                    {progress.weekly.current.toLocaleString()} / {progress.weekly.target.toLocaleString()} words
                  </div>
                </div>
              </div>
              <ProgressBar
                progress={progress.weekly.percentage}
                height={6}
                color={getProgressColor(progress.weekly.percentage)}
                showPercentage
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Writing Streak */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="neomorph-flat border-0 h-full">
            <CardContent className="p-4 lg:p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Flame size={24} className="text-primary" weight="duotone" />
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-foreground">{stats.currentStreak}</div>
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {getStreakLabel(stats.currentStreak)} Streak
                </div>
                <div className="text-xs text-muted-foreground">
                  Days • Best: {stats.longestStreak}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Monthly Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="neomorph-flat border-0">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendUp size={20} className="text-primary" weight="duotone" />
              <div>
                <h3 className="font-semibold">Monthly Progress</h3>
                <div className="text-sm text-muted-foreground">
                  {progress.monthly.current.toLocaleString()} / {progress.monthly.target.toLocaleString()} words
                </div>
              </div>
            </div>
            <ProgressBar
              progress={progress.monthly.percentage}
              height={8}
              color={getProgressColor(progress.monthly.percentage)}
              showPercentage
            />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
