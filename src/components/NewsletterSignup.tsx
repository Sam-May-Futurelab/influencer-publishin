import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Gift, CheckCircle2, Sparkles } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Recaptcha, RecaptchaRef } from '@/components/Recaptcha';

interface NewsletterSignupProps {
  variant?: 'default' | 'minimal' | 'sidebar';
  showLeadMagnet?: boolean;
}

export function NewsletterSignup({ variant = 'default', showLeadMagnet = true }: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const recaptchaRef = useRef<RecaptchaRef>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Execute reCAPTCHA if configured
      let recaptchaToken: string | null = null;
      if (recaptchaRef.current) {
        recaptchaToken = await recaptchaRef.current.execute();
        if (!recaptchaToken) {
          throw new Error('reCAPTCHA verification failed');
        }
      }
      
      // Newsletter signup via Resend API (configured and working)
      const response = await fetch('/api/newsletter-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name || '',
          email,
          wantsLeadMagnet: showLeadMagnet,
          recaptchaToken,
        }),
      });

      if (response.ok) {
        setIsSuccess(true);
        setEmail('');
        setName('');
        
        // If lead magnet, trigger download
        if (showLeadMagnet) {
          // Trigger lead magnet download after short delay
          setTimeout(() => {
            window.open('/api/download-lead-magnet', '_blank');
          }, 1500);
        }
      } else {
        throw new Error('Failed to subscribe');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <Alert className="bg-green-50 border-green-200">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          {showLeadMagnet 
            ? "Success! Your download will start shortly. We've also sent the template to your email."
            : "Success! You've been added to our newsletter. Check your inbox soon!"}
        </AlertDescription>
      </Alert>
    );
  }

  if (variant === 'minimal') {
    return (
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1"
          required
        />
        <Button 
          onClick={handleSubmit}
          disabled={isLoading || !email}
          className="bg-gradient-to-r from-[#9b87b8] to-[#b89ed6] hover:opacity-90"
        >
          {isLoading ? 'Subscribing...' : 'Subscribe'}
        </Button>
      </div>
    );
  }

  if (variant === 'sidebar') {
    return (
      <Card className="sticky top-24">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-[#7a5f96]">
            <Mail className="w-5 h-5" />
            <h3 className="font-bold">Get Weekly Tips</h3>
          </div>
          <p className="text-sm text-gray-600">
            Join 10,000+ creators getting our best ebook writing tips, AI prompts, and publishing strategies.
          </p>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button 
              type="submit"
              className="w-full bg-gradient-to-r from-[#9b87b8] to-[#b89ed6] hover:opacity-90"
              disabled={isLoading}
            >
              {isLoading ? 'Subscribing...' : 'Subscribe Free'}
            </Button>
          </form>
          {error && (
            <p className="text-xs text-red-600">{error}</p>
          )}
          <p className="text-xs text-gray-500">
            No spam. Unsubscribe anytime.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Default variant with lead magnet
  return (
    <Card className="border-2 border-[#9b87b8] bg-gradient-to-br from-[#f0e8f8] to-white shadow-lg">
      <CardContent className="p-8 space-y-6">
        <div className="text-center space-y-3">
          {showLeadMagnet && (
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#9b87b8] to-[#b89ed6] text-white px-4 py-2 rounded-full text-sm font-medium">
              <Gift className="w-4 h-4" />
              Free Lead Magnet
            </div>
          )}
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-[#9b87b8]" />
            <h3 className="text-2xl font-bold">
              {showLeadMagnet ? 'Get Your Free Ebook Template' : 'Join Our Newsletter'}
            </h3>
          </div>
          <p className="text-gray-600">
            {showLeadMagnet 
              ? 'Plus weekly tips on AI-powered ebook writing, publishing strategies, and content creation.'
              : 'Get exclusive tips on ebook writing, AI tools, and content marketing delivered to your inbox.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
              required
            />
          </div>
          <Button 
            type="submit"
            className="w-full bg-gradient-to-r from-[#9b87b8] to-[#b89ed6] hover:opacity-90 text-lg py-6"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : (showLeadMagnet ? 'Get Free Template' : 'Subscribe Now')}
          </Button>
        </form>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {showLeadMagnet && (
          <div className="space-y-2 text-sm text-gray-600">
            <p className="font-semibold text-[#7a5f96]">What you'll get:</p>
            <ul className="space-y-1.5">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Professional ebook template (Word + Google Docs)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>50+ AI prompts for ebook writing</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Weekly newsletter with exclusive tips</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Early access to new features</span>
              </li>
            </ul>
          </div>
        )}

        <p className="text-xs text-center text-gray-500">
          We respect your privacy. Unsubscribe anytime. No spam, ever.
        </p>

        {/* Invisible reCAPTCHA */}
        <Recaptcha ref={recaptchaRef} onVerify={() => {}} />
      </CardContent>
    </Card>
  );
}
