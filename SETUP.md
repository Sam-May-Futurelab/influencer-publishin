# 🚀 InkFluence AI - Setup Guide

## Prerequisites

- Node.js 18+ installed
- A Firebase account
- A Resend account (free tier)
- An OpenAI API key (for AI features)
- A Stripe account (for payments)

## 1. Clone and Install

```bash
git clone <your-repo-url>
cd influencer-publishin
npm install
```

## 2. Environment Variables Setup

Copy the example environment file:

```bash
cp .env.example .env
```

Then fill in your credentials:

### Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project (or use existing)
3. Go to Project Settings > General
4. Copy your Firebase config values into `.env`

### Resend Setup (Contact Form Emails)
1. Sign up at [Resend.com](https://resend.com) (free tier: 100 emails/day)
2. Go to API Keys and create a new key
3. Add `RESEND_API_KEY=re_xxxxx` to `.env`
4. **Important:** Verify your sending domain in Resend dashboard
   - For custom domain: Add DNS records for your domain
   - For testing: Use `onboarding@resend.dev` (works immediately)
5. Set `CONTACT_EMAIL` to where you want to receive contact form submissions

### OpenAI Setup
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create an API key
3. Add `VITE_OPENAI_API_KEY=sk-xxxxx` to `.env`

### Stripe Setup
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Get your publishable and secret keys (use test mode keys for development)
3. Add both keys to `.env`

## 3. Resend Domain Verification

You have two options:

### Option A: Use Resend's Testing Domain (Quick Start)
- Use `onboarding@resend.dev` as the "from" email
- Works immediately, no setup needed
- Limited to 100 emails/day

### Option B: Use Your Custom Domain (Production)
1. In Resend dashboard, go to Domains
2. Add your domain (e.g., `inkfluenceai.com`)
3. Add the provided DNS records to your domain provider
4. Wait for verification (usually 5-30 minutes)
5. Update `api/contact-form.js` line 42 to use your domain:
   ```javascript
   from: 'InkFluence AI <noreply@yourdomain.com>',
   ```

**For Zoho Email Users:**
- Add Resend's SPF/DKIM records alongside your Zoho DNS records
- Both can coexist on the same domain

## 4. Run Development Server

```bash
npm run dev
```

Open http://localhost:5173

## 5. Deploy to Vercel

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add all environment variables from `.env` in Vercel dashboard
4. Deploy!

## 6. Post-Deployment Checklist

- [ ] Test contact form (sends email to your CONTACT_EMAIL)
- [ ] Test AI content generation
- [ ] Test Stripe payment flow
- [ ] Verify Firebase authentication works
- [ ] Check robots.txt and sitemap.xml are accessible
- [ ] Test on mobile devices

## Troubleshooting

### Contact form not sending emails
- Check `RESEND_API_KEY` is set in Vercel environment variables
- Verify your domain in Resend dashboard
- Check Vercel function logs for errors

### AI features not working
- Verify `VITE_OPENAI_API_KEY` is set correctly
- Check OpenAI account has credits
- Look for errors in browser console

### Stripe checkout not working
- Ensure both `VITE_STRIPE_PUBLISHABLE_KEY` and `STRIPE_SECRET_KEY` are set
- Use test mode keys during development
- Check webhook endpoint is configured in Stripe dashboard

## Support

For issues, check:
- Vercel function logs (for backend errors)
- Browser console (for frontend errors)
- Firebase console (for auth/database errors)
