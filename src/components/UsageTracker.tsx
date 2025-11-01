import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Crown, TrendUp, FileText, Sparkle } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';

interface UsageTrackerProps {
  onUpgradeClick?: () => void;
  className?: string;
  forceShow?: boolean; // Show even for premium users or low usage
}

export function UsageTracker({ onUpgradeClick, className = '', forceShow = false }: UsageTrackerProps) {
  const { userProfile } = useAuth();
  if (!userProfile) return null;

  const { pagesUsed, maxPages, isPremium, subscriptionStatus } = userProfile;
  // Only show unlimited if user is actually premium (not just if maxPages is -1)
  const isUnlimited = isPremium && (maxPages === -1 || subscriptionStatus === 'premium');
  // Default to 4 pages for free users if maxPages is invalid
  const effectiveMaxPages = !isPremium && (maxPages <= 0 || maxPages === -1) ? 4 : maxPages;
  const usagePercentage = isUnlimited ? 0 : Math.min((pagesUsed / effectiveMaxPages) * 100, 100);
  const pagesRemaining = isUnlimited ? 'Unlimited' : Math.max(effectiveMaxPages - pagesUsed, 0);

  // Only show if forced, or if user is not premium and usage is high (70% or more)
  const shouldShow = forceShow || (!isPremium && usagePercentage >= 70);
  
  if (!shouldShow) return null;

  const getStatusColor = () => {
    if (isPremium) return 'bg-gradient-to-r from-yellow-400 to-orange-500';
    if (pagesUsed >= maxPages) return 'bg-gradient-to-r from-red-400 to-red-600';
    if (pagesUsed >= maxPages * 0.8) return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
    return 'bg-gradient-to-r from-green-400 to-green-600';
  };

  const getStatusText = () => {
    if (isPremium) return 'Premium Active';
    if (pagesUsed >= maxPages) return 'Limit Reached';
    if (pagesUsed >= maxPages * 0.8) return 'Almost Full';
    return 'Free Trial';
  };

  return (
    <Card className={`neomorph-raised border-0 ${className}`}>
      <CardContent className="p-3">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isPremium ? (
                <Crown size={14} className="text-amber-500" weight="fill" />
              ) : (
                <FileText size={14} className="text-muted-foreground" />
              )}
              <span className="font-medium text-xs">Page Usage</span>
            </div>
            <Badge 
              className={`${getStatusColor()} text-white border-0 text-[10px] px-1.5 py-0.5`}
            >
              {getStatusText()}
            </Badge>
          </div>

          {/* Usage Display */}
          {!isUnlimited ? (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">
                  {pagesUsed} of {maxPages} pages
                </span>
                <span className="font-medium">
                  {pagesRemaining} left
                </span>
              </div>
              <Progress 
                value={usagePercentage} 
                className="h-1.5 neomorph-inset"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm">
              <Sparkle size={14} className="text-yellow-500" />
              <span className="text-muted-foreground">Unlimited pages available</span>
            </div>
          )}

          {/* Upgrade CTA */}
          {!isPremium && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {pagesUsed >= maxPages ? (
                <div className="space-y-3 p-3 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 neomorph-flat">
                  <div className="text-center">
                    <h4 className="font-medium text-sm mb-1">You've reached your free limit!</h4>
                    <p className="text-xs text-muted-foreground">
                      Upgrade to continue creating your eBook with unlimited pages
                    </p>
                  </div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      onClick={onUpgradeClick}
                      className="w-full gap-2 neomorph-button border-0 bg-gradient-to-r from-primary to-accent text-white"
                    >
                      <Crown size={14} />
                      Upgrade to Premium
                    </Button>
                  </motion.div>
                </div>
              ) : pagesUsed >= maxPages * 0.7 ? (
                <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-amber-500/10 dark:from-amber-500/20 dark:via-orange-500/20 dark:to-amber-500/20 border border-amber-200/50 dark:border-amber-700/50 backdrop-blur-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-full bg-amber-100 dark:bg-amber-900/50">
                      <TrendUp size={14} className="text-amber-600 dark:text-amber-400" weight="bold" />
                    </div>
                    <span className="text-xs font-medium text-amber-900 dark:text-amber-100">Running low on pages</span>
                  </div>
                  <Button 
                    variant="ghost"
                    size="sm"
                    onClick={onUpgradeClick}
                    className="h-8 px-4 gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 text-xs font-semibold shadow-sm hover:shadow-md transition-all"
                  >
                    <Crown size={14} weight="fill" />
                    Upgrade
                  </Button>
                </div>
              ) : null}
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
