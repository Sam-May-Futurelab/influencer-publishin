import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Flame, Target, TrendingUp, Calendar, Award, Star, Zap, PenTool } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface WritingStreakCardProps {
  currentStreak: number;
  longestStreak: number;
  lastWriteDate?: string;
  className?: string;
}

export function WritingStreakCard({ 
  currentStreak, 
  longestStreak, 
  lastWriteDate,
  className 
}: WritingStreakCardProps) {
  const getStreakLevel = (streak: number) => {
    if (streak >= 30) return { 
      level: 'Legendary Author', 
      gradient: 'from-primary/20 to-primary/10',
      textColor: 'text-primary',
      icon: <Award className="w-8 h-8" />
    };
    if (streak >= 21) return { 
      level: 'Master Wordsmith', 
      gradient: 'from-primary/20 to-primary/10',
      textColor: 'text-primary',
      icon: <Star className="w-8 h-8 fill-current" />
    };
    if (streak >= 14) return { 
      level: 'Dedicated Writer', 
      gradient: 'from-primary/20 to-primary/10',
      textColor: 'text-primary',
      icon: <TrendingUp className="w-8 h-8" />
    };
    if (streak >= 7) return { 
      level: 'Committed Creator', 
      gradient: 'from-primary/15 to-primary/5',
      textColor: 'text-primary',
      icon: <Zap className="w-8 h-8 fill-current" />
    };
    if (streak >= 3) return { 
      level: 'Budding Author', 
      gradient: 'from-primary/15 to-primary/5',
      textColor: 'text-primary',
      icon: <Flame className="w-8 h-8 fill-current" />
    };
    return { 
      level: 'Fresh Start', 
      gradient: 'from-muted/50 to-muted/20',
      textColor: 'text-muted-foreground',
      icon: <PenTool className="w-8 h-8" />
    };
  };

  const streakInfo = getStreakLevel(currentStreak);
  const isActiveToday = lastWriteDate === new Date().toISOString().split('T')[0];

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn("p-3 rounded-xl bg-gradient-to-br", streakInfo.gradient)}>
              <Flame className={cn("w-6 h-6", streakInfo.textColor)} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-muted-foreground">Writing Streak</h3>
                {isActiveToday && (
                  <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                    Active Today
                  </Badge>
                )}
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-bold">{currentStreak}</span>
                <span className="text-lg text-muted-foreground">days</span>
              </div>
            </div>
          </div>
          <div className={cn("flex items-center justify-center", streakInfo.textColor)}>
            {streakInfo.icon}
          </div>
        </div>

        <div className="space-y-3">
          <div className={cn(
            "px-3 py-2 rounded-lg text-sm font-medium text-center bg-gradient-to-r",
            streakInfo.gradient,
            streakInfo.textColor
          )}>
            {streakInfo.level} Writer
          </div>

          {currentStreak > 0 && (
            <div className="text-xs text-muted-foreground text-center">
              {!isActiveToday && 'Write today to continue your streak!'}
              {isActiveToday && 'Great job staying consistent!'}
            </div>
          )}

          {longestStreak > currentStreak && (
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
              <span className="flex items-center gap-1">
                <Trophy className="w-3 h-3" />
                Personal Best
              </span>
              <span className="font-semibold">{longestStreak} days</span>
            </div>
          )}
        </div>

        {/* Streak Milestones Progress */}
        <div className="mt-4 pt-4 border-t space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Next Milestone</span>
            <span className="font-medium">
              {currentStreak < 3 && '3 days'}
              {currentStreak >= 3 && currentStreak < 7 && '7 days'}
              {currentStreak >= 7 && currentStreak < 14 && '14 days'}
              {currentStreak >= 14 && currentStreak < 21 && '21 days'}
              {currentStreak >= 21 && currentStreak < 30 && '30 days'}
              {currentStreak >= 30 && 'Max Level!'}
            </span>
          </div>
          <Progress 
            value={
              currentStreak < 3 ? (currentStreak / 3) * 100 :
              currentStreak < 7 ? ((currentStreak - 3) / 4) * 100 :
              currentStreak < 14 ? ((currentStreak - 7) / 7) * 100 :
              currentStreak < 21 ? ((currentStreak - 14) / 7) * 100 :
              currentStreak < 30 ? ((currentStreak - 21) / 9) * 100 :
              100
            }
            className="h-2"
          />
        </div>
      </CardContent>
    </Card>
  );
}

