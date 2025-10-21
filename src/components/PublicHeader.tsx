import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface PublicHeaderProps {
  logoText?: string;
  onNavigate?: (page: string) => void;
  isAuthenticated?: boolean;
  showGetStarted?: boolean;
}

export function PublicHeader({
  logoText = "Inkfluence AI",
  onNavigate,
  isAuthenticated = false,
  showGetStarted = true
}: PublicHeaderProps) {
  return (
    <header className="border-b border-border/40 bg-background/95 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => onNavigate?.('landing')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {logoText}
            </span>
          </div>
          {showGetStarted && (
            <Button onClick={() => onNavigate?.(isAuthenticated ? 'dashboard' : 'landing')}>
              {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}