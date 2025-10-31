import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LandingHeader } from '@/components/LandingHeader';
import { LandingFooter } from '@/components/LandingFooter';
import { SEO, createSoftwareApplicationSchema, createBreadcrumbSchema } from '@/components/SEO';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { 
  CheckCircle, 
  Crown, 
  Zap, 
  Users, 
  Palette,
  Download,
  Shield,
  Sparkles,
  BookOpen,
  HelpCircle,
  ArrowRight,
  Star,
  Clock,
  Globe,
  Brain
} from 'lucide-react';

export function PricingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');

  // SEO Meta Tags
  useEffect(() => {
    document.title = 'Pricing - Inkfluence AI | Affordable AI-Powered Ebook Creation Plans';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Choose the perfect plan for your ebook creation needs. Start free with 4 pages, or upgrade to Premium for unlimited pages, advanced AI features, and professional publishing tools.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Choose the perfect plan for your ebook creation needs. Start free with 4 pages, or upgrade to Premium for unlimited pages, advanced AI features, and professional publishing tools.';
      document.head.appendChild(meta);
    }

    // Keywords meta tag
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', 'ebook creation pricing, AI writing tool cost, self-publishing pricing, book creation plans, affordable ebook maker, premium writing features');

    // Open Graph tags
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute('content', 'Pricing - Inkfluence AI | Affordable AI-Powered Ebook Creation');

    let ogDescription = document.querySelector('meta[property="og:description"]');
    if (!ogDescription) {
      ogDescription = document.createElement('meta');
      ogDescription.setAttribute('property', 'og:description');
      document.head.appendChild(ogDescription);
    }
    ogDescription.setAttribute('content', 'Start free or choose Premium for unlimited ebook creation with AI-powered writing, professional covers, and multi-format publishing.');

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', window.location.origin + '/pricing');

    return () => {
      document.title = 'Inkfluence AI - AI-Powered Ebook Creation Platform';
    };
  }, []);

  const plans = [
    {
      name: 'Free',
      tagline: 'Perfect for getting started',
      price: { monthly: 0, yearly: 0 },
      popular: false,
      features: [
        { text: '4 pages total', included: true },
        { text: '3 AI generations per day', included: true },
        { text: '3 basic templates', included: true },
        { text: 'PDF export only', included: true },
        { text: 'Basic cover designer', included: true },
        { text: '1 AI cover image per month', included: true },
        { text: 'Cloud storage', included: true },
        { text: 'Email support', included: true },
        { text: 'Audiobook generation', included: false },
        { text: 'EPUB & DOCX export', included: false },
        { text: 'Custom watermarks', included: false },
        { text: 'Premium templates', included: false },
        { text: 'Priority support', included: false }
      ],
      ctaText: 'Start Free',
      ctaStyle: 'outline'
    },
    {
      name: 'Creator',
      tagline: 'For growing authors',
      price: { monthly: 4.99, yearly: 49 },
      yearlyDiscount: '17% off',
      popular: true,
      features: [
        { text: '20 pages total', included: true },
        { text: '15 AI generations per day', included: true },
        { text: '10 premium templates', included: true },
        { text: 'PDF & EPUB export', included: true },
        { text: 'Advanced cover designer', included: true },
        { text: '10 AI cover images per month', included: true },
        { text: 'Custom watermarks', included: true },
        { text: 'Cloud storage', included: true },
        { text: 'Email support', included: true },
        { text: '25 audiobook chapters/month', included: true },
        { text: 'AI audiobook (9 voices)', included: true },
        { text: 'Unlimited pages', included: false },
        { text: 'DOCX export', included: false },
        { text: 'Priority support', included: false }
      ],
      ctaText: 'Start Creator',
      ctaStyle: 'primary'
    },
    {
      name: 'Premium',
      tagline: 'For professional authors',
      price: { monthly: 9.99, yearly: 99 },
      yearlyDiscount: '17% off',
      popular: false,
      features: [
        { text: 'Unlimited pages', included: true },
        { text: '50 AI generations per day', included: true },
        { text: '20+ premium templates', included: true },
        { text: 'All export formats (PDF, EPUB, DOCX)', included: true },
        { text: 'Advanced cover designer', included: true },
        { text: '50 AI cover images per month', included: true },
        { text: 'Custom branding & watermarks', included: true },
        { text: 'Priority support', included: true },
        { text: '50 audiobook chapters/month', included: true },
        { text: 'AI audiobook (9 voices)', included: true },
        { text: 'Merge audiobooks feature', included: true },
        { text: 'Writing analytics', included: true },
        { text: 'Batch operations', included: true },
        { text: 'Advanced AI features', included: true },
        { text: 'Commercial license', included: true }
      ],
      ctaText: 'Start Premium',
      ctaStyle: 'primary'
    }
  ];

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Writing',
      description: 'Generate high-quality content with advanced AI that understands your voice and style.',
      freeFeature: '3 generations/day',
      premiumFeature: '50 generations/day'
    },
    {
      icon: BookOpen,
      title: 'Professional Templates',
      description: '20+ expertly designed templates for every niche and industry.',
      freeFeature: 'Basic templates',
      premiumFeature: 'All premium templates'
    },
    {
      icon: Palette,
      title: 'Cover Designer',
      description: 'Create stunning book covers with professional templates and customization.',
      freeFeature: 'Basic designer',
      premiumFeature: 'Advanced designer'
    },
    {
      icon: Download,
      title: 'Export Formats',
      description: 'Export your ebooks in multiple formats for different platforms.',
      freeFeature: 'PDF only',
      premiumFeature: 'PDF, EPUB, DOCX'
    },
    {
      icon: Shield,
      title: 'Commercial Rights',
      description: 'Full commercial license to sell and distribute your ebooks.',
      freeFeature: 'Personal use',
      premiumFeature: 'Commercial license'
    },
    {
      icon: Zap,
      title: 'Page Limits',
      description: 'Create ebooks of any length to match your content needs.',
      freeFeature: '4 pages total',
      premiumFeature: 'Unlimited pages'
    }
  ];

  const faqs = [
    {
      question: 'Can I start with the free plan and upgrade later?',
      answer: 'Absolutely! You can start with our free plan and upgrade to Creator (£4.99/month) or Premium (£9.99/month) at any time. Your existing projects and data will be preserved when you upgrade.'
    },
    {
      question: 'What happens when I hit the page limit on my plan?',
      answer: 'Free users get 4 pages, Creator gets 20 pages, and Premium gets unlimited pages. When you reach your limit, you\'ll be prompted to upgrade. You can still view and edit existing content, but won\'t be able to add new pages until you upgrade.'
    },
    {
      question: 'Do you offer refunds?',
      answer: 'Yes! We offer a 30-day money-back guarantee. If you\'re not satisfied with your subscription within 30 days of purchase, contact support for a full refund.'
    },
    {
      question: 'Can I cancel my subscription anytime?',
      answer: 'Yes, you can cancel your subscription at any time with no penalties. You\'ll retain your plan features until the end of your billing period.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express) and digital wallets through our secure Stripe payment system.'
    },
    {
      question: 'Is there a discount for yearly billing?',
      answer: 'Yes! Annual subscriptions are 17% off. Creator is £49/year (£4.08/month) vs £59.88 monthly. Premium is £99/year (£8.25/month) vs £119.88 monthly.'
    },
    {
      question: 'Do you offer educational or non-profit discounts?',
      answer: 'We offer special pricing for students, teachers, and non-profit organizations. Contact support with verification for discount eligibility.'
    },
    {
      question: 'What\'s the difference between Creator and Premium?',
      answer: 'Creator (£4.99/month) gives you 20 pages, 15 AI generations/day, and PDF+EPUB export. Premium (£9.99/month) offers unlimited pages, 50 AI generations/day, all export formats (including DOCX), and priority support. Choose Creator if you\'re writing shorter ebooks or are just getting started.'
    }
  ];

  const yearlyPrice = (plan: typeof plans[0]) => {
    // For yearly billing, the price is the annual total (not monthly rate * 12)
    return plan.price.yearly;
  };

  const monthlySavings = (plan: typeof plans[0]) => {
    if (plan.price.monthly === 0) return 0;
    return (plan.price.monthly * 12) - yearlyPrice(plan);
  };

  const displayPrice = (plan: typeof plans[0]) => {
    if (billingInterval === 'monthly') {
      return plan.price.monthly;
    } else {
      // For annual billing, show the monthly equivalent
      return plan.price.yearly === 0 ? 0 : (plan.price.yearly / 12).toFixed(2);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="InkfluenceAI Pricing - Free AI Ebook Creator | Premium Plans Available"
        description="Start creating professional ebooks for free with InkfluenceAI. Upgrade to Premium for advanced AI features, unlimited exports, custom branding, and priority support. No credit card required."
        keywords="AI ebook creator pricing, free ebook maker, premium ebook software, AI writing assistant cost, ebook creation plans"
        canonicalUrl="https://inkfluenceai.com/pricing"
        structuredData={{
          ...createSoftwareApplicationSchema(),
          "@graph": [
            createSoftwareApplicationSchema(),
            createBreadcrumbSchema([
              { name: "Home", url: "https://inkfluenceai.com/" },
              { name: "Pricing", url: "https://inkfluenceai.com/pricing" }
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
                <Crown className="w-12 h-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Start free and upgrade when you're ready. No hidden fees, no long-term contracts.
            </p>
            
            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className={`text-sm font-medium ${billingInterval === 'monthly' ? 'text-foreground' : 'text-muted-foreground'}`}>
                Monthly
              </span>
              <button
                onClick={() => setBillingInterval(billingInterval === 'monthly' ? 'yearly' : 'monthly')}
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    billingInterval === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm font-medium ${billingInterval === 'yearly' ? 'text-foreground' : 'text-muted-foreground'}`}>
                Yearly
              </span>
              {billingInterval === 'yearly' && (
                <Badge variant="secondary" className="ml-2">
                  Save 17%
                </Badge>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-primary to-accent text-white px-4 py-1">
                      <Star className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                <Card className={`neomorph-flat border-0 h-full ${plan.popular ? 'neomorph-raised scale-105' : ''}`}>
                  <CardContent className="p-8">
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground mb-6">{plan.tagline}</p>
                      
                      <div className="mb-6">
                        <div className="flex items-baseline justify-center gap-1">
                          {plan.price.monthly === 0 ? (
                            <span className="text-4xl font-bold">Free</span>
                          ) : (
                            <>
                              <span className="text-4xl font-bold">
                                ${displayPrice(plan)}
                              </span>
                              <span className="text-muted-foreground">/month</span>
                            </>
                          )}
                        </div>
                        {billingInterval === 'yearly' && plan.price.yearly > 0 && (
                          <div className="text-sm text-muted-foreground mt-2">
                            <span className="font-semibold text-foreground">
                              £{yearlyPrice(plan)} billed annually
                            </span>
                            <br />
                            <span className="text-green-600 font-medium">
                              Save £{monthlySavings(plan).toFixed(2)} per year
                            </span>
                          </div>
                        )}
                        {billingInterval === 'monthly' && plan.price.monthly > 0 && (
                          <div className="text-sm text-muted-foreground mt-2">
                            Billed monthly
                          </div>
                        )}
                      </div>

                      <Button 
                        className={`w-full ${
                          plan.ctaStyle === 'primary' 
                            ? 'bg-gradient-to-r from-primary to-accent text-white' 
                            : ''
                        }`}
                        variant={plan.ctaStyle === 'primary' ? 'default' : 'outline'}
                        size="lg"
                        onClick={() => {
                          if (user) {
                            navigate('/app/dashboard');
                          } else {
                            navigate('/?signin=true');
                          }
                        }}
                      >
                        {user ? plan.ctaText : (plan.name === 'Free' ? 'Get Started Free' : 'Get Started')}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                        What's Included
                      </h4>
                      <div className="space-y-3">
                        {plan.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center gap-3">
                            <CheckCircle 
                              className={`w-4 h-4 ${
                                feature.included 
                                  ? 'text-green-500' 
                                  : 'text-muted-foreground/30'
                              }`} 
                            />
                            <span 
                              className={`text-sm ${
                                feature.included 
                                  ? 'text-foreground' 
                                  : 'text-muted-foreground/50 line-through'
                              }`}
                            >
                              {feature.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Compare Features
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See exactly what you get with each plan
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="neomorph-flat border-0 h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <feature.icon className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-semibold">{feature.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {feature.description}
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Free:</span>
                        <span>{feature.freeFeature}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Premium:</span>
                        <span className="text-primary font-medium">{feature.premiumFeature}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-[#f0e8f8]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block px-3 py-1 bg-purple-100 rounded-full text-[#7a5f96] text-sm font-medium mb-4">
              What Our Users Say
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Real Value, Real Results
            </h2>
            <p className="text-lg text-muted-foreground">
              See why thousands of creators choose Inkfluence AI
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 shadow-lg">
              <CardContent className="p-0 space-y-3">
                <div className="flex gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-700 italic">
                  "The ROI is incredible. Premium paid for itself in the first month from increased productivity alone."
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#9b87b8] to-[#b89ed6] rounded-full flex items-center justify-center text-white text-xs font-bold">
                    RG
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Nina Voss</div>
                    <div className="text-xs text-gray-600">Life Coach</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6 shadow-lg">
              <CardContent className="p-0 space-y-3">
                <div className="flex gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-700 italic">
                  "Started with Free tier to test, upgraded to Premium within a week. Best decision for my writing business."
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#9b87b8] to-[#b89ed6] rounded-full flex items-center justify-center text-white text-xs font-bold">
                    DR
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Tyler Brennan</div>
                    <div className="text-xs text-gray-600">Author</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6 shadow-lg">
              <CardContent className="p-0 space-y-3">
                <div className="flex gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-700 italic">
                  "Premium features are worth every penny. The custom branding alone has elevated my entire brand image."
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#9b87b8] to-[#b89ed6] rounded-full flex items-center justify-center text-white text-xs font-bold">
                    LM
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Aria Castellano</div>
                    <div className="text-xs text-gray-600">Entrepreneur</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button 
              onClick={() => navigate('/testimonials')}
              variant="outline"
              className="border-2 border-[#9b87b8] text-[#7a5f96] hover:bg-[#f0e8f8] hover:text-[#7a5f96]"
            >
              See All Reviews
              <Star className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about our pricing
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="neomorph-flat border-0 h-full">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-3 text-sm">{faq.question}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Creating?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of authors who trust Inkfluence AI to bring their ideas to life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate(user ? '/app/dashboard' : '/')}
              className="bg-gradient-to-r from-primary to-accent text-white"
            >
              Start Free Today
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => navigate('/help')}
            >
              <HelpCircle className="w-5 h-5 mr-2" />
              Have Questions?
            </Button>
          </div>
        </div>
      </section>

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
        onNavigateToTestimonials={() => navigate('/testimonials')}
        onNavigateToCaseStudies={() => navigate('/case-studies')}
        onNavigateToFAQ={() => navigate('/faq')}
      />
    </div>
  );
}

export default PricingPage;