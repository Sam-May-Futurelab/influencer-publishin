# ✅ Stripe Payment Setup Checklist

## Current Status
- ✅ Stripe account created
- ✅ Monthly product created
- ✅ Yearly product created
- 🔄 Redirect after payment (fixing now)

---

## 🔧 Step 1: Verify Environment Variables in Vercel

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

### Required Variables:

```bash
# Stripe Keys (Get from Stripe Dashboard → Developers → API Keys)
STRIPE_SECRET_KEY=sk_test_xxxxx  # or sk_live_xxxxx for production
VITE_STRIPE_MONTHLY_PRICE_ID=price_xxxxx  # From your monthly product
VITE_STRIPE_YEARLY_PRICE_ID=price_xxxxx   # From your yearly product
STRIPE_WEBHOOK_SECRET=whsec_xxxxx  # From webhook setup (Step 3)

# Firebase Admin (For webhook to update user status)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Frontend URL (Your actual deployed URL)
FRONTEND_URL=https://inkfluence-ai-one.vercel.app
```

### How to Get Each Variable:

#### **Stripe Keys**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Click **Developers** → **API Keys**
3. Copy **Secret Key** (starts with `sk_test_` or `sk_live_`)
4. ⚠️ Use **TEST** keys until everything works!

#### **Price IDs**
1. Stripe Dashboard → **Products**
2. Click on your "Premium Monthly" product
3. Under **Pricing**, click on the price
4. Copy the **API ID** (starts with `price_`)
5. Repeat for "Premium Yearly"

