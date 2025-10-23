import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { LandingHeader } from './LandingHeader';
import { LandingFooter } from './LandingFooter';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';

export function PrivacyPolicy() {
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
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: October 20, 2025</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p>
              Welcome to Inkfluence AI ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data. 
              This privacy policy will inform you about how we look after your personal data when you visit our website or use our services, 
              and tell you about your privacy rights and how the law protects you.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
            <p className="mb-4">We collect and process the following types of information:</p>
            
            <h3 className="text-xl font-semibold mb-3">2.1 Information You Provide</h3>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Account Information:</strong> Name, email address, password</li>
              <li><strong>Profile Information:</strong> Display name, profile picture, bio</li>
              <li><strong>Content:</strong> Books, chapters, notes, and other content you create</li>
              <li><strong>Payment Information:</strong> Processed securely through Stripe (we don't store card details)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">2.2 Automatically Collected Information</h3>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Usage Data:</strong> Pages visited, features used, time spent</li>
              <li><strong>Device Information:</strong> Browser type, operating system, device type</li>
              <li><strong>Log Data:</strong> IP address, access times, error logs</li>
              <li><strong>Cookies:</strong> See our Cookie Policy for details</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
            <p className="mb-4">We use your information to:</p>
            <ul className="list-disc pl-6">
              <li>Provide, maintain, and improve our services</li>
              <li>Process your transactions and manage your subscription</li>
              <li>Send you important updates about your account and services</li>
              <li>Provide customer support and respond to your inquiries</li>
              <li>Generate AI-powered content based on your input</li>
              <li>Analyze usage patterns to improve user experience</li>
              <li>Detect and prevent fraud, abuse, and security issues</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. AI and Your Content</h2>
            <p className="mb-4">
              <strong>Important:</strong> Your manuscripts and content are private and confidential. We do not:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Use your content to train our AI models</li>
              <li>Share your content with third parties</li>
              <li>Sell your content to anyone</li>
              <li>Claim any ownership rights to your content</li>
            </ul>
            <p>
              You retain all rights, title, and interest in your content. AI-generated suggestions are processed in real-time 
              and are used solely to assist you in creating your content.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Data Sharing and Disclosure</h2>
            <p className="mb-4">We may share your information with:</p>
            
            <h3 className="text-xl font-semibold mb-3">5.1 Service Providers</h3>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Firebase/Google Cloud:</strong> Database and authentication</li>
              <li><strong>Stripe:</strong> Payment processing</li>
              <li><strong>OpenAI:</strong> AI content generation (no training on your data)</li>
              <li><strong>Vercel:</strong> Hosting and deployment</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">5.2 Legal Requirements</h3>
            <p>We may disclose your information if required by law or to:</p>
            <ul className="list-disc pl-6">
              <li>Comply with legal processes or government requests</li>
              <li>Enforce our Terms of Service</li>
              <li>Protect our rights, property, or safety</li>
              <li>Prevent fraud or illegal activities</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Data Security</h2>
            <p className="mb-4">
              We implement appropriate technical and organizational measures to protect your data, including:
            </p>
            <ul className="list-disc pl-6">
              <li>Encryption of data in transit and at rest</li>
              <li>Secure authentication using Firebase Auth</li>
              <li>Regular security assessments and updates</li>
              <li>Access controls and monitoring</li>
              <li>Secure backup and disaster recovery</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
            <p>
              We retain your information for as long as your account is active or as needed to provide services. 
              You can request deletion of your account and data at any time. After deletion, some information may be 
              retained in backup systems for up to 90 days.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Your Rights</h2>
            <p className="mb-4">You have the right to:</p>
            <ul className="list-disc pl-6">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update or correct your information</li>
              <li><strong>Deletion:</strong> Request deletion of your account and data</li>
              <li><strong>Export:</strong> Download your content in portable formats</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
              <li><strong>Withdraw Consent:</strong> Stop processing based on consent</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your own. 
              We ensure appropriate safeguards are in place to protect your data in accordance with this privacy policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Children's Privacy</h2>
            <p>
              Our services are not intended for children under 13. We do not knowingly collect personal information 
              from children under 13. If you believe we have collected such information, please contact us immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. We will notify you of any changes by posting 
              the new policy on this page and updating the "Last updated" date. Continued use of our services 
              after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Contact Us</h2>
            <p className="mb-4">
              If you have questions about this privacy policy or our privacy practices, please contact us at:
            </p>
            <ul className="list-none">
              <li><strong>Email:</strong> privacy@inkfluenceai.com</li>
              <li><strong>Website:</strong> https://www.inkfluenceai.com</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">13. GDPR Compliance (EU Users)</h2>
            <p className="mb-4">
              If you are in the European Economic Area (EEA), you have additional rights under GDPR:
            </p>
            <ul className="list-disc pl-6">
              <li>Right to data portability</li>
              <li>Right to restrict processing</li>
              <li>Right to object to processing</li>
              <li>Right to lodge a complaint with a supervisory authority</li>
            </ul>
            <p className="mt-4">
              Our lawful basis for processing your data is typically your consent or our legitimate interests 
              in providing and improving our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">14. California Privacy Rights (CCPA)</h2>
            <p className="mb-4">
              If you are a California resident, you have the right to:
            </p>
            <ul className="list-disc pl-6">
              <li>Know what personal information is collected, used, and shared</li>
              <li>Delete personal information held by businesses</li>
              <li>Opt-out of the sale of personal information (we do not sell your information)</li>
              <li>Non-discrimination for exercising your privacy rights</li>
            </ul>
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
