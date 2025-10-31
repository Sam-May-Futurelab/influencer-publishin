# Future Features & Enhancements

## 🚀 IN DEVELOPMENT

### Phase 1: Free Preview Generator ✅ COMPLETED
**Status:** Live at `/try-free`

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

### Phase 2: Full AI Book Generation ✅ COMPLETED
**Status:** Live - AI Book Generator Wizard

**Implemented:**
- ✅ Creates NEW project (don't interfere with existing)
- ✅ Full workflow: Title → Description → Chapters → Generate All
- ✅ Progress updates with chapter completion accordion
- ✅ All chapters generated automatically
- ✅ Stop Generation feature with confirmation dialog
- ✅ Custom slider with animations
- ✅ Responsive UI with mobile optimization
- ✅ Proper paragraph formatting in editor, preview, and export

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

### Phase 3: Audiobook Generation (3-4 days) 🔄 IN PROGRESS
**Status:** Building Now

**Implementation Approach: Level 1.5 (Simple + Playback)**
- ✅ Use OpenAI TTS API (already integrated, super cheap)
- ✅ Per-project feature (new "Audiobook" tab on project page)
- ✅ Download-based (no permanent storage needed)
- ✅ Optional in-browser playback before download

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

**Simplified User Flow:**
```
Project page → "Audiobook" tab (next to Chapters, Preview, Export)
    ↓
Choose Voice
  - Grid of 6 voices with preview samples (Nova, Alloy, Echo, Fable, Onyx, Shimmer)
  - Pre-generated 15-second previews (no API calls)
    ↓
Choose Quality
  - Standard ($0.015/1K chars) ✓
  - HD ($0.030/1K chars)
    ↓
Preview Cost
  - Shows: "45,000 characters = $0.68 (Standard)"
  - Shows: "Remaining this month: 55K/100K characters"
  - Tier limit check
    ↓
Generate
  - Progress: "Generating Chapter 3 of 10..."
  - Each chapter shows when complete
  - Takes 1-2 minutes
    ↓
Complete
  - HTML5 audio player per chapter (play in browser)
  - Download button per chapter (MP3)
  - No permanent storage - downloads only
  - Store metadata in Firestore (voice used, timestamp)
```

**Implementation Plan:**
- **Day 1:** Voice selector UI + pre-generated samples
- **Day 2:** Generation API + OpenAI TTS integration
- **Day 3:** Audio player component + download functionality
- **Day 4:** Cost tracking, tier limits, testing

**Components:**
- `src/components/AudiobookTab.tsx` - Main tab on project page
- `src/components/VoiceSelector.tsx` - Voice grid with previews
- `src/components/AudioPlayer.tsx` - HTML5 player per chapter
- `api/generate-audiobook.js` - TTS generation endpoint
- `src/lib/audiobook.ts` - Helper functions

**Tier Limits (Character-based):**
- Free: 0 characters (premium feature)
- Creator: 100K characters/month (~2-3 average books)
- Premium: 500K characters/month (~10-15 average books)

**Storage Strategy:**
- NO permanent storage (avoids Firebase limits)
- Generate → Stream to user → Download
- Store metadata only in Firestore (voice, quality, character count, timestamp)
- Optional: Temporary Vercel Blob storage (24 hours) for playback
- User keeps MP3 files locally

---

## Priority: Medium (Next Phases)

### 4. Enhanced Onboarding Wizard (1-2 days)
**Current State:** Basic onboarding exists in `Onboarding.tsx`
**Improvements Needed:**
- Better progression indicators
- Interactive tooltips for features
- Quick-start tutorial (create first project)
- Feature highlights (AI generator, templates, export)
- Success metrics tracking
- Mobile-optimized flow

### 5. Template System Improvements (2-3 days)
**Current State:** Templates exist in `TemplateGallery.tsx`
**Improvements Needed:**
- More template categories (business, fiction, non-fiction, children's)
- Preview before applying
- Save custom templates
- Template ratings/favorites
- Better filtering/search
- Mobile-responsive gallery

### 6. Import Content Feature (Future)
**Description:** Import PDFs, Word docs, text files → convert to chapters
**Complexity:** Medium-High
**Value:** High for users with existing content

### 7. Custom AI Image Models (Skip)
**Description:** Train AI on user photos for personalized covers
**Decision:** Too expensive and complex - not worth it

---

## Priority: Low

### 7. FlipBook Export Format
### 8. Collaboration Features
### 9. Template Marketplace
### 10. Analytics Dashboard

---

## Implementation Schedule

### ✅ Week 1: Free Preview (COMPLETED)
- ✅ Built `/try-free` page
- ✅ No-auth preview generator
- ✅ IP-based rate limiting

### ✅ Week 2: Full AI Generation (COMPLETED)
- ✅ AI Book Generator Wizard (4-step flow)
- ✅ Stop Generation feature
- ✅ Progress tracking with animations
- ✅ Responsive UI and mobile optimization
- ✅ Paragraph formatting fixes

### 🔄 Week 3: Audiobooks (IN PROGRESS)
- **Day 1:** Voice selector UI + sample previews ⏳
- **Day 2:** TTS API integration + generation logic
- **Day 3:** Audio player + download
- **Day 4:** Cost tracking + tier limits + polish

### Week 4: Onboarding + Templates
- Day 1-2: Enhanced onboarding flow
- Day 3-4: Template system improvements
- Day 5: Testing + polish

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
