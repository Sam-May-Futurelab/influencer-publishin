import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MagnifyingGlass, 
  Plus, 
  Trash, 
  Copy, 
  BookmarkSimple,
  Sparkle,
  Quotes,
  SignOut as ExitIcon,
  Lightbulb,
  ArrowsLeftRight,
  ArrowClockwise,
  Eye,
  Star,
  CopySimple
} from '@phosphor-icons/react';
import { useAuth } from '@/hooks/use-auth';
import { getUserSnippets, deleteSnippet, updateSnippet, saveSnippet } from '@/lib/snippets';
import { ContentSnippet } from '@/lib/types';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const categoryConfig = {
  intro: { label: 'Intros', icon: Sparkle, color: 'bg-blue-100 text-blue-800' },
  conclusion: { label: 'Conclusions', icon: ExitIcon, color: 'bg-purple-100 text-purple-800' },
  cta: { label: 'CTAs', icon: ArrowsLeftRight, color: 'bg-green-100 text-green-800' },
  tip: { label: 'Tips', icon: Lightbulb, color: 'bg-yellow-100 text-yellow-800' },
  quote: { label: 'Quotes', icon: Quotes, color: 'bg-pink-100 text-pink-800' },
  transition: { label: 'Transitions', icon: ArrowsLeftRight, color: 'bg-indigo-100 text-indigo-800' },
  other: { label: 'Other', icon: BookmarkSimple, color: 'bg-gray-100 text-gray-800' },
};

