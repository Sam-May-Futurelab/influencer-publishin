# Creator Tier Setup Guide (£4.99/month)

## ✅ Completed Code Changes

1. **PricingPage**: Added Creator tier with 20 pages, 15 AI gens/day, PDF+EPUB export
2. **Rate Limiting**: Updated API to support 3 tiers (3/15/50 daily AI generation limits)
3. **Page Limits**: System enforces Free (4), Creator (20), Premium (unlimited)
4. **ProfilePage**: Displays Creator subscription status correctly
5. **UpgradeModal**: Shows all 3 tiers in upgrade prompts
6. **Stripe Config**: Added creator-monthly and creator-yearly plan definitions
7. **Type System**: Updated `UserProfile` to include `'creator'` subscription status

---

## 🔧 Required Setup Steps

### 1. **Stripe Configuration** (REQUIRED)

#### A. Create Creator Products in Stripe Dashboard

1. Go to https://dashboard.stripe.com/products
2. Click **"Add product"**

**Creator Monthly Product:**
- Name: `Creator Monthly`
- Description: `For growing authors - 20 pages, 15 AI generations per day, PDF & EPUB export`
- Pricing: `£4.99 GBP`
- Billing period: `Monthly`
- **Copy the Price ID** (starts with `price_...`)

**Creator Yearly Product:**
- Name: `Creator Yearly`  
- Description: `For growing authors - Annual billing (Save 17%)`
- Pricing: `£49 GBP`
- Billing period: `Yearly`
- **Copy the Price ID** (starts with `price_...`)

#### B. Add Metadata to Each Product (Important!)
In each product's settings, add this metadata:
```
tier: creator
maxPages: 20
aiGenerationsPerDay: 15
aiCoversPerMonth: 10
```

---

### 2. **Vercel Environment Variables** (REQUIRED)

Go to your Vercel project settings → Environment Variables → Add:

```bash
# Creator Tier Stripe Price IDs
VITE_STRIPE_CREATOR_MONTHLY_PRICE_ID=price_xxx... # From Step 1A
VITE_STRIPE_CREATOR_YEARLY_PRICE_ID=price_xxx...  # From Step 1A

# Rate Limiting (if not already set)
AI_RATE_LIMIT_FREE_TIER=3
AI_RATE_LIMIT_CREATOR_TIER=15
AI_RATE_LIMIT_PREMIUM_TIER=50
```

**Add to all environments**: Production, Preview, Development

---

### 3. **Firebase Firestore Security Rules** (REQUIRED)

Update your `firestore.rules` file to allow 'creator' status:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection
    match /users/{userId} {
      allow read, update, delete: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null;
      
      // Validate subscription status
      allow write: if request.auth != null 
        && request.auth.uid == userId
        && (!request.resource.data.keys().hasAny(['subscriptionStatus']) 
          || request.resource.data.subscriptionStatus in ['free', 'creator', 'premium', 'trial']);
    }
    
    // ... rest of your rules
  }
}
```

Deploy rules:
```bash
firebase deploy --only firestore:rules
```

---

### 4. **Stripe Webhook Configuration** (REQUIRED)

Your existing `api/stripe-webhook.js` should handle Creator tier automatically via Stripe metadata. Verify it checks `metadata.tier` and sets:

```javascript
subscriptionStatus: metadata.tier || 'premium', // Will be 'creator' for Creator tier
maxPages: parseInt(metadata.maxPages) || -1,    // 20 for Creator
```

**Test the webhook** after creating products:
1. Use Stripe CLI: `stripe listen --forward-to http://localhost:5173/api/stripe-webhook`
2. Create a test subscription in Stripe Dashboard
3. Verify user document in Firestore shows `subscriptionStatus: 'creator'` and `maxPages: 20`

---

### 5. **Local Development Setup** (OPTIONAL)

Create/update `.env.local`:

```bash
# Stripe Test Mode Keys
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx...
VITE_STRIPE_CREATOR_MONTHLY_PRICE_ID=price_test_xxx...
VITE_STRIPE_CREATOR_YEARLY_PRICE_ID=price_test_xxx...

# Firebase (same as production)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
# ... other Firebase config

# Rate Limits
AI_RATE_LIMIT_FREE_TIER=3
AI_RATE_LIMIT_CREATOR_TIER=15
AI_RATE_LIMIT_PREMIUM_TIER=50
```

---

