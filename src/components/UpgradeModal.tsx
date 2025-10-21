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

  const handleUpgrade = async (priceId: string, planId: string) => {
    if (!user) {
      toast.error('Please sign in to upgrade');
      return;
    }

    console.log('Starting upgrade with:', { priceId, userId: user.uid, email: user.email });
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
  const paidPlans = SUBSCRIPTION_PLANS.filter(plan => plan.price > 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto neomorph-flat border-0 p-0">
        <DialogHeader className="p-6 pb-4 bg-gradient-to-r from-primary/10 to-purple-500/10 sticky top-0 z-10 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <Crown size={24} className="text-amber-500" weight="fill" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl">Upgrade to Premium</DialogTitle>
              <DialogDescription className="text-sm">
                {highlightMessage || 'Unlock unlimited creativity with Inkfluence AI Premium'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-4">
            {paidPlans.map((plan) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: plan.id === 'monthly' ? 0 : 0.1 }}
              >
                <Card className={`relative neomorph-flat border-0 p-6 ${
                  plan.popular ? 'ring-2 ring-primary' : ''
                }`}>
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                      <Sparkle size={12} className="mr-1" weight="fill" />
                      Most Popular
                    </Badge>
                  )}

                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold">£{plan.price}</span>
                      <span className="text-muted-foreground">/{plan.interval === 'month' ? 'mo' : 'year'}</span>
                    </div>
                    {plan.interval === 'year' && (
                      <div className="mt-2 space-y-1">
                        <Badge variant="outline" className="border-green-500 text-green-600">
                          Save {savings}%
                        </Badge>
                        <p className="text-sm text-muted-foreground">
                          Just £{(plan.price / 12).toFixed(2)}/month
                        </p>
                      </div>
                    )}
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Check size={16} className="text-green-500 flex-shrink-0 mt-0.5" weight="bold" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleUpgrade(plan.priceId, plan.id)}
                    disabled={loading !== null}
                    className={`w-full gap-2 ${
                      plan.popular 
                        ? 'bg-primary hover:bg-primary/90' 
                        : 'neomorph-button border-0'
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

          {/* Feature Highlights */}
          <div className="bg-muted/30 rounded-lg p-6">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <Sparkle size={18} className="text-primary" weight="fill" />
              What You'll Get
            </h4>
            <div className="grid sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <Check size={16} className="text-primary flex-shrink-0 mt-0.5" weight="bold" />
                <span><strong>Unlimited pages</strong> - No more limits on your creativity</span>
              </div>
              <div className="flex items-start gap-2">
                <Check size={16} className="text-primary flex-shrink-0 mt-0.5" weight="bold" />
                <span><strong>50 AI generations/day</strong> - 16x more than free tier</span>
              </div>
              <div className="flex items-start gap-2">
                <Check size={16} className="text-primary flex-shrink-0 mt-0.5" weight="bold" />
                <span><strong>Custom branding</strong> - Make it truly yours</span>
              </div>
              <div className="flex items-start gap-2">
                <Check size={16} className="text-primary flex-shrink-0 mt-0.5" weight="bold" />
                <span><strong>Priority support</strong> - Get help when you need it</span>
              </div>
            </div>
          </div>

          {/* Money-back guarantee */}
          <p className="text-center text-xs text-muted-foreground">
            🔒 Secure payment powered by Stripe • Cancel anytime, no questions asked
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
