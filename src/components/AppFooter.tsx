interface AppFooterProps {
  className?: string;
}

export function AppFooter({ className = '' }: AppFooterProps) {
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
            <a 
              href="#" 
              className="hover:text-foreground transition-colors"
            >
              Help Center
            </a>
            <a 
              href="#" 
              className="hover:text-foreground transition-colors"
            >
              Privacy
            </a>
            <a 
              href="#" 
              className="hover:text-foreground transition-colors"
            >
              Terms
            </a>
            <a 
              href="#" 
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
              Future Lab Solutions
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
