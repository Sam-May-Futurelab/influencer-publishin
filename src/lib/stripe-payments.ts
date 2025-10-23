// Stripe Payment Integration for Web
// This handles Stripe Checkout for subscription payments

export interface StripePriceInfo {
  id: string;
  product: string;
  unit_amount: number;
  currency: string;
  recurring: {
    interval: 'month' | 'year';
    interval_count: number;
  };
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  priceId: string; // Stripe Price ID
  interval: 'month' | 'year';
  features: string[];
  popular?: boolean;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for trying out Inkfluence AI',
    price: 0,
    priceId: '',
    interval: 'month',
    features: [
      '4 pages maximum',
      '3 AI generations per day',
      'Basic templates',
      'PDF export',
      'Community support'
    ]
  },
  {
    id: 'monthly',
    name: 'Premium Monthly',
    description: 'Full access to all premium features',
    price: 9.99,
    priceId: import.meta.env.VITE_STRIPE_MONTHLY_PRICE_ID || 'price_monthly_placeholder',
    interval: 'month',
    features: [
      'Unlimited pages',
      '50 AI generations per day',
      'All premium templates',
      'Priority support',
      'Custom branding',
      'Advanced export options',
      'Remove watermarks',
      'Early access to new features'
    ],
    popular: true
  },
  {
    id: 'yearly',
    name: 'Premium Yearly',
    description: 'Best value - Save 17%!',
    price: 99.99,
    priceId: import.meta.env.VITE_STRIPE_YEARLY_PRICE_ID || 'price_yearly_placeholder',
    interval: 'year',
    features: [
      'Unlimited pages',
      '50 AI generations per day',
      'All premium templates',
      'Priority support',
      'Custom branding',
      'Advanced export options',
      'Remove watermarks',
      'Early access to new features'
    ]
  }
];

export class StripePaymentService {
  private static instance: StripePaymentService;

  public static getInstance(): StripePaymentService {
    if (!StripePaymentService.instance) {
      StripePaymentService.instance = new StripePaymentService();
    }
    return StripePaymentService.instance;
  }

  /**
   * Create a Stripe Checkout session for subscription
   * This will be called from the frontend and handled by your Vercel function
   */
  async createCheckoutSession(
    priceId: string,
    userId: string,
    userEmail: string
  ): Promise<{ url: string } | { error: string }> {
    try {
      
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userId,
          userEmail,
        }),
      });

      // Try to parse as JSON, but handle HTML error pages
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text.substring(0, 200));
        throw new Error('Server error - please check Vercel logs');
      }

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Checkout session error response:', data);
        throw new Error(data.details || data.error || 'Failed to create checkout session');
      }

      return { url: data.url };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to create checkout session'
      };
    }
  }

  /**
   * Create a customer portal session for managing subscription
   */
  async createPortalSession(userId: string): Promise<{ url: string } | { error: string }> {
    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create portal session');
      }

      const data = await response.json();
      return { url: data.url };
    } catch (error) {
      console.error('Error creating portal session:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to create portal session'
      };
    }
  }

  /**
   * Get plan by ID
   */
  getPlan(planId: string): SubscriptionPlan | undefined {
    return SUBSCRIPTION_PLANS.find(plan => plan.id === planId);
  }

  /**
   * Get all plans
   */
  getAllPlans(): SubscriptionPlan[] {
    return SUBSCRIPTION_PLANS;
  }

  /**
   * Calculate savings for yearly plan
   */
  calculateYearlySavings(): number {
    const monthly = SUBSCRIPTION_PLANS.find(p => p.id === 'monthly');
    const yearly = SUBSCRIPTION_PLANS.find(p => p.id === 'yearly');
    
    if (!monthly || !yearly) return 0;
    
    const monthlyCost = monthly.price * 12;
    const savings = monthlyCost - yearly.price;
    const percentage = Math.round((savings / monthlyCost) * 100);
    
    return percentage;
  }
}

export const stripeService = StripePaymentService.getInstance();