#### **Firebase Admin Credentials**
1. [Firebase Console](https://console.firebase.google.com)
2. Click your project
3. Click ⚙️ (gear icon) → **Project Settings**
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Download the JSON file
7. Extract these fields:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (keep the `\n` characters!)

#### **Frontend URL**
- Your actual Vercel URL: `https://inkfluence-ai-one.vercel.app`
- Or your custom domain if you set one up

---

## 🪝 Step 2: Set Up Stripe Webhook

### What is a Webhook?
When a user completes payment, Stripe needs to tell YOUR server to upgrade them to premium. The webhook is how Stripe communicates with your app.

### Setup Instructions:

1. **Go to Stripe Dashboard** → **Developers** → **Webhooks**

2. **Click "Add endpoint"**

3. **Enter Endpoint URL**:
   ```
   https://inkfluence-ai-one.vercel.app/api/stripe-webhook
   ```

4. **Select Events to Listen To**:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`

5. **Click "Add endpoint"**

6. **Copy the Signing Secret**:
   - Click on your newly created webhook
   - Click **Reveal** under "Signing secret"
   - Copy the value (starts with `whsec_`)
   - Add to Vercel as `STRIPE_WEBHOOK_SECRET`

---

## 🧪 Step 3: Test the Payment Flow

### Test with Stripe Test Mode

1. **Ensure you're using TEST keys**:
   - `STRIPE_SECRET_KEY=sk_test_...`
   - Price IDs should be from test mode products

2. **Test Card Numbers** (provided by Stripe):
   ```
   ✅ Success: 4242 4242 4242 4242
   ❌ Decline: 4000 0000 0000 0002
   🔐 3D Secure: 4000 0027 6000 3184
   
   Expiry: Any future date (12/34)
   CVC: Any 3 digits (123)
   ZIP: Any 5 digits (12345)
   ```

3. **Test Flow**:
   - Sign in to your app
   - Click "Upgrade to Premium"
   - Click "Upgrade Now" on Monthly or Yearly plan
   - Enter test card: `4242 4242 4242 4242`
   - Click "Pay"
   - **You should be redirected back to your app**
   - Toast should show: "Payment successful!"
   - Profile should show "Premium" badge

4. **Verify in Stripe Dashboard**:
   - Go to **Payments** → should see your test payment
   - Go to **Customers** → should see customer created
   - Go to **Webhooks** → Your endpoint → check for successful delivery

5. **Verify in Firebase**:
   - Go to Firestore
   - Find your user document
   - Check `isPremium: true`
   - Check `subscriptionStatus: 'premium'`
   - Check `stripeCustomerId` and `stripeSubscriptionId` exist

---

## 🐛 Troubleshooting

### Issue: "Failed to create checkout session"
**Possible Causes**:
- Missing or incorrect `STRIPE_SECRET_KEY`
- Missing or incorrect Price IDs
- API endpoint not deployed

**Fix**:
1. Check Vercel environment variables are set
2. Redeploy your app after setting env vars
3. Check Vercel function logs for errors

---

### Issue: Stuck on loading after clicking "Upgrade Now"
**Possible Causes**:
- API endpoint returning error
- Network issue
- CORS issue

**Fix**:
1. Open browser console (F12)
2. Look for error messages
3. Check Network tab for failed requests
4. Check Vercel function logs

---

### Issue: Redirected to blank page or 404 after payment
**Possible Causes**:
- Wrong `FRONTEND_URL` in Vercel
- Redirect URL has typo
- App not handling success query params

**Fix** (already applied in latest commit):
- ✅ Updated redirect URLs to not have `//`
- ✅ Added auth loading check before showing success
- ✅ Auto-navigate to dashboard after success

**Additional Check**:
1. Verify `FRONTEND_URL` in Vercel matches your actual URL
2. Should NOT have trailing slash: ✅ `https://inkfluence-ai-one.vercel.app`
3. NOT like this: ❌ `https://inkfluence-ai-one.vercel.app/`

---

### Issue: Payment succeeds but user not upgraded to premium
**Possible Causes**:
- Webhook not configured
- Webhook secret incorrect
- Firebase Admin credentials wrong
- Webhook failing silently

**Fix**:
1. Check Stripe Dashboard → Webhooks → Your endpoint
2. Look for failed delivery attempts (red X)
3. Click on a failed event to see error message
4. Common errors:
   - `401 Unauthorized` → Wrong webhook secret
   - `500 Internal Error` → Firebase credentials wrong
   - `404 Not Found` → Webhook URL wrong

**Verify Firebase Credentials**:
```bash
# Test your Firebase Admin credentials
# In Vercel function logs, you should see:
✅ User {userId} upgraded to premium
# If you see error, check credentials
```

---

### Issue: Webhook not receiving events
**Possible Causes**:
- Webhook not added in Stripe Dashboard
- Wrong endpoint URL
- Vercel function not deployed

**Fix**:
1. Stripe Dashboard → Webhooks → Should see your endpoint
2. URL should be: `https://inkfluence-ai-one.vercel.app/api/stripe-webhook`
3. Status should be "Enabled" (not "Disabled")
4. Test webhook: Click "Send test webhook" in Stripe

---

## ✅ Verification Checklist

Before considering payments "done", verify:

- [ ] Can open upgrade modal
- [ ] Can see monthly and yearly plans
- [ ] Click "Upgrade Now" redirects to Stripe
- [ ] Can enter card details
- [ ] Payment processes successfully
- [ ] Redirected back to app (not 404/blank)
- [ ] See "Payment successful" toast
- [ ] Premium badge appears in profile
- [ ] Can access unlimited pages
- [ ] Can see "Manage Subscription" button
- [ ] Webhook shows successful delivery in Stripe
- [ ] User document updated in Firestore

---

## 🚀 Going Live (Production)

Once everything works in TEST mode:

### 1. Switch to Live Mode
- Get LIVE Stripe keys (start with `sk_live_`)
- Create LIVE products (or move test products to live)
- Get LIVE price IDs
- Update Vercel environment variables

### 2. Update Webhook for Live Mode
- Stripe Dashboard → Switch to "Live mode" (toggle top right)
- Add webhook endpoint again (same URL)
- Get NEW signing secret for live mode
- Update `STRIPE_WEBHOOK_SECRET` in Vercel

### 3. Test with Real Card
- Use small amount to test (£0.50 or minimum)
- Use your own card
- Complete full flow
- Verify webhook fires
- IMMEDIATELY REFUND the test payment

### 4. Monitor
- Watch Stripe Dashboard for first real payments
- Check webhook deliveries
- Monitor Vercel function logs
- Set up alerts for failed payments

---

## 💡 Pro Tips

### Test in Incognito/Private Window
- Avoids cached data issues
- Fresh authentication state
- See the flow as new users would

### Use Stripe CLI for Local Testing
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to http://localhost:5173/api/stripe-webhook

# Trigger test events
stripe trigger checkout.session.completed
```

### Check Logs
- **Vercel Function Logs**: Vercel Dashboard → Your Project → Functions → Select function
- **Stripe Webhook Logs**: Stripe Dashboard → Webhooks → Your endpoint → Recent deliveries
- **Browser Console**: F12 → Console tab

### Common Success Flow Logs
```
1. Frontend: "Creating checkout session with: { priceId, userId, email }"
2. API: "Creating checkout with URLs: { baseUrl, successUrl, cancelUrl }"
3. [User completes payment in Stripe]
4. Webhook: "✅ User {userId} upgraded to premium"
5. Frontend: "Payment successful! Your premium features will be activated shortly."
6. Frontend: Profile refreshes, isPremium: true
```

---

## 📞 Need Help?

### Resources
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support Chat](https://support.stripe.com) - Very responsive!
- [Vercel Docs](https://vercel.com/docs)
- [Firebase Admin Setup](https://firebase.google.com/docs/admin/setup)

### Quick Debugging Commands
```bash
# Check if environment variables are set in Vercel
vercel env ls

# View recent Vercel function logs
vercel logs

# Test API endpoint directly
curl -X POST https://inkfluence-ai-one.vercel.app/api/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{"priceId":"price_test_xxx","userId":"test123","userEmail":"test@example.com"}'
```

---

## 🎯 Current Issues Fixed

✅ **Fixed in latest commit**:
- Redirect URLs cleaned up (removed potential `//` issue)
- Success handler waits for auth to load before processing
- Auto-navigation to dashboard after successful payment
- Better error handling for unauthenticated success returns

---

**Last Updated**: October 20, 2025  
**Status**: Ready for environment variable setup and testing!