export function SnippetsPage() {
  const { user } = useAuth();
  const [snippets, setSnippets] = useState<ContentSnippet[]>([]);
  const [filteredSnippets, setFilteredSnippets] = useState<ContentSnippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [snippetToDelete, setSnippetToDelete] = useState<ContentSnippet | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [previewSnippet, setPreviewSnippet] = useState<ContentSnippet | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newSnippet, setNewSnippet] = useState({
    title: '',
    content: '',
    category: 'other' as ContentSnippet['category'],
    tags: [] as string[]
  });

  useEffect(() => {
    loadSnippets();
  }, [user]);

  useEffect(() => {
    filterSnippets();
  }, [snippets, searchQuery, selectedCategory]);

  const loadSnippets = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const userSnippets = await getUserSnippets(user.uid);
      setSnippets(userSnippets);
    } catch (error) {
      console.error('Error loading snippets:', error);
      toast.error('Failed to load snippets');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSnippets();
    setRefreshing(false);
    toast.success('Snippets refreshed!');
  };

  const filterSnippets = () => {
    let filtered = snippets;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(s => s.category === selectedCategory);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s =>
        s.title.toLowerCase().includes(query) ||
        s.content.toLowerCase().includes(query) ||
        s.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Sort: favorites first, then by updated date
    filtered = filtered.sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    setFilteredSnippets(filtered);
  };

  const toggleFavorite = async (snippet: ContentSnippet) => {
    if (!user) return;

    const updatedSnippet = {
      ...snippet,
      isFavorite: !snippet.isFavorite,
      updatedAt: new Date(),
    };

    try {
      await updateSnippet(snippet.id, { isFavorite: !snippet.isFavorite });
      setSnippets(currentSnippets =>
        currentSnippets.map(s => s.id === snippet.id ? updatedSnippet : s)
      );
      toast.success(updatedSnippet.isFavorite ? 'Added to favorites' : 'Removed from favorites');
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorite');
    }
  };

  const handleDeleteSnippet = async () => {
    if (!snippetToDelete) return;

    try {
      await deleteSnippet(snippetToDelete.id);
      setSnippets(snippets.filter(s => s.id !== snippetToDelete.id));
      toast.success('Snippet deleted');
      setSnippetToDelete(null);
    } catch (error) {
      toast.error('Failed to delete snippet');
    }
  };

  const handleCopySnippet = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Copied to clipboard!');
  };

  const handleCreateSnippet = async () => {
    if (!user) return;
    if (!newSnippet.title.trim() || !newSnippet.content.trim()) {
      toast.error('Please provide a title and content');
      return;
    }

    try {
      const snippetData = {
        title: newSnippet.title.trim(),
        content: newSnippet.content.trim(),
        category: newSnippet.category,
        tags: newSnippet.tags,
      };

      const savedSnippet = await saveSnippet(user.uid, snippetData);
      setSnippets([savedSnippet, ...snippets]);
      toast.success('Snippet created successfully!');
      setShowCreateDialog(false);
      setNewSnippet({
        title: '',
        content: '',
        category: 'other',
        tags: []
      });
    } catch (error) {
      console.error('Error creating snippet:', error);
      toast.error('Failed to create snippet');
    }
  };

  const handleDuplicateSnippet = async (snippet: ContentSnippet) => {
    if (!user) return;

    try {
      const duplicatedSnippet = {
        title: `${snippet.title} (Copy)`,
        content: snippet.content,
        category: snippet.category,
        tags: snippet.tags || [],
      };

      await saveSnippet(user.uid, duplicatedSnippet);
      await loadSnippets(); // Refresh the list
      toast.success('Snippet duplicated!');
    } catch (error) {
      toast.error('Failed to duplicate snippet');
    }
  };

  const getCategoryStats = () => {
    const stats: Record<string, number> = { all: snippets.length };
    snippets.forEach(snippet => {
      stats[snippet.category] = (stats[snippet.category] || 0) + 1;
    });
    return stats;
  };

  const categoryStats = getCategoryStats();

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl lg:text-4xl font-bold">My Snippets</h1>
          <p className="text-muted-foreground text-sm lg:text-base mt-2">
            Save and reuse your best content blocks
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            className="neomorph-button border-0 gap-2"
            title="Refresh snippets"
          >
            <motion.div
              animate={refreshing ? { rotate: 360 } : {}}
              transition={refreshing ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
            >
              <ArrowClockwise size={16} weight="bold" />
            </motion.div>
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button 
            className="neomorph-button border-0 gap-2"
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus size={16} weight="bold" />
            <span className="hidden sm:inline">Create Snippet</span>
          </Button>
        </div>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col lg:flex-row gap-4"
      >
        {/* Search */}
        <div className="relative flex-1 lg:max-w-md">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search snippets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 neomorph-inset border-0 text-sm"
          />
        </div>

        {/* Category Filter */}
        <div className="flex rounded-lg neomorph-inset p-1 overflow-x-auto">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
            className="h-8 px-3 text-xs whitespace-nowrap"
          >
            All ({categoryStats.all || 0})
          </Button>
          {Object.entries(categoryConfig).map(([key, config]) => {
            const count = categoryStats[key] || 0;
            if (count === 0 && selectedCategory !== key) return null;
            
            return (
              <Button
                key={key}
                variant={selectedCategory === key ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedCategory(key)}
                className="h-8 px-3 text-xs whitespace-nowrap"
              >
                {config.label} ({count})
              </Button>
            );
          })}
        </div>
      </motion.div>

      {/* Snippets Grid */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          <div className="animate-pulse">Loading snippets...</div>
        </div>
      ) : filteredSnippets.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <BookmarkSimple size={64} className="mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">
            {searchQuery || selectedCategory !== 'all' ? 'No snippets found' : 'No snippets yet'}
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {searchQuery || selectedCategory !== 'all'
              ? 'Try adjusting your search or filter'
              : 'Save reusable content blocks from your chapter editor'}
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredSnippets.map((snippet, index) => {
              const config = categoryConfig[snippet.category];
              const Icon = config.icon;
              
              return (
                <motion.div
                  key={snippet.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="neomorph-flat border-0 hover:neomorph-raised transition-all group">
                    <CardContent className="p-4 space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Icon size={18} className="text-primary flex-shrink-0" />
                          <h3 className="font-semibold text-base truncate">{snippet.title}</h3>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(snippet);
                            }}
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            title={snippet.isFavorite ? "Remove from favorites" : "Add to favorites"}
                          >
                            <Star 
                              size={16} 
                              weight={snippet.isFavorite ? "fill" : "regular"}
                              className={snippet.isFavorite ? "text-amber-500" : ""}
                            />
                          </Button>
                        </div>
                        <Badge className={`${config.color} text-xs px-2 py-0.5 flex-shrink-0`}>
                          {config.label}
                        </Badge>
                      </div>

                      {/* Content Preview */}
                      <p className="text-sm text-muted-foreground line-clamp-4 leading-relaxed min-h-[5rem]">
                        {snippet.content}
                      </p>

                      {/* Tags */}
                      {snippet.tags && snippet.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {snippet.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs px-2 py-0.5">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Actions - Always Visible */}
                      <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPreviewSnippet(snippet)}
                          className="h-8 gap-2 text-xs flex-1 neomorph-button border-0"
                        >
                          <Eye size={14} weight="bold" />
                          Preview
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopySnippet(snippet.content)}
                          className="h-8 gap-1 text-xs neomorph-button border-0"
                          title="Copy text to clipboard"
                        >
                          <Copy size={14} weight="bold" />
                          Copy Text
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDuplicateSnippet(snippet)}
                          className="h-8 gap-1 text-xs neomorph-button border-0"
                          title="Create a duplicate of this snippet"
                        >
                          <CopySimple size={14} weight="bold" />
                          Duplicate
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSnippetToDelete(snippet)}
                          className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                          title="Delete snippet"
                        >
                          <Trash size={14} weight="bold" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!snippetToDelete} onOpenChange={() => setSnippetToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Snippet</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{snippetToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSnippet}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewSnippet} onOpenChange={() => setPreviewSnippet(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <div className="flex items-start gap-3 pr-8">
              {previewSnippet && (() => {
                const config = categoryConfig[previewSnippet.category];
                const Icon = config.icon;
                return (
                  <>
                    <Icon size={24} className="text-primary flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <DialogTitle className="text-lg mb-2">{previewSnippet.title}</DialogTitle>
                      <Badge className={`${config.color} text-xs`}>
                        {config.label}
                      </Badge>
                    </div>
                  </>
                );
              })()}
            </div>
            <DialogDescription>
              {previewSnippet?.tags && previewSnippet.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {previewSnippet.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="p-4 rounded-lg bg-muted/50 neomorph-inset">
              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                {previewSnippet?.content}
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                if (previewSnippet) {
                  handleCopySnippet(previewSnippet.content);
                }
              }}
              className="neomorph-button border-0 gap-2"
            >
              <Copy size={16} />
              Copy to Clipboard
            </Button>
            <Button
              onClick={() => setPreviewSnippet(null)}
              className="neomorph-button border-0"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Snippet Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Snippet</DialogTitle>
            <DialogDescription>
              Save reusable content blocks to use across your projects
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                placeholder="e.g., Call to Action Template"
                value={newSnippet.title}
                onChange={(e) => setNewSnippet({ ...newSnippet, title: e.target.value })}
                className="neomorph-inset border-0"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.entries(categoryConfig).map(([key, config]) => {
                  const Icon = config.icon;
                  return (
                    <Button
                      key={key}
                      variant={newSnippet.category === key ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setNewSnippet({ ...newSnippet, category: key as ContentSnippet['category'] })}
                      className="gap-2 justify-start"
                    >
                      <Icon size={14} />
                      <span className="text-xs">{config.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Content</label>
              <textarea
                placeholder="Enter your snippet content..."
                value={newSnippet.content}
                onChange={(e) => setNewSnippet({ ...newSnippet, content: e.target.value })}
                className="w-full min-h-[200px] p-3 rounded-lg neomorph-inset border-0 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tags (optional)</label>
              <Input
                placeholder="Enter tags separated by commas"
                onChange={(e) => {
                  const tags = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
                  setNewSnippet({ ...newSnippet, tags });
                }}
                className="neomorph-inset border-0"
              />
              <p className="text-xs text-muted-foreground">
                Separate tags with commas (e.g., sales, email, persuasive)
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                setNewSnippet({
                  title: '',
                  content: '',
                  category: 'other',
                  tags: []
                });
              }}
              className="neomorph-button border-0"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateSnippet}
              disabled={!newSnippet.title.trim() || !newSnippet.content.trim()}
              className="neomorph-button border-0 gap-2"
            >
              <Plus size={16} weight="bold" />
              Create Snippet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
