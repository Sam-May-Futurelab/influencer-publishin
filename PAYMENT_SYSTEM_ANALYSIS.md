# 💳 Payment System Investigation Report
**Date**: October 20, 2025  
**Status**: ⚠️ **CRITICAL ISSUES FOUND**

---

## 🔍 Summary

I've analyzed your entire payment system. **Good news**: The Stripe web payment infrastructure is mostly in place. **Bad news**: There's a critical confusion between iOS/native payments and web Stripe payments that needs to be resolved.

---

## 🏗️ Current Architecture

### **Two Payment Systems (Conflicting)**

1. **Stripe (Web)** ✅ Mostly Implemented
   - Files: `api/create-checkout-session.js`, `api/stripe-webhook.js`, `api/create-portal-session.js`
   - Frontend: `src/lib/stripe-payments.ts`, `src/components/UpgradeModal.tsx`
   - Status: **90% Complete**

2. **iOS In-App Purchase** ❌ Mock/Placeholder
   - Files: `src/lib/payments.ts`, `src/hooks/use-payments.ts`
   - Status: **Not Implemented** (intentionally disabled)

---

## 🚨 CRITICAL ISSUES FOUND

### **Issue #1: Dual Payment Flow Confusion** 🔴

**Problem**: The app has TWO different upgrade flows that conflict:

1. **UpgradeModal** → Uses **Stripe** (correct for web)
2. **ProfilePage** → Uses **iOS Payment Service** (wrong for web)

**Code Evidence**:
```typescript
// ProfilePage.tsx line 42-43
const { purchaseSubscription, purchasing, canPurchase, loading: paymentsLoading } = usePayments();
// ↑ This uses lib/payments.ts (iOS mock)

// UpgradeModal.tsx line 32
const result = await stripeService.createCheckoutSession(...)
// ↑ This uses lib/stripe-payments.ts (Stripe web)
```

**Impact**: 
- Users trying to upgrade from ProfilePage get an error: "In-App Purchase not available"
- Only UpgradeModal actually works for web payments
- Confusing user experience

---

### **Issue #2: Missing Stripe Price IDs** 🔴

**Problem**: Stripe Price IDs are using placeholder values

**Code Evidence**:
```typescript
// stripe-payments.ts line 51-52
priceId: import.meta.env.VITE_STRIPE_MONTHLY_PRICE_ID || 'price_monthly_placeholder',
priceId: import.meta.env.VITE_STRIPE_YEARLY_PRICE_ID || 'price_yearly_placeholder',
```

**Required Environment Variables**:
```bash
VITE_STRIPE_MONTHLY_PRICE_ID=price_xxxxxxxxxxxxx  # From Stripe Dashboard
VITE_STRIPE_YEARLY_PRICE_ID=price_xxxxxxxxxxxxx   # From Stripe Dashboard
```

**Where to Get These**:
1. Go to Stripe Dashboard → Products
2. Create products for "Premium Monthly" and "Premium Yearly"
3. Copy the Price ID (starts with `price_`)
4. Add to Vercel environment variables

---

### **Issue #3: Missing Server Environment Variables** 🔴

**Required for API Functions** (Not set in Vercel):
```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxx or sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Firebase Admin (for webhook)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Frontend URL
FRONTEND_URL=https://inkfluence-ai-one.vercel.app
```

**How to Get Firebase Admin Keys**:
1. Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Download JSON file
4. Extract `project_id`, `client_email`, `private_key`

---

### **Issue #4: Webhook Not Configured** 🟡

**Problem**: Stripe webhook endpoint needs to be added to Stripe Dashboard

**Current Webhook Endpoint**:
```
https://inkfluence-ai-one.vercel.app/api/stripe-webhook
```

**Steps to Configure**:
1. Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. URL: `https://inkfluence-ai-one.vercel.app/api/stripe-webhook`
4. Events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the webhook signing secret → Add as `STRIPE_WEBHOOK_SECRET` in Vercel

---

### **Issue #5: No Customer Portal Link** 🟡

**Problem**: Users can't manage/cancel their subscriptions

**Solution Already Coded** (just needs to be wired up):
- File exists: `api/create-portal-session.js` ✅
- Function exists: `stripeService.createPortalSession()` ✅
- **Missing**: Button in ProfilePage to open portal

---

### **Issue #6: Subscription Status Not Displayed** 🟡

**Problem**: User profile shows "Premium" badge but not subscription details

**Missing Information**:
- Subscription plan (Monthly vs Yearly)
- Next billing date
- Payment method
- Cancel/Manage subscription button

---

## ✅ What's Working

