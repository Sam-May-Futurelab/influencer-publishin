import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { LandingHeader } from './LandingHeader';
import { LandingFooter } from './LandingFooter';

interface TermsOfServiceProps {
  onBack: () => void;
  onNavigate: (page: 'home' | 'dashboard' | 'profile' | 'projects' | 'settings' | 'help' | 'pricing' | 'features' | 'about' | 'signin' | 'blog', action?: 'signin') => void;
  isAuthenticated?: boolean;
}

export function TermsOfService({ onBack, onNavigate, isAuthenticated = false }: TermsOfServiceProps) {
  return (
    <div className="min-h-screen bg-background">
      <LandingHeader 
        onSignIn={() => onNavigate('signin')}
        onGetStarted={() => onNavigate(isAuthenticated ? 'dashboard' : 'signin')}
        showNavLinks={true}
        isAuthenticated={isAuthenticated}
        onNavigateToFeatures={() => onNavigate('features')}
        onNavigateToPricing={() => onNavigate('pricing')}
        onNavigateToBlog={() => onNavigate('blog')}
      />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 w-4 h-4" />
          Back
        </Button>

        <div className="prose prose-gray max-w-none">
          <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last updated: October 20, 2025</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
            <p>
              By accessing or using Inkfluence AI ("Service"), you agree to be bound by these Terms of Service ("Terms"). 
              If you disagree with any part of these terms, you may not access the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p className="mb-4">
              Inkfluence AI is an AI-powered book writing and publishing platform that provides:
            </p>
            <ul className="list-disc pl-6">
              <li>AI-assisted content generation and writing tools</li>
              <li>Chapter organization and project management</li>
              <li>Custom branding and design options</li>
              <li>Export functionality in multiple formats (PDF, DOCX, EPUB)</li>
              <li>Cloud storage and synchronization</li>
              <li>Premium features through paid subscriptions</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            
            <h3 className="text-xl font-semibold mb-3">3.1 Account Creation</h3>
            <p className="mb-4">
              To use certain features, you must create an account. You agree to:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and update your information</li>
              <li>Keep your password secure and confidential</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Be responsible for all activities under your account</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">3.2 Account Eligibility</h3>
            <p>
              You must be at least 13 years old to use this Service. If you are under 18, 
              you must have permission from a parent or guardian.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Content Ownership and Rights</h2>
            
            <h3 className="text-xl font-semibold mb-3">4.1 Your Content</h3>
            <p className="mb-4">
              You retain all rights, title, and interest in the content you create using our Service, including:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Books, manuscripts, and written content</li>
              <li>Characters, plots, and creative ideas</li>
              <li>Customized designs and branding</li>
              <li>Exported files and publications</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">4.2 License to Us</h3>
            <p className="mb-4">
              By using our Service, you grant us a limited license to:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Store and display your content within the platform</li>
              <li>Process your content to provide AI-assisted features</li>
              <li>Create backups for data protection</li>
            </ul>
            <p>
              <strong>Important:</strong> We do NOT use your content to train AI models, sell it, 
              or share it with third parties without your explicit permission.
            </p>

            <h3 className="text-xl font-semibold mb-3">4.3 AI-Generated Content</h3>
            <p>
              AI-generated suggestions and content are provided as tools to assist your writing. 
              You are responsible for reviewing, editing, and ensuring the accuracy and originality of all content 
              before publication or commercial use.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Acceptable Use Policy</h2>
            <p className="mb-4">You agree NOT to use the Service to:</p>
            <ul className="list-disc pl-6">
              <li>Violate any laws or regulations</li>
              <li>Infringe on intellectual property rights of others</li>
              <li>Create or distribute illegal, harmful, or offensive content</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Distribute malware, viruses, or malicious code</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Scrape, data mine, or use automated tools without permission</li>
              <li>Impersonate others or misrepresent your identity</li>
              <li>Use the Service for spam or unsolicited marketing</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Subscription and Payments</h2>
            
            <h3 className="text-xl font-semibold mb-3">6.1 Free Plan</h3>
            <p>
              Our free plan includes limited features with usage restrictions. 
              We reserve the right to modify free plan limits at any time.
            </p>

            <h3 className="text-xl font-semibold mb-3">6.2 Premium Subscriptions</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Subscriptions are billed monthly or annually</li>
              <li>Payments are processed securely through Stripe</li>
              <li>All fees are in GBP (£) unless otherwise stated</li>
              <li>Subscriptions auto-renew unless cancelled</li>
              <li>Price changes will be communicated 30 days in advance</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">6.3 Refunds</h3>
            <p>
              Refunds are handled on a case-by-case basis. Contact us within 7 days of purchase 
              for refund requests. No refunds for partial months.
            </p>

            <h3 className="text-xl font-semibold mb-3">6.4 Cancellation</h3>
            <p>
              You may cancel your subscription at any time. Access to premium features continues 
              until the end of your billing period.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Service Availability</h2>
            <p className="mb-4">
              We strive to provide reliable service but do not guarantee:
            </p>
            <ul className="list-disc pl-6">
              <li>Uninterrupted or error-free access</li>
              <li>That the Service will meet your specific requirements</li>
              <li>That data loss will never occur (always maintain backups)</li>
              <li>Availability during maintenance or emergencies</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Termination</h2>
            
            <h3 className="text-xl font-semibold mb-3">8.1 By You</h3>
            <p>
              You may delete your account at any time through your account settings.
            </p>

            <h3 className="text-xl font-semibold mb-3">8.2 By Us</h3>
            <p className="mb-4">
              We may suspend or terminate your account if you:
            </p>
            <ul className="list-disc pl-6">
              <li>Violate these Terms of Service</li>
              <li>Engage in fraudulent activity</li>
              <li>Abuse the Service or other users</li>
              <li>Fail to pay subscription fees</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Disclaimer of Warranties</h2>
            <p>
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, 
              EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, 
              FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, INKFLUENCE AI SHALL NOT BE LIABLE FOR ANY 
              INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF 
              PROFITS, DATA, USE, OR OTHER INTANGIBLE LOSSES, EVEN IF WE HAVE BEEN ADVISED OF THE 
              POSSIBILITY OF SUCH DAMAGES.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless Inkfluence AI and its affiliates from any claims, 
              damages, losses, liabilities, and expenses arising from your use of the Service or violation 
              of these Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will notify users of material changes 
              via email or in-app notification. Continued use after changes constitutes acceptance of updated Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">13. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of England and Wales, 
              without regard to its conflict of law provisions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">14. Dispute Resolution</h2>
            <p className="mb-4">
              Any disputes arising from these Terms or use of the Service shall be resolved through:
            </p>
            <ol className="list-decimal pl-6">
              <li>Good faith negotiation between parties</li>
              <li>Mediation if negotiation fails</li>
              <li>Binding arbitration if mediation fails</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">15. Contact Information</h2>
            <p className="mb-4">
              For questions about these Terms, please contact us:
            </p>
            <ul className="list-none">
              <li><strong>Email:</strong> legal@inkfluenceai.com</li>
              <li><strong>Website:</strong> https://www.inkfluenceai.com</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">16. Severability</h2>
            <p>
              If any provision of these Terms is found to be unenforceable or invalid, that provision 
              shall be limited or eliminated to the minimum extent necessary, and the remaining provisions 
              shall remain in full force and effect.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">17. Entire Agreement</h2>
            <p>
              These Terms, together with our Privacy Policy and Cookie Policy, constitute the entire agreement 
              between you and Inkfluence AI regarding the Service.
            </p>
          </section>
        </div>
      </div>
      
      <LandingFooter 
        onNavigateToPrivacy={() => onNavigate('home')}
        onNavigateToTerms={() => onNavigate('home')}
        onNavigateToCookies={() => onNavigate('home')}
        onNavigateToHelp={() => onNavigate('help')}
        onNavigateToAbout={() => onNavigate('about')}
        onNavigateToPricing={() => onNavigate('pricing')}
        onNavigateToFeatures={() => onNavigate('features')}
        onNavigateToBlog={() => onNavigate('blog')}
      />
    </div>
  );
}
