# Phase 2: AI Book Generation - Implementation Plan

**Goal**: Build a 4-step wizard for generating complete ebooks (6-15 chapters) with AI

---

## 📋 Pre-Implementation Review

### 1. **Rate Limits & Usage Tracking**

#### Current Rate Limits (from lib/auth.ts):
- ✅ **Free Tier**: 
  - 3 AI generations per day
  - 5 cover generations per month
  - 50 pages total
  
- ✅ **Creator Tier**: 
  - 10 AI generations per day
  - 25 cover generations per month
  - 500 pages total
  
- ✅ **Pro Tier**: 
  - Unlimited AI generations
  - Unlimited cover generations
  - Unlimited pages

#### New Limits for Full Book Generation:
```typescript
// Add to lib/types.ts
export interface UsageTracking {
  aiGenerations: number;          // Existing - counts per chapter
  coverGenerations: number;        // Existing
  fullBookGenerations: number;     // NEW - counts complete book generations
  lastFullBookGenerationReset: Date; // NEW
}

// Proposed Limits:
- Free: 1 AI book/month (resets monthly)
- Creator: 5 AI books/month (resets monthly)  
- Pro: Unlimited AI books
```

#### Cost Analysis:
- **Per chapter**: ~$0.015-0.025 (1500-2000 tokens avg)
- **10-chapter book**: ~$0.15-0.25
- **Outline generation**: ~$0.02-0.03 (200-300 tokens)
- **Total per book**: ~$0.20-0.30

**Monthly costs at scale**:
- 100 free users (1 book each): $20-30
- 50 creator users (5 books each): $50-75
- Total monthly AI cost: ~$70-105 for modest usage

✅ **Cost is reasonable - proceed with limits above**

---

### 2. **Dashboard Integration**

#### Add 4th Quick Action Tile:
```tsx
{/* AI Book Generation - NEW */}
<Card className="neomorph-flat border-0 hover:neomorph-raised transition-all duration-300">
  <CardContent className="p-4 lg:p-6">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-primary neomorph-inset">
        <Sparkle size={20} className="text-white" weight="fill" />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-sm lg:text-base">AI Book Generator</h3>
        <Badge variant="secondary" className="text-xs mt-1">New!</Badge>
      </div>
    </div>
    <p className="text-xs lg:text-sm text-muted-foreground mb-4">
      Generate a complete ebook (6-15 chapters) with AI in minutes.
    </p>
    <Button
      onClick={() => setShowBookGenerator(true)}
      className="w-full neomorph-button border-0 text-sm min-h-[40px] bg-gradient-to-r from-purple-600 to-primary"
    >
      <Sparkle size={16} weight="fill" />
      Generate Full Book
    </Button>
    
    {/* Usage indicator */}
    {userProfile && (
      <div className="mt-3 text-xs text-muted-foreground text-center">
        {userProfile.subscriptionStatus === 'free' && (
          <>
            {userProfile.fullBookGenerationsUsed || 0}/1 book this month
          </>
        )}
        {userProfile.subscriptionStatus === 'creator' && (
          <>
            {userProfile.fullBookGenerationsUsed || 0}/5 books this month
          </>
        )}
        {userProfile.subscriptionStatus === 'pro' && (
          <>Unlimited ✨</>
        )}
      </div>
    )}
  </CardContent>
</Card>
```

---

### 3. **New Components Needed**

#### A. `AIBookGeneratorWizard.tsx`
```tsx
interface AIBookGeneratorWizardProps {
  open: boolean;
  onClose: () => void;
  onComplete: (project: EbookProject) => void;
  userProfile: UserProfile;
}

// State:
- step: 1 | 2 | 3 | 4
- bookData: { title, description, genre, targetAudience }
- outline: { chapterTitle, description }[]
- numChapters: 6-15 (slider)
- generationProgress: { current: number, total: number, status: string }
```

**Steps**:
1. **Book Details**: Title, description, genre, target audience
2. **Outline Generation**: AI generates outline, show slider to adjust chapter count (6-15)
3. **Review & Edit**: Show draggable outline, allow editing titles/descriptions
4. **Generate Chapters**: Stream generation with progress bar, show X/N complete

#### B. Progress Components:
- `BookGenerationProgress.tsx` - Shows streaming progress
- `OutlineEditor.tsx` - Drag-to-reorder, inline editing

---

### 4. **API Endpoints Needed**

#### `/api/generate-book-outline.js`
```javascript
// Input: { title, description, genre, targetAudience, numChapters }
// Output: { outline: [{ title, description, order }] }
// Uses GPT-4o-mini for cost efficiency
// Cost: ~$0.02-0.03 per outline
```

#### `/api/generate-full-book.js` 
```javascript
// Input: { outline, bookData }
// Output: Server-Sent Events (SSE) stream
// Generates chapters sequentially
// Sends progress updates: { type: 'progress', chapter: number, total: number, content: string }
// Cost: ~$0.15-0.25 per 10 chapters
```

