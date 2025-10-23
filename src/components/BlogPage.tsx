import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { LandingHeader } from './LandingHeader';
import { LandingFooter } from './LandingFooter';
import { SEO, createArticleSchema, createBreadcrumbSchema, createOrganizationSchema } from './SEO';
import { 
  BookOpen, 
  Search, 
  Calendar, 
  Clock, 
  User, 
  ArrowRight,
  Zap,
  TrendingUp,
  Target,
  Lightbulb,
  PenTool,
  Settings,
  Brain,
  Sparkles
} from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  tags: string[];
  readTime: number;
  publishDate: string;
  image: string;
  featured: boolean;
}

const blogPosts: BlogPost[] = [
  {
    id: 'ai-ebook-writing-guide-2025',
    title: 'The Complete Guide to AI-Powered Ebook Writing in 2025',
    excerpt: 'Discover how artificial intelligence is revolutionizing ebook creation. Learn the best practices, tools, and techniques to create professional ebooks 10x faster.',
    content: 'Full article content would go here...',
    author: 'Sarah Johnson',
    category: 'AI Writing',
    tags: ['AI', 'Ebook Creation', 'Writing Tips', 'Productivity'],
    readTime: 8,
    publishDate: '2025-10-21',
    image: '/images/ai-writing-guide.jpg',
    featured: true
  },
  {
    id: 'ebook-marketing-strategies',
    title: '15 Proven Ebook Marketing Strategies That Actually Work',
    excerpt: 'Transform your ebook from a hidden gem into a bestseller. These data-driven marketing strategies have generated over $2M in ebook sales.',
    content: 'Full article content would go here...',
    author: 'Michael Chen',
    category: 'Marketing',
    tags: ['Marketing', 'Sales', 'Lead Generation', 'Content Strategy'],
    readTime: 12,
    publishDate: '2025-10-18',
    image: '/images/ebook-marketing.jpg',
    featured: true
  },
  {
    id: 'ebook-design-best-practices',
    title: 'Ebook Design That Converts: 10 Psychology-Based Principles',
    excerpt: 'Why some ebooks get 90% more engagement than others. Learn the design psychology secrets that make readers take action.',
    content: 'Full article content would go here...',
    author: 'Emma Rodriguez',
    category: 'Design',
    tags: ['Design', 'Psychology', 'Conversion', 'User Experience'],
    readTime: 6,
    publishDate: '2025-10-15',
    image: '/images/ebook-design.jpg',
    featured: false
  },
  {
    id: 'content-creation-workflow',
    title: 'Build a Content Creation Workflow That Scales to 100+ Ebooks',
    excerpt: 'The exact 5-step system we use to create high-quality ebooks consistently. Includes templates, checklists, and automation tips.',
    content: 'Full article content would go here...',
    author: 'David Kim',
    category: 'Productivity',
    tags: ['Workflow', 'Productivity', 'Automation', 'Templates'],
    readTime: 10,
    publishDate: '2025-10-12',
    image: '/images/content-workflow.jpg',
    featured: false
  },
  {
    id: 'seo-for-ebooks',
    title: 'SEO for Ebooks: How to Rank #1 and Get 10,000+ Downloads',
    excerpt: 'The ultimate guide to ebook SEO. From keyword research to distribution, learn how to make your ebooks discoverable and profitable.',
    content: 'Full article content would go here...',
    author: 'Lisa Thompson',
    category: 'SEO',
    tags: ['SEO', 'Keywords', 'Distribution', 'Organic Traffic'],
    readTime: 14,
    publishDate: '2025-10-09',
    image: '/images/ebook-seo.jpg',
    featured: false
  },
  {
    id: 'ai-writing-prompts',
    title: '50+ High-Converting AI Writing Prompts for Ebook Creators',
    excerpt: 'Copy-paste prompts that generate compelling ebook content. Includes prompts for introductions, chapters, conclusions, and CTAs.',
    content: 'Full article content would go here...',
    author: 'Alex Johnson',
    category: 'AI Writing',
    tags: ['AI Prompts', 'Content Generation', 'Writing', 'Templates'],
    readTime: 5,
    publishDate: '2025-10-06',
    image: '/images/ai-prompts.jpg',
    featured: false
  }
];

const categories = ['All', 'AI Writing', 'Marketing', 'Design', 'Productivity', 'SEO'];

