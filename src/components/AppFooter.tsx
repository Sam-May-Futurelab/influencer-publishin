interface AppFooterProps {
  className?: string;
  onNavigateToPrivacy?: () => void;
  onNavigateToTerms?: () => void;
  onNavigateToCookies?: () => void;
  onNavigateToHelp?: () => void;
  onNavigateToAbout?: () => void;
}

export function AppFooter({ className = '', onNavigateToPrivacy, onNavigateToTerms, onNavigateToCookies, onNavigateToHelp, onNavigateToAbout }: AppFooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`bg-background border-t border-border py-6 mt-auto ${className}`}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          {/* Left: Copyright */}
          <div className="flex items-center gap-2">
            <span>© {currentYear} Inkfluence AI</span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline text-xs">v1.0.0</span>
          </div>

          {/* Center: Quick Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            <button 
              onClick={onNavigateToHelp}
              className="hover:text-foreground transition-colors"
            >
              Help Center
            </button>
            <button 
              onClick={onNavigateToAbout}
              className="hover:text-foreground transition-colors"
            >
              About
            </button>
            <button 
              onClick={onNavigateToPrivacy}
              className="hover:text-foreground transition-colors"
            >
              Privacy
            </button>
            <button 
              onClick={onNavigateToTerms}
              className="hover:text-foreground transition-colors"
            >
              Terms
            </button>
            <button 
              onClick={onNavigateToCookies}
              className="hover:text-foreground transition-colors"
            >
              Cookies
            </button>
            <a 
              href="mailto:support@inkfluenceai.com" 
              className="hover:text-foreground transition-colors"
            >
              Contact
            </a>
          </div>

          {/* Right: Designer Credit */}
          <div className="text-xs">
            Designed by{' '}
            <a 
              href="https://www.futurelab.solutions/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              Futurelab
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
