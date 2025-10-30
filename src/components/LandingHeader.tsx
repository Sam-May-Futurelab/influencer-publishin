import { Button } from '@/components/ui/button';
import { BookOpen, Menu, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { MobileMenu } from './MobileMenu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface LandingHeaderProps {
  onGetStarted?: () => void;
  onSignIn?: () => void;
  scrollToSection?: (sectionId: string) => void;
  showNavLinks?: boolean;
  isAuthenticated?: boolean;
  onNavigateToPricing?: () => void;
  onNavigateToFeatures?: () => void;
  onNavigateToBlog?: () => void;
}

export function LandingHeader({ 
  onGetStarted, 
  onSignIn, 
  scrollToSection, 
  showNavLinks = true,
  isAuthenticated = false,
  onNavigateToPricing,
  onNavigateToFeatures,
  onNavigateToBlog
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
              onClick={onNavigateToFeatures || (() => navigate('/features'))}
              className="text-gray-600 hover:text-[#9b87b8] transition-colors font-medium"
            >
              Features
            </button>
            <button 
              onClick={onNavigateToPricing || (() => navigate('/pricing'))}
              className="text-gray-600 hover:text-[#9b87b8] transition-colors font-medium"
            >
              Pricing
            </button>
            <button 
              onClick={() => navigate('/try-free')}
              className="text-[#9b87b8] hover:text-[#7a5f96] transition-colors font-semibold"
            >
              Try Free
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger className="text-gray-600 hover:text-[#9b87b8] transition-colors font-medium flex items-center gap-1">
                Resources
                <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={onNavigateToBlog || (() => navigate('/blog'))}>
                  Blog
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/help')}>
                  Help Center
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/faq')}>
                  FAQ
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/testimonials')}>
                  Testimonials
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/case-studies')}>
                  Case Studies
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <button 
              onClick={() => navigate('/about')}
              className="text-gray-600 hover:text-[#9b87b8] transition-colors font-medium"
            >
              About
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
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
        )}
      </div>

      {/* Mobile Menu Component */}
      {showNavLinks && (
        <MobileMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          onSignIn={onSignIn}
          onGetStarted={onGetStarted}
        />
      )}
    </nav>
  );
}