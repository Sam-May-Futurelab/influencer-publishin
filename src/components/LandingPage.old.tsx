import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  BookOpen, Sparkles, FileText, Download, Palette, TrendingUp, 
  Zap, Users, Award, Play, CheckCircle2, ArrowRight,
  Twitter, Linkedin, Instagram, Github, Mail
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
              className="text-gray-600 hover:text-[#9b87b8] transition-colors"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection('pricing')}
              className="text-gray-600 hover:text-[#9b87b8] transition-colors"
            >
              Pricing
            </button>
            <button 
              onClick={() => scrollToSection('faq')}
              className="text-gray-600 hover:text-[#9b87b8] transition-colors"
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
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
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
              className="bg-gradient-to-r from-[#9b87b8] to-[#b89ed6] hover:opacity-90 text-lg px-8 py-6"
            >
              <Sparkles className="mr-2 w-5 h-5" />
              Start Writing for Free
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-[#9b87b8] text-[#7a5f96] hover:bg-[#f0e8f8] text-lg px-8 py-6"
            >
              Watch Demo
            </Button>
          </div>
          
          <p className="text-sm text-gray-500">
            No credit card required • Free 5 pages • Upgrade anytime
          </p>
        </div>
      </section>

      {/* Social Proof */}
      <section className="container mx-auto px-4 py-12 text-center">
        <p className="text-gray-600 mb-8">Trusted by authors worldwide</p>
        <div className="flex flex-wrap justify-center gap-8 items-center opacity-60">
          <div className="text-2xl font-semibold">📚 10,000+ Books Started</div>
          <div className="text-2xl font-semibold">✍️ 50,000+ Chapters Written</div>
          <div className="text-2xl font-semibold">⭐ 4.9/5 Rating</div>
        </div>
      </section>

      {/* Feature Sections */}
      <section className="container mx-auto px-4 py-20">
        <div className="space-y-32">
          {/* Feature 1: AI Writing */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-block px-3 py-1 bg-purple-100 rounded-full text-[#7a5f96] text-sm font-medium">
                Make it quick
              </div>
              <h2 className="text-4xl font-bold">
                From idea to chapter in 10 seconds
              </h2>
              <p className="text-lg text-gray-600">
                No more writer's block—just enter your topic, and let our AI writing assistant 
                do its magic. Start with AI-generated content, refine your message, and watch 
                your story unfold.
              </p>
              <Button 
                onClick={onGetStarted}
                className="bg-gradient-to-r from-[#9b87b8] to-[#b89ed6]"
              >
                Start Creating
              </Button>
            </div>
            <div className="bg-gradient-to-br from-[#f0e8f8] to-[#e2d1f0] rounded-2xl p-8 h-96 flex items-center justify-center">
              <Sparkles className="w-32 h-32 text-[#9b87b8] opacity-50" />
            </div>
          </div>

          {/* Feature 2: Organization */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="bg-gradient-to-br from-[#e2d1f0] to-[#f0e8f8] rounded-2xl p-8 h-96 flex items-center justify-center order-2 md:order-1">
              <BookOpen className="w-32 h-32 text-[#9b87b8] opacity-50" />
            </div>
            <div className="space-y-6 order-1 md:order-2">
              <div className="inline-block px-3 py-1 bg-purple-100 rounded-full text-[#7a5f96] text-sm font-medium">
                Make it structured
              </div>
              <h2 className="text-4xl font-bold">
                Organize your masterpiece with ease
              </h2>
              <p className="text-lg text-gray-600">
                Keep your chapters, notes, and research organized in one beautiful interface. 
                Drag and drop to reorder, use folders for different projects, and never lose 
                your work.
              </p>
              <Button 
                onClick={onGetStarted}
                className="bg-gradient-to-r from-[#9b87b8] to-[#b89ed6]"
              >
                Start Creating
              </Button>
            </div>
          </div>

          {/* Feature 3: Customization */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-block px-3 py-1 bg-purple-100 rounded-full text-[#7a5f96] text-sm font-medium">
                Make it yours
              </div>
              <h2 className="text-4xl font-bold">
                Beyond generation; true customization
              </h2>
              <p className="text-lg text-gray-600">
                Our AI lays the groundwork with expertly generated content, then hands the 
                reins to you. Customize fonts, colors, and layouts to match your unique style 
                and brand.
              </p>
              <Button 
                onClick={onGetStarted}
                className="bg-gradient-to-r from-[#9b87b8] to-[#b89ed6]"
              >
                Start Creating
              </Button>
            </div>
            <div className="bg-gradient-to-br from-[#f0e8f8] to-[#e2d1f0] rounded-2xl p-8 h-96 flex items-center justify-center">
              <Palette className="w-32 h-32 text-[#9b87b8] opacity-50" />
            </div>
          </div>

          {/* Feature 4: Export */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="bg-gradient-to-br from-[#e2d1f0] to-[#f0e8f8] rounded-2xl p-8 h-96 flex items-center justify-center order-2 md:order-1">
              <Download className="w-32 h-32 text-[#9b87b8] opacity-50" />
            </div>
            <div className="space-y-6 order-1 md:order-2">
              <div className="inline-block px-3 py-1 bg-purple-100 rounded-full text-[#7a5f96] text-sm font-medium">
                Make it happen
              </div>
              <h2 className="text-4xl font-bold">
                Export in any format you need
              </h2>
              <p className="text-lg text-gray-600">
                Ready to publish? Export your manuscript as PDF, DOCX, or even generate an 
                eBook-ready EPUB. Your content, your format, your way.
              </p>
              <Button 
                onClick={onGetStarted}
                className="bg-gradient-to-r from-[#9b87b8] to-[#b89ed6]"
              >
                Start Creating
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Simple, transparent pricing</h2>
          <p className="text-lg text-gray-600">Start free, upgrade when you're ready</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="p-8 space-y-6 hover:shadow-xl transition-shadow">
            <div>
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">£0</span>
                <span className="text-gray-600">/month</span>
              </div>
            </div>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>5 pages</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>10 AI generations/day</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Basic templates</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>PDF export</span>
              </li>
            </ul>
            <Button 
              onClick={onGetStarted}
              variant="outline"
              className="w-full border-[#9b87b8] text-[#7a5f96] hover:bg-[#f0e8f8]"
            >
              Get Started Free
            </Button>
          </Card>

          <Card className="p-8 space-y-6 border-2 border-[#9b87b8] hover:shadow-xl transition-shadow relative">
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
                <span className="text-green-500">✓</span>
                <span>Unlimited pages</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>50 AI generations/day</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Premium templates</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green