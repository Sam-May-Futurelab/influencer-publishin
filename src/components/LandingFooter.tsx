import { BookOpen, Twitter, Linkedin, Instagram, Github } from 'lucide-react';

interface LandingFooterProps {
  onNavigateToPrivacy?: () => void;
  onNavigateToTerms?: () => void;
  onNavigateToCookies?: () => void;
  onNavigateToHelp?: () => void;
  onNavigateToAbout?: () => void;
  onNavigateToPricing?: () => void;
  onNavigateToFeatures?: () => void;
  onNavigateToBlog?: () => void;
  onNavigateToContact?: () => void;
  onNavigateToTestimonials?: () => void;
  onNavigateToCaseStudies?: () => void;
  onNavigateToFAQ?: () => void;
}

export function LandingFooter({ 
  onNavigateToPrivacy, 
  onNavigateToTerms, 
  onNavigateToCookies, 
  onNavigateToHelp, 
  onNavigateToAbout,
  onNavigateToPricing,
  onNavigateToFeatures,
  onNavigateToBlog,
  onNavigateToContact,
  onNavigateToTestimonials,
  onNavigateToCaseStudies,
  onNavigateToFAQ
}: LandingFooterProps) {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <footer className="bg-[#2d1b3d] text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand Column */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-8 h-8" />
              <span className="text-2xl font-bold">Inkfluence AI</span>
            </div>
            <p className="text-gray-300 mb-6">
              AI-powered book writing platform helping authors bring their stories to life.
            </p>
            <div className="flex gap-4">
              <span className="text-gray-400 text-sm">Follow us (coming soon)</span>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-gray-300">
              {onNavigateToFeatures ? (
                <li><button onClick={onNavigateToFeatures} className="hover:text-white transition-colors">Features</button></li>
              ) : (
                <li><a href="#features" onClick={() => scrollToSection('features')} className="hover:text-white transition-colors cursor-pointer">Features</a></li>
              )}
              {onNavigateToPricing ? (
                <li><button onClick={onNavigateToPricing} className="hover:text-white transition-colors">Pricing</button></li>
              ) : (
                <li><a href="#pricing" onClick={() => scrollToSection('pricing')} className="hover:text-white transition-colors cursor-pointer">Pricing</a></li>
              )}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-gray-300">
              {onNavigateToBlog && (
                <li><button onClick={onNavigateToBlog} className="hover:text-white transition-colors">Blog</button></li>
              )}
              {onNavigateToHelp && (
                <li><button onClick={onNavigateToHelp} className="hover:text-white transition-colors">Help Center</button></li>
              )}
              {onNavigateToFAQ && (
                <li><button onClick={onNavigateToFAQ} className="hover:text-white transition-colors">FAQ</button></li>
              )}
              {onNavigateToTestimonials && (
                <li><button onClick={onNavigateToTestimonials} className="hover:text-white transition-colors">Testimonials</button></li>
              )}
              {onNavigateToCaseStudies && (
                <li><button onClick={onNavigateToCaseStudies} className="hover:text-white transition-colors">Case Studies</button></li>
              )}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-gray-300">
              {onNavigateToAbout && (
                <li><button onClick={onNavigateToAbout} className="hover:text-white transition-colors">About</button></li>
              )}
              {onNavigateToContact && (
                <li><button onClick={onNavigateToContact} className="hover:text-white transition-colors">Contact</button></li>
              )}
              {onNavigateToPrivacy && (
                <li><button onClick={onNavigateToPrivacy} className="hover:text-white transition-colors">Privacy</button></li>
              )}
              {onNavigateToTerms && (
                <li><button onClick={onNavigateToTerms} className="hover:text-white transition-colors">Terms</button></li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
            <p className="text-gray-400 text-sm">
              © 2025 Inkfluence AI. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-gray-400">
              {onNavigateToPrivacy && (
                <button 
                  onClick={onNavigateToPrivacy}
                  className="hover:text-white transition-colors"
                >
                  Privacy Policy
                </button>
              )}
              {onNavigateToTerms && (
                <button 
                  onClick={onNavigateToTerms}
                  className="hover:text-white transition-colors"
                >
                  Terms of Service
                </button>
              )}
              {onNavigateToCookies && (
                <button 
                  onClick={onNavigateToCookies}
                  className="hover:text-white transition-colors"
                >
                  Cookie Policy
                </button>
              )}
            </div>
          </div>
          <div className="text-center text-gray-400 text-sm pt-4 border-t border-gray-700">
            <p className="mb-2">
              This site is protected by reCAPTCHA and the Google{' '}
              <a 
                href="https://policies.google.com/privacy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#b89ed6] hover:text-[#9b87b8] transition-colors underline"
              >
                Privacy Policy
              </a>
              {' '}and{' '}
              <a 
                href="https://policies.google.com/terms" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#b89ed6] hover:text-[#9b87b8] transition-colors underline"
              >
                Terms of Service
              </a>
              {' '}apply.
            </p>
            <p>
              Designed by{' '}
              <a 
                href="https://www.futurelab.solutions/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#b89ed6] hover:text-[#9b87b8] transition-colors font-medium"
              >
                Futurelab
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}