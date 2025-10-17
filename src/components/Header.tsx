import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  House, 
  BookOpen, 
  Palette, 
  Gear, 
  User, 
  Bell,
  List,
  X,
  SignOut,
  Crown,
  CaretDown
} from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { AuthModal } from '@/components/AuthModal';
import { UsageTracker } from '@/components/UsageTracker';

interface HeaderProps {
  logoUrl?: string;
  logoText?: string;
  onNavigate?: (section: string) => void;
  currentSection?: string;
  notifications?: number;
}

export function Header({
  logoUrl,
  logoText = "Publishing Platform",
  onNavigate,
  currentSection = "dashboard",
  notifications = 0
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, userProfile, signOut } = useAuth();

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

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex h-16 lg:h-20 items-center justify-between">
          {/* Logo & Brand */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 lg:gap-4"
          >
            <button 
              onClick={() => onNavigate?.('dashboard')}
              className="flex items-center gap-3 lg:gap-4 hover:opacity-80 transition-opacity cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-xl"
              aria-label="Go to dashboard"
            >
              {logoUrl ? (
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl neomorph-flat overflow-hidden">
                  <img 
                    src={logoUrl} 
                    alt="Logo" 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl neomorph-flat flex items-center justify-center overflow-hidden">
                  <img 
                    src="/images/InkfluenceAILogo.png" 
                    alt="Inkfluence AI Logo" 
                    className="w-full h-full object-contain p-1"
                  />
                </div>
              )}
              
              <div className="hidden sm:block text-left">
                <h1 className="text-lg lg:text-xl font-bold text-foreground">
                  {logoText}
                </h1>
                <p className="text-xs lg:text-sm text-muted-foreground">
                  Create & Publish Professional Content
                </p>
              </div>
            </button>
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
            {user ? (
              <motion.div 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
                className="hidden sm:flex"
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 h-10 px-3 neomorph-button border-0 text-foreground hover:text-foreground"
                    >
                      <div className="w-6 h-6 rounded-full neomorph-flat flex items-center justify-center bg-primary/20">
                        <User size={14} className="text-primary" />
                      </div>
                      <span className="text-sm font-medium">
                        {user.displayName || user.email?.split('@')[0] || 'User'}
                      </span>
                      {userProfile?.isPremium && (
                        <Crown size={14} className="text-yellow-500" />
                      )}
                      <CaretDown size={12} className="text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user?.displayName || 'User'}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onNavigate?.('profile')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onNavigate?.('settings')}>
                      <Gear className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={signOut}
                      className="text-red-600 focus:text-red-600"
                    >
                      <SignOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            ) : (
              <AuthModal>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="default"
                    size="sm"
                    className="gap-2 h-10 px-4 neomorph-button border-0"
                  >
                    <User size={16} />
                    Sign In
                  </Button>
                </motion.div>
              </AuthModal>
            )}

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
                  {user ? (
                    <>
                      <div className="flex items-center gap-3 px-4 py-2">
                        <div className="w-8 h-8 rounded-full neomorph-flat flex items-center justify-center bg-primary/20">
                          <User size={16} className="text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground">
                              {user.displayName || user.email?.split('@')[0] || 'User'}
                            </p>
                            {userProfile?.isPremium && (
                              <Crown size={12} className="text-yellow-500" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {userProfile?.subscriptionStatus === 'premium' ? 'Premium User' : 'Free Trial'}
                          </p>
                        </div>
                      </div>
                      
                      {/* Usage Tracker in Mobile */}
                      <div className="px-4 py-2">
                        <UsageTracker className="mb-3" />
                      </div>
                      
                      {/* Mobile Profile and Sign Out Buttons */}
                      <div className="px-4 pb-2 space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            onNavigate?.('profile');
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full gap-2 neomorph-button border-0"
                        >
                          <User size={16} />
                          Profile
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleSignOut}
                          className="w-full gap-2 neomorph-button border-0 text-red-600 hover:text-red-700"
                        >
                          <SignOut size={16} />
                          Sign Out
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="px-4 py-2">
                      <AuthModal>
                        <Button
                          variant="default"
                          size="sm"
                          className="w-full gap-2 neomorph-button border-0"
                        >
                          <User size={16} />
                          Sign In
                        </Button>
                      </AuthModal>
                    </div>
                  )}
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