export default function BlogPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const featuredPosts = blogPosts.filter(post => post.featured);
  const recentPosts = blogPosts.slice(0, 4);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'AI Writing': return <Brain className="h-5 w-5" />;
      case 'Marketing': return <TrendingUp className="h-5 w-5" />;
      case 'Design': return <Sparkles className="h-5 w-5" />;
      case 'Productivity': return <Zap className="h-5 w-5" />;
      case 'SEO': return <Target className="h-5 w-5" />;
      default: return <BookOpen className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0e8f8] to-white">
      <SEO
        title="Ebook Creation Blog - AI Writing Tips, Marketing Strategies & Design Guides"
        description="Master ebook creation with expert guides on AI writing, marketing strategies, design tips, and SEO optimization. Free tutorials and resources for content creators and entrepreneurs."
        keywords="ebook creation blog, AI writing tips, ebook marketing, content creation guides, digital publishing resources, ebook design tutorials"
        canonicalUrl="https://inkfluenceai.com/blog"
        structuredData={{
          "@context": "https://schema.org",
          "@graph": [
            createOrganizationSchema(),
            createBreadcrumbSchema([
              { name: "Home", url: "https://inkfluenceai.com/" },
              { name: "Blog", url: "https://inkfluenceai.com/blog" }
            ]),
            {
              "@type": "Blog",
              "name": "InkfluenceAI Blog",
              "description": "Expert guides and tutorials on AI-powered ebook creation, marketing, and design",
              "url": "https://inkfluenceai.com/blog",
              "publisher": createOrganizationSchema(),
              "blogPost": featuredPosts.map(post => ({
                "@type": "BlogPosting",
                "headline": post.title,
                "description": post.excerpt,
                "author": {
                  "@type": "Person",
                  "name": post.author
                },
                "datePublished": post.publishDate,
                "url": `https://inkfluenceai.com/blog/${post.id}`
              }))
            }
          ]
        }}
      />
      
      <LandingHeader 
        onGetStarted={() => navigate('/signin')}
        onSignIn={() => navigate('/signin')}
        showNavLinks={true}
        isAuthenticated={!!user}
        onNavigateToPricing={() => navigate('/pricing')}
        onNavigateToFeatures={() => navigate('/features')}
        onNavigateToBlog={() => navigate('/blog')}
      />

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Master Ebook Creation with 
            <span className="bg-gradient-to-r from-[#9b87b8] to-[#b89ed6] bg-clip-text text-transparent"> AI-Powered Guides</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Expert tutorials, proven strategies, and insider tips to help you create, market, and sell professional ebooks that convert.
          </p>
          
          {/* Search and Filter */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search articles, tips, and guides..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 py-3 text-lg border-gray-200 focus:border-[#9b87b8] focus:ring-[#9b87b8]"
                />
              </div>
            </div>
            
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={`${selectedCategory === category 
                    ? 'bg-[#9b87b8] hover:bg-[#8a7ba7] text-white' 
                    : 'border-gray-200 text-gray-600 hover:border-[#9b87b8] hover:text-[#9b87b8]'
                  }`}
                >
                  {getCategoryIcon(category)}
                  <span className="ml-2">{category}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Featured Articles */}
        {searchTerm === '' && selectedCategory === 'All' && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Articles</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {featuredPosts.map((post) => (
                <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border-0 shadow-md bg-white/80 backdrop-blur">
                  <div className="aspect-video bg-gradient-to-br from-[#9b87b8]/10 to-[#b89ed6]/10 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      {getCategoryIcon(post.category)}
                    </div>
                    <Badge className="absolute top-4 left-4 bg-[#9b87b8] text-white">
                      Featured
                    </Badge>
                  </div>
                  <CardHeader>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {post.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(post.publishDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {post.readTime} min read
                      </span>
                    </div>
                    <CardTitle className="text-xl font-semibold text-gray-900 leading-tight">
                      {post.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4 leading-relaxed">{post.excerpt}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button variant="ghost" className="text-[#9b87b8] hover:text-[#8a7ba7] p-0">
                      Read Article
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* All Articles */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            {searchTerm || selectedCategory !== 'All' 
              ? `${filteredPosts.length} Article${filteredPosts.length !== 1 ? 's' : ''} Found` 
              : 'Latest Articles'
            }
          </h2>
          
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No articles found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <Card key={post.id} className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-md bg-white/60 backdrop-blur">
                  <div className="aspect-video bg-gradient-to-br from-[#9b87b8]/10 to-[#b89ed6]/10 relative">
                    <div className="absolute inset-0 flex items-center justify-center text-[#9b87b8]">
                      {getCategoryIcon(post.category)}
                    </div>
                    <Badge className="absolute top-3 left-3 bg-white/90 text-[#9b87b8] border border-[#9b87b8]/20">
                      {post.category}
                    </Badge>
                  </div>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {post.readTime} min
                      </span>
                      <span>{new Date(post.publishDate).toLocaleDateString()}</span>
                    </div>
                    <CardTitle className="text-lg font-semibold text-gray-900 leading-tight line-clamp-2">
                      {post.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">{post.excerpt}</p>
                    <Button variant="ghost" size="sm" className="text-[#9b87b8] hover:text-[#8a7ba7] p-0">
                      Read More
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Newsletter CTA */}
        <section className="mt-16 bg-gradient-to-r from-[#9b87b8] to-[#b89ed6] rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Stay Ahead of the Curve
          </h2>
          <p className="text-xl mb-8 text-purple-100 max-w-2xl mx-auto">
            Get weekly insights on AI writing, ebook marketing, and content creation. Plus exclusive templates and resources.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email address"
              className="bg-white/90 text-gray-900 border-white/30 placeholder:text-gray-500"
            />
            <Button 
              className="bg-white text-[#9b87b8] hover:bg-gray-50 font-semibold whitespace-nowrap"
              onClick={() => navigate('/signin')}
            >
              Get Started Free
            </Button>
          </div>
          <p className="text-sm mt-4 text-purple-200">
            No spam, unsubscribe anytime • 10,000+ creators already subscribed
          </p>
        </section>
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
      />
    </div>
  );
}