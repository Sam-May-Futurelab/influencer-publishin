# Firebase Cloud Functions Setup Guide

This guide explains how to set up and deploy secure Cloud Functions for AI content generation.

## Why Cloud Functions?

Previously, the OpenAI API key was exposed in the browser code with `dangerouslyAllowBrowser: true`. This is a **critical security vulnerability** that allows anyone to:
- View your API key in browser dev tools
- Use your API key for their own purposes
- Rack up charges on your OpenAI account

Cloud Functions solve this by:
- ✅ Keeping API keys secure on the server
- ✅ Adding authentication requirements
- ✅ Controlling costs with usage limits
- ✅ Monitoring API usage per user

## Prerequisites

1. Firebase CLI installed: `npm install -g firebase-tools`
2. OpenAI API key from https://platform.openai.com
3. Firebase project with Blaze (pay-as-you-go) plan (required for Cloud Functions)

## Setup Steps

### 1. Install Function Dependencies

```bash
cd functions
npm install
```

### 2. Configure OpenAI API Key

Set your OpenAI API key as a Firebase environment variable (this keeps it secure):

```bash
firebase functions:config:set openai.key="your-openai-api-key-here"
```

To verify it's set:
```bash
firebase functions:config:get
```

### 3. Deploy Functions

Deploy all functions to Firebase:

```bash
firebase deploy --only functions
```

Or deploy a specific function:
```bash
firebase deploy --only functions:generateAIContent
```

### 4. Update Client Code

The client code has been updated to use `openai-service-secure.ts` which calls the Cloud Function instead of direct OpenAI API.

Remove the old `.env` variable:
```bash
# Remove VITE_OPENAI_API_KEY from .env file
```

### 5. Test the Integration

1. Run the app locally: `npm run dev`
2. Sign in with a Firebase account
3. Try generating AI content in the chapter editor
4. Check Firebase Console > Functions > Logs to see function execution

## Local Development with Emulators

To test functions locally before deploying:

1. Start the Firebase emulators:
```bash
cd functions
npm run serve
```

2. Update `src/lib/openai-service-secure.ts` to use emulator:
```typescript
import { connectFunctionsEmulator } from 'firebase/functions';

const functions = getFunctions(app);
if (import.meta.env.DEV) {
  connectFunctionsEmulator(functions, 'localhost', 5001);
}
```

3. Set environment variable for local testing:
```bash
# In functions directory
firebase functions:config:set openai.key="sk-..." --project inkfluenceai
```

## Cost Management

### OpenAI Costs
- GPT-3.5-turbo: ~$0.002 per request (typical)
- GPT-4: ~$0.03 per request

### Firebase Costs
- Cloud Functions: First 2M invocations/month free
- After that: $0.40 per million invocations

### Recommendations
1. Set spending alerts in OpenAI dashboard
2. Monitor usage in Firebase Console
3. Consider rate limiting in production
4. Cache common requests to reduce costs

## Monitoring

### View Function Logs
```bash
firebase functions:log
```

### In Firebase Console
1. Go to Functions section
2. Click on function name
3. View logs, metrics, and errors

## Security Features

✅ **Authentication Required**: Only signed-in users can call functions
✅ **Input Validation**: Functions validate all input parameters
✅ **Rate Limiting**: Can add rate limiting per user (TODO)
✅ **Error Handling**: Graceful fallbacks if AI service fails
✅ **Usage Logging**: Track who uses AI and how much

## Troubleshooting

### "API key not configured" Error
- Run: `firebase functions:config:set openai.key="your-key"`
- Redeploy functions

### "Unauthenticated" Error  
- Ensure user is signed in via Firebase Auth
- Check that Firebase Auth is properly initialized

### Function Timeout
- Default timeout is 60 seconds
- Increase if needed in `functions/index.js`:
  ```javascript
  exports.generateAIContent = functions
    .runWith({ timeoutSeconds: 120 })
    .https.onCall(...)
  ```

### High Costs
- Check OpenAI usage dashboard
- Add rate limiting logic
- Consider caching responses
- Switch to GPT-3.5-turbo instead of GPT-4

## Next Steps

- [ ] Add rate limiting (e.g., 50 requests per user per day)
- [ ] Implement request caching for common queries
- [ ] Add analytics for AI usage patterns
- [ ] Support model selection (GPT-3.5 vs GPT-4)
- [ ] Add cost estimation before generation

## Migration Checklist

- [x] Create Cloud Functions structure
- [x] Implement secure AI generation endpoint
- [x] Add authentication checks
- [x] Create fallback responses
- [x] Update client to call Cloud Function
- [ ] Deploy to production
- [ ] Test with real users
- [ ] Monitor costs and usage
- [ ] Remove old `VITE_OPENAI_API_KEY` from `.env`
- [ ] Delete old `openai-service.ts` file
