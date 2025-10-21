import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LandingHeader } from '@/components/LandingHeader';
import { LandingFooter } from '@/components/LandingFooter';
import { 
  Sparkles, 
  Zap, 
  Shield, 
  Users, 
  Target, 
  Heart,
  BookOpen,
  Palette,
  Download,
  Brain,
  Clock,
  Globe
} from 'lucide-react';

interface AboutPageProps {
  onNavigate: (page: string) => void;
  isAuthenticated: boolean;
}

export function AboutPage({ onNavigate, isAuthenticated }: AboutPageProps) {

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Writing',
      description: 'Generate high-quality content with advanced AI technology that understands your voice and style.'
    },
    {
      icon: BookOpen,
      title: 'Professional Ebooks',
      description: 'Create beautifully formatted ebooks ready for publishing on any platform.'
    },
    {
      icon: Palette,
      title: 'Custom Cover Designer',
      description: 'Design stunning book covers with templates, gradients, and custom branding.'
    },
    {
      icon: Download,
      title: 'Multiple Export Formats',
      description: 'Export to PDF, EPUB, and DOCX with professional formatting and styling.'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Auto-save, real-time preview, and instant AI generation keep you productive.'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your content is encrypted and stored securely. We never share your data.'
    }
  ];

  const stats = [
    { value: '10,000+', label: 'Words Generated Daily' },
    { value: '500+', label: 'Ebooks Created' },
    { value: '99.9%', label: 'Uptime' },
    { value: '24/7', label: 'AI Availability' }
  ];

  const values = [
    {
      icon: Target,
      title: 'Empower Creators',
      description: 'We believe everyone has a story to tell. Our mission is to make professional ebook creation accessible to all.'
    },
    {
      icon: Sparkles,
      title: 'Innovation First',
      description: 'We leverage cutting-edge AI to help you create better content faster, without sacrificing quality.'
    },
    {
      icon: Heart,
      title: 'User-Centric',
      description: 'Every feature is designed with you in mind. We listen, iterate, and continuously improve.'
    },
    {
      icon: Globe,
      title: 'Open Platform',
      description: 'Export your work anywhere. No vendor lock-in. Your content, your freedom.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader 
        onSignIn={() => onNavigate('signin')}
        onGetStarted={() => onNavigate(isAuthenticated ? 'dashboard' : 'signin')}
        showNavLinks={true}
        isAuthenticated={isAuthenticated}
      />

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge className="mb-4" variant="secondary">About Inkfluence AI</Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Empowering Creators with AI-Powered Ebook Creation
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Inkfluence AI is the modern ebook creation platform that combines powerful AI writing assistance 
              with professional formatting tools. Create, design, and publish your ebooks faster than ever before.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Mission</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              To democratize professional ebook creation by combining cutting-edge AI technology 
              with intuitive design tools, enabling anyone to share their knowledge and stories with the world.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full neomorph-flat border-0 hover:neomorph-raised transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="p-3 rounded-xl bg-primary/10 w-fit mb-4">
                      <value.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to create professional ebooks, all in one platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full neomorph-flat border-0 hover:neomorph-raised transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 w-fit mb-4">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Story</h2>
          </div>
          
          <Card className="neomorph-flat border-0">
            <CardContent className="p-8 md:p-12">
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-lg leading-relaxed text-muted-foreground mb-6">
                  Inkfluence AI was born from a simple observation: creating professional ebooks shouldn't 
                  require expensive software, technical expertise, or hours of formatting work.
                </p>
                <p className="text-lg leading-relaxed text-muted-foreground mb-6">
                  As content creators ourselves, we experienced the frustration of juggling multiple tools—
                  one for writing, another for design, and yet another for formatting. We knew there had to 
                  be a better way.
                </p>
                <p className="text-lg leading-relaxed text-muted-foreground mb-6">
                  In 2024, we brought together AI experts, designers, and writers to create a unified platform 
                  that handles everything from ideation to publication. The result is Inkfluence AI—a tool 
                  that empowers you to focus on what matters: your content.
                </p>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  Today, thousands of creators use Inkfluence AI to write, design, and publish their ebooks. 
                  Whether you're an author, educator, entrepreneur, or blogger, we're here to help you share 
                  your knowledge and stories with the world.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Create Your First Ebook?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of creators who are already using Inkfluence AI to bring their ideas to life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => onNavigate(isAuthenticated ? 'dashboard' : 'landing')}>
              <Sparkles className="w-5 h-5 mr-2" />
              {isAuthenticated ? 'Go to Dashboard' : 'Start Creating Free'}
            </Button>
            <Button size="lg" variant="outline" onClick={() => onNavigate('help')}>
              <BookOpen className="w-5 h-5 mr-2" />
              Learn More
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
