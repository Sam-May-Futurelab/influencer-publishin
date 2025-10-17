# 🔐 OpenAI API Setup Instructions

> ⚠️ **IMPORTANT**: This guide is **OUTDATED**. We now use Vercel serverless functions for security.
> 
> **👉 See `VERCEL_API_SETUP.md` for current setup instructions.**

---

## Why This Changed

Previously, the OpenAI API key was stored in the browser (insecure). Now it's stored securely on Vercel's servers.

## Current Setup (Recommended)

Follow the guide in `VERCEL_API_SETUP.md` which covers:
1. Deploying to Vercel (FREE)
2. Securely storing your API key
3. Testing the integration

---

## Legacy Instructions (For Reference Only)

<details>
<summary>Old Setup Method (Not Recommended - API Key Exposed)</summary>

## Step 1: Get Your OpenAI API Key

1. Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Click "Create new secret key"
3. Give it a name (e.g., "Influencer Publishing App")
4. Copy the API key (starts with `sk-proj-...`)

## Step 2: Add API Key to Environment

1. Open the `.env` file in the project root
2. Replace `your_new_api_key_here` with your actual API key:
   ```
   VITE_OPENAI_API_KEY=sk-proj-your-actual-key-here
   ```
3. Save the file

## Step 3: Restart the Development Server

```bash
npm run dev
```

## ⚠️ Security Warning

This method exposes your API key in the browser and is **NOT RECOMMENDED** for production.

</details>

---

## 💰 Cost Information (Still Relevant)

- GPT-3.5-turbo costs ~$0.001-0.002 per request
- GPT-4 costs more but gives better results
- You can set usage limits in your OpenAI dashboard: https://platform.openai.com/usage

## � Current Security Features

With the new Vercel setup:
- ✅ API key stored securely on server
- ✅ Never exposed to browser
- ✅ Request logging and monitoring
- ✅ Rate limiting capability

### "API request failed" error
- Check your OpenAI account has credits
- Verify the API key is active
- Check your internet connection

### Rate limit errors
- You're making too many requests
- Add usage limits or implement rate limiting
- Consider upgrading your OpenAI plan
