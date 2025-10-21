import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';

interface LandingHeaderProps {
  onGetStarted?: () => void;
  onSignIn?: () => void;
  onNavigateToAbout?: () => void;
  onNavigateToHelp?: () => void;
  scrollToSection?: (sectionId: string) => void;
  showNavLinks?: boolean;
}

export function LandingHeader({ 
  onGetStarted, 
  onSignIn, 
  onNavigateToAbout,
  onNavigateToHelp,
  scrollToSection, 
  showNavLinks = true 
}: LandingHeaderProps) {
  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#e2d1f0] shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-8 h-8 text-[#9b87b8]" />
          <span className="text-2xl font-bold bg-gradient-to-r from-[#9b87b8] to-[#b89ed6] bg-clip-text text-transparent">
            Inkfluence AI
          </span>
        </div>
        
        {/* Desktop Navigation Links */}
        {showNavLinks && (
          <div className="hidden md:flex items-center gap-6">
            {scrollToSection && (
              <>
                <button 
                  onClick={() => scrollToSection('features')}
                  className="text-gray-600 hover:text-[#9b87b8] transition-colors font-medium"
                >
                  Features
                </button>
                <button 
                  onClick={() => scrollToSection('pricing')}
                  className="text-gray-600 hover:text-[#9b87b8] transition-colors font-medium"
                >
                  Pricing
                </button>
                <button 
                  onClick={() => scrollToSection('faq')}
                  className="text-gray-600 hover:text-[#9b87b8] transition-colors font-medium"
                >
                  FAQ
                </button>
              </>
            )}
            {onNavigateToAbout && (
              <button 
                onClick={onNavigateToAbout}
                className="text-gray-600 hover:text-[#9b87b8] transition-colors font-medium"
              >
                About
              </button>
            )}
            {onNavigateToHelp && (
              <button 
                onClick={onNavigateToHelp}
                className="text-gray-600 hover:text-[#9b87b8] transition-colors font-medium"
              >
                Help
              </button>
            )}
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {onSignIn && (
            <Button 
              variant="ghost" 
              onClick={onSignIn}
              className="hidden sm:inline-flex"
            >
              Sign In
            </Button>
          )}
          {onGetStarted && (
            <Button 
              onClick={onGetStarted}
              className="bg-gradient-to-r from-[#9b87b8] to-[#b89ed6] hover:opacity-90 shadow-md hover:shadow-lg transition-all"
            >
              Get Started Free
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}