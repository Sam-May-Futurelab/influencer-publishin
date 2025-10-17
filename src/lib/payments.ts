// iOS In-App Purchase Integration
// This will need to be connected to React Native StoreKit

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
      price: '£4.99',
      priceAmountMicros: 4990000,
      priceCurrencyCode: 'GBP',
      subscriptionPeriod: 'MONTH'
    },
    {
      id: 'inkfluence_premium_yearly',
      title: 'Inkfluence AI Premium Yearly',
      description: 'Unlimited pages and premium features - Best Value!',
      price: '£39.99',
      priceAmountMicros: 39990000,
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
  async initialize(): Promise<boolean> {
    try {
      // TODO: Initialize React Native StoreKit
      // await RNIap.initConnection();
      console.log('Payment service initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize payment service:', error);
      return false;
    }
  }

  // Get available subscription products
  async getProducts(): Promise<SubscriptionProduct[]> {
    try {
      // TODO: Get products from App Store
      // const products = await RNIap.getSubscriptions(productIds);
      return this.products;
    } catch (error) {
      console.error('Failed to get products:', error);
      return [];
    }
  }

  // Purchase a subscription
  async purchaseSubscription(productId: string): Promise<PurchaseResult> {
    try {
      // TODO: Implement actual StoreKit purchase
      // const purchase = await RNIap.requestSubscription(productId);
      
      // DISABLED: Mock implementation that auto-succeeds
      // This was causing users to get premium without payment!
      // Web users should use Stripe integration instead
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
  async restorePurchases(): Promise<PurchaseResult[]> {
    try {
      // TODO: Restore from App Store
      // const purchases = await RNIap.getAvailablePurchases();
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
  async dispose(): Promise<void> {
    try {
      // TODO: End StoreKit connection
      // await RNIap.endConnection();
      console.log('Payment service disposed');
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
