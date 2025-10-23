import React from 'react';
import { X, BookOpen } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSignIn?: () => void;
  onGetStarted?: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  onSignIn,
  onGetStarted,
}) => {
  const navigate = useNavigate();
  
  if (!isOpen) return null;

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={onClose}
      />
      
      {/* Menu Panel */}
      <div 
        className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white flex-shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#9b87b8]" />
            <span className="text-lg font-bold bg-gradient-to-r from-[#9b87b8] to-[#b89ed6] bg-clip-text text-transparent">
              Inkfluence AI
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
            <nav className="space-y-3">
              <button
                onClick={() => handleNavigation('/features')}
                className="w-full text-left px-5 py-4 text-gray-800 hover:text-[#9b87b8] hover:bg-[#9b87b8]/5 rounded-xl transition-colors font-medium"
              >
                Features
              </button>
              
              <button
                onClick={() => handleNavigation('/pricing')}
                className="w-full text-left px-5 py-4 text-gray-800 hover:text-[#9b87b8] hover:bg-[#9b87b8]/5 rounded-xl transition-colors font-medium"
              >
                Pricing
              </button>

              {/* Resources Section */}
              <div className="pt-3">
                <div className="px-5 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Resources
                </div>
                <div className="space-y-2 mt-1">
                  <button
                    onClick={() => handleNavigation('/blog')}
                    className="w-full text-left px-5 py-3 text-gray-800 hover:text-[#9b87b8] hover:bg-[#9b87b8]/5 rounded-xl transition-colors"
                  >
                    Blog
                  </button>

                  <button
                    onClick={() => handleNavigation('/help')}
                    className="w-full text-left px-5 py-3 text-gray-800 hover:text-[#9b87b8] hover:bg-[#9b87b8]/5 rounded-xl transition-colors"
                  >
                    Help Center
                  </button>

                  <button
                    onClick={() => handleNavigation('/faq')}
                    className="w-full text-left px-5 py-3 text-gray-800 hover:text-[#9b87b8] hover:bg-[#9b87b8]/5 rounded-xl transition-colors"
                  >
                    FAQ
                  </button>

                  <button
                    onClick={() => handleNavigation('/testimonials')}
                    className="w-full text-left px-5 py-3 text-gray-800 hover:text-[#9b87b8] hover:bg-[#9b87b8]/5 rounded-xl transition-colors"
                  >
                    Testimonials
                  </button>

                  <button
                    onClick={() => handleNavigation('/case-studies')}
                    className="w-full text-left px-5 py-3 text-gray-800 hover:text-[#9b87b8] hover:bg-[#9b87b8]/5 rounded-xl transition-colors"
                  >
                    Case Studies
                  </button>
                </div>
              </div>

              <button
                onClick={() => handleNavigation('/about')}
                className="w-full text-left px-5 py-4 text-gray-800 hover:text-[#9b87b8] hover:bg-[#9b87b8]/5 rounded-xl transition-colors font-medium"
              >
                About
              </button>
            </nav>
          </div>

        {/* Action Buttons */}
        <div className="p-6 border-t border-gray-100 bg-white flex-shrink-0 space-y-3">
          {onSignIn && (
            <Button 
              variant="outline" 
              onClick={() => {
                onSignIn();
                onClose();
              }}
              className="w-full"
            >
              Sign In
            </Button>
          )}
          {onGetStarted && (
            <Button 
              onClick={() => {
                onGetStarted();
                onClose();
              }}
              className="w-full bg-gradient-to-r from-[#9b87b8] to-[#b89ed6] hover:opacity-90"
            >
              Get Started Free
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};