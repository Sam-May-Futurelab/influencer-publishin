import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Check, Sparkle, Lightning } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { SUBSCRIPTION_PLANS, stripeService } from '@/lib/stripe-payments';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  highlightMessage?: string;
}

export function UpgradeModal({ open, onClose, highlightMessage }: UpgradeModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');

  const handleUpgrade = async (priceId: string, planId: string) => {
    if (!user) {
      toast.error('Please sign in to upgrade');
      return;
    }

    setLoading(planId);

    try {
      const result = await stripeService.createCheckoutSession(
        priceId,
        user.uid,
        user.email || ''
      );

      if ('error' in result) {
        console.error('Checkout error:', result.error);
        toast.error(result.error);
        setLoading(null);
        return;
      }

      // Open Stripe Checkout in new tab to preserve user's work
      window.open(result.url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Upgrade error:', error);
      toast.error('Failed to start upgrade process');
      setLoading(null);
    }
  };

  const savings = stripeService.calculateYearlySavings();
  // Filter plans by billing interval and exclude free plan
  const filteredPlans = SUBSCRIPTION_PLANS.filter(
    plan => plan.price > 0 && plan.interval === billingInterval
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto neomorph-flat border-0 p-0">
        <DialogHeader className="p-4 bg-gradient-to-br from-primary/10 via-purple-500/10 to-primary/10 dark:from-primary/20 dark:via-purple-500/20 dark:to-primary/20 border-b border-border/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg">
              <Crown size={20} className="text-white" weight="fill" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Upgrade to Premium
              </DialogTitle>
              <DialogDescription className="text-sm">
                {highlightMessage || "You've reached your page limit! Upgrade for more."}
              </DialogDescription>
            </div>
          </div>
          
          {/* Billing Interval Toggle */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <span className={`text-xs font-semibold ${billingInterval === 'month' ? 'text-foreground' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingInterval(billingInterval === 'month' ? 'year' : 'month')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                billingInterval === 'year' ? 'bg-gradient-to-r from-primary to-purple-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${
                  billingInterval === 'year' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-xs font-semibold ${billingInterval === 'year' ? 'text-foreground' : 'text-muted-foreground'}`}>
              Yearly
            </span>
            <div className="ml-1 min-w-[80px]">
              {billingInterval === 'year' && (
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 text-xs">
                  Save {savings}%
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="p-4 space-y-4">
          {/* Pricing Cards */}
          {filteredPlans.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No plans available for {billingInterval} billing.</p>
              <p className="text-sm mt-2">Please try the other billing option.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {filteredPlans.map((plan, index) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`relative h-full neomorph-raised border-0 p-4 transition-all hover:shadow-xl ${
                    plan.popular ? 'ring-2 ring-primary shadow-lg scale-[1.02]' : ''
                  }`}>
                  {plan.popular && (
                    <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 px-3 py-1 text-xs shadow-lg">
                      <Sparkle size={12} className="mr-1" weight="fill" />
                      Most Popular
                    </Badge>
                  )}

                  <div className="text-center mb-3">
                    <h3 className="text-lg font-bold mb-1">{plan.name.replace(' Monthly', '').replace(' Yearly', '')}</h3>
                    <p className="text-xs text-muted-foreground mb-3">{plan.description}</p>
                    <div className="flex items-baseline justify-center gap-1 mb-1">
                      <span className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                        £{plan.price}
                      </span>
                      <span className="text-muted-foreground text-sm">/{plan.interval === 'month' ? 'mo' : 'year'}</span>
                    </div>
                    {plan.interval === 'year' && (
                      <p className="text-xs font-medium text-muted-foreground">
                        £{(plan.price / 12).toFixed(2)}/month • Save {savings}%
                      </p>
                    )}
                  </div>

                  <ul className="space-y-1.5 mb-3 text-xs">
                    {plan.features.slice(0, 7).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <div className="p-0.5 rounded-full bg-green-100 dark:bg-green-900/30 flex-shrink-0 mt-0.5">
                          <Check size={10} className="text-green-600 dark:text-green-400" weight="bold" />
                        </div>
                        <span className="leading-tight">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleUpgrade(plan.priceId, plan.id)}
                    disabled={loading !== null}
                    className={`w-full gap-2 h-10 text-sm font-semibold transition-all ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl' 
                        : 'bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-md hover:shadow-lg'
                    }`}
                  >
                    {loading === plan.id ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Lightning size={16} />
                        </motion.div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Crown size={16} weight="fill" />
                        Upgrade Now
                      </>
                    )}
                  </Button>
                </Card>
              </motion.div>
            ))}
            </div>
          )}

          {/* Money-back guarantee */}
          <p className="text-center text-xs text-muted-foreground">
            🔒 Secure payment • Cancel anytime
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
