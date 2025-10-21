interface PublicFooterProps {
  onNavigate?: (page: string) => void;
  showAboutLink?: boolean;
  showHelpLink?: boolean;
}

export function PublicFooter({ 
  onNavigate, 
  showAboutLink = true, 
  showHelpLink = true 
}: PublicFooterProps) {
  return (
    <footer className="border-t border-border/40 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            © 2025 Inkfluence AI • v1.0.0
          </div>
          <div className="flex gap-6 text-sm">
            {showAboutLink && (
              <button 
                onClick={() => onNavigate?.('about')} 
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                About
              </button>
            )}
            {showHelpLink && (
              <button 
                onClick={() => onNavigate?.('help')} 
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Help Center
              </button>
            )}
            <a 
              href="mailto:support@inkfluenceai.com" 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Contact
            </a>
            <span className="text-muted-foreground">
              Designed by Futurelab
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}