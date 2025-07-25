# Firebase Authentication Setup Guide

## What We've Built
✅ Complete Firebase Authentication system  
✅ Page-based usage tracking (4 pages free, unlimited premium)  
✅ User profiles with subscription status  
✅ Sign-in/Sign-up with email + Google  
✅ Professional authentication UI  
✅ Usage tracker component with upgrade prompts  

## Next Steps (Firebase Setup)

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or use existing
3. Enter project name: `influencer-publishing`
4. Disable Google Analytics (optional for now)
5. Click "Create project"

### 2. Enable Authentication
1. In your Firebase project, go to **Authentication**
2. Click "Get started"
3. Go to **Sign-in method** tab
4. Enable these providers:
   - ✅ **Email/Password** (click Enable)
   - ✅ **Google** (click Enable, add your email as test user)

### 3. Create Firestore Database
1. Go to **Firestore Database**
2. Click "Create database"
3. Choose **Start in test mode** (for now)
4. Select your preferred location (us-central1 recommended)

### 4. Get Configuration Keys
1. Go to **Project Settings** (gear icon)
2. Scroll down to "Your apps" section
3. Click the **Web app** icon (`</>`)
4. Register app name: `influencer-publishing-web`
5. Copy the `firebaseConfig` object values

### 5. Update Environment Variables
1. Copy `.env.template` to `.env`
2. Replace the Firebase placeholder values with your actual config:

```env
VITE_FIREBASE_API_KEY=your_actual_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
VITE_FIREBASE_MEASUREMENT_ID=G-ABCDEF123
```

### 6. Test the System
```bash
npm run dev
```

Then test:
1. ✅ Sign up with email/password
2. ✅ Sign in with Google  
3. ✅ Create chapters (watch usage tracker)
4. ✅ Hit 4-page limit and see upgrade prompt
5. ✅ Sign out and back in (data persists)

## What Happens Next

### Immediate Features
- **Usage Tracking**: Users get 4 pages free, then see upgrade prompts
- **Cross-device Sync**: Same account works on web and future iOS app
- **Professional UX**: Clean authentication flow, no friction

### Future Enhancements (Later)
- **Apple Sign-In**: Required for iOS App Store
- **Subscription System**: Stripe for web, Apple In-App Purchase for iOS
- **Premium Features**: Advanced templates, export options, no watermarks

## Security Notes
- ✅ API keys are environment variables (not committed to git)
- ✅ Firestore rules will need updating for production
- ✅ Firebase automatically handles password security
- ✅ Google OAuth is managed by Firebase

## iOS Readiness
This authentication system is **fully compatible** with:
- Capacitor (for iOS conversion)
- Apple Sign-In (can be added later)
- App Store requirements
- Cross-platform user accounts

You're building the foundation properly from the start! 🚀
