import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

export interface PaymentState {
  loading: boolean;
  purchasing: boolean;
  initialized: boolean;
}

// Stripe price IDs (these should match your Stripe dashboard)
const STRIPE_PRICES = {
  monthly: import.meta.env.VITE_STRIPE_MONTHLY_PRICE_ID || 'price_1S9qW1Dg7CTY7UgaLvL0Wn8j',
  yearly: import.meta.env.VITE_STRIPE_YEARLY_PRICE_ID || 'price_1S9qW2Dg7CTY7UgaPBLRw8zK',
  'creator-monthly': import.meta.env.VITE_STRIPE_CREATOR_MONTHLY_PRICE_ID,
  'creator-yearly': import.meta.env.VITE_STRIPE_CREATOR_YEARLY_PRICE_ID,
  'premium-monthly': import.meta.env.VITE_STRIPE_MONTHLY_PRICE_ID || 'price_1S9qW1Dg7CTY7UgaLvL0Wn8j',
  'premium-yearly': import.meta.env.VITE_STRIPE_YEARLY_PRICE_ID || 'price_1S9qW2Dg7CTY7UgaPBLRw8zK'
};

export type PlanId = 'monthly' | 'yearly' | 'creator-monthly' | 'creator-yearly' | 'premium-monthly' | 'premium-yearly';

export function usePayments() {
  const { user, userProfile, refreshProfile } = useAuth();
  const [state, setState] = useState<PaymentState>({
    loading: false,
    purchasing: false,
    initialized: true // Stripe is always available on web
  });

  // Create Stripe checkout session and redirect to Stripe
  const createCheckoutSession = async (priceId: string) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId,
        userId: user.uid,
        userEmail: user.email
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to create checkout session');
    }

    return data.url;
  };

  // Purchase a subscription using Stripe Checkout
  const purchaseSubscription = useCallback(async (planId: PlanId): Promise<boolean> => {
    if (!user || !state.initialized) {
      toast.error('Please sign in to upgrade to premium.');
      return false;
    }

    const priceId = STRIPE_PRICES[planId];
    
    if (!priceId) {
      toast.error(`Invalid plan: ${planId}`);
      return false;
    }

    setState(prev => ({ ...prev, purchasing: true }));

    try {
      // Show purchase starting
      toast.loading('Redirecting to Stripe checkout...', { id: 'purchase' });

      // Create checkout session and redirect to Stripe
      const checkoutUrl = await createCheckoutSession(priceId);
      
      // Redirect to Stripe Checkout
      window.location.href = checkoutUrl;
      
      // Return true since we're redirecting (actual success handled by webhook)
      return true;

    } catch (error) {
      console.error('Stripe checkout error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to start checkout. Please try again.',
        { id: 'purchase' }
      );
      return false;
    } finally {
      setState(prev => ({ ...prev, purchasing: false }));
    }
  }, [user, state.initialized]);

  // Restore purchases (not needed for Stripe web, but kept for compatibility)
  const restorePurchases = useCallback(async (): Promise<boolean> => {
    if (!user) {
      toast.error('Please sign in first.');
      return false;
    }

    try {
      // Refresh user profile to get latest subscription status
      await refreshProfile();
      
      if (userProfile?.isPremium) {
        toast.success('Premium subscription restored!');
        return true;
      } else {
        toast.info('No active premium subscription found.');
        return false;
      }
    } catch (error) {
      console.error('Restore purchases error:', error);
      toast.error('Failed to restore purchases. Please try again.');
      return false;
    }
  }, [user, userProfile?.isPremium, refreshProfile]);

  // Check if purchases are available (always true for web Stripe)
  const canPurchase = true;

  return {
    products: [], // Not used for Stripe web implementation
    loading: state.loading,
    purchasing: state.purchasing,
    canPurchase,
    initialized: state.initialized,
    purchaseSubscription,
    restorePurchases,
  };
}
