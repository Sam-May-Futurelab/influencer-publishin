# Achievements Integration Guide

## Overview
The achievements system is now live! The notification bell shows a badge count for unread achievements, and clicking it opens a dropdown with all unlocked achievements.

## How It Works

### Current Setup ✅
- ✅ Achievements hook (`use-achievements.ts`)
- ✅ Achievements context provider (`use-achievements-context.tsx`)
- ✅ Notifications panel component (`NotificationsPanel.tsx`)
- ✅ Integrated into Header (replaces dummy notification bell)
- ✅ Wrapped app in `AchievementsProvider` (main.tsx)

### Achievements Available 🏆

1. **First Words** - 100 words written ✍️
2. **Wordsmith** - 1,000 words written 📝
3. **Author** - 10,000 words written 📚
4. **Novelist** - 50,000 words written 🏆
5. **Chapter One** - First chapter created 📖
6. **Building Momentum** - 5 chapters created 🚀
7. **Prolific Writer** - 10 chapters created ⭐
8. **Project Started** - First project created 🎯
9. **Cover Artist** - First cover designed 🎨
10. **AI Explorer** - AI assistant used 10 times 🤖
11. **AI Master** - AI assistant used 50 times 🧠
12. **Published** - First book exported 📤

## How to Track Achievements

### In Any Component

```typescript
import { useAchievementsContext } from '@/hooks/use-achievements-context';

function YourComponent() {
  const { 
    trackWordCount, 
    trackChapterCreated, 
    trackProjectCreated,
    trackCoverDesigned,
    trackAIAssist,
    trackExport 
  } = useAchievementsContext();

  // Track when user writes
  const handleSave = () => {
    const wordCount = getWordCount(); // your word counting logic
    trackWordCount(wordCount);
  };

  // Track when creating a chapter
  const createChapter = () => {
    // ... your chapter creation logic
    trackChapterCreated();
  };

  // And so on...
}
```

### Recommended Integration Points

#### 1. App.tsx - `createProject` function (line ~450)
```typescript
const createProject = async (projectData) => {
  // ... existing code ...
  
  try {
    await saveProject(user.uid, newProject);
    setProjects(currentProjects => [...currentProjects, newProject]);
    selectProject(newProject);
    
    // 🎯 Add this line:
    trackProjectCreated();
    
    toast.success('Project created! 🎉');
  }
};
```

#### 2. App.tsx - `createChapter` function (line ~700)
```typescript
const createChapter = async () => {
  // ... existing code ...
  
  updateProject({ chapters: updatedChapters });
  setCurrentChapter(newChapter);
  
  // 📖 Add this line:
  trackChapterCreated();
  
  await refreshProfile();
  toast.success('New chapter created!');
};
```

#### 3. CoverDesigner.tsx - `exportCover` function
```typescript
const exportCover = async () => {
  // ... existing export logic ...
  
  // 🎨 Add this line after successful save:
  trackCoverDesigned();
  
  onSave(design);
  toast.success('Cover saved to project!');
};
```

#### 4. ChapterEditor.tsx - Track word count
```typescript
import { useAchievementsContext } from '@/hooks/use-achievements-context';

// In the component:
const { trackWordCount } = useAchievementsContext();

// In handleChapterChange or similar:
const handleChapterChange = (newContent: string) => {
  // ... existing save logic ...
  
  // Calculate total words across all chapters
  const totalWords = chapters.reduce((total, chapter) => {
    const words = chapter.content?.split(/\s+/).filter(w => w.length > 0).length || 0;
    return total + words;
  }, 0);
  
  // 📝 Track total word count
  trackWordCount(totalWords);
};
```

#### 5. AIContentAssistant.tsx - Track AI usage
```typescript
const { trackAIAssist } = useAchievementsContext();

const handleGenerateContent = async () => {
  // ... existing AI generation logic ...
  
  // 🤖 Add this line after successful generation:
  trackAIAssist();
  
  toast.success('Content generated!');
};
```

#### 6. ExportDialog.tsx - Track exports
```typescript
const { trackExport } = useAchievementsContext();

const handleExport = async () => {
  // ... existing export logic ...
  
  // 📤 Add this line after successful export:
  trackExport();
  
  toast.success('Ebook exported successfully!');
};
```

## User Experience

### When Achievement Unlocked:
1. 🔔 Bell icon fills in and shows badge count
2. 🎉 Toast notification appears: "🏆 Achievement Unlocked: [Title]"
3. 📋 Achievement appears in notifications dropdown (unread with blue dot)
4. ✅ User can mark as read, mark all as read, or delete individual achievements

### Notifications Panel Features:
- Shows all achievements sorted by most recent
- Unread achievements have a blue dot and highlighted background
- Shows relative time ("5m ago", "2h ago", "3d ago")
- "Mark all read" button when there are unread achievements
- Delete button (X) for each achievement
- Empty state when no achievements yet

## Testing

To test achievements locally:

```typescript
// In browser console:
localStorage.clear(); // Reset achievements

// Or clear specific user:
localStorage.removeItem('achievements_[USER_ID]');
localStorage.removeItem('stats_[USER_ID]');
```

Then perform actions to unlock achievements:
1. Create a project → "Project Started" 🎯
2. Create 5 chapters → "Chapter One", then "Building Momentum" 🚀
3. Write 100+ words → "First Words" ✍️
4. Design a cover → "Cover Artist" 🎨
5. Use AI 10 times → "AI Explorer" 🤖
6. Export a book → "Published" 📤

## Future Enhancements

Possible additions:
- Writing streaks (daily writing achievements)
- Social sharing of achievements
- Achievement progress bars (show how close to next milestone)
- Rarity badges (common, rare, legendary achievements)
- Sound effects when unlocking achievements
- Achievement showcase on profile page
- Leaderboards (optional, privacy-respecting)

## Notes

- Achievement data stored in localStorage (per user)
- Survives page refresh
- Tracks cumulative stats (total words, chapters, etc.)
- Toast notifications use Sonner (already integrated)
- No database writes needed (all client-side)
- Works offline

Enjoy the new achievements system! 🎉
