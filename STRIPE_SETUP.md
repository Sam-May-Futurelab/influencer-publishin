# Stripe Payment Integration Setup

This guide will help you set up Stripe payments for Inkfluence AI.

## 1. Create Stripe Account

1. Go to [https://stripe.com](https://stripe.com) and create an account
2. Complete your business information
3. Get your API keys from Dashboard → Developers → API keys

## 2. Create Products and Prices in Stripe

### Monthly Subscription
1. Go to Products in Stripe Dashboard
2. Click "Add Product"
3. Set:
   - Name: `Inkfluence AI Premium Monthly`
   - Description: `Full access to all premium features`
   - Pricing: Recurring, Monthly, $9.99 USD
4. Copy the **Price ID** (starts with `price_...`)

### Yearly Subscription
1. Create another product
2. Set:
   - Name: `Inkfluence AI Premium Yearly`
   - Description: `Best value - Save 17%!`
   - Pricing: Recurring, Yearly, $99.99 USD
3. Copy the **Price ID** (starts with `price_...`)

## 3. Set Up Vercel Environment Variables

Add these to your Vercel project (Settings → Environment Variables):

```bash
# Stripe Keys
STRIPE_SECRET_KEY=sk_live_... # or sk_test_... for testing
STRIPE_PUBLISHABLE_KEY=pk_live_... # or pk_test_... for testing
VITE_STRIPE_MONTHLY_PRICE_ID=price_...  # From step 2
VITE_STRIPE_YEARLY_PRICE_ID=price_...   # From step 2

# Frontend URL
FRONTEND_URL=https://your-app.vercel.app

# Firebase Admin (for webhook)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### Getting Firebase Admin Credentials

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Open the JSON file and extract:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (keep the `\n` characters)

## 4. Set Up Stripe Webhook

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Set endpoint URL: `https://your-app.vercel.app/api/stripe-webhook`
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the **Signing Secret** (starts with `whsec_...`)
6. Add to Vercel environment variables:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

## 5. Configure Stripe Customer Portal

1. Go to Stripe Dashboard → Settings → Billing
2. Enable Customer Portal
3. Configure:
   - Allow customers to update payment methods: ✅
   - Allow customers to update billing information: ✅
   - Allow customers to cancel subscriptions: ✅
   - Show proration preview: ✅

## 6. Test the Integration

### Test Mode
1. Use Stripe test keys (starts with `sk_test_` and `pk_test_`)
2. Use test card: `4242 4242 4242 4242`
3. Any future expiry date and CVC

### Test Flow
1. Click "Upgrade to Premium" in the app
2. Complete Stripe Checkout with test card
3. Verify webhook receives `checkout.session.completed`
4. Check Firebase - user should have `isPremium: true`
5. Verify you now have 50 AI generations/day

## 7. Go Live

1. Complete Stripe account activation
2. Replace test keys with live keys in Vercel
3. Update webhook endpoint to use live mode
4. Test with real card (you can refund immediately)

## Pricing Structure

- **Free**: 3 AI generations/day, 4 pages max
- **Monthly Premium** ($9.99/mo): 50 AI generations/day, unlimited pages
- **Yearly Premium** ($99.99/year): Same as monthly, save 17%

## Webhook Events Handled

- `checkout.session.completed` - User completes payment → Upgrade to premium
- `customer.subscription.updated` - Subscription changed → Update status
- `customer.subscription.deleted` - User cancels → Downgrade to free
- `invoice.payment_succeeded` - Renewal successful → Log event
- `invoice.payment_failed` - Payment failed → Could send email notification

## Security Notes

- ✅ Webhook signature verification prevents fake events
- ✅ Firebase Admin SDK securely updates user data
- ✅ Stripe handles all payment data (PCI compliant)
- ✅ API keys stored as Vercel environment variables (never in code)

## Support

- Stripe Documentation: https://stripe.com/docs
- Vercel Environment Variables: https://vercel.com/docs/concepts/projects/environment-variables
- Firebase Admin SDK: https://firebase.google.com/docs/admin/setup

## Troubleshooting

### Webhook not receiving events
- Check webhook URL is correct
- Verify signing secret is correct
- Check Vercel function logs for errors
- Test webhook in Stripe Dashboard → Send test event

### Payment succeeds but user not upgraded
- Check webhook logs in Stripe Dashboard
- Verify Firebase credentials are correct
- Check Vercel function logs for errors
- Ensure `firebaseUserId` is in checkout session metadata

### Can't access customer portal
- Verify Customer Portal is enabled in Stripe settings
- Check user has `stripeCustomerId` in Firebase
- Ensure portal session API is working