interface GoalProgressCardProps {
  title: string;
  current: number;
  target: number;
  period: 'daily' | 'weekly' | 'monthly';
  icon?: React.ReactNode;
  className?: string;
}

export function GoalProgressCard({
  title,
  current,
  target,
  period,
  icon,
  className
}: GoalProgressCardProps) {
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const isComplete = current >= target;
  const remaining = Math.max(target - current, 0);

  const getProgressGradient = () => {
    if (isComplete) return 'bg-gradient-to-r from-primary via-primary/90 to-primary/80';
    if (percentage >= 75) return 'bg-gradient-to-r from-primary/90 via-primary/70 to-primary/50';
    if (percentage >= 50) return 'bg-gradient-to-r from-primary/80 via-primary/60 to-primary/40';
    return 'bg-gradient-to-r from-primary/70 via-primary/50 to-primary/30';
  };

  const getPeriodLabel = () => {
    switch (period) {
      case 'daily': return 'today';
      case 'weekly': return 'this week';
      case 'monthly': return 'this month';
    }
  };

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {icon || <Target className="w-5 h-5 text-muted-foreground" />}
            <h3 className="font-semibold text-sm">{title}</h3>
          </div>
          {isComplete && (
            <Badge className="bg-primary/10 text-primary border-primary/20">
              Complete!
            </Badge>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-bold">{current.toLocaleString()}</span>
              <span className="text-sm text-muted-foreground ml-1">/ {target.toLocaleString()}</span>
            </div>
            <span className="text-lg font-semibold text-foreground">{Math.round(percentage)}%</span>
          </div>

          <div className="relative">
            <div className="h-3 bg-muted/30 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={cn("h-full rounded-full", getProgressGradient())}
              />
            </div>
          </div>

          {!isComplete && (
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">{remaining.toLocaleString()} words</span> remaining {getPeriodLabel()}
            </p>
          )}

          {isComplete && (
            <p className="text-xs text-primary font-medium">
              Goal achieved! Keep up the great work!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface ProjectCompletionCardProps {
  projectTitle: string;
  currentWords: number;
  targetWords: number;
  chapters: number;
  completedChapters: number;
  onClick?: () => void;
  className?: string;
}

export function ProjectCompletionCard({
  projectTitle,
  currentWords,
  targetWords,
  chapters,
  completedChapters,
  onClick,
  className
}: ProjectCompletionCardProps) {
  const wordPercentage = targetWords > 0 ? Math.min((currentWords / targetWords) * 100, 100) : 0;
  const chapterPercentage = chapters > 0 ? (completedChapters / chapters) * 100 : 0;
  const overallPercentage = (wordPercentage + chapterPercentage) / 2;

  return (
    <Card 
      className={cn(
        "relative overflow-hidden cursor-pointer hover:shadow-lg transition-shadow",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold mb-1 line-clamp-1">{projectTitle}</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{chapters} chapters</span>
              <span>•</span>
              <span>{currentWords.toLocaleString()} words</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {Math.round(overallPercentage)}%
            </div>
            <div className="text-xs text-muted-foreground">complete</div>
          </div>
        </div>

        <div className="space-y-3">
          {/* Word Count Progress */}
          <div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Word Count</span>
              <span>{currentWords.toLocaleString()} / {targetWords.toLocaleString()}</span>
            </div>
            <Progress value={wordPercentage} className="h-2" />
          </div>

          {/* Chapter Progress */}
          <div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Chapters</span>
              <span>{completedChapters} / {chapters}</span>
            </div>
            <Progress value={chapterPercentage} className="h-2" />
          </div>
        </div>

        {overallPercentage === 100 && (
          <div className="mt-3 flex items-center gap-2 text-xs text-primary font-medium">
            <CheckCircle className="w-4 h-4" />
            <span>Project Complete!</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Trophy({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}

function CheckCircle({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
