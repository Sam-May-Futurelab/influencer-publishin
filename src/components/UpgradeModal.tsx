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
      <DialogContent className="max-w-[95vw] lg:max-w-7xl max-h-[95vh] overflow-y-auto neomorph-flat border-0 p-0">
        <DialogHeader className="p-6 pb-4 bg-gradient-to-br from-primary/10 via-purple-500/10 to-primary/10 dark:from-primary/20 dark:via-purple-500/20 dark:to-primary/20 sticky top-0 z-10 backdrop-blur-md border-b border-border/50">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg">
              <Crown size={28} className="text-white" weight="fill" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Upgrade to Premium
              </DialogTitle>
              <DialogDescription className="text-base mt-1">
                {highlightMessage || "You've reached your page limit! Upgrade to Premium for unlimited pages."}
              </DialogDescription>
            </div>
          </div>
          
          {/* Billing Interval Toggle */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <span className={`text-sm font-semibold ${billingInterval === 'month' ? 'text-foreground' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingInterval(billingInterval === 'month' ? 'year' : 'month')}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                billingInterval === 'year' ? 'bg-gradient-to-r from-primary to-purple-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
                  billingInterval === 'year' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-semibold ${billingInterval === 'year' ? 'text-foreground' : 'text-muted-foreground'}`}>
              Yearly
            </span>
            <div className="ml-2 min-w-[100px]">
              {billingInterval === 'year' && (
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-sm">
                  Save {savings}%
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Pricing Cards */}
          {filteredPlans.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No plans available for {billingInterval} billing.</p>
              <p className="text-sm mt-2">Please try the other billing option.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {filteredPlans.map((plan, index) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`relative h-full neomorph-raised border-0 p-6 transition-all hover:shadow-2xl ${
                    plan.popular ? 'ring-2 ring-primary shadow-xl scale-[1.02]' : ''
                  }`}>
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 px-4 py-1.5 shadow-lg">
                      <Sparkle size={14} className="mr-1.5" weight="fill" />
                      Most Popular
                    </Badge>
                  )}

                  <div className="text-center mb-5">
                    <h3 className="text-2xl font-bold mb-2">{plan.name.replace(' Monthly', '').replace(' Yearly', '')}</h3>
                    <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>
                    <div className="flex items-baseline justify-center gap-1 mb-2">
                      <span className="text-5xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                        £{plan.price}
                      </span>
                      <span className="text-muted-foreground text-lg">/{plan.interval === 'month' ? 'mo' : 'year'}</span>
                    </div>
                    {plan.interval === 'year' && (
                      <div className="mt-3 space-y-1">
                        <Badge variant="outline" className="border-green-500 text-green-600 dark:border-green-400 dark:text-green-400">
                          Save {savings}%
                        </Badge>
                        <p className="text-sm font-medium text-muted-foreground">
                          Just £{(plan.price / 12).toFixed(2)}/month
                        </p>
                      </div>
                    )}
                  </div>

                  <ul className="space-y-2.5 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm">
                        <div className="p-1 rounded-full bg-green-100 dark:bg-green-900/30 flex-shrink-0 mt-0.5">
                          <Check size={12} className="text-green-600 dark:text-green-400" weight="bold" />
                        </div>
                        <span className="leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleUpgrade(plan.priceId, plan.id)}
                    disabled={loading !== null}
                    className={`w-full gap-2 h-12 text-base font-semibold transition-all ${
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
                          <Lightning size={18} />
                        </motion.div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Crown size={18} weight="fill" />
                        Upgrade Now
                      </>
                    )}
                  </Button>
                </Card>
              </motion.div>
            ))}
            </div>
          )}

          {/* Feature Highlights */}
          <div className="bg-gradient-to-br from-muted/50 to-muted/30 dark:from-muted/30 dark:to-muted/20 rounded-xl p-5 border border-border/50">
            <h4 className="font-bold text-base mb-4 flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Sparkle size={18} className="text-primary" weight="fill" />
              </div>
              What You'll Get
            </h4>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-2.5">
                <Check size={16} className="text-primary flex-shrink-0 mt-0.5" weight="bold" />
                <span><strong className="text-foreground">Unlimited pages</strong> - No more limits on your creativity</span>
              <div className="flex items-start gap-2.5">
                <Check size={16} className="text-primary flex-shrink-0 mt-0.5" weight="bold" />
                <span><strong className="text-foreground">50 AI generations/day</strong> - 16x more than free tier</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check size={16} className="text-primary flex-shrink-0 mt-0.5" weight="bold" />
                <span><strong className="text-foreground">Custom branding</strong> - Make it truly yours</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check size={16} className="text-primary flex-shrink-0 mt-0.5" weight="bold" />
                <span><strong className="text-foreground">Priority support</strong> - Get help when you need it</span>
              </div>
            </div>
          </div>

          {/* Money-back guarantee */}
          <p className="text-center text-sm text-muted-foreground pb-2">
            🔒 Secure payment powered by Stripe • Cancel anytime, no questions asked
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
