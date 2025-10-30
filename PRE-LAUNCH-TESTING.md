# Pre-Launch Testing Checklist

**Target**: 2-3 hours of manual QA  
**Goal**: Identify edge cases and critical bugs before launch

---

## 🔴 Critical Tests (Must Complete)

### 1. Preview → Signup → Migration Flow
- [ ] Go to /try-free page (logged out)
- [ ] Enter book details (title, description, genre)
- [ ] Click "Generate Preview Chapter"
- [ ] Wait for chapter to generate successfully
- [ ] Verify preview displays with proper formatting
- [ ] Click "Save to My Account - Sign Up Free" CTA
- [ ] Complete signup process (new account)
- [ ] Verify redirect to Dashboard
- [ ] Verify migration modal appears automatically
- [ ] Click "Save to My Account" in modal
- [ ] Verify success toast shows
- [ ] Verify new project appears in projects list
- [ ] Open the project and verify chapter content preserved
- [ ] Check that text has proper paragraph formatting (not wall of text)
- [ ] Test with existing user: sign out, generate preview, sign back in
- [ ] Verify migration modal appears for returning users too

**Expected**: Seamless preview → account → project flow, no data loss, proper formatting

---

### 2. Large Export Test (50+ Chapters)
- [ ] Create a new project with 50-60 chapters
- [ ] Add at least 100 words of content to each chapter
- [ ] Export to PDF format
- [ ] Export to EPUB format
- [ ] Verify all chapters appear in the exported file
- [ ] Check file size is reasonable (<50MB)
- [ ] Confirm no missing content or formatting issues

**Expected**: Should handle large projects without timeout/crashes

---

### 2. Very Long Content Test
- [ ] Create a chapter with 10,000+ words (copy/paste lorem ipsum)
- [ ] Test editor performance (typing, scrolling, formatting)
- [ ] Use AI content generation on this long chapter
- [ ] Try to save the chapter
- [ ] Export the project with this massive chapter

**Expected**: Editor should remain responsive, save should work, export should succeed

---

### 3. Delete During Auto-Save Test
- [ ] Open a chapter and start editing
- [ ] Type continuously for 10+ seconds (triggers auto-save)
- [ ] While "Saving..." indicator shows, try to delete the chapter
- [ ] Also try deleting the entire project during save

**Expected**: Should either block deletion with warning, or handle gracefully without data corruption

---

### 4. Large Cover Image Test
- [ ] Try uploading a 10MB+ image as cover
- [ ] Try uploading a 20MB+ image
- [ ] Try uploading a very small image (10KB)
- [ ] Try uploading wrong file type (PDF, video)
- [ ] Verify compression happens for large images
- [ ] Check cover displays correctly in project card

**Expected**: Large images rejected or compressed, wrong types rejected with clear error

---

### 5. Rapid Project Creation Test
- [ ] Click "New Project" button rapidly 20 times
- [ ] Create 20 projects in quick succession
- [ ] Verify all projects saved correctly
- [ ] Check for duplicate projects
- [ ] Verify Firebase usage is reasonable

**Expected**: All projects created successfully, no duplicates, no crashes

---

## ✅ Already Protected (Validation Added)

### Project Title Length
- [x] 500+ character titles blocked at 100 chars
- [x] Character counter shows "100/100"
- [x] Toast error on submission if exceeded

### Empty Chapter Export
- [x] Warns when exporting chapters with <50 words
- [x] Shows styled toast with "Export Anyway" option
- [x] Lists which chapters are empty

---

## 🟡 Nice to Have (If Time Permits)

### Network Disconnection Test
- [ ] Start editing a chapter
- [ ] Disconnect internet (turn off WiFi)
- [ ] Continue typing/editing
- [ ] Try to save (Cmd/Ctrl+S)
- [ ] Reconnect internet
- [ ] Verify changes saved or clear error shown

**Expected**: Clear error message, no silent data loss

---

### Multiple Tabs Test
- [ ] Open project in two browser tabs
- [ ] Edit chapter in Tab 1
- [ ] Edit same chapter in Tab 2
- [ ] Save in both tabs
- [ ] Verify which changes persist

**Expected**: Last save wins (document this behavior if not already clear)

---

### Browser Navigation Test
- [ ] Start onboarding wizard
- [ ] Get to step 3 of 4
- [ ] Click browser back button
- [ ] Try to navigate away during project creation
- [ ] Test back button while editing chapter

**Expected**: Either preserves state or warns before losing work

---

### Rate Limiting Test
- [ ] Use AI content generation 3 times (free tier limit)
- [ ] Try to generate 4th time
- [ ] Verify rate limit message shows
- [ ] Check message mentions "Resets at [time]"
- [ ] Verify counter resets after 24 hours

**Expected**: Clear rate limit message, accurate reset time

---

## 📋 Bug Tracking

### Issues Found
Document any bugs you discover:

1. **Bug Title**: 
   - **Severity**: Critical / High / Medium / Low
   - **Steps to Reproduce**: 
   - **Expected Behavior**: 
   - **Actual Behavior**: 
   - **Screenshot/Error**: 

2. **Bug Title**: 
   - **Severity**: 
   - **Steps to Reproduce**: 
   - **Expected Behavior**: 
   - **Actual Behavior**: 
   - **Screenshot/Error**: 

---

## ✅ Testing Complete

Once all critical tests pass:
- [ ] Document any bugs found above
- [ ] Decide which bugs block launch vs. post-launch fixes
- [ ] Mark "Edge case testing" task as complete
- [ ] Ready for soft launch! 🚀

---

**Notes**:
- Test on production URL (inkfluence-ai.vercel.app)
- Use a test account, not your main account
- Check Sentry dashboard after testing for any captured errors
- Monitor Vercel Analytics to see your test sessions
