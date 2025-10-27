// ============================================
// iOS In-App Purchase Integration (FUTURE USE)
// ============================================
// This file is for future iOS native app support.
// Currently NOT USED - web app uses Stripe integration.
// See src/hooks/use-payments.ts for active Stripe implementation.
// ============================================

export interface SubscriptionProduct {
  id: string;
  title: string;
  description: string;
  price: string;
  priceAmountMicros: number;
  priceCurrencyCode: string;
  subscriptionPeriod: 'MONTH' | 'YEAR';
}

export interface PurchaseResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

// Mock implementation - replace with actual StoreKit integration
export class PaymentService {
  private static instance: PaymentService;
  private products: SubscriptionProduct[] = [
    {
      id: 'inkfluence_premium_monthly',
      title: 'Inkfluence AI Premium Monthly',
      description: 'Unlimited pages and premium features',
      price: '£9.99',
      priceAmountMicros: 9990000,
      priceCurrencyCode: 'GBP',
      subscriptionPeriod: 'MONTH'
    },
    {
      id: 'inkfluence_premium_yearly',
      title: 'Inkfluence AI Premium Yearly',
      description: 'Unlimited pages and premium features - Best Value!',
      price: '£99.99',
      priceAmountMicros: 99990000,
      priceCurrencyCode: 'GBP',
      subscriptionPeriod: 'YEAR'
    }
  ];

  public static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  // Initialize StoreKit connection
  // NOTE: Not implemented - requires React Native StoreKit integration
  async initialize(): Promise<boolean> {
    try {
      // For future iOS app: await RNIap.initConnection();
      console.warn('iOS StoreKit not available - web app uses Stripe');
      return true;
    } catch (error) {
      console.error('Failed to initialize payment service:', error);
      return false;
    }
  }

  // Get available subscription products
  // NOTE: Returns mock data - requires App Store Connect integration
  async getProducts(): Promise<SubscriptionProduct[]> {
    try {
      // For future iOS app: const products = await RNIap.getSubscriptions(productIds);
      console.warn('Using mock products - iOS StoreKit not implemented');
      return this.products;
    } catch (error) {
      console.error('Failed to get products:', error);
      return [];
    }
  }

  // Purchase a subscription
  // NOTE: INTENTIONALLY DISABLED - web app uses Stripe, not StoreKit
  async purchaseSubscription(productId: string): Promise<PurchaseResult> {
    try {
      // For future iOS app: const purchase = await RNIap.requestSubscription(productId);
      
      // Web users must use Stripe integration (see src/hooks/use-payments.ts)
      console.warn('iOS In-App Purchase not implemented. Use Stripe for web payments.');
      return {
        success: false,
        error: 'In-App Purchase not available. Please upgrade via web.'
      };
      
      /* 
      // Old mock code - DO NOT RE-ENABLE without real StoreKit
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            transactionId: `txn_${Date.now()}_${productId}`
          });
        }, 2000);
      });
      */
    } catch (error) {
      console.error('Purchase failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Purchase failed'
      };
    }
  }

  // Restore purchases
  // NOTE: Not implemented - requires App Store integration
  async restorePurchases(): Promise<PurchaseResult[]> {
    try {
      // For future iOS app: const purchases = await RNIap.getAvailablePurchases();
      console.warn('iOS restore not available - web app syncs with Stripe/Firebase');
      return [];
    } catch (error) {
      console.error('Failed to restore purchases:', error);
      return [];
    }
  }

  // Get product by ID
  getProduct(productId: string): SubscriptionProduct | undefined {
    return this.products.find(product => product.id === productId);
  }

  // Clean up
  // NOTE: Not implemented - no StoreKit connection to close
  async dispose(): Promise<void> {
    try {
      // For future iOS app: await RNIap.endConnection();
      console.warn('No StoreKit connection to dispose - web app only');
    } catch (error) {
      console.error('Failed to dispose payment service:', error);
    }
  }
}

// Product IDs for App Store Connect
export const SUBSCRIPTION_PRODUCTS = {
  MONTHLY: 'inkfluence_premium_monthly',
  YEARLY: 'inkfluence_premium_yearly'
} as const;

export type SubscriptionType = typeof SUBSCRIPTION_PRODUCTS[keyof typeof SUBSCRIPTION_PRODUCTS];