### **Stripe Checkout** (in UpgradeModal)
```typescript
// UpgradeModal.tsx - This WORKS!
const handleUpgrade = async (priceId: string, planId: string) => {
  const result = await stripeService.createCheckoutSession(
    priceId,
    user.uid,
    user.email || ''
  );
  
  if ('error' in result) {
    toast.error(result.error);
    return;
  }
  
  window.location.href = result.url; // Redirects to Stripe
}
```

### **Webhook Handler** (Backend)
```javascript
// stripe-webhook.js - Properly updates Firebase
case 'checkout.session.completed': {
  await db.collection('users').doc(userId).set({
    isPremium: true,
    subscriptionStatus: 'premium',
    stripeCustomerId: session.customer,
    stripeSubscriptionId: session.subscription,
  }, { merge: true });
}
```

### **Success Redirect** (in App.tsx)
```typescript
// App.tsx line 175-195 - Handles success callback
if (success === 'true' && sessionId) {
  toast.success('Payment successful!');
  refreshProfile(); // Updates premium status
}
```

---

## 🔧 FIXES REQUIRED

### **Priority 1: Critical Fixes** (Required for payments to work)

#### **1.1 Set Stripe Environment Variables in Vercel**

Go to Vercel → Your Project → Settings → Environment Variables:

```bash
# Production Variables
STRIPE_SECRET_KEY=sk_live_YOUR_KEY
VITE_STRIPE_MONTHLY_PRICE_ID=price_YOUR_MONTHLY_PRICE_ID
VITE_STRIPE_YEARLY_PRICE_ID=price_YOUR_YEARLY_PRICE_ID
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
FRONTEND_URL=https://inkfluence-ai-one.vercel.app

# Firebase Admin (for webhook)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**For Testing**: Use `sk_test_` and `price_test_` values first!

---

#### **1.2 Fix ProfilePage to Use Stripe (Not iOS Payments)**

**Current Code** (ProfilePage.tsx lines 42, 104-120):
```typescript
// WRONG: Using iOS payment service
const { purchaseSubscription } = usePayments();

const handleUpgrade = async (planId: 'monthly' | 'yearly') => {
  const success = await purchaseSubscription(planId); // ← iOS mock
}
```

**Fixed Code**:
```typescript
// RIGHT: Use Stripe service like UpgradeModal does
import { stripeService, SUBSCRIPTION_PLANS } from '@/lib/stripe-payments';

const [upgrading, setUpgrading] = useState(false);

const handleUpgrade = async (planId: 'monthly' | 'yearly') => {
  if (!user?.email) {
    toast.error('Please sign in to upgrade');
    return;
  }

  if (userProfile?.isPremium) {
    toast.info('You already have Premium!');
    return;
  }

  setUpgrading(true);

  try {
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
    if (!plan) {
      toast.error('Plan not found');
      return;
    }

    const result = await stripeService.createCheckoutSession(
      plan.priceId,
      user.uid,
      user.email
    );

    if ('error' in result) {
      toast.error(result.error);
      return;
    }

    // Redirect to Stripe Checkout
    window.location.href = result.url;
  } catch (error) {
    console.error('Upgrade error:', error);
    toast.error('Failed to start upgrade process');
  } finally {
    setUpgrading(false);
  }
};
```

---

#### **1.3 Configure Stripe Webhook**

1. **Create Products in Stripe Dashboard**:
   - Product 1: "Inkfluence AI Premium Monthly" → £9.99/month
   - Product 2: "Inkfluence AI Premium Yearly" → £99.99/year

2. **Copy Price IDs** (they look like `price_1AB2CD3EF4GH5IJ6`)

3. **Create Webhook**:
   - URL: `https://inkfluence-ai-one.vercel.app/api/stripe-webhook`
   - Events: `checkout.session.completed`, `customer.subscription.*`, `invoice.payment_*`

4. **Copy Webhook Secret** (looks like `whsec_ABC123...`)

5. **Add to Vercel Env Vars**

---

### **Priority 2: High Priority Fixes**

#### **2.1 Add Subscription Management**

Add "Manage Subscription" button to ProfilePage:

```typescript
// Add this function in ProfilePage.tsx
const handleManageSubscription = async () => {
  if (!user || !userProfile?.isPremium) {
    toast.error('No active subscription found');
    return;
  }

  try {
    const result = await stripeService.createPortalSession(user.uid);
    
    if ('error' in result) {
      toast.error(result.error);
      return;
    }

    // Redirect to Stripe Customer Portal
    window.location.href = result.url;
  } catch (error) {
    console.error('Portal error:', error);
    toast.error('Failed to open subscription management');
  }
};
```

