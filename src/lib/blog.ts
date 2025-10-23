// Blog post types and data management

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string; // Full HTML content
  author: {
    name: string;
    avatar?: string;
  };
  category: string;
  tags: string[];
  readTime: number; // minutes
  publishDate: string; // ISO date
  updatedDate?: string; // ISO date
  featured: boolean;
  image: string;
  imageAlt?: string;
  // SEO fields
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  canonicalUrl?: string;
}

// For now, we'll use hardcoded posts with proper SEO structure
// Later, you can move these to markdown files or a CMS
export const blogPosts: BlogPost[] = [
  {
    id: 'ai-ebook-writing-guide-2025',
    slug: 'ai-ebook-writing-guide-2025',
    title: 'The Complete Guide to AI-Powered Ebook Writing in 2025',
    excerpt: 'Discover how artificial intelligence is revolutionizing ebook creation. Learn the best practices, tools, and techniques to create professional ebooks 10x faster.',
    content: `
      <h2>Introduction to AI-Powered Ebook Writing</h2>
      <p>The publishing industry is experiencing a revolutionary transformation. Artificial Intelligence has emerged as a powerful ally for authors, marketers, and content creators looking to produce high-quality ebooks efficiently.</p>
      
      <h2>Why AI for Ebook Writing?</h2>
      <p>Traditional ebook writing can take months of dedicated work. AI-powered tools like Inkfluence AI are changing this paradigm by:</p>
      <ul>
        <li><strong>Accelerating content creation</strong> - Generate draft chapters in minutes</li>
        <li><strong>Maintaining consistency</strong> - Keep tone and style uniform throughout</li>
        <li><strong>Overcoming writer's block</strong> - Get instant inspiration and suggestions</li>
        <li><strong>Improving quality</strong> - AI-powered editing and enhancement</li>
      </ul>

      <h2>Best Practices for AI Ebook Writing</h2>
      <h3>1. Start with a Clear Outline</h3>
      <p>Before generating content, create a detailed outline. AI works best when given clear direction and structure.</p>

      <h3>2. Use Specific Prompts</h3>
      <p>Generic prompts produce generic content. Be specific about tone, audience, and goals.</p>

      <h3>3. Edit and Personalize</h3>
      <p>AI generates drafts - your expertise makes them great. Always review and add your unique insights.</p>

      <h3>4. Leverage AI for Research</h3>
      <p>Use AI to gather information, statistics, and examples to enrich your content.</p>

      <h2>Tools and Techniques</h2>
      <p>Inkfluence AI combines multiple AI technologies to streamline your ebook creation:</p>
      <ul>
        <li>GPT-4 powered content generation</li>
        <li>Voice-to-text dictation for natural writing flow</li>
        <li>Custom branding and styling</li>
        <li>Multi-format export (PDF, EPUB, DOCX)</li>
      </ul>

      <h2>Common Pitfalls to Avoid</h2>
      <ol>
        <li><strong>Over-reliance on AI</strong> - Use it as a tool, not a replacement for expertise</li>
        <li><strong>Ignoring fact-checking</strong> - Always verify AI-generated information</li>
        <li><strong>Generic content</strong> - Add your unique perspective and examples</li>
        <li><strong>Skipping editing</strong> - Professional ebooks require thorough editing</li>
      </ol>

      <h2>The Future of AI Ebook Writing</h2>
      <p>As AI technology advances, we can expect even more sophisticated features:</p>
      <ul>
        <li>Advanced style adaptation</li>
        <li>Real-time collaboration</li>
        <li>Automated formatting and design</li>
        <li>Multi-language support</li>
      </ul>

      <h2>Getting Started</h2>
      <p>Ready to create your first AI-powered ebook? Start with Inkfluence AI today and experience the future of content creation.</p>

      <p><a href="/pricing">View pricing plans →</a></p>
    `,
    author: {
      name: 'Sarah Johnson',
      avatar: '/images/authors/sarah.jpg'
    },
    category: 'AI Writing',
    tags: ['AI', 'Ebook Creation', 'Writing Tips', 'Productivity'],
    readTime: 8,
    publishDate: '2025-10-21T09:00:00Z',
    featured: true,
    image: '/images/blog/ai-writing-guide.jpg',
    imageAlt: 'Person writing an ebook with AI assistance on a laptop',
    metaTitle: 'Complete Guide to AI Ebook Writing in 2025 | Inkfluence AI',
    metaDescription: 'Learn how to create professional ebooks 10x faster with AI. Best practices, tools, and techniques for AI-powered ebook writing in 2025.',
    keywords: ['AI ebook writing', 'artificial intelligence writing', 'ebook creation', 'content generation', 'writing with AI', 'ebook tools 2025']
  },
  {
    id: 'ebook-marketing-strategies',
    slug: 'ebook-marketing-strategies',
    title: '15 Proven Ebook Marketing Strategies That Actually Work',
    excerpt: 'Transform your ebook from a hidden gem into a bestseller. These data-driven marketing strategies have generated over $2M in ebook sales.',
    content: `
      <h2>Why Most Ebooks Fail to Sell</h2>
      <p>Creating a great ebook is only half the battle. Without proper marketing, even the best content won't reach your audience. This guide reveals 15 proven strategies used by successful ebook marketers.</p>

      <h2>Strategy 1: Build an Email List First</h2>
      <p>Start building your audience before you launch. Offer a free chapter or bonus content to collect emails.</p>

      <h2>Strategy 2: Create a Compelling Landing Page</h2>
      <p>Your landing page should clearly communicate the value proposition and include social proof.</p>

      <h2>Strategy 3: Leverage Social Proof</h2>
      <p>Reviews, testimonials, and case studies build trust and increase conversions.</p>

      <h2>Strategy 4: Use Lead Magnets</h2>
      <p>Offer your ebook as a lead magnet to grow your email list and nurture relationships.</p>

      <h2>Strategy 5: Partner with Influencers</h2>
      <p>Collaborate with influencers in your niche to reach a broader audience.</p>

      <h2>Measuring Success</h2>
      <p>Track these key metrics to optimize your ebook marketing:</p>
      <ul>
        <li>Download/Purchase conversion rate</li>
        <li>Email open and click rates</li>
        <li>Social media engagement</li>
        <li>Reader reviews and ratings</li>
      </ul>

      <h2>Conclusion</h2>
      <p>Successful ebook marketing requires a multi-channel approach. Start with these strategies and adjust based on your results.</p>
    `,
    author: {
      name: 'Michael Chen',
      avatar: '/images/authors/michael.jpg'
    },
    category: 'Marketing',
    tags: ['Marketing', 'Sales', 'Lead Generation', 'Content Strategy'],
    readTime: 12,
    publishDate: '2025-10-18T10:00:00Z',
    featured: true,
    image: '/images/blog/ebook-marketing.jpg',
    imageAlt: 'Marketing strategies dashboard showing ebook sales growth',
    metaTitle: '15 Proven Ebook Marketing Strategies for 2025 | Inkfluence AI',
    metaDescription: 'Discover data-driven ebook marketing strategies that generated $2M+ in sales. Learn how to market your ebook effectively.',
    keywords: ['ebook marketing', 'digital book promotion', 'content marketing', 'lead generation', 'ebook sales strategies']
  },
  {
    id: 'ebook-design-best-practices',
    slug: 'ebook-design-best-practices',
    title: 'Ebook Design That Converts: 10 Psychology-Based Principles',
    excerpt: 'Why some ebooks get 90% more engagement than others. Learn the design psychology secrets that make readers take action.',
    content: `
      <h2>The Psychology of Ebook Design</h2>
      <p>Great design isn't just about aesthetics - it's about psychology. Understanding how readers process visual information can dramatically increase engagement and conversions.</p>

      <h2>Principle 1: Visual Hierarchy</h2>
      <p>Guide readers' attention with clear hierarchy. Use size, color, and spacing to emphasize important information.</p>

      <h2>Principle 2: White Space</h2>
      <p>Don't overcrowd your pages. Strategic white space improves readability and reduces cognitive load.</p>

      <h2>Principle 3: Color Psychology</h2>
      <p>Colors evoke emotions. Choose a palette that aligns with your message and brand.</p>

      <h2>Typography Matters</h2>
      <ul>
        <li>Use readable fonts (14-16pt for body text)</li>
        <li>Limit to 2-3 font families</li>
        <li>Ensure sufficient line spacing</li>
      </ul>

      <h2>Call-to-Actions</h2>
      <p>Strategic placement and design of CTAs can increase conversion rates by up to 90%.</p>
    `,
    author: {
      name: 'Emma Rodriguez',
      avatar: '/images/authors/emma.jpg'
    },
    category: 'Design',
    tags: ['Design', 'Psychology', 'Conversion', 'User Experience'],
    readTime: 6,
    publishDate: '2025-10-15T11:00:00Z',
    featured: false,
    image: '/images/blog/ebook-design.jpg',
    imageAlt: 'Professional ebook layout showcasing design principles',
    metaTitle: 'Ebook Design Psychology: 10 Principles That Convert | Inkfluence AI',
    metaDescription: 'Learn psychology-based ebook design principles that increase engagement by 90%. Professional design tips for ebook creators.',
    keywords: ['ebook design', 'design psychology', 'conversion optimization', 'visual design', 'user experience']
  }
];

// Helper functions
export function getAllPosts(): BlogPost[] {
  return blogPosts.sort((a, b) => 
    new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
  );
}

export function getFeaturedPosts(): BlogPost[] {
  return blogPosts.filter(post => post.featured);
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find(post => post.slug === slug);
}

export function getRelatedPosts(post: BlogPost, limit: number = 3): BlogPost[] {
  return blogPosts
    .filter(p => 
      p.id !== post.id && 
      (p.category === post.category || p.tags.some(tag => post.tags.includes(tag)))
    )
    .slice(0, limit);
}

export function getPostsByCategory(category: string): BlogPost[] {
  return blogPosts.filter(post => post.category === category);
}

export function getPostsByTag(tag: string): BlogPost[] {
  return blogPosts.filter(post => post.tags.includes(tag));
}

export function getAllCategories(): string[] {
  return Array.from(new Set(blogPosts.map(post => post.category)));
}

export function getAllTags(): string[] {
  return Array.from(new Set(blogPosts.flatMap(post => post.tags)));
}
