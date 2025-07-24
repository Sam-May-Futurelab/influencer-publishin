import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  House, 
  BookOpen, 
  Palette, 
  Gear, 
  User, 
  Bell,
  List,
  X
} from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface HeaderProps {
  logoUrl?: string;
  logoText?: string;
  onNavigate?: (section: string) => void;
  currentSection?: string;
  userAvatar?: string;
  userName?: string;
  notifications?: number;
}

export function Header({
  logoUrl,
  logoText = "Publishing Platform",
  onNavigate,
  currentSection = "dashboard",
  userAvatar,
  userName = "User",
  notifications = 0
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: House },
    { id: 'projects', label: 'Projects', icon: BookOpen },
    { id: 'templates', label: 'Templates', icon: Palette },
    { id: 'settings', label: 'Settings', icon: Gear },
  ];

  const handleNavigate = (section: string) => {
    onNavigate?.(section);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex h-16 lg:h-20 items-center justify-between">
          {/* Logo Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 lg:gap-4"
          >
            <div className="flex items-center gap-2 lg:gap-3">
              {logoUrl ? (
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl neomorph-flat overflow-hidden">
                  <img 
                    src={logoUrl} 
                    alt="Logo" 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl neomorph-flat flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                  <BookOpen size={20} className="lg:hidden text-primary" />
                  <BookOpen size={24} className="hidden lg:block text-primary" />
                </div>
              )}
              
              <div className="hidden sm:block">
                <h1 className="text-lg lg:text-xl font-bold text-foreground">
                  {logoText}
                </h1>
                <p className="text-xs lg:text-sm text-muted-foreground">
                  Create & Publish Professional Content
                </p>
              </div>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <motion.nav 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="hidden lg:flex items-center gap-2"
          >
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentSection === item.id;
              
              return (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleNavigate(item.id)}
                    className={cn(
                      "gap-2 h-10 px-4 neomorph-button border-0 text-sm transition-all",
                      isActive 
                        ? "bg-primary text-primary-foreground neomorph-inset" 
                        : "hover:bg-accent/50 text-foreground hover:text-foreground"
                    )}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </Button>
                </motion.div>
              );
            })}
          </motion.nav>

          {/* User Section */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 lg:gap-3"
          >
            {/* Notifications */}
            <motion.div 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 neomorph-button border-0 text-foreground hover:text-foreground"
              >
                <Bell size={18} />
                {notifications > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                  >
                    {notifications > 9 ? '9+' : notifications}
                  </Badge>
                )}
              </Button>
            </motion.div>

            {/* User Profile */}
            <motion.div 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              className="hidden sm:flex"
            >
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 h-10 px-3 neomorph-button border-0 text-foreground hover:text-foreground"
              >
                {userAvatar ? (
                  <div className="w-6 h-6 rounded-full overflow-hidden neomorph-flat">
                    <img 
                      src={userAvatar} 
                      alt={userName} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full neomorph-flat flex items-center justify-center bg-primary/20">
                    <User size={14} className="text-primary" />
                  </div>
                )}
                <span className="text-sm font-medium">{userName}</span>
              </Button>
            </motion.div>

            {/* Mobile Menu Toggle */}
            <motion.div 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              className="lg:hidden"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="h-10 w-10 p-0 neomorph-button border-0 text-foreground hover:text-foreground"
              >
                {isMobileMenuOpen ? <X size={18} /> : <List size={18} />}
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-border/40 mt-4 pt-4 pb-6"
            >
              <nav className="flex flex-col gap-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentSection === item.id;
                  
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        size="sm"
                        onClick={() => handleNavigate(item.id)}
                        className={cn(
                          "w-full justify-start gap-3 h-12 px-4 neomorph-button border-0",
                          isActive 
                            ? "bg-primary text-primary-foreground neomorph-inset" 
                            : "hover:bg-accent/50 text-foreground hover:text-foreground"
                        )}
                      >
                        <Icon size={18} />
                        <span className="text-base">{item.label}</span>
                      </Button>
                    </motion.div>
                  );
                })}
                
                {/* Mobile User Section */}
                <div className="mt-4 pt-4 border-t border-border/40">
                  <div className="flex items-center gap-3 px-4 py-2">
                    {userAvatar ? (
                      <div className="w-8 h-8 rounded-full overflow-hidden neomorph-flat">
                        <img 
                          src={userAvatar} 
                          alt={userName} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full neomorph-flat flex items-center justify-center bg-primary/20">
                        <User size={16} className="text-primary" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-foreground">{userName}</p>
                      <p className="text-xs text-muted-foreground">Signed in</p>
                    </div>
                  </div>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