Add button in the subscription section:
```tsx
{userProfile?.isPremium && (
  <Button 
    onClick={handleManageSubscription}
    variant="outline"
    className="gap-2"
  >
    <CreditCard size={16} />
    Manage Subscription
  </Button>
)}
```

---

#### **2.2 Display Subscription Details**

Update ProfilePage to show:
```tsx
{userProfile?.isPremium && (
  <div className="space-y-2 text-sm">
    <div className="flex justify-between">
      <span className="text-muted-foreground">Plan:</span>
      <span className="font-medium">
        {userProfile.subscriptionType === 'yearly' ? 'Premium Yearly' : 'Premium Monthly'}
      </span>
    </div>
    <div className="flex justify-between">
      <span className="text-muted-foreground">Status:</span>
      <Badge variant="default">Active</Badge>
    </div>
    {userProfile.subscriptionStartedAt && (
      <div className="flex justify-between">
        <span className="text-muted-foreground">Member since:</span>
        <span>{new Date(userProfile.subscriptionStartedAt.toDate()).toLocaleDateString()}</span>
      </div>
    )}
  </div>
)}
```

---

#### **2.3 Add Proper Loading States**

UpgradeModal already has good loading states, but ProfilePage needs:
```tsx
<Button
  onClick={() => handleUpgrade('monthly')}
  disabled={upgrading}
  className="gap-2"
>
  {upgrading ? (
    <>
      <Loader className="animate-spin" size={16} />
      Processing...
    </>
  ) : (
    <>
      <Crown size={16} />
      Upgrade Now
    </>
  )}
</Button>
```

---

### **Priority 3: Nice to Have**

#### **3.1 Test Mode Indicator**

Add visual indicator when using Stripe test mode:
```tsx
{import.meta.env.VITE_STRIPE_MONTHLY_PRICE_ID?.includes('test') && (
  <Badge variant="outline" className="border-yellow-500 text-yellow-600">
    ⚠️ Test Mode
  </Badge>
)}
```

---

#### **3.2 Promo Codes**

Already supported in checkout session! Just enable in Stripe Dashboard:
```javascript
// create-checkout-session.js line 87
allow_promotion_codes: true, // ✅ Already enabled!
```

---

#### **3.3 Free Trial**

Add to checkout session:
```javascript
subscription_data: {
  trial_period_days: 7, // 7-day free trial
  metadata: {
    firebaseUserId: userId,
  },
},
```

---

## 📋 Implementation Checklist

### **Phase 1: Get Payments Working** (Do This First!)

- [ ] **1.1** Create Stripe products (Monthly & Yearly)
- [ ] **1.2** Get Stripe API keys (test mode first)
- [ ] **1.3** Get Firebase Admin credentials
- [ ] **1.4** Set all environment variables in Vercel
- [ ] **1.5** Configure Stripe webhook endpoint
- [ ] **1.6** Fix ProfilePage to use Stripe (not iOS payments)
- [ ] **1.7** Test checkout flow end-to-end
- [ ] **1.8** Verify webhook updates Firebase correctly
- [ ] **1.9** Test success redirect updates UI

### **Phase 2: Polish** (After payments work)

- [ ] **2.1** Add "Manage Subscription" button
- [ ] **2.2** Display subscription details in profile
- [ ] **2.3** Add loading states everywhere
- [ ] **2.4** Test subscription cancellation
- [ ] **2.5** Test subscription updates (monthly ↔ yearly)
- [ ] **2.6** Add error handling for failed payments

### **Phase 3: Production** (Before going live)

- [ ] **3.1** Switch from test to live Stripe keys
- [ ] **3.2** Update webhook to use live endpoint
- [ ] **3.3** Test with real card (small amount)
- [ ] **3.4** Set up email notifications for failed payments
- [ ] **3.5** Add usage limits enforcement for free tier
- [ ] **3.6** Document refund policy
- [ ] **3.7** Add terms of service acceptance to checkout

---

## 🧪 Testing Guide

### **Test Checkout Flow**

1. **Start with Test Mode**:
   ```bash
   STRIPE_SECRET_KEY=sk_test_YOUR_TEST_KEY
   VITE_STRIPE_MONTHLY_PRICE_ID=price_test_YOUR_TEST_PRICE
   ```

2. **Test Card Numbers** (provided by Stripe):
   ```
   Success: 4242 4242 4242 4242
   Decline: 4000 0000 0000 0002
   3D Secure: 4000 0027 6000 3184
   
   Expiry: Any future date (e.g., 12/34)
   CVC: Any 3 digits (e.g., 123)
   ZIP: Any 5 digits (e.g., 12345)
   ```

