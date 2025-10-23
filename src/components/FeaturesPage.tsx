import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { LandingHeader } from './LandingHeader';
import { LandingFooter } from './LandingFooter';
import { SEO, createSoftwareApplicationSchema, createBreadcrumbSchema } from './SEO';
import { Sparkles, BookOpen, Palette, Target, Zap, Shield, Globe, Users, Clock, Download, Share2, TrendingUp, Brain, Eye, Layers, MousePointer, Smartphone, Cloud, Mic, Star, Upload } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function FeaturesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const coreFeatures = [
    {
      icon: <Brain className="h-8 w-8 text-blue-600" />,
      title: "AI Writing Assistant",
      description: "Advanced GPT-4 powered writing suggestions, content generation, and real-time editing assistance.",
      benefits: ["Overcome writer's block", "Generate high-quality content", "Maintain consistent tone", "Speed up writing process"],
      badge: "Most Popular"
    },
    {
      icon: <Mic className="h-8 w-8 text-red-600" />,
      title: "Voice-to-Text Dictation",
      description: "Hands-free content creation with real-time speech recognition and visual feedback.",
      benefits: ["Faster content creation", "Natural speaking flow", "Hands-free writing", "Real-time transcription"],
      badge: "New"
    },
    {
      icon: <Palette className="h-8 w-8 text-purple-600" />,
      title: "Custom Branding",
      description: "Fully customize your ebook's appearance with colors, fonts, logos, and professional styling options.",
      benefits: ["Match your brand identity", "Professional appearance", "Stand out from competition", "Build brand recognition"],
      badge: "Premium"
    },
    {
      icon: <Upload className="h-8 w-8 text-indigo-600" />,
      title: "Document Import",
      description: "Import existing content from Google Docs (.docx) or text files with automatic chapter detection.",
      benefits: ["Migrate existing content", "Auto-detect chapters", "Preserve formatting", "Quick project setup"],
      badge: "New"
    },
    {
      icon: <Download className="h-8 w-8 text-green-600" />,
      title: "Multi-Format Export",
      description: "Export your ebooks in PDF, EPUB, DOCX, and HTML formats for maximum compatibility.",
      benefits: ["Reach wider audience", "Multiple distribution channels", "Print-ready formats", "Digital publishing ready"],
      badge: "Essential"
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-orange-600" />,
      title: "SEO Optimization",
      description: "Built-in SEO tools to optimize your ebook content for search engines and discoverability.",
      benefits: ["Increase visibility", "Drive organic traffic", "Better rankings", "More downloads"],
      badge: "Growth"
    }
  ];

  const advancedFeatures = [
    {
      icon: <Eye className="h-6 w-6" />,
      title: "Real-time Preview",
      description: "See exactly how your ebook will look as you write and edit."
    },
    {
      icon: <Layers className="h-6 w-6" />,
      title: "Template Gallery",
      description: "Choose from 20+ professionally designed ebook templates."
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Collaboration Tools",
      description: "Work with team members and get feedback in real-time."
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Auto-Save",
      description: "Never lose your work with automatic saving every few seconds."
    },
    {
      icon: <Share2 className="h-6 w-6" />,
      title: "Easy Sharing",
      description: "Share drafts and published ebooks with a simple link."
    },
    {
      icon: <MousePointer className="h-6 w-6" />,
      title: "Drag & Drop Editor",
      description: "Intuitive interface for easy content organization and editing."
    },
    {
      icon: <Smartphone className="h-6 w-6" />,
      title: "Mobile Responsive",
      description: "Create and edit ebooks on any device, anywhere."
    },
    {
      icon: <Cloud className="h-6 w-6" />,
      title: "Cloud Storage",
      description: "Secure cloud storage with automatic backup and sync."
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Version Control",
      description: "Track changes and restore previous versions of your ebook."
    }
  ];

  const useCases = [
    {
      title: "Content Creators",
      description: "Transform your expertise into professional ebooks for lead generation and audience building.",
      features: ["AI content suggestions", "SEO optimization", "Custom branding"]
    },
    {
      title: "Educators & Trainers",
      description: "Create educational materials and course content with engaging, interactive elements.",
      features: ["Template library", "Multi-format export", "Easy sharing"]
    },
    {
      title: "Marketers",
      description: "Develop compelling lead magnets and marketing materials that convert prospects into customers.",
      features: ["Brand customization", "Analytics", "Professional design"]
    },
    {
      title: "Authors & Publishers",
      description: "Streamline your publishing workflow from draft to distribution with AI-powered assistance.",
      features: ["Writing assistant", "Version control", "Multiple formats"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0e8f8] to-white">
      <SEO
        title="AI Ebook Creator Features - Advanced Writing Tools | InkfluenceAI"
        description="Discover powerful AI ebook creation features: intelligent writing assistant, custom branding, multi-format export, SEO optimization, and more. Create professional ebooks in minutes."
        keywords="AI ebook features, ebook creator tools, AI writing assistant, custom branding, multi-format export, ebook templates, SEO optimization"
        canonicalUrl="https://inkfluenceai.com/features"
        structuredData={{
          ...createSoftwareApplicationSchema(),
          "@graph": [
            createSoftwareApplicationSchema(),
            createBreadcrumbSchema([
              { name: "Home", url: "https://inkfluenceai.com/" },
              { name: "Features", url: "https://inkfluenceai.com/features" }
            ])
          ]
        }}
      />
      <LandingHeader 
        onGetStarted={() => navigate('/?signin=true')}
        onSignIn={() => navigate('/?signin=true')}
        showNavLinks={true}
        isAuthenticated={!!user}
        onNavigateToPricing={() => navigate('/pricing')}
        onNavigateToFeatures={() => navigate('/features')}
        onNavigateToBlog={() => navigate('/blog')}
      />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#9b87b8] to-[#b89ed6] text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-4 bg-white/20 text-white border-white/30">
              <Sparkles className="mr-2 h-4 w-4" />
              AI-Powered Features
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Everything You Need to Create
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent"> Professional Ebooks</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 leading-relaxed">
              Discover the powerful AI writing tools, custom branding options, and advanced features that make InkfluenceAI the ultimate ebook creation platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-[#9b87b8] hover:bg-gray-50 font-semibold px-8 py-4 text-lg"
                onClick={() => navigate('/?signin=true')}
              >
                <Zap className="mr-2 h-5 w-5" />
                Start Creating Free
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-4 text-lg"
                onClick={() => navigate('/pricing')}
              >
                View Pricing
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Core Features Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Core Features That Set Us Apart
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Advanced AI technology combined with intuitive design to help you create professional ebooks faster than ever before.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {coreFeatures.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50">
                      {feature.icon}
                    </div>
                    {feature.badge && (
                      <Badge variant={feature.badge === 'Most Popular' ? 'default' : 'secondary'} className="ml-2">
                        {feature.badge}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900">{feature.title}</CardTitle>
                  <CardDescription className="text-gray-600 leading-relaxed">{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <div key={benefitIndex} className="flex items-center text-sm text-gray-700">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3 flex-shrink-0"></div>
                        {benefit}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Separator className="my-16" />

        {/* Advanced Features Grid */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Advanced Tools & Capabilities
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Professional-grade features designed to streamline your workflow and enhance your ebook creation experience.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {advancedFeatures.map((feature, index) => (
              <Card key={index} className="border-gray-200 hover:border-blue-300 transition-colors duration-200 bg-white/60 backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 rounded-lg bg-blue-50 text-blue-600 flex-shrink-0">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Separator className="my-16" />

        {/* Use Cases Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Perfect For Every Creator
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Whether you're building your personal brand, educating others, or growing your business, InkfluenceAI has the features you need.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {useCases.map((useCase, index) => (
              <Card key={index} className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/30">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-900 flex items-center">
                    <Target className="mr-3 h-6 w-6 text-blue-600" />
                    {useCase.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600 leading-relaxed text-base">
                    {useCase.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700 mb-3">Key Features:</p>
                    {useCase.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <div className="inline-block px-3 py-1 bg-purple-100 rounded-full text-[#7a5f96] text-sm font-medium mb-4">
              Loved by Creators
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              See What Features Users Love Most
            </h2>
            <p className="text-lg text-muted-foreground">
              Real feedback from creators using Inkfluence AI every day
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-0 space-y-3">
                <div className="flex gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-700 italic">
                  "The AI Content Assistant is mind-blowing. It understands my writing style and generates perfectly on-brand content every time."
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#9b87b8] to-[#b89ed6] rounded-full flex items-center justify-center text-white text-xs font-bold">
                    SJ
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Kira Patel</div>
                    <div className="text-xs text-gray-600">Non-Fiction Author</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-0 space-y-3">
                <div className="flex gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-700 italic">
                  "The Cover Designer and custom branding features made my ebooks look incredibly professional. Worth the upgrade alone."
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#9b87b8] to-[#b89ed6] rounded-full flex items-center justify-center text-white text-xs font-bold">
                    MC
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Marcus Thornton</div>
                    <div className="text-xs text-gray-600">Marketing Consultant</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-0 space-y-3">
                <div className="flex gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-700 italic">
                  "Voice-to-text is a game changer. I dictate ideas during my commute and they're perfectly formatted when I get home."
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#9b87b8] to-[#b89ed6] rounded-full flex items-center justify-center text-white text-xs font-bold">
                    EW
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Jade Moreno</div>
                    <div className="text-xs text-gray-600">Course Creator</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button 
              onClick={() => navigate('/testimonials')}
              variant="outline"
              className="border-2 border-[#9b87b8] text-[#7a5f96] hover:bg-[#f0e8f8]"
            >
              Read More Success Stories
              <Star className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <div className="inline-block px-3 py-1 bg-purple-100 rounded-full text-[#7a5f96] text-sm font-medium mb-4">
              Feature Highlights
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Loved by Creators Worldwide
            </h2>
            <p className="text-lg text-muted-foreground">
              See how our features transform the content creation process
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
                  "The AI Assistant is like having a co-author who never gets tired. It's helped me overcome writer's block countless times."
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#9b87b8] to-[#b89ed6] rounded-full flex items-center justify-center text-white text-xs font-bold">
                    SJ
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Kira Patel</div>
                    <div className="text-xs text-gray-600">Non-Fiction Author</div>
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
                  "The Cover Designer is phenomenal. My books look professional without spending hours on design or hiring expensive designers."
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#9b87b8] to-[#b89ed6] rounded-full flex items-center justify-center text-white text-xs font-bold">
                    MC
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Marcus Thornton</div>
                    <div className="text-xs text-gray-600">Marketing Consultant</div>
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
                  "Voice-to-text changed my workflow completely. I can brainstorm while walking and capture everything instantly."
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#9b87b8] to-[#b89ed6] rounded-full flex items-center justify-center text-white text-xs font-bold">
                    EW
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Jade Moreno</div>
                    <div className="text-xs text-gray-600">Course Creator</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button 
              onClick={() => navigate('/testimonials')}
              variant="outline"
              className="border-2 border-[#9b87b8] text-[#7a5f96] hover:bg-[#f0e8f8]"
            >
              Read More Success Stories
              <Star className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-[#9b87b8] to-[#b89ed6] rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Experience These Features?
          </h2>
          <p className="text-xl mb-8 text-purple-100 max-w-2xl mx-auto">
            Join thousands of creators who are already using InkfluenceAI to create professional ebooks that engage and convert.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-[#9b87b8] hover:bg-gray-50 font-semibold px-8 py-4 text-lg"
              onClick={() => navigate('/?signin=true')}
            >
              <BookOpen className="mr-2 h-5 w-5" />
              Start Creating Now
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-4 text-lg"
              onClick={() => navigate('/help')}
            >
              <Globe className="mr-2 h-5 w-5" />
              Learn More
            </Button>
          </div>
          <p className="text-sm mt-6 text-purple-200">
            No credit card required • Get started in under 60 seconds
          </p>
        </div>
      </div>

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
    </div>
  );
}