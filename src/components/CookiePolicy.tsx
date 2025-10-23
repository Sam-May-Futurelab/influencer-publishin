import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { LandingHeader } from './LandingHeader';
import { LandingFooter } from './LandingFooter';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';

export function CookiePolicy() {
  const navigate = useNavigate();
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-background">
      <LandingHeader 
        onSignIn={() => navigate('/?signin=true')}
        onGetStarted={() => navigate(user ? '/app/dashboard' : '/?signin=true')}
        showNavLinks={true}
        isAuthenticated={!!user}
        onNavigateToFeatures={() => navigate('/features')}
        onNavigateToPricing={() => navigate('/pricing')}
        onNavigateToBlog={() => navigate('/blog')}
      />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 w-4 h-4" />
          Back
        </Button>

        <div className="prose prose-gray max-w-none">
          <h1 className="text-4xl font-bold mb-8">Cookie Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: October 20, 2025</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. What Are Cookies?</h2>
            <p>
              Cookies are small text files that are placed on your computer or mobile device when you visit a website. 
              They are widely used to make websites work more efficiently and provide information to website owners.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. How We Use Cookies</h2>
            <p className="mb-4">
              Inkfluence AI uses cookies and similar technologies to:
            </p>
            <ul className="list-disc pl-6">
              <li>Keep you signed in to your account</li>
              <li>Remember your preferences and settings</li>
              <li>Understand how you use our service</li>
              <li>Improve our service and user experience</li>
              <li>Provide security and prevent fraud</li>
              <li>Analyze performance and traffic patterns</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Types of Cookies We Use</h2>

            <h3 className="text-xl font-semibold mb-3">3.1 Essential Cookies</h3>
            <p className="mb-4">
              These cookies are necessary for the website to function and cannot be switched off. They include:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Authentication:</strong> Keep you logged in to your account</li>
              <li><strong>Security:</strong> Protect against fraudulent activity</li>
              <li><strong>Session Management:</strong> Remember your actions during a session</li>
            </ul>
            <p className="text-sm text-muted-foreground mb-4">
              <strong>Provider:</strong> Firebase Authentication<br />
              <strong>Duration:</strong> Session or up to 2 weeks<br />
              <strong>Purpose:</strong> Authentication and security
            </p>

            <h3 className="text-xl font-semibold mb-3">3.2 Functional Cookies</h3>
            <p className="mb-4">
              These cookies enable enhanced functionality and personalization:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Preferences:</strong> Remember your settings (theme, language, etc.)</li>
              <li><strong>UI State:</strong> Remember sidebar state, view modes, etc.</li>
              <li><strong>Recent Projects:</strong> Quick access to recently used projects</li>
            </ul>
            <p className="text-sm text-muted-foreground mb-4">
              <strong>Provider:</strong> Local Storage (First-party)<br />
              <strong>Duration:</strong> Persistent until cleared<br />
              <strong>Purpose:</strong> User experience and personalization
            </p>

            <h3 className="text-xl font-semibold mb-3">3.3 Analytics Cookies</h3>
            <p className="mb-4">
              These cookies help us understand how visitors use our website:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Usage Analytics:</strong> Pages visited, features used, session duration</li>
              <li><strong>Performance:</strong> Load times, errors, and technical issues</li>
              <li><strong>User Flow:</strong> How users navigate through the app</li>
            </ul>
            <p className="text-sm text-muted-foreground mb-4">
              <strong>Provider:</strong> Google Analytics (if enabled)<br />
              <strong>Duration:</strong> Up to 2 years<br />
              <strong>Purpose:</strong> Website analytics and improvements
            </p>

            <h3 className="text-xl font-semibold mb-3">3.4 Payment Cookies</h3>
            <p className="mb-4">
              These cookies are used to process payments securely:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Stripe:</strong> Secure payment processing</li>
              <li><strong>Fraud Detection:</strong> Protect against fraudulent transactions</li>
            </ul>
            <p className="text-sm text-muted-foreground mb-4">
              <strong>Provider:</strong> Stripe<br />
              <strong>Duration:</strong> Session<br />
              <strong>Purpose:</strong> Payment processing and security
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Third-Party Cookies</h2>
            <p className="mb-4">
              We use the following third-party services that may set cookies:
            </p>
            
            <h3 className="text-xl font-semibold mb-3">4.1 Firebase/Google</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Authentication and user management</li>
              <li>Cloud database and storage</li>
              <li>Analytics (if enabled)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">4.2 Stripe</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Payment processing</li>
              <li>Fraud detection</li>
              <li>PCI compliance</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">4.3 OpenAI</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>AI content generation (API calls only, no cookies)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Cookie Duration</h2>
            
            <h3 className="text-xl font-semibold mb-3">5.1 Session Cookies</h3>
            <p>
              Temporary cookies that expire when you close your browser. Used for authentication and security.
            </p>

            <h3 className="text-xl font-semibold mb-3">5.2 Persistent Cookies</h3>
            <p>
              Remain on your device for a set period or until manually deleted. Used for preferences and analytics.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Managing Cookies</h2>
            
            <h3 className="text-xl font-semibold mb-3">6.1 Browser Settings</h3>
            <p className="mb-4">
              You can control cookies through your browser settings:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies</li>
              <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies</li>
              <li><strong>Safari:</strong> Preferences → Privacy → Cookies</li>
              <li><strong>Edge:</strong> Settings → Privacy → Cookies</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">6.2 Opt-Out Links</h3>
            <ul className="list-disc pl-6 mb-4">
              <li><a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Analytics Opt-out</a></li>
              <li><a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DAA Opt-out</a></li>
              <li><a href="https://www.youronlinechoices.eu/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">EDAA Opt-out (EU)</a></li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">6.3 Impact of Disabling Cookies</h3>
            <p className="mb-4">
              If you disable cookies, some features may not work properly:
            </p>
            <ul className="list-disc pl-6">
              <li>You may need to log in more frequently</li>
              <li>Your preferences won't be saved</li>
              <li>Some features may not function correctly</li>
              <li>We won't be able to personalize your experience</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Do Not Track</h2>
            <p>
              Some browsers have a "Do Not Track" feature. Currently, there is no industry standard for 
              how to respond to these signals. We do not track users across third-party websites for 
              advertising purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Local Storage</h2>
            <p className="mb-4">
              In addition to cookies, we use browser local storage to:
            </p>
            <ul className="list-disc pl-6">
              <li>Cache data for offline functionality</li>
              <li>Store draft content temporarily</li>
              <li>Remember UI state and preferences</li>
              <li>Improve app performance</li>
            </ul>
            <p className="mt-4">
              Local storage data remains on your device until you clear it through browser settings or our app settings.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Mobile Apps</h2>
            <p>
              Our iOS and Android apps use similar technologies to cookies, including:
            </p>
            <ul className="list-disc pl-6">
              <li>Device identifiers for authentication</li>
              <li>Local storage for preferences and cached data</li>
              <li>Analytics SDKs (with your consent)</li>
            </ul>
            <p className="mt-4">
              You can manage app permissions through your device settings.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Updates to This Policy</h2>
            <p>
              We may update this Cookie Policy to reflect changes in our practices or for legal reasons. 
              We will notify you of significant changes via email or in-app notification.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Contact Us</h2>
            <p className="mb-4">
              If you have questions about our use of cookies, please contact us:
            </p>
            <ul className="list-none">
              <li><strong>Email:</strong> privacy@inkfluenceai.com</li>
              <li><strong>Website:</strong> https://www.inkfluenceai.com</li>
            </ul>
          </section>

          <section className="mb-8 bg-muted p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Cookie Summary Table</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Cookie Name</th>
                    <th className="text-left py-2 px-4">Type</th>
                    <th className="text-left py-2 px-4">Duration</th>
                    <th className="text-left py-2 px-4">Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 px-4">firebase_auth</td>
                    <td className="py-2 px-4">Essential</td>
                    <td className="py-2 px-4">14 days</td>
                    <td className="py-2 px-4">Authentication</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4">user_preferences</td>
                    <td className="py-2 px-4">Functional</td>
                    <td className="py-2 px-4">Persistent</td>
                    <td className="py-2 px-4">User settings</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4">_ga</td>
                    <td className="py-2 px-4">Analytics</td>
                    <td className="py-2 px-4">2 years</td>
                    <td className="py-2 px-4">Google Analytics</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4">stripe_session</td>
                    <td className="py-2 px-4">Payment</td>
                    <td className="py-2 px-4">Session</td>
                    <td className="py-2 px-4">Payment processing</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
      
      <LandingFooter 
        onNavigateToAbout={() => navigate('/about')}
        onNavigateToHelp={() => navigate('/help')}
        onNavigateToPrivacy={() => navigate('/privacy')}
        onNavigateToTerms={() => navigate('/terms')}
        onNavigateToCookies={() => navigate('/cookies')}
        onNavigateToContact={() => navigate('/contact')}
        onNavigateToPricing={() => navigate('/pricing')}
        onNavigateToFeatures={() => navigate('/features')}
        onNavigateToBlog={() => navigate('/blog')}
        onNavigateToTestimonials={() => navigate('/testimonials')}
        onNavigateToCaseStudies={() => navigate('/case-studies')}
        onNavigateToFAQ={() => navigate('/faq')}
      />
    </div>
  );
}