3. **Test Flow**:
   - Click "Upgrade to Premium" in UpgradeModal
   - Redirected to Stripe Checkout
   - Enter test card `4242 4242 4242 4242`
   - Complete payment
   - Redirected back with `?success=true`
   - Check Firebase: `isPremium` should be `true`
   - Check UI: Premium badge should appear

### **Test Webhook**

1. **Use Stripe CLI** (recommended):
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe-webhook
   stripe trigger checkout.session.completed
   ```

2. **Or Use Stripe Dashboard**:
   - Create a test payment
   - Go to Webhooks → Your endpoint
   - View delivery attempts
   - Check logs in Vercel Functions

### **Test Subscription Management**

1. Create subscription in test mode
2. Click "Manage Subscription" (after implementing)
3. Should redirect to Stripe Customer Portal
4. Try canceling subscription
5. Verify webhook fires `customer.subscription.deleted`
6. Check `isPremium` changes to `false`

---

## 🐛 Common Issues & Solutions

### **Issue**: "Failed to create checkout session"
**Solution**: Check that `STRIPE_SECRET_KEY` and `VITE_STRIPE_MONTHLY_PRICE_ID` are set in Vercel

### **Issue**: Webhook not firing
**Solution**: 
1. Check webhook URL is correct in Stripe Dashboard
2. Verify `STRIPE_WEBHOOK_SECRET` matches
3. Check Vercel function logs for errors

### **Issue**: Premium status not updating after payment
**Solution**:
1. Check webhook received the event (Stripe Dashboard)
2. Check Vercel function logs for webhook handler
3. Verify Firebase Admin credentials are correct
4. Check Firestore to see if `isPremium` was updated

### **Issue**: Redirected to Stripe but checkout page shows error
**Solution**:
1. Price ID might be wrong or from different Stripe account
2. Check price exists in your Stripe Dashboard
3. Verify using same mode (test/live) for keys and prices

---

## 💰 Pricing Recommendations

### **Current Pricing**: £9.99/month or £99.99/year

**Observations**:
- Good price point for solo authors
- Yearly saves 17% (good incentive)
- Free tier is maybe too generous (4 pages)

**Suggestions**:

**Option A: Adjust Free Tier**
```
Free: 2 pages (enough to try, not enough to publish)
Monthly: £9.99 (unlimited pages)
Yearly: £99.99 (save 17%)
```

**Option B: Add Middle Tier**
```
Free: 2 pages
Starter: £4.99/month (10 pages)
Pro: £9.99/month (unlimited)
Team: £29.99/month (5 users, collaboration)
```

**Option C: Usage-Based**
```
Free: 5 AI generations/month
Pay-As-You-Go: £0.10 per AI generation
Unlimited: £9.99/month
```

---

## 📊 Metrics to Track

Once payments are working, track:

- **Conversion Rate**: Free signups → Paid
- **Churn Rate**: Monthly cancellations
- **MRR**: Monthly Recurring Revenue
- **LTV**: Customer Lifetime Value
- **Time to First Payment**: How long after signup
- **Payment Failures**: Track failed payments

Add to Firebase Analytics:
```typescript
// When user upgrades
analytics.logEvent('purchase', {
  transaction_id: session.id,
  value: 9.99,
  currency: 'GBP',
  items: [{
    item_id: 'premium_monthly',
    item_name: 'Premium Monthly'
  }]
});
```

---

## 🎯 Next Steps

### **Immediate (Today)**:
1. Get Stripe account set up (test mode)
2. Create two products in Stripe
3. Copy Price IDs
4. Set environment variables in Vercel
5. Deploy and test

### **This Week**:
6. Fix ProfilePage payment flow
7. Add "Manage Subscription" button
8. Test full payment cycle
9. Document payment process for team

### **Next Week**:
10. Switch to live mode
11. Test with real payment
12. Monitor for errors
13. Set up alerts for failed payments

---

## 📝 Notes

- **Never commit** Stripe keys to git
- **Use test mode** until you're 100% confident
- **Monitor Stripe Dashboard** for unusual activity
- **Set up webhooks** before going live
- **Have a refund policy** ready
- **Consider adding** cancellation surveys
- **Track** why users cancel

---

**Status**: Ready to implement fixes! Start with Phase 1 checklist above.

**Estimated Time**: 2-4 hours to get basic payments working, 1-2 days to polish.

**Risk Level**: Medium (Stripe is well-documented, but env var issues can be tricky)

**Support**: Stripe has excellent docs and chat support if you get stuck!
