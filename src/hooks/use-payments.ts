import { useState, useEffect, useCallback } from 'react';
import { PaymentService, SubscriptionProduct, PurchaseResult, SUBSCRIPTION_PRODUCTS } from '@/lib/payments';
import { useAuth } from '@/hooks/use-auth';
import { upgradeToPremium } from '@/lib/auth';
import { toast } from 'sonner';

export interface PaymentState {
  products: SubscriptionProduct[];
  loading: boolean;
  purchasing: boolean;
  initialized: boolean;
}

export function usePayments() {
  const { user, userProfile, refreshProfile } = useAuth();
  const [state, setState] = useState<PaymentState>({
    products: [],
    loading: true,
    purchasing: false,
    initialized: false
  });

  const paymentService = PaymentService.getInstance();

  // Initialize payment service and load products
  useEffect(() => {
    let mounted = true;

    const initializePayments = async () => {
      try {
        const initialized = await paymentService.initialize();
        if (!mounted) return;

        if (initialized) {
          const products = await paymentService.getProducts();
          if (mounted) {
            setState(prev => ({
              ...prev,
              products,
              initialized: true,
              loading: false
            }));
          }
        } else {
          if (mounted) {
            setState(prev => ({
              ...prev,
              loading: false,
              initialized: false
            }));
          }
        }
      } catch (error) {
        console.error('Failed to initialize payments:', error);
        if (mounted) {
          setState(prev => ({
            ...prev,
            loading: false,
            initialized: false
          }));
        }
      }
    };

    initializePayments();

    return () => {
      mounted = false;
    };
  }, []);

  // Purchase a subscription
  const purchaseSubscription = useCallback(async (planId: 'monthly' | 'yearly'): Promise<boolean> => {
    if (!user || !state.initialized) {
      toast.error('Payment system not ready. Please try again.');
      return false;
    }

    const productId = planId === 'monthly' 
      ? SUBSCRIPTION_PRODUCTS.MONTHLY 
      : SUBSCRIPTION_PRODUCTS.YEARLY;

    const product = paymentService.getProduct(productId);
    if (!product) {
      toast.error('Subscription plan not found.');
      return false;
    }

    setState(prev => ({ ...prev, purchasing: true }));

    try {
      // Show purchase starting
      toast.loading(`Starting purchase of ${product.title}...`, { id: 'purchase' });

      // Attempt purchase
      const result: PurchaseResult = await paymentService.purchaseSubscription(productId);

      if (result.success) {
        // Update user to premium in Firebase
        const upgradeSuccess = await upgradeToPremium(user.uid);
        
        if (upgradeSuccess) {
          // Refresh user profile to show premium status
          await refreshProfile();
          
          toast.success(`Welcome to Premium! ${product.title} activated.`, { id: 'purchase' });
          return true;
        } else {
          toast.error('Purchase successful but failed to activate premium. Contact support.', { id: 'purchase' });
          return false;
        }
      } else {
        toast.error(result.error || 'Purchase failed. Please try again.', { id: 'purchase' });
        return false;
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('Purchase failed. Please check your payment method and try again.', { id: 'purchase' });
      return false;
    } finally {
      setState(prev => ({ ...prev, purchasing: false }));
    }
  }, [user, state.initialized, refreshProfile]);

  // Restore purchases
  const restorePurchases = useCallback(async (): Promise<boolean> => {
    if (!user || !state.initialized) {
      toast.error('Cannot restore purchases at this time.');
      return false;
    }

    setState(prev => ({ ...prev, purchasing: true }));

    try {
      toast.loading('Restoring purchases...', { id: 'restore' });

      const purchases = await paymentService.restorePurchases();
      
      if (purchases.length > 0) {
        // Check if any purchase is still active
        const activePurchase = purchases.find(p => p.success);
        
        if (activePurchase) {
          const upgradeSuccess = await upgradeToPremium(user.uid);
          
          if (upgradeSuccess) {
            await refreshProfile();
            toast.success('Premium subscription restored!', { id: 'restore' });
            return true;
          }
        }
      }

      toast.info('No active premium subscriptions found.', { id: 'restore' });
      return false;
    } catch (error) {
      console.error('Restore error:', error);
      toast.error('Failed to restore purchases.', { id: 'restore' });
      return false;
    } finally {
      setState(prev => ({ ...prev, purchasing: false }));
    }
  }, [user, state.initialized, refreshProfile]);

  // Get product by plan type
  const getProduct = useCallback((planId: 'monthly' | 'yearly'): SubscriptionProduct | undefined => {
    const productId = planId === 'monthly' 
      ? SUBSCRIPTION_PRODUCTS.MONTHLY 
      : SUBSCRIPTION_PRODUCTS.YEARLY;
    return paymentService.getProduct(productId);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      paymentService.dispose();
    };
  }, []);

  return {
    ...state,
    purchaseSubscription,
    restorePurchases,
    getProduct,
    canPurchase: state.initialized && !state.purchasing && !userProfile?.isPremium
  };
}
