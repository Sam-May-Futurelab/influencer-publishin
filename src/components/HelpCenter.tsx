import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LandingHeader } from '@/components/LandingHeader';
import { LandingFooter } from '@/components/LandingFooter';
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

interface HelpCenterProps {
  onNavigate: (page: string) => void;
  isAuthenticated: boolean;
}

export function HelpCenter({ onNavigate, isAuthenticated }: HelpCenterProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    {
      icon: FileText,
      title: 'Getting Started',
      description: 'Learn the basics',
      color: 'from-blue-500/20 to-blue-600/20',
      textColor: 'text-blue-600'
    },
    {
      icon: Palette,
      title: 'Cover Design',
      description: 'Create beautiful covers',
      color: 'from-purple-500/20 to-purple-600/20',
      textColor: 'text-purple-600'
    },
    {
      icon: Download,
      title: 'Exporting',
      description: 'Export your ebooks',
      color: 'from-green-500/20 to-green-600/20',
      textColor: 'text-green-600'
    },
    {
      icon: Zap,
      title: 'AI Features',
      description: 'Use AI to write faster',
      color: 'from-yellow-500/20 to-yellow-600/20',
      textColor: 'text-yellow-600'
    }
  ];

  const faqs = [
    {
      question: 'How do I create my first ebook project?',
      answer: 'Click "New Project" on your dashboard, give it a title and description, then start adding chapters. Use the AI assistant to generate content or write manually. You can customize fonts, colors, and branding in Project Settings.'
    },
    {
      question: 'What is the daily AI generation limit?',
      answer: 'Free users get 3 AI generations per day. Premium users get 50 AI generations daily. Each generation can create 200-500 words of content based on your prompt. The limit resets at midnight UTC.'
    },
    {
      question: 'How do I design a custom cover?',
      answer: 'Open any project, click the "Customize" dropdown, and select "Cover Designer". Choose a template or start from scratch. Customize backgrounds (solid colors, gradients, or images), change fonts, adjust text sizes and colors, then save. Your cover will appear in exports and previews.'
    },
    {
      question: 'What export formats are available?',
      answer: 'You can export to PDF (best for sharing/reading), EPUB (for eReaders like Kindle), and DOCX (for further editing in Word). All formats include your custom cover, branding, and formatting.'
    },
    {
      question: 'Can I customize fonts and colors?',
      answer: 'Yes! Go to Project Settings to set your primary color, fonts (heading and body), and custom watermark. These settings apply to your entire ebook. For covers, the Cover Designer offers 8 Google Fonts and unlimited color options.'
    },
    {
      question: 'How does auto-save work?',
      answer: 'Your work is automatically saved every few seconds as you type. You\'ll see a "Saved" indicator in the header. All changes are synced to the cloud, so you can access your work from any device.'
    },
    {
      question: 'Can I import existing documents?',
      answer: 'Currently, you can copy and paste content from other documents. We\'re working on direct import from Word (.docx) and Google Docs - coming soon!'
    },
    {
      question: 'How do I upgrade to Premium?',
      answer: 'Click "Upgrade" in the top navigation or when you hit your daily AI limit. Choose between monthly ($9.99) or yearly ($99/year - save 17%) plans. Payment is processed securely through Stripe.'
    },
    {
      question: 'Can I cancel my subscription anytime?',
      answer: 'Yes! Go to Profile → Billing and click "Manage Subscription". You can cancel anytime with no penalties. You\'ll retain Premium features until the end of your billing period.'
    },
    {
      question: 'Is my content private and secure?',
      answer: 'Absolutely. All data is encrypted in transit and at rest. We use Firebase (Google Cloud) for secure storage. Your content is private to you - we never share, sell, or use it for AI training.'
    },
    {
      question: 'Can I collaborate with others?',
      answer: 'Team collaboration is coming soon! Currently, each account is for individual use. Follow our roadmap for updates on multi-user features.'
    },
    {
      question: 'How do I delete a project?',
      answer: 'Go to "My Books", find the project you want to delete, click the menu (three dots), and select "Delete". This action cannot be undone, so make sure to export any content you want to keep first.'
    },
    {
      question: 'What happens if I hit the page limit?',
      answer: 'Free users get 4 pages total. Premium users get unlimited pages. A "page" is approximately 250 words. When you hit your limit, you can upgrade to Premium or export your existing work and start a new project.'
    },
    {
      question: 'Can I use Inkfluence AI offline?',
      answer: 'You need an internet connection to use Inkfluence AI since it\'s a cloud-based platform. However, you can export your ebooks and read them offline anytime.'
    },
    {
      question: 'How do I contact support?',
      answer: 'Email us at support@inkfluenceai.com or use the contact form. We typically respond within 24 hours on business days.'
    }
  ];

  const tutorials = [
    {
      icon: FileText,
      title: 'Creating Your First Ebook',
      description: 'Learn how to start a new project, add chapters, and write content',
      time: '5 min read'
    },
    {
      icon: Sparkles,
      title: 'Using AI Content Generation',
      description: 'Master AI prompts to generate high-quality content faster',
      time: '7 min read'
    },
    {
      icon: Palette,
      title: 'Designing Custom Covers',
      description: 'Create professional book covers with the Cover Designer',
      time: '10 min read'
    },
    {
      icon: Download,
      title: 'Exporting & Publishing',
      description: 'Export to PDF, EPUB, and DOCX for distribution',
      time: '4 min read'
    },
    {
      icon: Shield,
      title: 'Brand Customization',
      description: 'Set custom fonts, colors, and watermarks for your ebooks',
      time: '6 min read'
    },
    {
      icon: Zap,
      title: 'Productivity Tips & Shortcuts',
      description: 'Work faster with keyboard shortcuts and pro tips',
      time: '8 min read'
    }
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader 
        onNavigateToHome={() => onNavigate('landing')}
        onNavigateToAbout={() => onNavigate('about')}
        onNavigateToHelp={() => onNavigate('help')}
        onGetStarted={() => onNavigate(isAuthenticated ? 'dashboard' : 'landing')}
        showNavLinks={true}
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
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="neomorph-flat border-0 hover:neomorph-raised transition-all duration-300 cursor-pointer h-full">
                  <CardContent className="p-6">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${category.color} w-fit mb-4`}>
                      <category.icon className={`w-6 h-6 ${category.textColor}`} />
                    </div>
                    <h3 className="text-lg font-semibold mb-1">{category.title}</h3>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tutorials.map((tutorial, index) => (
              <motion.div
                key={tutorial.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="neomorph-flat border-0 hover:neomorph-raised transition-all duration-300 cursor-pointer h-full group">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <tutorial.icon className="w-5 h-5 text-primary" />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {tutorial.time}
                      </Badge>
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

      {/* FAQ */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground">
              {searchQuery ? `${filteredFaqs.length} results found` : 'Quick answers to common questions'}
            </p>
          </div>

          <Card className="neomorph-flat border-0">
            <CardContent className="p-6 md:p-8">
              <Accordion type="single" collapsible className="w-full">
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
                    No results found for "{searchQuery}"
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
            <Button size="lg" asChild>
              <a href="mailto:support@inkfluenceai.com">
                <MessageCircle className="w-5 h-5 mr-2" />
                Contact Support
              </a>
            </Button>
            <Button size="lg" variant="outline" onClick={() => onNavigate('about')}>
              <FileText className="w-5 h-5 mr-2" />
              About Us
            </Button>
          </div>
        </div>
      </section>

      <LandingFooter 
        onNavigateToAbout={() => onNavigate('about')}
        onNavigateToHelp={() => onNavigate('help')}
        onNavigateToPrivacy={() => onNavigate('privacy')}
        onNavigateToTerms={() => onNavigate('terms')}
        onNavigateToCookies={() => onNavigate('cookies')}
      />
    </div>
  );
}
