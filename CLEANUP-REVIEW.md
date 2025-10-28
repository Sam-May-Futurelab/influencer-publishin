# Project Cleanup Review - InkFluence AI

**Generated**: October 28, 2025  
**Purpose**: Identify unused files, dead code, and cleanup opportunities before launch

---

## 🗑️ Files to DELETE (Safe to Remove)

### 1. `/src/prd.md` - Product Requirements Document
- **Why Remove**: Development/planning doc, not needed in production
- **Action**: Delete or move to separate `/docs` folder
- **Impact**: None - purely internal documentation

### 2. `/scripts/upgrade-user.js` - Manual User Upgrade Script
- **Why Remove**: One-off utility script, hardcoded user ID
- **Contains**: Manual Firebase user upgrade for testing
- **Action**: Delete (already used once, no longer needed)
- **Impact**: None - only used for initial testing

### 3. `/api/webhook-test.js` - Stripe Webhook Test Endpoint
- **Why Remove**: Development/debugging endpoint
- **Action**: Delete (Stripe webhooks working via `/api/stripe-webhook.js`)
- **Impact**: None - test endpoint not used in production

### 4. `/theme.json` - Empty Theme File
- **Why Remove**: Completely empty `{}`
- **Action**: Delete
- **Impact**: None - no content

### 5. `/.env.example` Line 109 - Outdated Comments
- **Why Update**: References removed debug endpoints
- **Action**: Clean up any references to `debug-user.js` or `debug-webhooks.js`
- **Impact**: Better documentation clarity

---

## ⚠️ Files to KEEP (But Review)

### 1. `/SETUP.md` - Setup Instructions
- **Status**: Keep - useful for future developers
- **Action**: Verify all instructions still accurate
- **Priority**: LOW

### 2. `/.env.example` - Environment Template
- **Status**: Keep - essential for deployment/onboarding
- **Action**: Verify all variables are documented
- **Priority**: MEDIUM

### 3. `/api/_cors.js` - CORS Configuration
- **Status**: Keep - actively used by 8 API endpoints
- **Action**: Verify `ALLOWED_ORIGINS` includes production domains
- **Priority**: HIGH - Security critical

### 4. `/api/Ultimate-Ebook-Writing-Template.pdf` - Lead Magnet
- **Status**: Keep - actively used for downloads
- **File Size**: 143 KB (compressed, acceptable)
- **Action**: None
- **Priority**: N/A

---

## 🔍 Code Cleanup Opportunities

### 1. Unused Imports (Low Priority)
Run this to find unused imports:
```bash
npm run build
# Check for any "imported but never used" warnings
```

### 2. Console.log Statements (Medium Priority)
Search for development console logs:
```bash
grep -r "console.log" src/ --exclude-dir=node_modules
```
**Action**: Remove or convert to proper error monitoring (Sentry)

### 3. TODO Comments (✅ DONE)
- Already cleaned up in `src/lib/payments.ts`
- Verify no other TODOs remain

### 4. Commented-Out Code (Low Priority)
Search for large commented blocks:
```bash
grep -r "// " src/ | wc -l
```
**Action**: Remove dead code before launch

---

## 📊 Bundle Size Analysis

### Current Build Output
Run to check bundle size:
```bash
npm run build
```

Look for:
- Chunk sizes > 1MB (may need code splitting)
- Unused dependencies (check with `npm ls`)
- Heavy libraries that could be lazy-loaded

---

## 🔒 Security Review

### Environment Variables
- [x] `.env` in `.gitignore` ✅
- [x] Sensitive keys use `VITE_` prefix only for public keys ✅
- [x] OpenAI key server-side only ✅
- [ ] Verify Vercel has all production env vars set

### API Endpoints
- [x] CORS configured with allowed origins ✅
- [x] reCAPTCHA on public forms ✅
- [x] Rate limiting on AI generation ✅
- [ ] Review webhook signature verification (Stripe)

---

## 📝 Documentation Cleanup

### Files to Update
1. **README.md** - Verify setup instructions current
2. **SETUP.md** - Ensure all environment variables documented
3. **.env.example** - Remove references to deleted files

### Files to Remove from Git History
If you want to clean up committed `.env` files (DANGEROUS - only if exposed):
```bash
# DO NOT RUN unless you're sure sensitive data was committed
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all
```

---

## ✅ Cleanup Checklist

**Before Launch** (HIGH PRIORITY):
- [ ] Delete `/src/prd.md` (or move to `/docs`)
- [ ] Delete `/scripts/upgrade-user.js`
- [ ] Delete `/api/webhook-test.js`
- [ ] Delete `/theme.json`
- [ ] Review CORS allowed origins in `/api/_cors.js`
- [ ] Remove unnecessary `console.log` statements
- [ ] Verify no hardcoded credentials in code
- [ ] Check Vercel environment variables complete

**Post-Launch** (LOW PRIORITY):
- [ ] Remove commented-out code
- [ ] Analyze bundle size for optimization
- [ ] Document any temporary workarounds in code
- [ ] Set up dependabot alerts (already configured in `.github/`)

---

## 🎯 Recommended Action Plan

### Phase 1: Critical Cleanup (15 minutes)
```bash
cd /Users/MacBook/influencer-publishin

# Delete unused files
rm src/prd.md
rm scripts/upgrade-user.js
rm api/webhook-test.js
rm theme.json

# Commit cleanup
git add -A
git commit -m "Remove unused files and test scripts before launch"
git push
```

### Phase 2: Code Review (30 minutes)
1. Search for `console.log` and remove/replace with Sentry
2. Review CORS origins in `api/_cors.js`
3. Run `npm run build` and check for warnings
4. Verify no hardcoded test data or credentials

### Phase 3: Documentation (15 minutes)
1. Update README.md with current setup
2. Verify .env.example is accurate
3. Check all docs reference correct file names

---

## 📈 Impact Summary

**Files to Delete**: 4 files (~200 lines of unused code)  
**Security Improvements**: CORS review, env var audit  
**Build Size Impact**: Minimal (mostly docs/scripts)  
**Risk Level**: LOW - Only removing development/test files  

**Estimated Time**: 1 hour total for complete cleanup  
**Launch Blocker**: NO - Can launch before cleanup, but recommended  

---

## 🚨 DO NOT DELETE

These files are CRITICAL and actively used:
- ✅ `/api/_cors.js` - Used by all API endpoints
- ✅ `/api/generate-ai-content.js` - Core AI feature
- ✅ `/api/stripe-webhook.js` - Payment processing
- ✅ `/api/contact-form.js` - Contact page functionality
- ✅ `/api/download-lead-magnet.js` - Lead magnet delivery
- ✅ `/api/Ultimate-Ebook-Writing-Template.pdf` - Lead magnet file
- ✅ All files in `/src/components` - Active UI components
- ✅ All files in `/src/lib` - Core business logic
- ✅ `.env.example` - Setup template
- ✅ `SETUP.md` - Onboarding documentation
