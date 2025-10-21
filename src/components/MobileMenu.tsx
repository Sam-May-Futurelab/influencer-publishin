import React from 'react';
import { X, BookOpen } from 'lucide-react';
import { Button } from './ui/button';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToFeatures?: () => void;
  onNavigateToPricing?: () => void;
  onNavigateToBlog?: () => void;
  onSignIn?: () => void;
  onGetStarted?: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  onNavigateToFeatures,
  onNavigateToPricing,
  onNavigateToBlog,
  onSignIn,
  onGetStarted,
}) => {
  if (!isOpen) return null;

  const handleNavigation = (callback?: () => void) => {
    if (callback) callback();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50" 
        onClick={onClose}
      />
      
      {/* Menu Panel */}
      <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
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
          <div className="flex-1 p-6">
            <nav className="space-y-4">
              {onNavigateToFeatures && (
                <button
                  onClick={() => handleNavigation(onNavigateToFeatures)}
                  className="w-full text-left px-4 py-3 text-gray-800 hover:text-[#9b87b8] hover:bg-gray-50 rounded-lg transition-colors font-medium"
                >
                  Features
                </button>
              )}
              
              {onNavigateToPricing && (
                <button
                  onClick={() => handleNavigation(onNavigateToPricing)}
                  className="w-full text-left px-4 py-3 text-gray-800 hover:text-[#9b87b8] hover:bg-gray-50 rounded-lg transition-colors font-medium"
                >
                  Pricing
                </button>
              )}
              
              {onNavigateToBlog && (
                <button
                  onClick={() => handleNavigation(onNavigateToBlog)}
                  className="w-full text-left px-4 py-3 text-gray-800 hover:text-[#9b87b8] hover:bg-gray-50 rounded-lg transition-colors font-medium"
                >
                  Blog
                </button>
              )}

              <button
                onClick={() => handleNavigation(() => window.location.href = '/about')}
                className="w-full text-left px-4 py-3 text-gray-800 hover:text-[#9b87b8] hover:bg-gray-50 rounded-lg transition-colors font-medium"
              >
                About
              </button>

              <button
                onClick={() => handleNavigation(() => window.location.href = '/help')}
                className="w-full text-left px-4 py-3 text-gray-800 hover:text-[#9b87b8] hover:bg-gray-50 rounded-lg transition-colors font-medium"
              >
                Help
              </button>
            </nav>
          </div>

          {/* Action Buttons */}
          <div className="p-6 border-t border-gray-200 space-y-3">
            {onSignIn && (
              <Button 
                variant="outline" 
                onClick={() => handleNavigation(onSignIn)}
                className="w-full"
              >
                Sign In
              </Button>
            )}
            {onGetStarted && (
              <Button 
                onClick={() => handleNavigation(onGetStarted)}
                className="w-full bg-gradient-to-r from-[#9b87b8] to-[#b89ed6] hover:opacity-90"
              >
                Get Started Free
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};