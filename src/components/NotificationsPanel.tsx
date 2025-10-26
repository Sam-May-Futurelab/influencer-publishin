import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, X, Check } from '@phosphor-icons/react';
import { useAchievements } from '@/hooks/use-achievements';
import { motion, AnimatePresence } from 'framer-motion';

export function NotificationsPanel() {
  const { achievements, unreadCount, markAsRead, markAllAsRead, deleteAchievement } = useAchievements();
  const [open, setOpen] = useState(false);

  // Sort by most recent first
  const sortedAchievements = [...achievements].sort((a, b) => b.unlockedAt - a.unlockedAt);

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <Bell size={20} weight={unreadCount > 0 ? 'fill' : 'regular'} />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              variant="destructive"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-[500px] overflow-y-auto">
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center gap-2">
            <Bell size={18} weight="bold" />
            <h3 className="font-semibold">Achievements</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} new
              </Badge>
            )}
          </div>
          {achievements.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-8 text-xs"
            >
              <Check size={16} className="mr-1" weight="bold" />
              Mark all read
            </Button>
          )}
        </div>

        <AnimatePresence mode="popLayout">
          {sortedAchievements.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell size={48} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium mb-1">No achievements yet</p>
              <p className="text-xs">Start writing to unlock achievements!</p>
            </div>
          ) : (
            sortedAchievements.map((achievement) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <DropdownMenuItem
                  className={`p-4 cursor-pointer ${!achievement.read ? 'bg-muted/50' : ''}`}
                  onSelect={(e) => {
                    e.preventDefault();
                    if (!achievement.read) {
                      markAsRead(achievement.id);
                    }
                  }}
                >
                  <div className="flex items-start gap-3 w-full">
                    <div className="text-3xl flex-shrink-0 mt-1">
                      {achievement.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-sm leading-tight">
                          {achievement.title}
                          {!achievement.read && (
                            <span className="ml-2 inline-block w-2 h-2 bg-primary rounded-full"></span>
                          )}
                        </h4>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 flex-shrink-0 -mt-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteAchievement(achievement.id);
                          }}
                        >
                          <X size={14} />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {achievement.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatTime(achievement.unlockedAt)}
                      </p>
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-0" />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
