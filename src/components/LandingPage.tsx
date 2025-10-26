import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LandingHeader } from '@/components/LandingHeader';
import { LandingFooter } from '@/components/LandingFooter';
import { NewsletterSignup } from '@/components/NewsletterSignup';
import { SEO, createOrganizationSchema, createSoftwareApplicationSchema } from '@/components/SEO';
import { 
  BookOpen, Sparkles, FileText, Download, Palette, TrendingUp, 
  Zap, Users, Award, Play, CheckCircle2, ArrowRight,
  Twitter, Linkedin, Instagram, Github, Mail, Star, Mic
} from 'lucide-react';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { useState, useEffect } from 'react';
import { AuthModal } from './AuthModal';

export function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Check if signin param is in URL
  useEffect(() => {
    if (searchParams.get('signin') === 'true') {
      setShowAuthModal(true);
    }
  }, [searchParams]);
  
  const handleGetStarted = () => {
    if (user) {
      navigate('/app/dashboard');
    } else {
      setShowAuthModal(true);
    }
  };
  
  const handleSignIn = () => {
    setShowAuthModal(true);
  };
  
  const handleAuthModalClose = () => {
    setShowAuthModal(false);
    // Remove signin param from URL
    searchParams.delete('signin');
    setSearchParams(searchParams);
  };
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0e8f8] to-white">
      <SEO
        title="InkfluenceAI - AI-Powered Ebook Creator | Create Professional Ebooks in Minutes"
        description="Transform your ideas into professional ebooks with AI-powered writing assistance. Features intelligent content generation, custom branding, multi-format export, and SEO optimization. Start creating for free!"
        keywords="AI ebook creator, ebook writing software, AI writing assistant, voice to text, speech recognition, digital publishing, ebook generator, content creation, book writing AI, professional ebooks, dictation software"
        canonicalUrl="https://inkfluenceai.com/"
        structuredData={{
          ...createOrganizationSchema(),
          "@graph": [
            createOrganizationSchema(),
            createSoftwareApplicationSchema()
          ]
        }}
      />
      <LandingHeader 
        onGetStarted={handleGetStarted}
        onSignIn={handleSignIn}
        scrollToSection={scrollToSection}
        showNavLinks={true}
        isAuthenticated={!!user}
        onNavigateToPricing={() => navigate('/pricing')}
        onNavigateToFeatures={() => navigate('/features')}
        onNavigateToBlog={() => navigate('/blog')}
      />

      <main>
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-8"
          >
            <div className="inline-block px-4 py-2 bg-[#e2d1f0] rounded-full text-[#5c4470] font-medium">
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
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-[#9b87b8] to-[#b89ed6] hover:opacity-90 text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
              >
                <Sparkles className="mr-2 w-5 h-5" />
                Start Writing for Free
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-2 border-[#9b87b8] text-[#7a5f96] hover:bg-[#f0e8f8] hover:text-[#7a5f96] text-lg px-8 py-6"
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
                onClick={handleGetStarted}
                size="lg"
                className="bg-gradient-to-r from-[#9b87b8] to-[#b89ed6] hover:opacity-90"
              >
                Start Creating
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
            <div className="bg-gradient-to-br from-[#f0e8f8] to-[#e2d1f0] rounded-2xl p-4 overflow-hidden shadow-lg">
              <img 
                src="/images/idea-to-chapter.jpg" 
                alt="AI-powered content generation from idea to chapter in seconds"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
          </motion.div>

          {/* Feature 2: Organization */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <div className="bg-gradient-to-br from-[#e2d1f0] to-[#f0e8f8] rounded-2xl p-4 overflow-hidden order-2 md:order-1 shadow-lg">
              <img 
                src="/images/organise-masterpiece.jpg" 
                alt="Organize your book chapters and manuscripts with ease"
                className="w-full h-full object-cover rounded-xl"
              />
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
                onClick={handleGetStarted}
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
                onClick={handleGetStarted}
                size="lg"
                className="bg-gradient-to-r from-[#9b87b8] to-[#b89ed6] hover:opacity-90"
              >
                Start Creating
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
            <div className="bg-gradient-to-br from-[#f0e8f8] to-[#e2d1f0] rounded-2xl p-4 overflow-hidden shadow-lg">
              <img 
                src="/images/true-customisation.jpg" 
                alt="Customize your book with custom fonts, colors, and branding"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
          </motion.div>

          {/* Feature 4: Export */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <div className="bg-gradient-to-br from-[#e2d1f0] to-[#f0e8f8] rounded-2xl p-4 overflow-hidden order-2 md:order-1 shadow-lg">
              <img 
                src="/images/export.jpg" 
                alt="Export your book in PDF, DOCX, and EPUB formats"
                className="w-full h-full object-cover rounded-xl"
              />
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
                onClick={handleGetStarted}
                size="lg"
                className="bg-gradient-to-r from-[#9b87b8] to-[#b89ed6] hover:opacity-90"
              >
                Start Creating
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </motion.div>

          {/* Feature 5: Voice Input */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <div className="bg-gradient-to-br from-[#f0e8f8] to-[#e2d1f0] rounded-2xl p-4 overflow-hidden shadow-lg">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                    <Mic className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Voice Recording Active</span>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-gray-500 italic">Speaking: "The future of content creation..."</div>
                  <div className="text-base font-medium text-gray-800">The future of content creation lies in the seamless integration of artificial intelligence and human creativity.</div>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="inline-block px-3 py-1 bg-purple-100 rounded-full text-[#7a5f96] text-sm font-medium">
                Speak your mind
              </div>
              <h2 className="text-4xl md:text-5xl font-bold">
                Voice-to-text that actually works
              </h2>
              <p className="text-lg text-gray-600">
                Speak naturally and watch your words appear in real-time. Perfect for brainstorming, 
                capturing inspiration on-the-go, or when your thoughts flow faster than you can type.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Real-time speech recognition with visual feedback</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Hands-free content creation</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Keyboard shortcuts (⌘M to start, Esc to stop)</span>
                </li>
              </ul>
              <Button 
                onClick={handleGetStarted}
                size="lg"
                className="bg-gradient-to-r from-[#9b87b8] to-[#b89ed6] hover:opacity-90"
              >
                Try Voice Input
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
                name: "Kira Patel",
                role: "Fiction Author",
                content: "Inkfluence AI helped me finish my first novel in half the time. The AI suggestions were incredibly helpful!",
                rating: 5
              },
              {
                name: "Marcus Thornton",
                role: "Business Coach",
                content: "Perfect for creating professional eBooks for my coaching business. The customization options are fantastic.",
                rating: 5
              },
              {
                name: "Jade Moreno",
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
                onClick={handleGetStarted}
                variant="outline"
                className="w-full border-2 border-[#9b87b8] text-[#7a5f96] hover:bg-[#f0e8f8] hover:text-[#7a5f96]"
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
                onClick={handleGetStarted}
                className="w-full bg-gradient-to-r from-[#9b87b8] to-[#b89ed6] hover:opacity-90"
                size="lg"
              >
                Upgrade to Premium
              </Button>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 bg-purple-100 rounded-full text-[#7a5f96] text-sm font-medium mb-4">
              Success Stories
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Real Results from Real Authors</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              See how Inkfluence AI has transformed the writing journey for thousands of creators
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="p-6 h-full shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-[#9b87b8]">
                <CardContent className="p-0 space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#9b87b8] to-[#b89ed6] rounded-full flex items-center justify-center text-white font-bold text-lg">
                      SJ
                    </div>
                    <div>
                      <h3 className="font-bold">Kira Patel</h3>
                      <p className="text-sm text-gray-600">Non-Fiction Author</p>
                    </div>
                  </div>
                  <p className="text-gray-700 italic">
                    "Published 6 ebooks in 8 months and generated $12K in revenue. Inkfluence AI cut my production time by 85%."
                  </p>
                  <div className="flex gap-4 text-center pt-4 border-t">
                    <div>
                      <div className="text-2xl font-bold text-[#7a5f96]">6</div>
                      <div className="text-xs text-gray-600">eBooks</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-[#7a5f96]">$12K</div>
                      <div className="text-xs text-gray-600">Revenue</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-[#7a5f96]">85%</div>
                      <div className="text-xs text-gray-600">Faster</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6 h-full shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-[#9b87b8]">
                <CardContent className="p-0 space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#9b87b8] to-[#b89ed6] rounded-full flex items-center justify-center text-white font-bold text-lg">
                      MC
                    </div>
                    <div>
                      <h3 className="font-bold">Marcus Thornton</h3>
                      <p className="text-sm text-gray-600">Marketing Consultant</p>
                    </div>
                  </div>
                  <p className="text-gray-700 italic">
                    "Created lead magnets that generate 500+ qualified leads per month for my clients. A 400% increase in lead generation."
                  </p>
                  <div className="flex gap-4 text-center pt-4 border-t">
                    <div>
                      <div className="text-2xl font-bold text-[#7a5f96]">500+</div>
                      <div className="text-xs text-gray-600">Leads/Month</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-[#7a5f96]">400%</div>
                      <div className="text-xs text-gray-600">Increase</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 h-full shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-[#9b87b8]">
                <CardContent className="p-0 space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#9b87b8] to-[#b89ed6] rounded-full flex items-center justify-center text-white font-bold text-lg">
                      EW
                    </div>
                    <div>
                      <h3 className="font-bold">Jade Moreno</h3>
                      <p className="text-sm text-gray-600">Online Course Creator</p>
                    </div>
                  </div>
                  <p className="text-gray-700 italic">
                    "Course companion workbooks boosted my completion rate from 23% to 67%. Students love the structured approach."
                  </p>
                  <div className="flex gap-4 text-center pt-4 border-t">
                    <div>
                      <div className="text-2xl font-bold text-[#7a5f96]">67%</div>
                      <div className="text-xs text-gray-600">Completion</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-[#7a5f96]">3x</div>
                      <div className="text-xs text-gray-600">Improvement</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <Button 
              onClick={() => navigate('/testimonials')}
              size="lg"
              variant="outline"
              className="border-2 border-[#9b87b8] text-[#7a5f96] hover:bg-[#f0e8f8] hover:text-[#7a5f96]"
            >
              View All Success Stories
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              onClick={() => navigate('/case-studies')}
              size="lg"
              className="bg-gradient-to-r from-[#9b87b8] to-[#b89ed6] hover:opacity-90"
            >
              Read Detailed Case Studies
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
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

      {/* Newsletter / Lead Magnet Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto">
          <NewsletterSignup showLeadMagnet={true} />
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
              onClick={handleGetStarted}
              variant="secondary"
              className="bg-white text-[#9b87b8] hover:bg-gray-100 text-lg px-8 py-6 shadow-lg"
            >
              <Sparkles className="mr-2 w-5 h-5" />
              Start Writing for Free
            </Button>
            <Button 
              size="lg"
              onClick={handleSignIn}
              variant="outline"
              className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6"
            >
              Sign In
            </Button>
          </div>
        </motion.div>
      </section>
      </main>

      <LandingFooter 
        onNavigateToPrivacy={() => navigate('/privacy')}
        onNavigateToTerms={() => navigate('/terms')}
        onNavigateToCookies={() => navigate('/cookies')}
        onNavigateToHelp={() => navigate('/help')}
        onNavigateToAbout={() => navigate('/about')}
        onNavigateToPricing={() => navigate('/pricing')}
        onNavigateToFeatures={() => navigate('/features')}
        onNavigateToBlog={() => navigate('/blog')}
        onNavigateToContact={() => navigate('/contact')}
        onNavigateToTestimonials={() => navigate('/testimonials')}
        onNavigateToCaseStudies={() => navigate('/case-studies')}
        onNavigateToFAQ={() => navigate('/faq')}
      />
      
      <AuthModal isOpen={showAuthModal} onOpenChange={(open) => !open && handleAuthModalClose()} />
    </div>
  );
}