## 🎨 AI Cover Generator (Optional Enhancement)

To add AI-generated cover images using DALL-E 3:

### Cost Analysis:
- **DALL-E 3**: ~$0.04 per image (1024x1024)
- **Monthly costs**:
  - Free tier (1/month): $0.04
  - Creator tier (10/month): $0.40
  - Premium tier (50/month): $2.00

### Implementation:
1. Create `/api/generate-cover-image.js` (OpenAI DALL-E 3 API)
2. Add rate limiting per tier (similar to `generate-ai-content.js`)
3. Add UI in CoverDesigner with "Generate AI Cover" button
4. Store usage count in Firestore: `users/{uid}/aiCoverUsage/{month}`

**Would you like me to implement this?** It's a nice premium feature differentiation.

---

## 🧪 Testing Checklist

### Stripe Testing:
- [ ] Creator Monthly checkout works
- [ ] Creator Yearly checkout works
- [ ] Webhook properly sets `subscriptionStatus: 'creator'`
- [ ] User gets `maxPages: 20` after Creator subscription
- [ ] Cancellation reverts to Free tier correctly

### Feature Testing:
- [ ] Free user can create 4 pages max
- [ ] Creator user can create 20 pages max
- [ ] Premium user can create unlimited pages
- [ ] AI generation limits: 3/15/50 per day work correctly
- [ ] PDF export works for all tiers
- [ ] EPUB export works for Creator & Premium only
- [ ] DOCX export works for Premium only

### UI Testing:
- [ ] PricingPage shows all 3 tiers correctly
- [ ] ProfilePage displays correct subscription status
- [ ] UpgradeModal shows all paid tiers in 3-column grid
- [ ] Page usage counter shows correct limits per tier

---

## 📊 Pricing Summary

| Feature | Free | Creator (£4.99) | Premium (£9.99) |
|---------|------|-----------------|-----------------|
| **Pages** | 4 | 20 | Unlimited |
| **AI Generations/Day** | 3 | 15 | 50 |
| **AI Covers/Month** | 1 | 10 | 50 |
| **Templates** | 3 basic | 10 premium | 20+ premium |
| **Export Formats** | PDF only | PDF + EPUB | All (PDF/EPUB/DOCX) |
| **Watermarks** | ❌ | ✅ Custom | ✅ Custom |
| **Support** | Email | Email | Priority |

---

## 🚀 Deployment Order

1. ✅ **Code changes** - Already committed
2. **Create Stripe products** - Do this first in test mode
3. **Set Vercel env vars** - Add all 3 Creator variables
4. **Deploy to Vercel** - `git push` will auto-deploy
5. **Update Firebase rules** - Allow 'creator' status
6. **Test with Stripe test mode** - Complete a test subscription
7. **Verify in production** - Check logs, user documents
8. **Switch to live mode** - Update env vars with live Stripe keys

---

## 💡 Marketing Tips

**Creator Tier Positioning:**
- "Perfect for authors publishing their first 3-5 ebooks"
- "Upgrade when you outgrow the 4-page limit"
- "Most cost-effective for 100-200 page ebooks"

**Upgrade Triggers:**
- Show Creator option when user hits 4-page limit
- Offer Creator in FAQ: "Not ready for Premium? Try Creator!"
- Email campaign: "New Creator tier - Only £4.99/month"

---

## 🆘 Troubleshooting

**Issue**: Creator subscription not showing in profile
- Check Firestore: `users/{uid}` → `subscriptionStatus` should be `'creator'`
- Verify Stripe webhook fired: Check Vercel logs
- Ensure metadata was set on Stripe product

**Issue**: Still getting "upgrade to Premium" prompts
- Check `maxPages` in user document (should be 20, not 4)
- Verify `subscriptionStatus !== 'free'` checks in code
- Clear browser cache/localStorage

**Issue**: Rate limiting not working
- Verify `AI_RATE_LIMIT_CREATOR_TIER=15` in Vercel env
- Check `rateLimits/{uid}` document in Firestore
- API should check `subscriptionStatus === 'creator'`

---

## 📞 Need Help?

If you encounter issues during setup:
1. Check Vercel function logs: `vercel logs`
2. Check Stripe webhook logs in Dashboard
3. Verify Firestore user document structure
4. Test with Stripe CLI for local debugging

---

**Last Updated**: October 28, 2025
**Status**: ✅ Code complete, awaiting Stripe + deployment setup
