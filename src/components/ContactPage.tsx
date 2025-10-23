import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { LandingHeader } from '@/components/LandingHeader';
import { LandingFooter } from '@/components/LandingFooter';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { 
  Mail, 
  MessageSquare, 
  HelpCircle, 
  Bug, 
  CreditCard, 
  Star,
  Clock,
  CheckCircle,
  Send
} from 'lucide-react';

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
}

const CONTACT_CATEGORIES = [
  { value: 'support', label: 'Technical Support', icon: Bug, color: 'bg-blue-500' },
  { value: 'billing', label: 'Billing & Refunds', icon: CreditCard, color: 'bg-green-500' },
  { value: 'feature', label: 'Feature Request', icon: Star, color: 'bg-purple-500' },
  { value: 'general', label: 'General Inquiry', icon: MessageSquare, color: 'bg-gray-500' },
];

const FAQ_ITEMS = [
  {
    question: "How do I cancel my subscription?",
    answer: "You can cancel your subscription anytime from your Profile page. Click on 'Manage Subscription' and follow the prompts. You'll retain access to premium features until your current billing period ends."
  },
  {
    question: "Can I get a refund?",
    answer: "Yes! We offer refunds within 30 days of purchase. Contact us with your account details and reason for the refund request. Most refunds are processed within 2-3 business days."
  },
  {
    question: "How many pages can I create?",
    answer: "Free users can create up to 4 pages per book. Premium users have unlimited pages and access to premium templates, AI enhancements, and export options."
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely! We use Firebase's secure infrastructure with bank-level encryption. Your books and personal data are never shared with third parties and are always backed up."
  },
  {
    question: "Can I export my books?",
    answer: "Yes! Premium users can export books as PDF, EPUB, and Word documents. Free users can export books up to 4 pages in length."
  },
  {
    question: "How does the AI content generation work?",
    answer: "Our AI uses advanced language models to help you write, edit, and enhance your content. Free users get 10 AI generations per month, while premium users get unlimited access."
  }
];

export default function ContactPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState<ContactForm>({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name || !form.email || !form.subject || !form.message || !form.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/contact-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }
      
      toast.success('Message sent successfully! We\'ll get back to you within 24 hours.');
      setForm({ name: '', email: '', subject: '', category: '', message: '' });
    } catch (error) {
      console.error('Contact form error:', error);
      toast.error('Failed to send message. Please try again or email us directly at support@inkfluenceai.com');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ContactForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

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
      
      <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
        <div className="max-w-6xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Get in Touch</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're here to help! Whether you need technical support, have billing questions, 
              or want to share feedback, we'd love to hear from you.
            </p>
          </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  Send us a Message
                </CardTitle>
                <CardDescription>
                  Fill out the form below and we'll respond within 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Name *
                      </label>
                      <Input
                        value={form.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <Input
                        type="email"
                        value={form.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {CONTACT_CATEGORIES.map((category) => {
                        const Icon = category.icon;
                        return (
                          <button
                            key={category.value}
                            type="button"
                            onClick={() => handleInputChange('category', category.value)}
                            className={`p-3 border-2 rounded-lg text-left transition-all ${
                              form.category === category.value
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-8 h-8 rounded-full ${category.color} flex items-center justify-center`}>
                                <Icon className="w-4 h-4 text-white" />
                              </div>
                              <span className="font-medium text-sm">{category.label}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <Input
                      value={form.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      placeholder="Brief description of your inquiry"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <Textarea
                      value={form.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder="Please provide as much detail as possible..."
                      className="min-h-32"
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Info & Response Times */}
          <div className="space-y-6">
            {/* Direct Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Direct Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Email Support</p>
                  <p className="font-medium">support@inkfluenceai.com</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Billing Inquiries</p>
                  <p className="font-medium">billing@inkfluenceai.com</p>
                </div>
                <Separator />
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Response within 24 hours</span>
                </div>
              </CardContent>
            </Card>

            {/* Response Times */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Response Times
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Technical Support</span>
                  <Badge variant="secondary">24 hours</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Billing & Refunds</span>
                  <Badge variant="secondary">12 hours</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Feature Requests</span>
                  <Badge variant="secondary">2-3 days</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">General Inquiries</span>
                  <Badge variant="secondary">24 hours</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600">
              Find quick answers to common questions. Can't find what you're looking for? Contact us!
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {FAQ_ITEMS.map((item, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-start gap-2 text-lg">
                    <HelpCircle className="w-5 h-5 mt-0.5 text-blue-500" />
                    {item.question}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">{item.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="font-medium text-gray-900">We're here to help!</span>
              </div>
              <p className="text-gray-600">
                Our support team is dedicated to ensuring you have the best experience with InkfluenceAI. 
                We read every message and aim to provide helpful, personalized responses.
              </p>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>

      <LandingFooter 
        onNavigateToAbout={() => navigate('/about')}
        onNavigateToHelp={() => navigate('/help')}
        onNavigateToPrivacy={() => navigate('/privacy')}
        onNavigateToTerms={() => navigate('/terms')}
        onNavigateToCookies={() => navigate('/cookies')}
        onNavigateToPricing={() => navigate('/pricing')}
        onNavigateToFeatures={() => navigate('/features')}
        onNavigateToBlog={() => navigate('/blog')}
        onNavigateToContact={() => navigate('/contact')}
      />
    </div>
  );
}