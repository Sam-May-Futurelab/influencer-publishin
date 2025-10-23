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
  TrendingUp, 
  Target,
  BookOpen,
  DollarSign,
  Clock,
  Users,
  ArrowRight,
  CheckCircle,
  BarChart,
  Zap,
  Award,
  LineChart
} from 'lucide-react';

export function CaseStudiesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const caseStudies = [
    {
      id: 'sarah-johnson',
      name: 'Sarah Johnson',
      role: 'Self-Published Author',
      image: '/images/case-studies/sarah.jpg',
      featured: true,
      challenge: 'Struggling to write and publish ebooks consistently. Taking 3-4 months per book, limiting income potential.',
      solution: 'Used Inkfluence AI to streamline writing process, create professional covers, and export in multiple formats.',
      results: {
        metric1: { label: 'Time per Ebook', before: '3-4 months', after: '2 weeks', improvement: '85% faster' },
        metric2: { label: 'Ebooks Published', before: '2 per year', after: '6 in 8 months', improvement: '300% increase' },
        metric3: { label: 'Monthly Revenue', before: '$500', after: '$3,000+', improvement: '500% growth' },
      },
      testimonial: "Inkfluence AI did not just speed up my process - it transformed my entire business. I went from struggling author to full-time income in less than a year.",
      timeline: [
        { month: 'Month 1', milestone: 'First ebook completed in 2 weeks', revenue: '$0' },
        { month: 'Month 2', milestone: '2 more ebooks published', revenue: '$450' },
        { month: 'Month 4', milestone: '4 ebooks generating passive income', revenue: '$1,800' },
        { month: 'Month 8', milestone: '6 ebooks, quit day job', revenue: '$3,200' },
      ],
      keyTakeaways: [
        'AI-assisted writing cut production time by 85%',
        'Professional templates eliminated design bottleneck',
        'Multi-format exports enabled Amazon + direct sales',
        'Consistent publishing schedule built audience trust'
      ]
    },
    {
      id: 'michael-chen',
      name: 'Michael Chen',
      role: 'Marketing Consultant',
      image: '/images/case-studies/michael.jpg',
      featured: true,
      challenge: 'Needed high-quality lead magnets for clients but outsourcing was expensive and slow.',
      solution: 'Created branded ebook templates using Inkfluence AI, generating custom lead magnets in hours instead of weeks.',
      results: {
        metric1: { label: 'Lead Magnet Cost', before: '$500-1000', after: '$0 (in-house)', improvement: '100% savings' },
        metric2: { label: 'Production Time', before: '2-3 weeks', after: '4-6 hours', improvement: '90% faster' },
        metric3: { label: 'Client Leads/Month', before: '50-100', after: '500+', improvement: '400% increase' },
      },
      testimonial: "ROI was immediate. First client campaign generated 500+ qualified leads worth $50,000 in potential revenue. Inkfluence AI paid for itself in the first day.",
      timeline: [
        { month: 'Week 1', milestone: 'Created first client lead magnet', leads: '0' },
        { month: 'Week 2', milestone: 'Deployed in email campaign', leads: '150' },
        { month: 'Month 1', milestone: '3 clients using lead magnets', leads: '450' },
        { month: 'Month 3', milestone: '8 clients, standard offering', leads: '1,200' },
      ],
      keyTakeaways: [
        'Eliminated $500-1000 per project outsourcing costs',
        'Reduced lead magnet turnaround from weeks to hours',
        'Generated 400% more leads for clients',
        'Added new service offering without hiring'
      ]
    },
    {
      id: 'emma-williams',
      name: 'Emma Williams',
      role: 'Online Course Creator',
      image: '/images/case-studies/emma.jpg',
      featured: true,
      challenge: 'Course completion rates were low. Students needed better supplementary materials but design skills were lacking.',
      solution: 'Created professional workbooks, checklists, and resource guides using Inkfluence AI templates.',
      results: {
        metric1: { label: 'Course Completion', before: '23%', after: '67%', improvement: '+44 points' },
        metric2: { label: 'Student Satisfaction', before: '3.8/5', after: '4.9/5', improvement: '+1.1 points' },
        metric3: { label: 'Referrals', before: '5/month', after: '40/month', improvement: '700% increase' },
      },
      testimonial: "My students used to complain about lack of resources. Now they rave about the quality materials. Course completion tripled and referrals skyrocketed.",
      timeline: [
        { month: 'Before', milestone: 'Basic PDF handouts', completion: '23%' },
        { month: 'Month 1', milestone: 'Added branded workbooks', completion: '35%' },
        { month: 'Month 2', milestone: 'Full resource library', completion: '52%' },
        { month: 'Month 4', milestone: 'Advanced templates', completion: '67%' },
      ],
      keyTakeaways: [
        'Professional materials increased completion 3x',
        'Student satisfaction jumped from 3.8 to 4.9 stars',
        'Referrals increased 700% due to quality',
        'No design skills needed with templates'
      ]
    },
    {
      id: 'david-rodriguez',
      name: 'David Rodriguez',
      role: 'Digital Product Seller',
      image: '/images/case-studies/david.jpg',
      featured: false,
      challenge: 'Building product library from scratch. Needed to launch quickly but quality could not suffer.',
      solution: 'Used AI writing assistant to create 12 niche ebooks in 60 days, tested different markets rapidly.',
      results: {
        metric1: { label: 'Products Launched', before: '0', after: '12 ebooks', improvement: '12 products' },
        metric2: { label: 'Time to Market', before: 'N/A', after: '5 days avg', improvement: 'Fast validation' },
        metric3: { label: 'Monthly Revenue', before: '$0', after: '$2,400', improvement: '$2,400/month' },
      },
      testimonial: "Speed was everything. I tested 12 different niches in 2 months and found 3 winners. Traditional approach would have taken 2 years.",
      timeline: [
        { month: 'Month 1', milestone: '5 ebooks in testing', revenue: '$0' },
        { month: 'Month 2', milestone: '12 ebooks, 3 profitable', revenue: '$600' },
        { month: 'Month 4', milestone: 'Doubled down on winners', revenue: '$1,800' },
        { month: 'Month 6', milestone: 'Optimized top sellers', revenue: '$2,400' },
      ],
      keyTakeaways: [
        'Rapid testing identified 3 profitable niches quickly',
        'Average 5 days from idea to published ebook',
        'Started generating income within 60 days',
        'Portfolio approach reduced risk'
      ]
    },
    {
      id: 'rachel-green',
      name: 'Rachel Green',
      role: 'Fitness Coach',
      image: '/images/case-studies/rachel.jpg',
      featured: false,
      challenge: 'Wanted to add digital products to coaching business but did not know where to start.',
      solution: 'Created nutrition guide and workout plan ebooks, used as lead magnets and paid products.',
      results: {
        metric1: { label: 'Email List Growth', before: '200', after: '2,800', improvement: '1,300% growth' },
        metric2: { label: 'Coaching Inquiries', before: '2-3/month', after: '20-30/month', improvement: '900% increase' },
        metric3: { label: 'Passive Income', before: '$0', after: '$1,200/month', improvement: 'New revenue stream' },
      },
      testimonial: "My ebooks became my best salespeople. They showcase my expertise 24/7 and pre-qualify leads before they even contact me.",
      timeline: [
        { month: 'Month 1', milestone: 'Published first free guide', subscribers: '200' },
        { month: 'Month 2', milestone: 'Added paid meal plan ebook', subscribers: '650' },
        { month: 'Month 4', milestone: '3 ebooks in funnel', subscribers: '1,500' },
        { month: 'Month 6', milestone: 'Full product ecosystem', subscribers: '2,800' },
      ],
      keyTakeaways: [
        'Email list grew from 200 to 2,800 in 6 months',
        'Coaching inquiries increased 900%',
        'Added $1,200/month passive income stream',
        'Ebooks positioned her as authority'
      ]
    }
  ];

  const metrics = [
    { icon: TrendingUp, label: 'Average Revenue Increase', value: '450%' },
    { icon: Clock, label: 'Average Time Saved', value: '80%' },
    { icon: BookOpen, label: 'Total Ebooks Created', value: '50,000+' },
    { icon: Users, label: 'Success Stories', value: '500+' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Case Studies - Real Success Stories from Inkfluence AI Users"
        description="See detailed case studies of how authors, marketers, and creators use Inkfluence AI to grow their business. Real metrics, real results."
        keywords="inkfluence ai case studies, ebook success stories, ai writing results, creator success stories, ebook business growth"
        canonicalUrl="https://inkfluenceai.com/case-studies"
        structuredData={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "CollectionPage",
              "name": "Inkfluence AI Case Studies",
              "description": "Real success stories from Inkfluence AI users"
            },
            createBreadcrumbSchema([
              { name: "Home", url: "https://inkfluenceai.com/" },
              { name: "Case Studies", url: "https://inkfluenceai.com/case-studies" }
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
                <BarChart className="w-12 h-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Real Results, Real Success Stories
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              See how creators are using Inkfluence AI to build profitable ebook businesses, grow their audience, and achieve their goals.
            </p>

            {/* Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {metrics.map((metric, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="neomorph-flat border-0">
                    <CardContent className="p-6 text-center">
                      <metric.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                      <div className="text-2xl font-bold mb-1">{metric.value}</div>
                      <div className="text-sm text-muted-foreground">{metric.label}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Case Studies */}
      {caseStudies.filter(cs => cs.featured).map((study, index) => (
        <section 
          key={study.id} 
          className={`py-16 px-4 sm:px-6 lg:px-8 ${index % 2 === 1 ? 'bg-muted/30' : ''}`}
        >
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              {/* Header */}
              <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <span className="text-4xl font-bold text-primary">
                      {study.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <Badge variant="secondary" className="mb-3">
                    <Award className="w-3 h-3 mr-1" />
                    Featured Case Study
                  </Badge>
                  <h2 className="text-3xl md:text-4xl font-bold mb-2">{study.name}</h2>
                  <p className="text-xl text-muted-foreground mb-4">{study.role}</p>
                  <div className="flex flex-wrap gap-4">
                    {Object.values(study.results).map((result, i) => (
                      <Badge key={i} variant="outline" className="px-3 py-1">
                        <TrendingUp className="w-3 h-3 mr-2" />
                        {result.improvement}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Challenge & Solution */}
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <Card className="neomorph-flat border-0">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <Target className="w-6 h-6 text-red-500" />
                      <h3 className="text-xl font-semibold">The Challenge</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{study.challenge}</p>
                  </CardContent>
                </Card>

                <Card className="neomorph-flat border-0">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <Zap className="w-6 h-6 text-green-500" />
                      <h3 className="text-xl font-semibold">The Solution</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{study.solution}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Results Grid */}
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                {Object.entries(study.results).map(([key, result]) => (
                  <Card key={key} className="neomorph-raised border-0">
                    <CardContent className="p-6">
                      <div className="text-sm text-muted-foreground mb-2">{result.label}</div>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-sm line-through text-muted-foreground">{result.before}</span>
                        <ArrowRight className="w-4 h-4 text-primary" />
                        <span className="text-lg font-bold text-primary">{result.after}</span>
                      </div>
                      <Badge variant="secondary" className="w-full justify-center">
                        {result.improvement}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Timeline */}
              <Card className="neomorph-flat border-0 mb-12">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <LineChart className="w-6 h-6 text-primary" />
                    <h3 className="text-xl font-semibold">Growth Timeline</h3>
                  </div>
                  <div className="grid md:grid-cols-4 gap-6">
                    {study.timeline.map((item, i) => (
                      <div key={i} className="relative">
                        {i < study.timeline.length - 1 && (
                          <div className="hidden md:block absolute top-6 left-full w-full h-0.5 bg-gradient-to-r from-primary to-primary/30"></div>
                        )}
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-3">
                            <CheckCircle className="w-6 h-6 text-primary" />
                          </div>
                          <div className="font-semibold mb-1">{item.month}</div>
                          <div className="text-sm text-muted-foreground mb-2">{item.milestone}</div>
                          <Badge variant="outline" className="text-xs">
                            {item.revenue || item.leads || item.completion || item.subscribers}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Testimonial */}
              <Card className="neomorph-raised border-0 mb-8">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl text-primary/30">"</div>
                    <div>
                      <p className="text-lg italic mb-4">{study.testimonial}</p>
                      <div className="font-semibold">— {study.name}, {study.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Key Takeaways */}
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Key Takeaways
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {study.keyTakeaways.map((takeaway, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{takeaway}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      ))}

      {/* More Case Studies */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              More Success Stories
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              These creators also transformed their business with Inkfluence AI
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {caseStudies.filter(cs => !cs.featured).map((study, index) => (
              <motion.div
                key={study.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="neomorph-flat border-0 h-full">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                        <span className="text-xl font-bold text-primary">
                          {study.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">{study.name}</h3>
                        <p className="text-sm text-muted-foreground">{study.role}</p>
                      </div>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div>
                        <div className="text-sm font-semibold mb-2">Challenge</div>
                        <p className="text-sm text-muted-foreground">{study.challenge}</p>
                      </div>
                      <div>
                        <div className="text-sm font-semibold mb-2">Results</div>
                        <div className="flex flex-wrap gap-2">
                          {Object.values(study.results).map((result, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {result.improvement}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <p className="text-sm italic text-muted-foreground">"{study.testimonial}"</p>
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
              Ready to Write Your Success Story?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of creators building profitable ebook businesses with Inkfluence AI
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-primary to-accent text-white"
                onClick={() => navigate(user ? '/app/dashboard' : '/?signin=true')}
              >
                Start Your Journey
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/testimonials')}
              >
                Read More Reviews
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

export default CaseStudiesPage;
