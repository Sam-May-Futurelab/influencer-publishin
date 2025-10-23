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
  Star, 
  Quote, 
  Award, 
  Users, 
  BookOpen, 
  TrendingUp,
  CheckCircle,
  ArrowRight,
  MessageCircle,
  Clock
} from 'lucide-react';

export function TestimonialsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const stats = [
    { icon: Users, label: 'Active Users', value: '10,000+' },
    { icon: BookOpen, label: 'Ebooks Created', value: '50,000+' },
    { icon: Star, label: 'Average Rating', value: '4.9/5' },
    { icon: Award, label: 'Success Stories', value: '500+' }
  ];

  const featuredTestimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Self-Published Author',
      avatar: '/images/testimonials/sarah.jpg',
      rating: 5,
      text: "Inkfluence AI transformed my writing process. What used to take me 3 months now takes 2 weeks. I've published 6 ebooks this year and made over $12,000 in passive income. The AI writing assistant is like having a co-author who never gets tired!",
      result: '6 ebooks in 8 months, $12K revenue',
      featured: true
    },
    {
      name: 'Michael Chen',
      role: 'Marketing Consultant',
      avatar: '/images/testimonials/michael.jpg',
      rating: 5,
      text: "I use Inkfluence AI to create lead magnets for my clients. The quality is incredible, and the speed is unmatched. We've generated 500+ qualified leads per month using these ebooks. ROI is through the roof.",
      result: '500+ leads/month for clients',
      featured: true
    },
    {
      name: 'Emma Williams',
      role: 'Course Creator',
      avatar: '/images/testimonials/emma.jpg',
      rating: 5,
      text: "The template gallery saved me countless hours. I went from zero design skills to creating professional-looking ebooks in minutes. My students love the resources I create now. Premium subscription paid for itself in the first week.",
      result: 'Professional ebooks in minutes',
      featured: true
    }
  ];

  const testimonials = [
    {
      name: 'David Rodriguez',
      role: 'Digital Marketer',
      rating: 5,
      text: "Best investment I've made for my content marketing. Created 12 lead magnets in a month. Lead generation increased by 300%.",
      verified: true
    },
    {
      name: 'Lisa Thompson',
      role: 'Blogger & Influencer',
      rating: 5,
      text: "Finally, a tool that understands my voice. The AI generates content that sounds like me, not a robot. My audience can't tell the difference!",
      verified: true
    },
    {
      name: 'James Wilson',
      role: 'Business Coach',
      rating: 5,
      text: "I've tried every ebook creator out there. Inkfluence AI is the only one that combines speed, quality, and ease of use. Worth every penny.",
      verified: true
    },
    {
      name: 'Rachel Green',
      role: 'Fitness Coach',
      rating: 5,
      text: "Created my first ebook in 48 hours using Inkfluence AI. Sold 200 copies in the first month at $27 each. This tool pays for itself instantly.",
      verified: true
    },
    {
      name: 'Tom Anderson',
      role: 'SaaS Founder',
      rating: 5,
      text: "We use Inkfluence AI for all our product documentation and guides. The export formats work perfectly, and the collaborative features are great.",
      verified: true
    },
    {
      name: 'Maria Garcia',
      role: 'Online Educator',
      rating: 4,
      text: "The AI writing assistant is incredibly helpful. Sometimes needs a bit of editing, but it cuts my writing time by 70%. Highly recommend!",
      verified: true
    },
    {
      name: 'Chris Lee',
      role: 'Entrepreneur',
      rating: 5,
      text: "I've published 4 ebooks this quarter using Inkfluence AI. Each one generates $500-2000/month in passive income. This is my secret weapon.",
      verified: true
    },
    {
      name: 'Jennifer Brown',
      role: 'Content Strategist',
      rating: 5,
      text: "The cover designer is phenomenal. No design skills needed - just pick a template, customize, and you're done. My ebooks look professionally designed.",
      verified: true
    },
    {
      name: 'Alex Martinez',
      role: 'Real Estate Agent',
      rating: 5,
      text: "Created buyer/seller guides for my clients in record time. Positioned myself as an authority in my market. Already seeing more referrals!",
      verified: true
    },
    {
      name: 'Sophie Turner',
      role: 'Life Coach',
      rating: 5,
      text: "The templates are beautiful and the AI understands coaching language perfectly. My clients love the workbooks I create with this tool.",
      verified: true
    },
    {
      name: 'Ryan Kim',
      role: 'Software Developer',
      rating: 5,
      text: "As a developer, I appreciate the clean export formats and the API-like efficiency. Great for creating technical documentation quickly.",
      verified: true
    },
    {
      name: 'Amanda White',
      role: 'Freelance Writer',
      rating: 5,
      text: "Inkfluence AI helps me deliver more projects to clients. The quality is consistent, and turnaround time is incredible. Game-changer for freelancers.",
      verified: true
    }
  ];

  const videoTestimonials = [
    {
      name: 'Mark Stevens',
      role: 'Full-Time Author',
      thumbnail: '/images/testimonials/video-mark.jpg',
      duration: '2:15',
      views: '15K',
      title: 'How I Published 10 Ebooks in 6 Months'
    },
    {
      name: 'Kelly Anderson',
      role: 'Marketing Director',
      thumbnail: '/images/testimonials/video-kelly.jpg',
      duration: '1:45',
      views: '8K',
      title: 'Our Lead Generation Increased 400%'
    },
    {
      name: 'Daniel Park',
      role: 'Course Creator',
      thumbnail: '/images/testimonials/video-daniel.jpg',
      duration: '3:20',
      views: '12K',
      title: 'From Idea to Published Ebook in 48 Hours'
    }
  ];

  const trustBadges = [
    { icon: Users, text: '10,000+ Happy Users' },
    { icon: BookOpen, text: '50,000+ Ebooks Created' },
    { icon: Star, text: '4.9/5 Average Rating' },
    { icon: CheckCircle, text: 'Verified Reviews' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Testimonials & Reviews - See Why 10,000+ Users Love Inkfluence AI"
        description="Read real success stories from authors, marketers, and creators who use Inkfluence AI to create professional ebooks. 4.9/5 rating, 10,000+ satisfied users."
        keywords="inkfluence ai reviews, ebook creator testimonials, user success stories, ai writing tool reviews, customer feedback"
        canonicalUrl="https://inkfluenceai.com/testimonials"
        structuredData={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "name": "Inkfluence AI",
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.9",
                "reviewCount": "1250",
                "bestRating": "5",
                "worstRating": "1"
              }
            },
            createBreadcrumbSchema([
              { name: "Home", url: "https://inkfluenceai.com/" },
              { name: "Testimonials", url: "https://inkfluenceai.com/testimonials" }
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
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10">
                <MessageCircle className="w-12 h-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Loved by 10,000+ Creators
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              See why authors, marketers, and entrepreneurs trust Inkfluence AI to create professional ebooks faster than ever before.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="neomorph-flat border-0">
                    <CardContent className="p-6 text-center">
                      <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                      <div className="text-2xl font-bold mb-1">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-4">
              {trustBadges.map((badge, index) => (
                <Badge key={index} variant="secondary" className="px-4 py-2">
                  <badge.icon className="w-4 h-4 mr-2" />
                  {badge.text}
                </Badge>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Testimonials */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              <Star className="w-3 h-3 mr-1 fill-yellow-500 text-yellow-500" />
              Featured Success Stories
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Real Results from Real Users
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              These creators transformed their workflow and grew their business with Inkfluence AI
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {featuredTestimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="neomorph-flat border-0 h-full">
                  <CardContent className="p-8">
                    <Quote className="w-8 h-8 text-primary/30 mb-4" />
                    
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                      ))}
                    </div>

                    <p className="text-foreground mb-6 leading-relaxed">
                      "{testimonial.text}"
                    </p>

                    <div className="pt-6 border-t border-border">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                          <span className="text-lg font-bold text-primary">
                            {testimonial.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold">{testimonial.name}</div>
                          <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                        </div>
                      </div>
                      <Badge variant="outline" className="w-full justify-center">
                        <TrendingUp className="w-3 h-3 mr-2" />
                        {testimonial.result}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* All Testimonials Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What Our Users Are Saying
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join thousands of satisfied creators who've transformed their ebook creation process
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="neomorph-flat border-0 h-full">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-3">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                      ))}
                    </div>

                    <p className="text-sm text-foreground mb-4 leading-relaxed">
                      "{testimonial.text}"
                    </p>

                    <div className="pt-4 border-t border-border">
                      <div className="font-semibold text-sm">{testimonial.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        {testimonial.role}
                        {testimonial.verified && (
                          <CheckCircle className="w-3 h-3 text-green-500 ml-1" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Join 10,000+ Happy Creators
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Start creating professional ebooks today. No credit card required.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-primary to-accent text-white"
                onClick={() => navigate(user ? '/app/dashboard' : '/?signin=true')}
              >
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/pricing')}
              >
                View Pricing
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
        onNavigateToTestimonials={() => navigate('/testimonials')}
        onNavigateToCaseStudies={() => navigate('/case-studies')}
        onNavigateToFAQ={() => navigate('/faq')}
      />
    </div>
  );
}

export default TestimonialsPage;
