import { motion } from 'framer-motion';
import { LandingHeader } from '@/components/LandingHeader';
import { LandingFooter } from '@/components/LandingFooter';
import { SEO, createBreadcrumbSchema } from '@/components/SEO';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  HelpCircle,
  Search,
  BookOpen,
  CreditCard,
  Settings,
  Users,
  Lock,
  Zap,
  ArrowRight,
  MessageCircle,
  ChevronDown
} from 'lucide-react';
import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FAQPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'getting-started', name: 'Getting Started', icon: Zap },
    { id: 'features', name: 'Features & Tools', icon: BookOpen },
    { id: 'pricing', name: 'Pricing & Plans', icon: CreditCard },
    { id: 'account', name: 'Account & Settings', icon: Settings },
    { id: 'technical', name: 'Technical Support', icon: Users },
    { id: 'security', name: 'Security & Privacy', icon: Lock },
  ];

  const faqs = [
    // Getting Started
    {
      category: 'getting-started',
      question: 'How do I get started with Inkfluence AI?',
      answer: 'Simply sign up for a free account at inkfluenceai.com. No credit card required. Once registered, you can immediately start creating ebooks with our intuitive editor, AI writing assistant, and professional templates. The onboarding wizard will guide you through your first project.'
    },
    {
      category: 'getting-started',
      question: 'Do I need any writing or design experience?',
      answer: 'No! Inkfluence AI is designed for everyone, regardless of experience level. Our AI writing assistant helps generate content, while pre-designed templates make professional layouts simple. The drag-and-drop interface requires no coding or design skills.'
    },
    {
      category: 'getting-started',
      question: 'How long does it take to create an ebook?',
      answer: 'Most users create their first ebook in 2-8 hours with our AI assistance. Simple guides can be completed in under 2 hours, while comprehensive books might take a few days. Compare this to traditional methods which can take weeks or months.'
    },
    {
      category: 'getting-started',
      question: 'Can I import existing content?',
      answer: 'Yes! You can copy and paste existing content, import from Word documents, or start fresh. Our editor preserves formatting and makes it easy to enhance existing content with AI.'
    },
    {
      category: 'getting-started',
      question: 'What types of ebooks can I create?',
      answer: 'Any type! Popular options include how-to guides, lead magnets, course workbooks, recipe books, fiction novels, business reports, coaching materials, technical documentation, and more. Our templates cover 20+ categories.'
    },

    // Features & Tools
    {
      category: 'features',
      question: 'How does the AI writing assistant work?',
      answer: 'Our AI analyzes your topic and writing style to generate relevant, high-quality content. Simply describe what you want, and the AI creates drafts you can edit and refine. It understands context, maintains consistency, and adapts to your voice.'
    },
    {
      category: 'features',
      question: 'What export formats are available?',
      answer: 'Free accounts can export to PDF. Premium users get PDF, EPUB (for e-readers like Kindle), and DOCX (Microsoft Word) formats. All exports are professionally formatted and ready to publish or print.'
    },
    {
      category: 'features',
      question: 'Can I customize the design and branding?',
      answer: 'Absolutely! Premium users have full control over colors, fonts, logos, headers, footers, and layout. Choose from 20+ professional templates or start from scratch. Your branding stays consistent across all pages.'
    },
    {
      category: 'features',
      question: 'Is there a limit to how many ebooks I can create?',
      answer: 'No limit on the number of projects! Free users are limited to 4 pages per ebook. Premium users can create unlimited pages across unlimited projects. All your work is safely stored in the cloud.'
    },
    {
      category: 'features',
      question: 'Can I collaborate with others on an ebook?',
      answer: 'Currently, each ebook is associated with one account. However, you can export and share drafts, or use our premium features to manage client projects. Team collaboration features are on our roadmap for 2025.'
    },
    {
      category: 'features',
      question: 'What is the cover designer feature?',
      answer: 'Our cover designer lets you create professional book covers without design skills. Choose from templates, customize colors and fonts, add images, and generate 3D mockups. Premium users access advanced customization options.'
    },
    {
      category: 'features',
      question: 'How does the template gallery work?',
      answer: 'Browse 20+ professionally designed templates organized by category (business, education, fiction, etc.). Click a template to preview it, then use it as your starting point. Templates include pre-designed layouts, color schemes, and typography.'
    },

    // Pricing & Plans
    {
      category: 'pricing',
      question: 'Is there a free plan?',
      answer: 'Yes! Our free plan includes 4 pages total, 3 AI generations per day, basic templates, PDF export, and cloud storage. It is perfect for testing the platform or creating short lead magnets.'
    },
    {
      category: 'pricing',
      question: 'How much does Premium cost?',
      answer: 'Premium costs £9.99/month billed monthly, or £99/year (£8.25/month) when billed annually - that is a 17% savings. Cancel anytime with no penalties.'
    },
    {
      category: 'pricing',
      question: 'What is included in Premium?',
      answer: 'Premium includes unlimited pages, 50 AI generations per day, 20+ premium templates, all export formats (PDF, EPUB, DOCX), advanced cover designer, custom branding, priority support, writing analytics, batch operations, and commercial license.'
    },
    {
      category: 'pricing',
      question: 'Can I upgrade or downgrade anytime?',
      answer: 'Yes! Upgrade to Premium instantly to unlock all features. Downgrade anytime and keep Premium features until your billing period ends. Your projects and data are always preserved.'
    },
    {
      category: 'pricing',
      question: 'Do you offer refunds?',
      answer: 'Yes! We offer a 30-day money-back guarantee for Premium subscriptions. If you are not satisfied within 30 days of purchase, contact support for a full refund, no questions asked.'
    },
    {
      category: 'pricing',
      question: 'Are there educational or nonprofit discounts?',
      answer: 'Yes! We offer special pricing for students, teachers, and nonprofit organizations. Contact support with verification (student ID, .edu email, or 501(c)(3) documentation) for discount eligibility.'
    },
    {
      category: 'pricing',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express, Discover) and digital wallets through our secure Stripe payment system. All transactions are encrypted and PCI-compliant.'
    },
    {
      category: 'pricing',
      question: 'Will my price change if I lock in now?',
      answer: 'Your subscription rate is locked in when you sign up. If we raise prices in the future, existing customers keep their current rate as long as they remain subscribed.'
    },

    // Account & Settings
    {
      category: 'account',
      question: 'How do I reset my password?',
      answer: 'Click "Forgot Password" on the login page, enter your email, and follow the reset link sent to your inbox. The link expires in 1 hour for security. If you do not receive it, check your spam folder or contact support.'
    },
    {
      category: 'account',
      question: 'Can I change my email address?',
      answer: 'Yes! Go to Settings > Account > Email Address. Enter your new email and verify it through the confirmation link. Your login will then use the new email address.'
    },
    {
      category: 'account',
      question: 'How do I cancel my subscription?',
      answer: 'Go to Settings > Billing > Cancel Subscription. Confirm the cancellation and you will keep Premium features until your current billing period ends. You can reactivate anytime.'
    },
    {
      category: 'account',
      question: 'What happens to my projects if I cancel?',
      answer: 'All your projects remain safely stored and accessible. You can still view and export them. You will only lose Premium features like unlimited pages and advanced exports until you resubscribe.'
    },
    {
      category: 'account',
      question: 'How do I delete my account?',
      answer: 'Go to Settings > Account > Delete Account. This permanently removes all your data, projects, and subscription information. This action cannot be undone, so export any important work first.'
    },
    {
      category: 'account',
      question: 'Can I have multiple accounts?',
      answer: 'You can create separate accounts with different email addresses. However, subscriptions and projects are tied to individual accounts and cannot be shared or transferred.'
    },

    // Technical Support
    {
      category: 'technical',
      question: 'What browsers are supported?',
      answer: 'Inkfluence AI works best on modern browsers: Chrome, Firefox, Safari, and Edge (latest versions). We recommend Chrome or Firefox for optimal performance. Internet Explorer is not supported.'
    },
    {
      category: 'technical',
      question: 'Can I use Inkfluence AI on mobile devices?',
      answer: 'Yes! Our platform is mobile-responsive. However, for the best editing experience, we recommend using a tablet or desktop computer. Mobile is great for reviewing and quick edits.'
    },
    {
      category: 'technical',
      question: 'Is my work automatically saved?',
      answer: 'Yes! Every change you make is automatically saved to the cloud within seconds. You will see a "Saved" indicator. You can also manually save using Cmd+S (Mac) or Ctrl+S (Windows).'
    },
    {
      category: 'technical',
      question: 'What if I lose my internet connection while working?',
      answer: 'Your work is saved continuously while connected. If you lose connection, changes are queued and saved automatically when you reconnect. A notification will alert you if saving fails.'
    },
    {
      category: 'technical',
      question: 'Why is the AI generation slow sometimes?',
      answer: 'AI generation speed depends on request complexity and server load. Simple requests take 2-5 seconds, complex ones up to 15 seconds. If consistently slow, try refreshing or check your internet connection.'
    },
    {
      category: 'technical',
      question: 'Can I work offline?',
      answer: 'Inkfluence AI requires an internet connection to access AI features and save your work. Offline mode is planned for a future update, which will allow basic editing without AI.'
    },
    {
      category: 'technical',
      question: 'What is the maximum file size for exports?',
      answer: 'There is no strict limit, but ebooks over 200 pages or with many high-resolution images may take longer to export. For best performance, optimize images before importing.'
    },

    // Security & Privacy
    {
      category: 'security',
      question: 'Is my data secure?',
      answer: 'Yes! We use industry-standard encryption (256-bit SSL) for all data transmission and storage. Your projects are stored on secure servers with regular backups. We never share your content with third parties.'
    },
    {
      category: 'security',
      question: 'Who owns the content I create?',
      answer: 'You do! You retain complete ownership and copyright of all content created with Inkfluence AI. We claim no rights to your work. Premium users also get a commercial license to sell their ebooks.'
    },
    {
      category: 'security',
      question: 'Do you train AI on my content?',
      answer: 'No! Your content is private and never used to train our AI models. We respect your intellectual property and privacy. Our AI is trained on publicly available data, not user content.'
    },
    {
      category: 'security',
      question: 'Can I export and delete my data?',
      answer: 'Yes! You can export all your projects anytime in multiple formats. To permanently delete data, go to Settings > Account > Delete Account. This removes all data from our servers.'
    },
    {
      category: 'security',
      question: 'Do you comply with GDPR and privacy laws?',
      answer: 'Yes! We are GDPR-compliant and respect all major privacy regulations including CCPA. Read our Privacy Policy for full details on data collection, use, and your rights.'
    },
    {
      category: 'security',
      question: 'How do you handle payment information?',
      answer: 'We do not store credit card information. All payments are processed through Stripe, a PCI Level 1 certified payment processor. Your payment data is encrypted and secure.'
    },
  ];

  const filteredFAQs = searchQuery
    ? faqs.filter(
        faq =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqs;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Frequently Asked Questions - Inkfluence AI Help Center"
        description="Find answers to common questions about Inkfluence AI. Learn about features, pricing, account management, technical support, and more."
        keywords="inkfluence ai faq, ebook creator help, ai writing questions, support, how to use inkfluence ai, pricing questions"
        canonicalUrl="https://inkfluenceai.com/faq"
        structuredData={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "FAQPage",
              "mainEntity": faqs.slice(0, 10).map(faq => ({
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": faq.answer
                }
              }))
            },
            createBreadcrumbSchema([
              { name: "Home", url: "https://inkfluenceai.com/" },
              { name: "FAQ", url: "https://inkfluenceai.com/faq" }
            ])
          ]
        }}
      />

      <LandingHeader 
        onSignIn={() => navigate('/?signin=true')}
        onGetStarted={() => navigate(user ? '/app/dashboard' : '/?signin=true')}
        showNavLinks={true}
        isAuthenticated={!!user}
        onNavigateToFeatures={() => navigate('/features')}
        onNavigateToPricing={() => navigate('/pricing')}
        onNavigateToBlog={() => navigate('/blog')}
      />

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10">
                <HelpCircle className="w-12 h-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Find answers to common questions about Inkfluence AI
            </p>

            {/* Search */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <button
                  onClick={() => {
                    const element = document.getElementById(category.id);
                    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="w-full"
                >
                  <Card className="neomorph-flat border-0 hover:neomorph-raised transition-all cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <category.icon className="w-8 h-8 text-primary mx-auto mb-2" />
                      <div className="text-sm font-medium">{category.name}</div>
                    </CardContent>
                  </Card>
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-16">
          {categories.map((category, categoryIndex) => {
            const categoryFAQs = filteredFAQs.filter(faq => faq.category === category.id);
            
            if (categoryFAQs.length === 0) return null;

            return (
              <motion.div
                key={category.id}
                id={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: categoryIndex * 0.1 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
                    <category.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{category.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {categoryFAQs.length} {categoryFAQs.length === 1 ? 'question' : 'questions'}
                    </p>
                  </div>
                </div>

                <Accordion type="single" collapsible className="space-y-4">
                  {categoryFAQs.map((faq, index) => (
                    <AccordionItem
                      key={index}
                      value={`${category.id}-${index}`}
                      className="border border-border rounded-lg px-6"
                    >
                      <AccordionTrigger className="text-left hover:no-underline py-4">
                        <span className="font-semibold pr-4">{faq.question}</span>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-4">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Still Have Questions Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <MessageCircle className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Still Have Questions?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Cannot find what you are looking for? Our support team is here to help.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-primary to-accent text-white"
                onClick={() => navigate('/contact')}
              >
                Contact Support
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/help')}
              >
                Visit Help Center
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <LandingFooter 
        onNavigateToAbout={() => navigate('/about')}
        onNavigateToPrivacy={() => navigate('/privacy')}
        onNavigateToTerms={() => navigate('/terms')}
        onNavigateToCookies={() => navigate('/cookies')}
        onNavigateToContact={() => navigate('/contact')}
        onNavigateToHelp={() => navigate('/help')}
        onNavigateToBlog={() => navigate('/blog')}
        onNavigateToPricing={() => navigate('/pricing')}
        onNavigateToFeatures={() => navigate('/features')}
      />
    </div>
  );
}

export default FAQPage;
