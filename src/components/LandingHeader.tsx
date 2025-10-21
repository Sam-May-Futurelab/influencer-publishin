import { Button } from '@/components/ui/button';
import { BookOpen, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface LandingHeaderProps {
  onGetStarted?: () => void;
  onSignIn?: () => void;
  scrollToSection?: (sectionId: string) => void;
  showNavLinks?: boolean;
  isAuthenticated?: boolean;
}

export function LandingHeader({ 
  onGetStarted, 
  onSignIn, 
  scrollToSection, 
  showNavLinks = true,
  isAuthenticated = false
}: LandingHeaderProps) {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#e2d1f0] shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => navigate('/')}
        >
          <BookOpen className="w-8 h-8 text-[#9b87b8]" />
          <span className="text-2xl font-bold bg-gradient-to-r from-[#9b87b8] to-[#b89ed6] bg-clip-text text-transparent">
            Inkfluence AI
          </span>
        </div>
        
        {/* Desktop Navigation Links */}
        {showNavLinks && (
          <div className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => navigate('/pricing')}
              className="text-gray-600 hover:text-[#9b87b8] transition-colors font-medium"
            >
              Pricing
            </button>
            <button 
              onClick={() => navigate('/about')}
              className="text-gray-600 hover:text-[#9b87b8] transition-colors font-medium"
            >
              About
            </button>
            <button 
              onClick={() => navigate('/help')}
              className="text-gray-600 hover:text-[#9b87b8] transition-colors font-medium"
            >
              Help
            </button>
          </div>
        )}
        
        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
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

        {/* Mobile Menu Button */}
        {showNavLinks && (
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-600" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600" />
            )}
          </button>
        )}
      </div>

      {/* Mobile Sidebar Menu */}
      {showNavLinks && (
        <div className={`md:hidden fixed inset-0 z-50 transition-all duration-300 ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}>
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Sidebar */}
          <div className={`absolute right-0 top-0 h-full w-80 bg-white shadow-2xl shadow-black/10 transform transition-transform duration-300 ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}>
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-[#9b87b8]" />
                  <span className="text-lg font-bold bg-gradient-to-r from-[#9b87b8] to-[#b89ed6] bg-clip-text text-transparent">
                    Inkfluence AI
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="space-y-4 mb-8">
                <button
                  onClick={() => {
                    navigate('/pricing');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 text-gray-700 hover:text-[#9b87b8] hover:bg-gray-50 rounded-lg transition-colors font-medium"
                >
                  Pricing
                </button>
                <button
                  onClick={() => {
                    navigate('/about');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 text-gray-700 hover:text-[#9b87b8] hover:bg-gray-50 rounded-lg transition-colors font-medium"
                >
                  About
                </button>
                <button
                  onClick={() => {
                    navigate('/help');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 text-gray-700 hover:text-[#9b87b8] hover:bg-gray-50 rounded-lg transition-colors font-medium"
                >
                  Help
                </button>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {onSignIn && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      onSignIn();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full justify-center h-12 text-gray-700 hover:text-[#9b87b8] hover:bg-gray-50"
                  >
                    Sign In
                  </Button>
                )}
                {onGetStarted && (
                  <Button
                    onClick={() => {
                      onGetStarted();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full justify-center h-12 bg-gradient-to-r from-[#9b87b8] to-[#b89ed6] hover:opacity-90 shadow-md hover:shadow-lg transition-all text-white"
                  >
                    Get Started Free
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}