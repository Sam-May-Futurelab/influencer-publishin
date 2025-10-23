import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LandingHeader } from '@/components/LandingHeader';
import { LandingFooter } from '@/components/LandingFooter';
import { useEffect } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { 
  Sparkles, 
  BookOpen, 
  Palette, 
  Download,
  Zap,
  Shield,
  HelpCircle,
  Search,
  FileText,
  Lightbulb,
  MessageCircle,
  ArrowRight
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';

export function HelpCenter() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // SEO Meta Tags
  useEffect(() => {
    document.title = 'Help Center | Inkfluence AI - Ebook Creation Support & Tutorials';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Complete help center for Inkfluence AI ebook creation platform. Find tutorials, FAQs, and step-by-step guides for AI writing, cover design, publishing, and more.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Complete help center for Inkfluence AI ebook creation platform. Find tutorials, FAQs, and step-by-step guides for AI writing, cover design, publishing, and more.';
      document.head.appendChild(meta);
    }

    // Keywords meta tag
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', 'ebook creation help, AI writing assistant, book publishing guide, cover design tutorial, PDF export, EPUB creation, self-publishing help, content generation AI');

    // Open Graph tags
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute('content', 'Help Center | Inkfluence AI - Ebook Creation Support');

    let ogDescription = document.querySelector('meta[property="og:description"]');
    if (!ogDescription) {
      ogDescription = document.createElement('meta');
      ogDescription.setAttribute('property', 'og:description');
      document.head.appendChild(ogDescription);
    }
    ogDescription.setAttribute('content', 'Get help with AI-powered ebook creation. Comprehensive tutorials, FAQs, and guides for writing, designing, and publishing professional ebooks.');

    let ogType = document.querySelector('meta[property="og:type"]');
    if (!ogType) {
      ogType = document.createElement('meta');
      ogType.setAttribute('property', 'og:type');
      document.head.appendChild(ogType);
    }
    ogType.setAttribute('content', 'website');

    // Twitter Card tags
    let twitterCard = document.querySelector('meta[name="twitter:card"]');
    if (!twitterCard) {
      twitterCard = document.createElement('meta');
      twitterCard.setAttribute('name', 'twitter:card');
      document.head.appendChild(twitterCard);
    }
    twitterCard.setAttribute('content', 'summary_large_image');

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', window.location.origin + '/help');

    // Structured data for FAQs
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "name": "Inkfluence AI Help Center",
      "description": "Frequently asked questions about Inkfluence AI ebook creation platform",
      "mainEntity": faqs.slice(0, 10).map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    };

    let structuredDataScript = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;
    if (!structuredDataScript) {
      structuredDataScript = document.createElement('script');
      structuredDataScript.type = 'application/ld+json';
      document.head.appendChild(structuredDataScript);
    }
    structuredDataScript.textContent = JSON.stringify(structuredData);

    // Cleanup function
    return () => {
      document.title = 'Inkfluence AI - AI-Powered Ebook Creation Platform';
    };
  }, []);

  const categories = [
    {
      icon: FileText,
      title: 'Getting Started',
      description: 'Project creation, chapters, basics',
      color: 'from-blue-500/20 to-blue-600/20',
      textColor: 'text-blue-600',
      count: '2 articles'
    },
    {
      icon: Sparkles,
      title: 'AI Writing Assistant',
      description: 'Content generation, prompts, enhancement',
      color: 'from-purple-500/20 to-purple-600/20',
      textColor: 'text-purple-600',
      count: '4 articles'
    },
    {
      icon: Palette,
      title: 'Design & Customization',
      description: 'Covers, branding, fonts, colors',
      color: 'from-pink-500/20 to-pink-600/20',
      textColor: 'text-pink-600',
      count: '4 articles'
    },
    {
      icon: Download,
      title: 'Export & Publishing',
      description: 'PDF, EPUB, Kindle, distribution',
      color: 'from-green-500/20 to-green-600/20',
      textColor: 'text-green-600',
      count: '4 articles'
    },
    {
      icon: BookOpen,
      title: 'Templates & Examples',
      description: 'Pre-made templates, content ideas',
      color: 'from-orange-500/20 to-orange-600/20',
      textColor: 'text-orange-600',
      count: '1 article'
    },
    {
      icon: Shield,
      title: 'Account & Billing',
      description: 'Premium features, payments, security',
      color: 'from-red-500/20 to-red-600/20',
      textColor: 'text-red-600',
      count: '6 articles'
    },
    {
      icon: Zap,
      title: 'Productivity Tips',
      description: 'Workflows, analytics, shortcuts',
      color: 'from-yellow-500/20 to-yellow-600/20',
      textColor: 'text-yellow-600',
      count: '3 articles'
    },
    {
      icon: HelpCircle,
      title: 'Troubleshooting',
      description: 'Common issues, solutions, support',
      color: 'from-gray-500/20 to-gray-600/20',
      textColor: 'text-gray-600',
      count: '5 articles'
    }
  ];

  const faqs = [
    // Getting Started FAQs
    {
      question: 'How do I create my first ebook project?',
      answer: 'Click "New Project" on your dashboard, give it a title and description, then start adding chapters. Use the AI assistant to generate content or write manually. You can customize fonts, colors, and branding in Project Settings.',
      category: 'Getting Started'
    },
    {
      question: 'What ebook templates are available?',
      answer: 'We offer 20+ professional templates including fitness guides, business growth, personal finance, productivity, marketing strategies, self-help, cooking recipes, and more. Premium templates include 6+ pre-written chapters with full content.',
      category: 'Templates & Examples'
    },
    {
      question: 'How do I organize my ebook chapters?',
      answer: 'Each project can have unlimited chapters (Premium) or up to 4 pages (Free). Add new chapters using the "+" button, reorder them by dragging, and use the chapter navigation sidebar to jump between sections quickly.',
      category: 'Getting Started'
    },
    {
      question: 'Can I set writing goals and track progress?',
      answer: 'Yes! Go to your Dashboard to see writing analytics including total words written, chapters completed, and daily progress. Set custom word count goals to stay motivated and track your publishing journey.',
      category: 'Productivity Tips'
    },
    
    // AI Features FAQs
    {
      question: 'What is the daily AI generation limit?',
      answer: 'Free users get 3 AI generations per day. Premium users get 50 AI generations daily. Each generation can create 100-300 words of content based on your prompt and selected length. The limit resets at midnight UTC.',
      category: 'AI Writing Assistant'
    },
    {
      question: 'How do I write effective AI prompts?',
      answer: 'Use specific keywords separated by commas like "productivity tips, time management, goal setting". Choose your preferred tone (friendly, professional, motivational) and length (brief, standard, detailed, comprehensive). The AI works best with clear, focused topics.',
      category: 'AI Writing Assistant'
    },
    {
      question: 'What AI content types can I generate?',
      answer: 'The AI creates 4 content types: detailed outlines with main points, engaging introductions that hook readers, practical tips and key insights, and compelling conclusions that motivate action. Each type is optimized for different chapter sections.'
    },
    {
      question: 'Can I enhance existing content with AI?',
      answer: 'Yes! Select any text in your chapter and use the "Enhance with AI" feature. Choose your desired tone, format (intro, bullets, steps, Q&A, narrative), and length to improve clarity, add examples, and enhance readability.',
      category: 'AI Writing Assistant'
    },
    {
      question: 'What genres work best with AI generation?',
      answer: 'Our AI excels at business, self-help, fitness, productivity, marketing, personal finance, cooking, and educational content. It understands context and can adapt to your specific niche and target audience.',
      category: 'AI Writing Assistant'
    },
    
    // Design & Customization FAQs  
    {
      question: 'How do I design a custom cover?',
      answer: 'Open any project, click the "Customize" dropdown, and select "Cover Designer". Choose from professional templates or start from scratch. Customize backgrounds (solid colors, gradients, or images), change fonts, adjust text sizes and colors, then save. Your cover appears in all exports and previews.',
      category: 'Design & Customization'
    },
    {
      question: 'Can I customize fonts and colors throughout my ebook?',
      answer: 'Yes! Go to Project Settings to set your primary brand color, heading and body fonts, and custom watermark. These settings apply to your entire ebook automatically. The Cover Designer offers 8 Google Fonts and unlimited color options for covers.',
      category: 'Design & Customization'
    },
    {
      question: 'How do I add my personal branding?',
      answer: 'In Project Settings, upload your logo as a watermark, set brand colors, choose fonts that match your style, and customize the cover design. Your branding will appear consistently across all exports (PDF, EPUB, DOCX).',
      category: 'Design & Customization'
    },
    {
      question: 'Can I preview my ebook before exporting?',
      answer: 'Absolutely! Use the "Preview" button to see exactly how your ebook will look when exported. The preview shows your custom cover, formatting, fonts, colors, and full chapter layout in PDF format.',
      category: 'Design & Customization'
    },
    
    // Export & Publishing FAQs
    {
      question: 'What export formats are available?',
      answer: 'You can export to PDF (best for sharing/reading), EPUB (for eReaders like Kindle), and DOCX (for further editing in Word). All formats include your custom cover, branding, and professional formatting with table of contents.',
      category: 'Export & Publishing'
    },
    {
      question: 'How do I publish my ebook on Amazon Kindle?',
      answer: 'Export your ebook as EPUB format, then upload it to Amazon Kindle Direct Publishing (KDP). Your exported file includes professional formatting, cover, and metadata needed for publishing. The PDF version works great for lead magnets and direct sales.',
      category: 'Export & Publishing'
    },
    {
      question: 'Can I customize export settings?',
      answer: 'Yes! When exporting, you can add author information, website, copyright details, choose chapter numbering style (numeric, roman, or none), include/exclude table of contents, and set copyright page position (beginning or end).',
      category: 'Export & Publishing'
    },
    {
      question: 'Does the export include my custom cover?',
      answer: 'Yes! All export formats (PDF, EPUB, DOCX) automatically include your custom-designed cover as the first page. The cover maintains its high-quality design and branding across all formats.',
      category: 'Export & Publishing'
    },
    
    // Account & Billing FAQs
    {
      question: 'What\'s included in the Free vs Premium plan?',
      answer: 'Free: 4 pages total, 3 AI generations daily, basic templates, PDF export. Premium ($9.99/month): Unlimited pages, 50 AI generations daily, 20+ premium templates, all export formats (PDF/EPUB/DOCX), advanced cover designer, priority support.',
      category: 'Account & Billing'
    },
    {
      question: 'How do I upgrade to Premium?',
      answer: 'Click "Upgrade" in the top navigation or when you hit your daily AI limit. Choose between monthly ($9.99) or yearly ($99/year - save 17%) plans. Payment is processed securely through Stripe with instant activation.',
      category: 'Account & Billing'
    },
    {
      question: 'Can I cancel my subscription anytime?',
      answer: 'Yes! Go to Profile → Billing and click "Manage Subscription". You can cancel anytime with no penalties. You\'ll retain Premium features until the end of your billing period, then revert to the Free plan automatically.',
      category: 'Account & Billing'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express), debit cards, and digital wallets through our secure Stripe payment system. All transactions are encrypted and PCI compliant.',
      category: 'Account & Billing'
    },
    
    // Technical & Security FAQs
    {
      question: 'How does auto-save work?',
      answer: 'Your work is automatically saved every few seconds as you type. You\'ll see a "Saved" indicator in the header when changes are synced. All data is stored securely in the cloud, so you can access your projects from any device.',
      category: 'Productivity Tips'
    },
    {
      question: 'Is my content private and secure?',
      answer: 'Absolutely. All data is encrypted in transit (HTTPS) and at rest using Firebase (Google Cloud) enterprise-grade security. Your content is private to you - we never share, sell, or use it for AI training. You maintain full ownership of your work.',
      category: 'Account & Billing'
    },
    {
      question: 'Can I access my projects from multiple devices?',
      answer: 'Yes! Your projects are cloud-synced and accessible from any device with internet access. Simply log in to your account from any computer, tablet, or mobile device to continue working on your ebooks.',
      category: 'Productivity Tips'
    },
    {
      question: 'What happens if I delete a project?',
      answer: 'Deleted projects are permanently removed and cannot be recovered. Before deleting, make sure to export any content you want to keep. We recommend exporting important projects as PDF backups for safekeeping.',
      category: 'Troubleshooting'
    },
    {
      question: 'Do you offer data export or backup options?',
      answer: 'Yes! You can export individual projects as PDF, EPUB, or DOCX files anytime. For complete account data export, contact support and we\'ll provide a full backup of your projects and settings within 48 hours.',
      category: 'Account & Billing'
    },
    
    // Support & Troubleshooting FAQs
    {
      question: 'Can I import existing documents?',
      answer: 'Currently, you can copy and paste content from Word, Google Docs, or other sources. We preserve basic formatting like bold, italics, and paragraphs. Direct file import for Word (.docx) and Google Docs is coming soon!',
      category: 'Troubleshooting'
    },
    {
      question: 'What browsers are supported?',
      answer: 'Inkfluence AI works best on modern browsers: Chrome, Firefox, Safari, and Edge. We recommend keeping your browser updated for the best experience. Mobile browsers are supported for editing, though the desktop experience is optimized for writing.',
      category: 'Troubleshooting'
    },
    {
      question: 'Why is my AI generation slow or failing?',
      answer: 'AI generation typically takes 5-15 seconds. Slow performance may be due to high server load or poor internet connection. If generations fail, check your internet connection and try again. Contact support if issues persist.',
      category: 'Troubleshooting'
    },
    {
      question: 'How do I contact support?',
      answer: 'Email us at support@inkfluenceai.com for technical issues, billing questions, or feature requests. We typically respond within 24 hours on business days. Premium users receive priority support with faster response times.',
      category: 'Troubleshooting'
    },
    {
      question: 'Do you offer refunds?',
      answer: 'We offer a 30-day money-back guarantee for Premium subscriptions. If you\'re not satisfied within 30 days of your first payment, contact support for a full refund. After 30 days, you can cancel anytime to avoid future charges.'
    }
  ];

  const tutorials = [
    {
      icon: FileText,
      title: 'Creating Your First Ebook Project',
      description: 'Complete guide to starting a new project, adding chapters, organizing content, and setting up your ebook structure',
      time: '5 min read',
      category: 'Getting Started'
    },
    {
      icon: Sparkles,
      title: 'Mastering AI Content Generation',
      description: 'Learn to write effective prompts, choose the right tone and length, and generate high-quality content that matches your voice',
      time: '7 min read',
      category: 'AI Features'
    },
    {
      icon: Lightbulb,
      title: 'AI Enhancement & Content Editing',
      description: 'How to use AI to improve existing content, change tone, add examples, and enhance readability and engagement',
      time: '6 min read',
      category: 'AI Features'
    },
    {
      icon: BookOpen,
      title: 'Using Professional Templates',
      description: 'Browse 20+ templates, customize pre-written content, and adapt professional structures to your niche',
      time: '4 min read',
      category: 'Templates'
    },
    {
      icon: Palette,
      title: 'Designing Custom Book Covers',
      description: 'Step-by-step cover design tutorial with templates, gradients, fonts, and professional branding techniques',
      time: '10 min read',
      category: 'Design'
    },
    {
      icon: Shield,
      title: 'Brand Customization & Settings',
      description: 'Set up custom fonts, brand colors, watermarks, and consistent styling across your entire ebook',
      time: '6 min read',
      category: 'Customization'
    },
    {
      icon: Download,
      title: 'Exporting & Publishing Your Ebook',
      description: 'Export to PDF, EPUB, and DOCX formats, set up metadata, and prepare for Amazon Kindle and other platforms',
      time: '8 min read',
      category: 'Publishing'
    },
    {
      icon: Zap,
      title: 'Writing Productivity & Analytics',
      description: 'Set writing goals, track progress, use auto-save effectively, and optimize your writing workflow',
      time: '5 min read',
      category: 'Productivity'
    },
    {
      icon: FileText,
      title: 'Content Organization & Structure',
      description: 'Best practices for chapter organization, using headings, creating flow, and structuring compelling ebooks',
      time: '9 min read',
      category: 'Writing Tips'
    },
    {
      icon: Search,
      title: 'Project Management & Workflow',
      description: 'Manage multiple projects, use search and filters, preview drafts, and maintain organized workflows',
      time: '4 min read',
      category: 'Organization'
    },
    {
      icon: HelpCircle,
      title: 'Troubleshooting Common Issues',
      description: 'Solutions for AI generation problems, export issues, formatting problems, and account management',
      time: '6 min read',
      category: 'Support'
    },
    {
      icon: MessageCircle,
      title: 'From Free to Premium: Upgrade Guide',
      description: 'When to upgrade, comparing features, billing management, and getting the most from Premium features',
      time: '3 min read',
      category: 'Premium Features'
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === '' || faq.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

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
              How can we help you?
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Find answers, learn new skills, and get the most out of Inkfluence AI
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search for help articles..."
                  className="pl-12 h-14 text-lg neomorph-inset border-0"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
            Browse by Category
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className={`border-0 hover:neomorph-raised transition-all duration-300 cursor-pointer h-full ${
                    selectedCategory === category.title 
                      ? 'neomorph-raised ring-2 ring-primary/30' 
                      : 'neomorph-flat'
                  }`}
                  onClick={() => {
                    if (selectedCategory === category.title) {
                      setSelectedCategory('');
                    } else {
                      setSelectedCategory(category.title);
                      // Scroll to FAQ section
                      document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  <CardContent className="p-6">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${category.color} w-fit mb-4`}>
                      <category.icon className={`w-6 h-6 ${category.textColor}`} />
                    </div>
                    <h3 className="text-lg font-semibold mb-1">{category.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{category.description}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground font-medium">{category.count}</p>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tutorials */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">
              Step-by-Step Tutorials
            </h2>
            <Lightbulb className="w-8 h-8 text-primary" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tutorials.map((tutorial, index) => (
              <motion.div
                key={tutorial.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className="neomorph-flat border-0 hover:neomorph-raised transition-all duration-300 cursor-pointer h-full group"
                  onClick={() => {
                    // For now, scroll to the tutorial in the FAQ section
                    setSearchQuery(tutorial.title.split(' ').slice(0, 3).join(' '));
                    document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <tutorial.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant="secondary" className="text-xs">
                          {tutorial.time}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {tutorial.category}
                        </Badge>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                      {tutorial.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {tutorial.description}
                    </p>
                    <div className="flex items-center text-sm text-primary font-medium">
                      Read tutorial
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Start Guide */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              🚀 Quick Start Guide
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              New to Inkfluence AI? Follow these simple steps to create your first professional ebook in under 15 minutes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '1',
                title: 'Create Your Project',
                description: 'Click "New Project" on your dashboard. Choose a compelling title and brief description for your ebook.',
                icon: '📝',
                tip: 'Use specific, keyword-rich titles for better discoverability'
              },
              {
                step: '2', 
                title: 'Add & Organize Chapters',
                description: 'Structure your ebook with logical chapters. Use the "+" button to add new chapters and drag to reorder.',
                icon: '📚',
                tip: 'Plan 5-10 chapters for optimal ebook length'
              },
              {
                step: '3',
                title: 'Generate AI Content',
                description: 'Use specific keywords like "time management, productivity tips" to generate relevant, high-quality content.',
                icon: '🤖',
                tip: 'Be specific with keywords for better AI results'
              },
              {
                step: '4',
                title: 'Customize & Export',
                description: 'Design your cover, set brand colors, preview your ebook, then export as PDF, EPUB, or DOCX.',
                icon: '🎨',
                tip: 'Use your brand colors for professional consistency'
              }
            ].map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <Card className="neomorph-flat border-0 h-full hover:neomorph-raised transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                        {step.step}
                      </div>
                      <span className="text-2xl">{step.icon}</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-3">{step.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{step.description}</p>
                    <div className="bg-primary/10 p-3 rounded-lg border border-primary/20">
                      <p className="text-xs text-primary">
                        💡 <strong>Pro tip:</strong> {step.tip}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button 
              size="lg" 
              onClick={() => navigate(user ? '/app/dashboard' : '/')}
              className="bg-gradient-to-r from-primary to-accent text-white"
            >
              {user ? 'Go to Dashboard' : 'Start Creating Now'} 
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq-section" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              {selectedCategory ? `${selectedCategory} - Help Articles` : 'Frequently Asked Questions'}
            </h2>
            <p className="text-lg text-muted-foreground">
              {searchQuery || selectedCategory ? (
                <>
                  {filteredFaqs.length} results found
                  {(searchQuery || selectedCategory) && (
                    <button 
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('');
                      }}
                      className="ml-2 text-primary hover:underline text-sm"
                    >
                      Clear filters
                    </button>
                  )}
                </>
              ) : (
                'Quick answers to common questions'
              )}
            </p>
          </div>

          <Card className="neomorph-flat border-0">
            <CardContent className="p-6 md:p-8">
              <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
                {filteredFaqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left text-base md:text-lg font-semibold hover:text-primary">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              
              {filteredFaqs.length === 0 && (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-lg text-muted-foreground">
                    {searchQuery 
                      ? `No results found for "${searchQuery}"` 
                      : selectedCategory 
                        ? `No articles found in "${selectedCategory}"`
                        : 'No results found'
                    }
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Try a different search term or browse by category
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Popular Topics */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              🔥 Popular Topics
            </h2>
            <p className="text-lg text-muted-foreground">
              Most searched help topics by our community
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { topic: 'How to write effective AI prompts', icon: '🎯', searches: '1.2k' },
              { topic: 'Export ebook to Amazon Kindle', icon: '📖', searches: '980' },
              { topic: 'Design professional book covers', icon: '🎨', searches: '850' },
              { topic: 'Upgrade to Premium features', icon: '👑', searches: '720' },
              { topic: 'Fix AI generation errors', icon: '🔧', searches: '650' },
              { topic: 'Set up custom branding', icon: '🏢', searches: '580' },
              { topic: 'Organize multiple projects', icon: '📁', searches: '490' },
              { topic: 'Export formatting options', icon: '⚙️', searches: '420' },
              { topic: 'Cancel subscription safely', icon: '💳', searches: '380' }
            ].map((item, index) => (
              <motion.div
                key={item.topic}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-background/50 transition-colors cursor-pointer"
                onClick={() => setSearchQuery(item.topic.split(' ').slice(0, 3).join(' '))}
              >
                <span className="text-xl">{item.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.topic}</p>
                  <p className="text-xs text-muted-foreground">{item.searches} searches</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10">
              <MessageCircle className="w-10 h-10 text-primary" />
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Still need help?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/contact')}>
              <MessageCircle className="w-5 h-5 mr-2" />
              Contact Form
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="mailto:support@inkfluenceai.com">
                <MessageCircle className="w-5 h-5 mr-2" />
                Email Support
              </a>
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/about')}>
              <FileText className="w-5 h-5 mr-2" />
              About Us
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
      />
    </div>
  );
}
