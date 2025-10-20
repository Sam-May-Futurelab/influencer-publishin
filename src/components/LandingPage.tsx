import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  BookOpen, Sparkles, FileText, Download, Palette, TrendingUp, 
  Zap, Users, Award, Play, CheckCircle2, ArrowRight,
  Twitter, Linkedin, Instagram, Github, Mail, Star
} from 'lucide-react';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { motion } from 'framer-motion';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export function LandingPage({ onGetStarted, onSignIn }: LandingPageProps) {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0e8f8] to-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#e2d1f0] shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-[#9b87b8]" />
            <span className="text-2xl font-bold bg-gradient-to-r from-[#9b87b8] to-[#b89ed6] bg-clip-text text-transparent">
              Inkfluence AI
            </span>
          </div>
          
          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => scrollToSection('features')}
              className="text-gray-600 hover:text-[#9b87b8] transition-colors font-medium"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection('pricing')}
              className="text-gray-600 hover:text-[#9b87b8] transition-colors font-medium"
            >
              Pricing
            </button>
            <button 
              onClick={() => scrollToSection('faq')}
              className="text-gray-600 hover:text-[#9b87b8] transition-colors font-medium"
            >
              FAQ
            </button>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={onSignIn} className="hidden sm:inline-flex">
              Sign In
            </Button>
            <Button 
              onClick={onGetStarted}
              className="bg-gradient-to-r from-[#9b87b8] to-[#b89ed6] hover:opacity-90 shadow-md hover:shadow-lg transition-all"
            >
              Get Started Free
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-8"
          >
            <div className="inline-block px-4 py-2 bg-[#e2d1f0] rounded-full text-[#7a5f96] font-medium">
              ✨ AI-Powered Book Writing Platform
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              From concept to{' '}
              <span className="bg-gradient-to-r from-[#9b87b8] to-[#b89ed6] bg-clip-text text-transparent">
                published book
              </span>
              {' '}in seconds
            </h1>
            
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Write, organize, and publish your book with AI-powered assistance. 
              From chapter outlines to full manuscripts, Inkfluence AI helps authors bring their stories to life.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                onClick={onGetStarted}
                className="bg-gradient-to-r from-[#9b87b8] to-[#b89ed6] hover:opacity-90 text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
              >
                <Sparkles className="mr-2 w-5 h-5" />
                Start Writing for Free
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-2 border-[#9b87b8] text-[#7a5f96] hover:bg-[#f0e8f8] text-lg px-8 py-6"
              >
                <Play className="mr-2 w-5 h-5" />
                Watch Demo
              </Button>
            </div>
            
            <p className="text-sm text-gray-500">
              No credit card required • Free 5 pages • Upgrade anytime
            </p>
          </motion.div>

          {/* Demo/Preview Area */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-16 rounded-2xl overflow-hidden shadow-2xl border border-[#e2d1f0]"
          >
            <div className="bg-gradient-to-br from-[#9b87b8] to-[#b89ed6] p-8 md:p-16 min-h-[400px] flex items-center justify-center relative">
              <div className="absolute inset-0 bg-grid-white/10"></div>
              <div className="relative text-white text-center space-y-6">
                <BookOpen className="w-32 h-32 mx-auto opacity-80" />
                <p className="text-2xl font-semibold">Interactive Product Demo</p>
                <p className="text-lg opacity-90">See Inkfluence AI in action</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-gray-600 mb-8 font-medium">Trusted by authors worldwide</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-6 rounded-xl bg-white shadow-md"
            >
              <div className="text-4xl font-bold text-[#9b87b8] mb-2">10,000+</div>
              <div className="text-gray-600">Books Started</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-xl bg-white shadow-md"
            >
              <div className="text-4xl font-bold text-[#9b87b8] mb-2">50,000+</div>
              <div className="text-gray-600">Chapters Written</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="p-6 rounded-xl bg-white shadow-md"
            >
              <div className="text-4xl font-bold text-[#9b87b8] mb-2 flex items-center justify-center gap-1">
                4.9 <Star className="w-6 h-6 fill-[#9b87b8]" />
              </div>
              <div className="text-gray-600">Average Rating</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Sections */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="space-y-32">
          {/* Feature 1: AI Writing */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <div className="space-y-6">
              <div className="inline-block px-3 py-1 bg-purple-100 rounded-full text-[#7a5f96] text-sm font-medium">
                Make it quick
              </div>
              <h2 className="text-4xl md:text-5xl font-bold">
                From idea to chapter in 10 seconds
              </h2>
              <p className="text-lg text-gray-600">
                No more writer's block—just enter your topic, and let our AI writing assistant 
                do its magic. Start with AI-generated content, refine your message, and watch 
                your story unfold.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">AI-powered content generation from keywords</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Intelligent chapter outlines and structure</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Context-aware content suggestions</span>
                </li>
              </ul>
              <Button 
                onClick={onGetStarted}
                size="lg"
                className="bg-gradient-to-r from-[#9b87b8] to-[#b89ed6] hover:opacity-90"
              >
                Start Creating
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
            <div className="bg-gradient-to-br from-[#f0e8f8] to-[#e2d1f0] rounded-2xl p-8 h-96 flex items-center justify-center shadow-lg">
              <Sparkles className="w-32 h-32 text-[#9b87b8] opacity-50" />
            </div>
          </motion.div>

          {/* Feature 2: Organization */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <div className="bg-gradient-to-br from-[#e2d1f0] to-[#f0e8f8] rounded-2xl p-8 h-96 flex items-center justify-center order-2 md:order-1 shadow-lg">
              <BookOpen className="w-32 h-32 text-[#9b87b8] opacity-50" />
            </div>
            <div className="space-y-6 order-1 md:order-2">
              <div className="inline-block px-3 py-1 bg-purple-100 rounded-full text-[#7a5f96] text-sm font-medium">
                Make it structured
              </div>
              <h2 className="text-4xl md:text-5xl font-bold">
                Organize your masterpiece with ease
              </h2>
              <p className="text-lg text-gray-600">
                Keep your chapters, notes, and research organized in one beautiful interface. 
                Drag and drop to reorder, manage multiple projects, and never lose your work.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Intuitive chapter management</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Drag-and-drop reordering</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Cloud sync across all devices</span>
                </li>
              </ul>
              <Button 
                onClick={onGetStarted}
                size="lg"
                className="bg-gradient-to-r from-[#9b87b8] to-[#b89ed6] hover:opacity-90"
              >
                Start Creating
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </motion.div>

          {/* Feature 3: Customization */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <div className="space-y-6">
              <div className="inline-block px-3 py-1 bg-purple-100 rounded-full text-[#7a5f96] text-sm font-medium">
                Make it yours
              </div>
              <h2 className="text-4xl md:text-5xl font-bold">
                Beyond generation; true customization
              </h2>
              <p className="text-lg text-gray-600">
                Our AI lays the groundwork with expertly generated content, then hands the 
                reins to you. Customize fonts, colors, and layouts to match your unique style 
                and brand.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Custom color palettes and fonts</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Professional cover design options</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Brand logo integration</span>
                </li>
              </ul>
              <Button 
                onClick={onGetStarted}
                size="lg"
                className="bg-gradient-to-r from-[#9b87b8] to-[#b89ed6] hover:opacity-90"
              >
                Start Creating
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
            <div className="bg-gradient-to-br from-[#f0e8f8] to-[#e2d1f0] rounded-2xl p-8 h-96 flex items-center justify-center shadow-lg">
              <Palette className="w-32 h-32 text-[#9b87b8] opacity-50" />
            </div>
          </motion.div>

          {/* Feature 4: Export */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <div className="bg-gradient-to-br from-[#e2d1f0] to-[#f0e8f8] rounded-2xl p-8 h-96 flex items-center justify-center order-2 md:order-1 shadow-lg">
              <Download className="w-32 h-32 text-[#9b87b8] opacity-50" />
            </div>
            <div className="space-y-6 order-1 md:order-2">
              <div className="inline-block px-3 py-1 bg-purple-100 rounded-full text-[#7a5f96] text-sm font-medium">
                Make it happen
              </div>
              <h2 className="text-4xl md:text-5xl font-bold">
                Export in any format you need
              </h2>
              <p className="text-lg text-gray-600">
                Ready to publish? Export your manuscript as PDF, DOCX, or even generate an 
                eBook-ready EPUB. Your content, your format, your way.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Professional PDF export</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">DOCX format for editing</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">EPUB for digital publishing</span>
                </li>
              </ul>
              <Button 
                onClick={onGetStarted}
                size="lg"
                className="bg-gradient-to-r from-[#9b87b8] to-[#b89ed6] hover:opacity-90"
              >
                Start Creating
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-gradient-to-b from-white to-[#f0e8f8] py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">What authors are saying</h2>
            <p className="text-lg text-gray-600">Join thousands of satisfied writers</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: "Sarah Johnson",
                role: "Fiction Author",
                content: "Inkfluence AI helped me finish my first novel in half the time. The AI suggestions were incredibly helpful!",
                rating: 5
              },
              {
                name: "Michael Chen",
                role: "Business Coach",
                content: "Perfect for creating professional eBooks for my coaching business. The customization options are fantastic.",
                rating: 5
              },
              {
                name: "Emma Williams",
                role: "Content Creator",
                content: "I've published 3 books using Inkfluence AI. The organization features keep me on track and productive.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 h-full shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-0 space-y-4">
                    <div className="flex gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-700 italic">"{testimonial.content}"</p>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Simple, transparent pricing</h2>
          <p className="text-lg text-gray-600">Start free, upgrade when you're ready</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="p-8 space-y-6 hover:shadow-xl transition-shadow h-full">
              <div>
                <h3 className="text-2xl font-bold mb-2">Free</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">£0</span>
                  <span className="text-gray-600">/month</span>
                </div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>5 pages</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>10 AI generations/day</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Basic templates</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>PDF export</span>
                </li>
              </ul>
              <Button 
                onClick={onGetStarted}
                variant="outline"
                className="w-full border-2 border-[#9b87b8] text-[#7a5f96] hover:bg-[#f0e8f8]"
                size="lg"
              >
                Get Started Free
              </Button>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-8 space-y-6 border-2 border-[#9b87b8] hover:shadow-xl transition-shadow relative h-full">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#9b87b8] to-[#b89ed6] text-white px-4 py-1 rounded-full text-sm font-medium">
                Most Popular
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Premium</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">£9.99</span>
                  <span className="text-gray-600">/month</span>
                </div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Unlimited pages</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>50 AI generations/day</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Premium templates</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Advanced export options</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Custom branding</span>
                </li>
              </ul>
              <Button 
                onClick={onGetStarted}
                className="w-full bg-gradient-to-r from-[#9b87b8] to-[#b89ed6] hover:opacity-90"
                size="lg"
              >
                Upgrade to Premium
              </Button>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="bg-gradient-to-b from-white to-[#f0e8f8] py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Frequently asked questions</h2>
            <p className="text-lg text-gray-600">Everything you need to know about Inkfluence AI</p>
          </div>
          
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="bg-white rounded-lg px-6 border shadow-sm">
              <AccordionTrigger className="text-left font-semibold hover:text-[#9b87b8]">
                How does the AI content generation work?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Our AI uses advanced natural language processing to generate high-quality content based on your keywords and context. 
                Simply provide a chapter title and a few keywords, and the AI will create outlines, introductions, tips, and conclusions 
                that you can customize to match your voice and style.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="bg-white rounded-lg px-6 border shadow-sm">
              <AccordionTrigger className="text-left font-semibold hover:text-[#9b87b8]">
                Can I use the content commercially?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Yes! All content you create and export using Inkfluence AI is 100% yours to use commercially. 
                You retain full rights to publish, sell, or distribute your books in any format.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="bg-white rounded-lg px-6 border shadow-sm">
              <AccordionTrigger className="text-left font-semibold hover:text-[#9b87b8]">
                What's included in the free plan?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                The free plan includes 5 pages, 10 AI generations per day, access to basic templates, 
                and PDF export functionality. It's perfect for trying out the platform and creating shorter content pieces.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="bg-white rounded-lg px-6 border shadow-sm">
              <AccordionTrigger className="text-left font-semibold hover:text-[#9b87b8]">
                Can I cancel my subscription anytime?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Absolutely! You can cancel your Premium subscription at any time. You'll continue to have access to Premium features 
                until the end of your billing period, after which you'll automatically revert to the free plan.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="bg-white rounded-lg px-6 border shadow-sm">
              <AccordionTrigger className="text-left font-semibold hover:text-[#9b87b8]">
                Is my data secure and private?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Yes! We take security and privacy seriously. All your data is encrypted and stored securely in the cloud. 
                Your manuscripts are private and will never be shared or used to train our AI models without your explicit permission.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6" className="bg-white rounded-lg px-6 border shadow-sm">
              <AccordionTrigger className="text-left font-semibold hover:text-[#9b87b8]">
                Can I collaborate with other authors?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Collaboration features are coming soon! We're working on adding the ability to invite co-authors, 
                leave comments, and track changes. Stay tuned for updates.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-[#9b87b8] to-[#b89ed6] rounded-3xl p-12 md:p-16 text-center text-white shadow-2xl"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to write your masterpiece?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of authors who are already using Inkfluence AI to bring their stories to life. 
            Start for free, no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={onGetStarted}
              variant="secondary"
              className="bg-white text-[#9b87b8] hover:bg-gray-100 text-lg px-8 py-6 shadow-lg"
            >
              <Sparkles className="mr-2 w-5 h-5" />
              Start Writing for Free
            </Button>
            <Button 
              size="lg"
              onClick={onSignIn}
              variant="outline"
              className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6"
            >
              Sign In
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
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
                <a href="#" className="hover:text-[#b89ed6] transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="hover:text-[#b89ed6] transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="hover:text-[#b89ed6] transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="hover:text-[#b89ed6] transition-colors">
                  <Github className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Templates</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>

            {/* Resources Links */}
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tutorials</a></li>
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press Kit</a></li>
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
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
              </div>
            </div>
            <div className="text-center text-gray-500 text-sm pt-4 border-t border-gray-700">
              Designed by{' '}
              <a 
                href="https://www.futurelab.solutions/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#b89ed6] hover:text-[#9b87b8] transition-colors font-medium"
              >
                Future Lab Solutions
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
