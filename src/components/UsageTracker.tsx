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
}

export function UsageTracker({ onUpgradeClick, className = '' }: UsageTrackerProps) {
  const { userProfile } = useAuth();

  if (!userProfile) return null;

  const { pagesUsed, maxPages, isPremium, subscriptionStatus } = userProfile;
  const isUnlimited = maxPages === -1 || isPremium;
  const usagePercentage = isUnlimited ? 0 : Math.min((pagesUsed / maxPages) * 100, 100);
  const pagesRemaining = isUnlimited ? 'Unlimited' : Math.max(maxPages - pagesUsed, 0);

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
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isPremium ? (
                <Crown size={16} className="text-yellow-500" />
              ) : (
                <FileText size={16} className="text-muted-foreground" />
              )}
              <span className="font-medium text-sm">Page Usage</span>
            </div>
            <Badge 
              className={`${getStatusColor()} text-white border-0 text-xs`}
            >
              {getStatusText()}
            </Badge>
          </div>

          {/* Usage Display */}
          {!isUnlimited ? (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {pagesUsed} of {maxPages} pages used
                </span>
                <span className="font-medium">
                  {pagesRemaining} remaining
                </span>
              </div>
              <Progress 
                value={usagePercentage} 
                className="h-2 neomorph-inset"
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
                <div className="space-y-2 p-3 rounded-lg bg-yellow-50/50 neomorph-flat">
                  <div className="flex items-center gap-2 text-sm">
                    <TrendUp size={14} className="text-yellow-600" />
                    <span className="font-medium text-yellow-800">Running low on pages</span>
                  </div>
                  <p className="text-xs text-yellow-700">
                    Consider upgrading for unlimited pages and advanced features
                  </p>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={onUpgradeClick}
                    className="w-full gap-2 neomorph-button border-0 text-yellow-700 hover:bg-yellow-100"
                  >
                    <Crown size={12} />
                    Learn More
                  </Button>
                </div>
              ) : (
                <div className="text-center p-2">
                  <p className="text-xs text-muted-foreground mb-2">
                    Want unlimited pages and premium features?
                  </p>
                  <Button 
                    variant="ghost"
                    size="sm"
                    onClick={onUpgradeClick}
                    className="gap-2 neomorph-button border-0 text-xs"
                  >
                    <Crown size={12} />
                    Upgrade to Premium
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
