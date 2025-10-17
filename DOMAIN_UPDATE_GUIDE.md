# Domain Update Guide

When you're ready to switch from `inkfluence-ai.vercel.app` to your custom domain, you'll need to update it in multiple places.

## 📋 Checklist

### 1. **Vercel** (Primary Domain)
- [ ] Go to [Vercel Dashboard](https://vercel.com) → Your Project → **Settings** → **Domains**
- [ ] Add your custom domain (e.g., `inkfluence.ai` or `www.inkfluence.ai`)
- [ ] Follow Vercel's DNS instructions to verify ownership
- [ ] Set it as the primary domain
- [ ] Vercel will automatically handle SSL/HTTPS

**Where it's used**: 
- Main app URL
- API endpoints (`/api/*`)

---

### 2. **Vercel Environment Variable**
- [ ] Go to Vercel → **Settings** → **Environment Variables**
- [ ] Update `FRONTEND_URL` from `https://inkfluence-ai.vercel.app` to your new domain
- [ ] Click **Save**
- [ ] **Redeploy** your app for changes to take effect

**Current value**: `https://inkfluence-ai.vercel.app`  
**New value**: `https://yourdomain.com`

**⚠️ Important**: If this is set to the wrong domain, Stripe checkout will redirect to a 404 page after payment, even though the payment succeeds. Make sure this matches your actual Vercel domain!

---

### 3. **Firebase Authentication** (Authorized Domains)
- [ ] Go to [Firebase Console](https://console.firebase.google.com)
- [ ] Select your project → **Authentication** → **Settings** tab
- [ ] Scroll to **Authorized domains**
- [ ] Click **Add domain**
- [ ] Add your new custom domain (e.g., `inkfluence.ai`)
- [ ] You can remove `inkfluence-ai.vercel.app` once migration is complete

**Why**: Firebase Auth will reject sign-in attempts from unauthorized domains.

**Current domains**:
- `localhost`
- `inkfluenceai.firebaseapp.com`
- `inkfluence-ai.vercel.app` (needs updating)

---

### 4. **Stripe Webhook URL**
- [ ] Go to [Stripe Dashboard](https://dashboard.stripe.com) → **Developers** → **Webhooks**
- [ ] Click on your existing webhook endpoint
- [ ] Click **"..."** → **Update endpoint**
- [ ] Change URL from `https://inkfluence-ai.vercel.app/api/stripe-webhook` to `https://yourdomain.com/api/stripe-webhook`
- [ ] Click **Save**

**Current URL**: `https://inkfluence-ai.vercel.app/api/stripe-webhook`  
**New URL**: `https://yourdomain.com/api/stripe-webhook`

**Note**: Don't delete the old webhook until you've confirmed the new one works!

---

### 5. **Stripe Checkout Success/Cancel URLs** (Optional)
These are dynamically set in code, so they should update automatically when you change `FRONTEND_URL`.

**Files that reference the frontend URL**:
- `api/create-checkout-session.js` (uses `process.env.FRONTEND_URL`)

No action needed if you updated the environment variable!

---

### 6. **Google Cloud Console** (if using Google APIs)
If you're using any Google APIs beyond Firebase:
- [ ] Go to [Google Cloud Console](https://console.cloud.google.com)
- [ ] Select your project → **APIs & Services** → **Credentials**
- [ ] Update any OAuth 2.0 Client IDs to include your new domain

**Current**: Probably not needed for your app  
**Action**: Check only if you use Google Sign-In or other Google APIs

---

### 7. **OpenAI (if you have domain restrictions)**
- [ ] Check if you've set up domain restrictions in OpenAI dashboard
- [ ] Update if necessary

**Current**: Likely not restricted  
**Action**: No action needed unless you set restrictions

---

### 8. **DNS Configuration** (Your Domain Registrar)
Where you bought your domain (e.g., Namecheap, GoDaddy, Cloudflare):

**For Apex Domain** (`inkfluence.ai`):
- [ ] Add an **A Record** pointing to Vercel's IP: `76.76.21.21`

**For www Subdomain** (`www.inkfluence.ai`):
- [ ] Add a **CNAME Record** pointing to `cname.vercel-dns.com`

**Note**: Vercel will give you exact DNS instructions when you add the domain.

---

### 9. **Code References** (Check if hardcoded)
Search your codebase for any hardcoded URLs:

```bash
# Run this in your terminal to find references:
grep -r "inkfluence-ai.vercel.app" src/
grep -r "vercel.app" src/
```

**Expected**: None (you're using environment variables ✅)

---

### 10. **Social Media & Marketing**
Update your domain in:
- [ ] Twitter/X profile
- [ ] LinkedIn
- [ ] Facebook
- [ ] Instagram bio
- [ ] Email signatures
- [ ] Business cards
- [ ] Landing pages (when you build it)

---

## 🚀 Migration Process (Step-by-Step)

### Before Migration
1. **Test everything** on `inkfluence-ai.vercel.app`
2. Confirm payments work
3. Confirm AI generation works
4. Take screenshots of Stripe/Firebase/Vercel settings

### During Migration
1. **Add domain to Vercel** (don't remove old one yet)
2. **Configure DNS** at your registrar
3. Wait for DNS propagation (5 mins - 48 hours)
4. **Test new domain** works
5. **Update Firebase** authorized domains
6. **Update Vercel** environment variable `FRONTEND_URL`
7. **Redeploy** app
8. **Update Stripe** webhook URL
9. **Test payment flow** on new domain
10. **Set new domain as primary** in Vercel

### After Migration
1. Keep old Vercel domain active for 7 days (grace period)
2. Monitor Stripe webhook logs for errors
3. Check Firebase Auth works on new domain
4. Once confirmed, remove old domain from Firebase authorized list

---

## ⚠️ Common Issues

### Issue: "Auth domain not authorized"
**Solution**: Add domain to Firebase → Authentication → Authorized domains

### Issue: Stripe webhook fails
**Solution**: 
1. Check webhook URL is correct in Stripe Dashboard
2. Verify `STRIPE_WEBHOOK_SECRET` is correct
3. Check Vercel function logs for errors

### Issue: Redirect loops
**Solution**: 
1. Update `FRONTEND_URL` environment variable
2. Clear browser cache
3. Redeploy app

### Issue: SSL certificate errors
**Solution**: 
1. Vercel handles this automatically
2. Wait 5-10 minutes for certificate provisioning
3. Check domain is verified in Vercel

---

## 📝 Quick Reference

| Service | What to Update | Where |
|---------|---------------|-------|
| **Vercel** | Add custom domain | Settings → Domains |
| **Vercel** | Update `FRONTEND_URL` | Settings → Environment Variables |
| **Firebase** | Add authorized domain | Authentication → Settings → Authorized domains |
| **Stripe** | Update webhook URL | Developers → Webhooks → Update endpoint |
| **DNS** | Point to Vercel | Your domain registrar (Namecheap, etc.) |

---

## 🎯 Testing Checklist (After Domain Update)

- [ ] Visit new domain - site loads correctly
- [ ] Sign in works
- [ ] Sign up new account works
- [ ] Create a project
- [ ] Generate AI content (uses 1 of 3 daily)
- [ ] Hit daily limit (3/3)
- [ ] Upgrade modal appears
- [ ] Click "Upgrade Now" redirects to Stripe
- [ ] Complete test payment
- [ ] Webhook fires and updates Firebase
- [ ] User becomes premium (50/50 daily limit)
- [ ] Generate AI content as premium user
- [ ] Open browser console - no errors
- [ ] Check Stripe webhook logs - no failures

---

## 💡 Pro Tips

1. **Do this during low traffic hours** (late night/early morning)
2. **Keep old domain active for 1 week** as fallback
3. **Set up domain forwarding** from old to new in Vercel
4. **Update documentation** (README, setup guides) with new URLs
5. **Announce the change** to existing users via email
6. **Monitor error logs** closely for 24-48 hours after migration

---

## 🆘 Need Help?

If something breaks after domain update:

1. **Check Vercel deployment logs**: Vercel Dashboard → Deployments → Click latest → View Function Logs
2. **Check Stripe webhook logs**: Stripe Dashboard → Developers → Webhooks → Click endpoint → View logs
3. **Check Firebase**: Console → Authentication → Users (verify isPremium field updates)
4. **Rollback if needed**: Vercel → Deployments → Find previous working deployment → Promote to Production

---

**Last Updated**: October 17, 2025  
**Current Domain**: `inkfluence-ai.vercel.app`  
**Target Domain**: _(To be determined)_
