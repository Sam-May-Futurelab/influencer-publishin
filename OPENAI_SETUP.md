# 🔐 OpenAI API Setup Instructions

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

## ✅ Test the Integration

1. Open the app in your browser
2. Create a new project and chapter
3. Go to the AI Assistant tab
4. Enter some keywords and click "Generate"
5. You should see real AI-generated content!

## 🚨 Security Notes

- **Never commit your `.env` file to git** (it's already in `.gitignore`)
- **Never share your API key publicly**
- **Revoke old keys if they're compromised**
- **Monitor your OpenAI usage** at https://platform.openai.com/usage

## 💰 Cost Information

- GPT-3.5-turbo costs ~$0.001-0.002 per request
- GPT-4 costs more but gives better results
- You can set usage limits in your OpenAI dashboard

## 🔧 Troubleshooting

### "API key not configured" error
- Check that your `.env` file exists and has the correct key
- Restart the dev server after adding the key

### "API request failed" error
- Check your OpenAI account has credits
- Verify the API key is active
- Check your internet connection

### Rate limit errors
- You're making too many requests
- Add usage limits or implement rate limiting
- Consider upgrading your OpenAI plan