---

### 5. **Usage Tracking Updates**

#### Update `lib/auth.ts`:
```typescript
// Add to incrementUsage()
export const incrementFullBookGeneration = async (userId: string): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    fullBookGenerationsUsed: increment(1),
    lastFullBookGenerationReset: serverTimestamp()
  });
};

// Add to checkUsageLimits()
export const canGenerateFullBook = (profile: UserProfile): boolean => {
  if (!profile) return false;
  
  const { subscriptionStatus, fullBookGenerationsUsed = 0 } = profile;
  
  if (subscriptionStatus === 'pro') return true;
  if (subscriptionStatus === 'creator') return fullBookGenerationsUsed < 5;
  if (subscriptionStatus === 'free') return fullBookGenerationsUsed < 1;
  
  return false;
};
```

#### Update Firestore User Schema:
```typescript
interface UserProfile {
  // ... existing fields
  fullBookGenerationsUsed?: number;
  lastFullBookGenerationReset?: Timestamp;
}
```

---

### 6. **User Experience Flow**

```
Dashboard
  ↓ Click "Generate Full Book"
Step 1: Book Details Form
  - Title (required)
  - Description (required, 100-500 chars)
  - Genre (dropdown)
  - Target Audience (optional)
  ↓ Click "Generate Outline"
Step 2: AI Generates Outline
  - Shows loading spinner
  - AI creates 5-10 chapter outline
  - Display chapters in cards
  - Slider to adjust count (6-15)
  - "Generate More" or "Generate Fewer" buttons
  ↓ Click "Review & Edit"
Step 3: Review/Edit Outline
  - Drag to reorder chapters
  - Click to edit chapter titles/descriptions
  - Add/remove chapters
  - Preview book structure
  ↓ Click "Generate Book"
Step 4: Generate All Chapters
  - Check usage limits (show upgrade modal if exceeded)
  - Progress bar: "Generating Chapter 3 of 10..."
  - Show chapter titles as they complete
  - Estimated time remaining
  - Cancel option (saves progress so far)
  ↓ Complete
Success Screen
  - "Your book is ready!"
  - Shows project card
  - "Open Project" button
  - "Generate Another" button (if limits allow)
```

---

### 7. **Error Handling**

- **Rate limit exceeded**: Show upgrade modal with comparison
- **API timeout**: Save progress, allow resume
- **Network error**: Retry with exponential backoff
- **Invalid outline**: Allow manual editing before generation
- **Partial success**: Create project with completed chapters, mark others as drafts

---

### 8. **Implementation Checklist**

#### Phase 2.1: Foundation (Day 1)
- [ ] Add `fullBookGenerationsUsed` to UserProfile type
- [ ] Update Firestore security rules for new fields
- [ ] Create `incrementFullBookGeneration()` function
- [ ] Create `canGenerateFullBook()` check
- [ ] Add Dashboard tile with usage counter

#### Phase 2.2: Outline Generation (Day 1-2)
- [ ] Create `/api/generate-book-outline.js` endpoint
- [ ] Build `AIBookGeneratorWizard.tsx` shell
- [ ] Implement Step 1 (Book Details form)
- [ ] Implement Step 2 (Outline generation + slider)
- [ ] Test outline generation with various inputs

#### Phase 2.3: Outline Editing (Day 2)
- [ ] Build `OutlineEditor.tsx` with drag-and-drop
- [ ] Add inline editing for chapter titles/descriptions
- [ ] Implement add/remove chapter buttons
- [ ] Test reordering and editing

#### Phase 2.4: Book Generation (Day 2-3)
- [ ] Create `/api/generate-full-book.js` with SSE
- [ ] Build `BookGenerationProgress.tsx` component
- [ ] Implement streaming progress updates
- [ ] Handle cancellation (save partial progress)
- [ ] Create final project with all chapters

#### Phase 2.5: Polish & Testing (Day 3)
- [ ] Add usage limit checks at each step
- [ ] Implement upgrade prompts
- [ ] Add success screen with confetti
- [ ] Error handling for all edge cases
- [ ] Test complete flow multiple times
- [ ] Test with Free/Creator/Pro tiers

---

## 🚀 Ready to Implement?

**Estimated Time**: 3 days  
**Cost per book**: $0.20-0.30  
**Monthly cost (modest usage)**: ~$70-105  

### Open Questions:
1. Should we add a "Save Draft Outline" feature in Step 3?
2. Do we want to allow editing chapters after generation (before saving)?
3. Should generation be cancelable with partial save?
4. Add competitor analysis link to /try-free page?

### Dependencies:
- ✅ User authentication (done)
- ✅ Usage tracking system (done)
- ✅ Project creation (done)
- ✅ Chapter editor (done)
- ✅ OpenAI integration (done)
- ⏳ SSE streaming for progress (need to implement)

**Next Step**: Review this plan, confirm approach, then start with Phase 2.1 (Foundation) 🎯
