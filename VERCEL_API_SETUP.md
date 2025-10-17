# FREE Serverless API Setup (Vercel)

## 🎯 Why This Approach?

Your OpenAI API key is currently exposed in the browser. This setup:
- ✅ Keeps your API key 100% secure on the server
- ✅ Works with FREE Vercel/Netlify plans (no paid tier needed)
- ✅ Takes 5 minutes to set up
- ✅ No Firebase Blaze plan required

## 🚀 Quick Setup (Choose ONE option)

### Option A: Deploy to Vercel (Recommended - Easiest)

1. **Install Vercel CLI** (if you haven't):
```bash
npm i -g vercel
```

2. **Login to Vercel**:
```bash
vercel login
```

3. **Deploy from project root**:
```bash
cd /Users/MacBook/influencer-publishin
vercel
```

4. **Set your OpenAI API key** (secure environment variable):
```bash
vercel env add OPENAI_API_KEY
# Paste your OpenAI API key when prompted
# Select: Production, Preview, Development (all)
```

5. **Redeploy to apply environment variable**:
```bash
vercel --prod
```

**That's it!** Your API is now live at `https://your-project.vercel.app/api/generate-ai-content`

### Option B: Deploy to Netlify

1. **Install Netlify CLI**:
```bash
npm i -g netlify-cli
```

2. **Login and deploy**:
```bash
netlify login
netlify deploy --prod
```

3. **Set environment variable** in Netlify dashboard:
   - Go to Site settings > Environment variables
   - Add `OPENAI_API_KEY` with your key

## 🧪 Local Development (Optional)

To test the serverless function locally:

1. **Install Vercel CLI** (if you haven't):
```bash
npm i -g vercel
```

2. **Run Vercel dev server**:
```bash
vercel dev
```

3. **Add `.env` file** in project root:
```bash
OPENAI_API_KEY=your-key-here
```

4. **Test the API**:
```bash
curl -X POST http://localhost:3000/api/generate-ai-content \
  -H "Content-Type: application/json" \
  -d '{"keywords":["health","fitness"],"chapterTitle":"Getting Started","contentType":"suggestions"}'
```

## 🔒 Security Features

- ✅ API key never exposed to browser
- ✅ Server-side only execution
- ✅ CORS automatically handled by Vercel
- ✅ Rate limiting available (Vercel edge functions)
- ✅ Request logging included

## 💰 Costs

**Vercel Free Plan includes:**
- 100 GB bandwidth/month
- Serverless function executions: Unlimited
- Build minutes: 100 hours/month

**OpenAI Costs:**
- GPT-3.5-turbo: ~$0.002 per request
- You control spending in OpenAI dashboard

## 📝 What Changed?

### Old (Insecure):
```typescript
// Browser code - API key visible!
const openai = new OpenAI({
  apiKey: 'sk-exposed-key',
  dangerouslyAllowBrowser: true
});
```

### New (Secure):
```typescript
// Browser calls YOUR server
fetch('/api/generate-ai-content', {
  method: 'POST',
  body: JSON.stringify({ keywords, chapterTitle })
});

// Server code (Vercel) calls OpenAI
// API key stays on server!
```

## 🐛 Troubleshooting

### "API key not configured"
- Make sure you ran: `vercel env add OPENAI_API_KEY`
- Redeploy: `vercel --prod`

### "Function not found"
- Check `vercel.json` exists in project root
- Check `api/` folder exists with `.js` file
- Redeploy: `vercel --prod`

### "CORS error"
- Vercel automatically handles CORS
- If using custom domain, add to Vercel settings

## ✅ Verification

After deployment, test your API:

```bash
curl -X POST https://your-project.vercel.app/api/generate-ai-content \
  -H "Content-Type: application/json" \
  -d '{"keywords":["test"],"chapterTitle":"Test Chapter","contentType":"suggestions"}'
```

Should return:
```json
{
  "success": true,
  "content": ["suggestion 1", "suggestion 2", ...],
  "tokensUsed": 150
}
```

## 🎉 Done!

Your app now uses secure serverless functions! The client automatically calls your Vercel API instead of OpenAI directly.

**No more exposed API keys!** 🔐
