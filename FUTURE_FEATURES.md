# Future Features & Enhancements

## 🚀 IN DEVELOPMENT

### Phase 1: Free Preview Generator (1-2 days)
**Status:** Planning → Implementation

**Decision Made:**
- Keep existing landing page (`/`)
- Create new dedicated page `/preview` or `/try-free`
- Add prominent CTA on landing page → "/try-free"
- Better for SEO (separate pages targeting different keywords)

**SEO Benefits:**
- Landing `/` = "ebook creator", "AI writing tool" (broad)
- Preview `/try-free` = "free ebook generator", "try AI writing free" (conversion)
- More pages = more ranking opportunities
- Different meta descriptions & keywords per page

**Implementation:**
- ✅ New route: `/try-free`
- ✅ New component: `src/components/TryFreePage.tsx`
- ✅ New API: `api/preview-chapter.js` (no auth, IP rate-limited)
- ✅ Update landing page with CTA button
- ✅ Rate limiting: 1 generation per IP per day (Vercel Edge Config or simple timestamp check)
- ✅ Generate 1 chapter only (500-750 words)
- ✅ Show result with watermark + signup CTA
- ✅ No database saves (ephemeral only)

**Technical Notes:**
- Use `req.headers['x-forwarded-for']` or `req.socket.remoteAddress` for IP
- Cache in memory or use Vercel KV for rate limit tracking
- Clear separation from main app (no project creation)

---

### Phase 2: Full AI Book Generation (3-4 days)
**Status:** Planning

**Decision Made:**
- ✅ Creates NEW project (don't interfere with existing)
- ✅ Full workflow: Title → Description → Chapters → Generate All
- ✅ Streaming progress updates
- ✅ All chapters generated automatically

**User Flow:**
```
Dashboard → "Generate Full Book with AI" button
    ↓
Step 1: Book Details
  - Title (required)
  - Description/Synopsis (required, 200-500 words)
  - Genre (dropdown)
    ↓
Step 2: Structure
  - Number of chapters (slider: 3-15)
  - Auto-generate chapter titles? (yes/no)
  - If no: User enters chapter titles
    ↓
Step 3: Confirm
  - Shows: "This will generate 8 chapters"
  - Cost: "Uses ~400 AI credits" (or whatever limit)
  - Preview tier limits
    ↓
Step 4: Generation
  - Progress bar: "Generating Chapter 3 of 8..."
  - Shows each chapter as it completes
  - Takes 2-3 minutes for full book
    ↓
Complete: New project created → Redirect to editor
```

**Implementation:**
- New component: `src/components/FullBookGenerator.tsx`
- New API: `api/generate-full-book.js`
- Uses Firebase for progress tracking
- Tier limits:
  - Free: 0 full generations
  - Creator: 2 per month
  - Premium: Unlimited

**Cost Estimate:**
- GPT-4o-mini: ~$0.15 per 1M tokens
- 10 chapters × 1000 words = ~15K tokens = ~$0.002
- Very cheap! Can be generous with limits

---

### Phase 3: Audiobook Generation (5-7 days)
**Status:** Planning

**Decision Made:**
- ✅ Use OpenAI TTS API (already integrated, super cheap)
- ✅ Per-project feature (not global)

**OpenAI TTS Pricing:**
- $0.015 per 1K characters (TTS)
- $0.030 per 1K characters (TTS-HD for better quality)
- Example: 10 chapters × 1000 words × 6 chars/word = 60K chars = $0.90 (standard) or $1.80 (HD)
- WAY cheaper than ElevenLabs ($18 for same book!)

**Available Voices (OpenAI):**
- Alloy (neutral)
- Echo (male)
- Fable (expressive male)
- Onyx (deep male)
- Nova (female, warm)
- Shimmer (female, bright)

**User Flow:**
```
Project page → "Generate Audiobook" tab/button
    ↓
Choose Quality
  - Standard ($0.90 for 10 chapters)
  - HD ($1.80 for 10 chapters)
    ↓
Choose Voice
  - Shows 6 voice options with preview buttons
  - Play 15-second sample of each
    ↓
Confirm
  - Shows cost in credits/dollars
  - "Generate Audiobook" button
    ↓
Generation
  - Progress: "Generating audio for Chapter 3 of 10..."
  - Takes 1-2 minutes
    ↓
Complete
  - Audio player for each chapter
  - Download individual chapters or full book MP3
  - Option: Combine into single file
```

**Implementation:**
- New component: `src/components/AudiobookGenerator.tsx`
- New API: `api/generate-audiobook.js`
- Firebase Storage for audio files
- Audio player component for playback

**Tier Limits:**
- Free: 0 audiobooks
- Creator: 1 audiobook/month (or 50K characters)
- Premium: 5 audiobooks/month (or 250K characters)

**Storage:**
- Store MP3s in Firebase Storage
- Keep for 90 days or until user deletes
- Auto-cleanup for inactive users

---

## Priority: Medium (Future Phases)

### 4. Enhanced Onboarding Wizard
**Current State:** Basic onboarding exists in `Onboarding.tsx`
**Improvement:** Make more comprehensive, add tooltips, better progression

### 5. Import Content Feature
**Description:** Import PDFs, Word docs, text files → convert to chapters

### 6. Custom AI Image Models
**Description:** Train AI on user photos for personalized covers
**Concern:** Very expensive, complex - maybe skip this

---

## Priority: Low

### 7. FlipBook Export Format
### 8. Collaboration Features
### 9. Template Marketplace
### 10. Analytics Dashboard

---

## Implementation Schedule

### Week 1: Free Preview
- Day 1-2: Build preview page + API
- Day 2: Add CTA to landing page
- Day 3: Test, polish, deploy

### Week 2: Full AI Generation  
- Day 1-2: Build generation wizard
- Day 2-3: API + streaming progress
- Day 4: Test with various book types

### Week 3: Audiobooks
- Day 1-2: Voice selection + preview
- Day 3-4: Generation API + storage
- Day 5: Audio player + download
- Day 6-7: Test + polish

---

## Success Metrics

### Free Preview:
- Target: 25%+ preview → signup conversion
- Track: # previews, # signups from preview page

### Full AI Generation:
- Target: 40% of new users try it
- Track: # books generated, completion rate, quality feedback

### Audiobooks:
- Target: 15% of premium users generate audiobook
- Track: # audiobooks created, listening time, downloads

---

## Technical Decisions Summary

✅ **Free Preview**: Separate `/try-free` page (SEO benefit)
✅ **Full AI Gen**: Creates new projects (safe isolation)  
✅ **Audiobooks**: OpenAI TTS (cheap, good quality, already integrated)
✅ **Rollout**: Build incrementally, 1 feature per week
✅ **Testing**: Thorough testing before each release

---

## Notes

**Why These Features Matter:**
1. Free Preview = Removes barrier to entry, shows quality
2. Full AI Gen = Competitive parity with ebookmaker.ai
3. Audiobooks = Premium differentiation, high perceived value

**Risk Mitigation:**
- Each feature isolated (won't break existing functionality)
- Rate limiting prevents abuse
- Tier limits control costs
- Can disable features via feature flags if needed

**Cost Analysis:**
- Free Preview: ~$0.01 per generation (acceptable loss leader)
- Full AI Gen: ~$0.20 per book (covered by subscription)
- Audiobooks: ~$1.50 per book (charge premium or use credits)
