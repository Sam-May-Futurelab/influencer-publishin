import { EbookProject, Chapter, BrandConfig } from './types';

export interface EbookTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  brandConfig: BrandConfig;
  chapters: Omit<Chapter, 'id' | 'createdAt' | 'updatedAt'>[];
  estimatedReadTime: string;
  targetAudience: string;
}

export const ebookTemplates: EbookTemplate[] = [
  {
    id: 'fitness-transformation',
    name: '30-Day Fitness Transformation',
    description: 'Complete guide for body transformation with workouts, nutrition, and mindset.',
    category: 'Fitness & Health',
    icon: '💪',
    brandConfig: {
      primaryColor: '#EF4444',
      secondaryColor: '#F87171',
      accentColor: '#FEE2E2',
      fontFamily: 'Inter, sans-serif',
      coverStyle: 'gradient',
    },
    estimatedReadTime: '45 minutes',
    targetAudience: 'Fitness beginners to intermediate',
    chapters: [
      {
        title: 'Welcome to Your Transformation',
        content: `# Welcome to Your 30-Day Fitness Journey

Congratulations on taking the first step toward transforming your body and mind. This guide will provide you with everything you need to achieve remarkable results in just 30 days.

## What You'll Achieve
- Lose 5-15 pounds of fat
- Build lean muscle definition
- Increase energy levels
- Develop lasting healthy habits

## How to Use This Guide
Each chapter builds upon the previous one, creating a comprehensive system for transformation. Read through completely before starting, then reference specific sections as needed.

*Remember: Consistency beats perfection. Small daily actions lead to extraordinary results.*`,
        order: 0,
      },
      {
        title: 'Setting Your Foundation',
        content: `# Building Your Success Foundation

Before diving into workouts and meal plans, we need to establish the mental and physical foundation for your transformation.

## Goal Setting Framework
### SMART Goals Template
- **Specific**: I will lose ___ pounds/gain ___ muscle
- **Measurable**: Using scale, measurements, photos
- **Achievable**: Based on your current fitness level
- **Relevant**: Aligned with your lifestyle
- **Time-bound**: 30-day deadline

## Tracking Your Progress
- Weekly body measurements
- Progress photos (front, side, back)
- Energy levels (1-10 scale)
- Workout performance metrics

## Mindset Preparation
Your mind is your most powerful tool. Prepare for challenges and celebrate small wins daily.`,
        order: 1,
      },
      {
        title: 'The Transformation Workout Plan',
        content: `# Your 30-Day Workout System

This plan combines strength training, cardio, and mobility work for maximum results.

## Week 1-2: Foundation Phase
### Workout A (Monday/Thursday)
- Bodyweight squats: 3 sets x 12-15 reps
- Push-ups (modified if needed): 3 sets x 8-12 reps
- Plank hold: 3 sets x 30-60 seconds
- Walking lunges: 3 sets x 10 each leg

### Workout B (Tuesday/Friday)
- Jumping jacks: 3 sets x 30 seconds
- Mountain climbers: 3 sets x 20 reps
- Glute bridges: 3 sets x 15 reps
- Dead bug: 3 sets x 10 each side

### Active Recovery (Wednesday/Saturday)
- 20-30 minute walk
- Gentle stretching routine
- Foam rolling if available

*Detailed exercise descriptions and video links included in your bonus materials.*`,
        order: 2,
      },
      {
        title: 'Nutrition That Fuels Results',
        content: `# Nutrition for Transformation

Abs are made in the kitchen. Your nutrition strategy will determine 70% of your results.

## The Simple Plate Method
Divide your plate into thirds:
- **1/2 plate**: Non-starchy vegetables (broccoli, spinach, peppers)
- **1/4 plate**: Lean protein (chicken, fish, tofu, beans)
- **1/4 plate**: Complex carbs (quinoa, sweet potato, brown rice)

## Sample Daily Menu
### Breakfast
- 2 eggs with spinach
- 1 slice whole grain toast
- 1/2 avocado
- Black coffee or green tea

### Lunch
- Large salad with mixed greens
- 4 oz grilled chicken
- 1/2 cup quinoa
- Olive oil vinaigrette

### Dinner
- 4 oz salmon
- Roasted vegetables
- 1/2 cup brown rice

### Snacks (choose 1-2)
- Apple with almond butter
- Greek yogurt with berries
- Handful of nuts
- Vegetable sticks with hummus

## Hydration Goal
Drink half your body weight in ounces of water daily. Add lemon or cucumber for variety.`,
        order: 3,
      },
      {
        title: 'Week-by-Week Progression',
        content: `# Your 30-Day Timeline

Each week builds intensity while allowing for adaptation and recovery.

## Week 1: Foundation
**Focus**: Learning movements, establishing routine
- Workouts: 4 days
- Intensity: 6/10
- Key habit: Track everything

## Week 2: Adaptation
**Focus**: Improving form, increasing consistency
- Workouts: 4-5 days
- Intensity: 7/10
- Key habit: Meal prep Sunday

## Week 3: Acceleration
**Focus**: Pushing limits, seeing changes
- Workouts: 5 days
- Intensity: 8/10
- Key habit: Progress photos

## Week 4: Peak Performance
**Focus**: Maximum effort, final push
- Workouts: 5-6 days
- Intensity: 9/10
- Key habit: Plan for maintenance

## Daily Success Checklist
- [ ] Complete workout
- [ ] Hit nutrition targets
- [ ] Drink target water
- [ ] Take progress photo (weekly)
- [ ] Journal wins and challenges`,
        order: 4,
      },
      {
        title: 'Maintaining Your Results',
        content: `# Beyond 30 Days: Lifestyle Integration

Your transformation doesn't end at day 30. Here's how to maintain and continue your progress.

## Transition Strategy
### Weeks 5-8: Stabilization
- Maintain current workout frequency
- Allow for 80/20 nutrition flexibility
- Focus on building sustainable habits

### Month 3+: Evolution
- Introduce new workout challenges
- Expand your healthy recipe collection
- Set new fitness goals

## Troubleshooting Common Challenges
### Plateau Busting
- Increase workout intensity
- Adjust caloric intake
- Change exercise selection
- Add more sleep/recovery

### Motivation Maintenance
- Find a workout buddy
- Set mini-challenges
- Reward non-food victories
- Join fitness communities

## Your Success Toolkit
- Weekly meal prep templates
- Workout progression charts
- Habit tracking sheets
- Emergency healthy meal ideas

*Congratulations on completing your 30-day transformation. You now have the tools for lifelong fitness success!*`,
        order: 5,
      },
    ],
  },
  {
    id: 'business-startup',
    name: 'From Idea to Launch',
    description: 'Complete blueprint for launching your first successful business in 90 days.',
    category: 'Business & Entrepreneurship',
    icon: '🚀',
    brandConfig: {
      primaryColor: '#3B82F6',
      secondaryColor: '#60A5FA',
      accentColor: '#DBEAFE',
      fontFamily: 'Inter, sans-serif',
      coverStyle: 'gradient',
    },
    estimatedReadTime: '60 minutes',
    targetAudience: 'Aspiring entrepreneurs and business owners',
    chapters: [
      {
        title: 'Your Entrepreneurial Journey Begins',
        content: `# From Idea to Launch: Your 90-Day Business Blueprint

Welcome to your comprehensive guide for transforming your business idea into a profitable reality. In the next 90 days, you'll build, validate, and launch your business with confidence.

## What You'll Accomplish
- Validate your business idea with real customers
- Build a minimum viable product (MVP)
- Generate your first $1,000 in revenue
- Create systems for sustainable growth

## The 90-Day Framework
This guide follows a proven 3-phase approach:
- **Days 1-30**: Foundation & Validation
- **Days 31-60**: Building & Testing
- **Days 61-90**: Launch & Scale

## Success Principles
1. **Start before you're ready** - Perfect is the enemy of good
2. **Customer-first mindset** - Solve real problems for real people
3. **Iterate quickly** - Fail fast, learn faster
4. **Track everything** - Data drives decisions

*Your entrepreneurial journey starts with a single step. Let's take it together.*`,
        order: 0,
      },
      {
        title: 'Idea Validation & Market Research',
        content: `# Validating Your Million-Dollar Idea

Before investing time and money, we need to prove people want what you're offering.

## The Validation Framework
### 1. Problem Identification
- What specific problem does your idea solve?
- How painful is this problem for your target audience?
- How are people currently solving this problem?

### 2. Target Customer Profile
**Primary Customer Avatar:**
- Demographics: Age, income, location, job title
- Psychographics: Values, interests, pain points
- Behaviors: Where they shop, how they research, decision factors

### 3. Market Research Methods
**Free Research Sources:**
- Google Trends and Keyword Planner
- Social media groups and forums
- Competitor analysis
- Industry reports and surveys

**Paid Research Options:**
- Survey Monkey or Typeform surveys
- Facebook/Google Ads testing
- Landing page A/B tests

## Validation Experiments
### Week 1: Problem Interviews
Conduct 10 interviews with potential customers:
- "Tell me about the last time you experienced [problem]"
- "How do you currently handle [problem]?"
- "What would an ideal solution look like?"

### Week 2: Solution Testing
Create a simple prototype or mockup:
- Landing page with value proposition
- Social media posts describing your solution
- Email signup form to gauge interest

### Week 3: Competitive Analysis
- Identify 5-10 direct competitors
- Analyze their pricing, features, and customer reviews
- Find gaps in the market you can fill

## Success Metrics
- 50+ problem interviews completed
- 100+ email signups from landing page
- 70%+ of interviewees express buying intent`,
        order: 1,
      },
      {
        title: 'Building Your Minimum Viable Product',
        content: `# Creating Your MVP in 30 Days

Your MVP should be the simplest version of your product that solves the core problem for your customers.

## MVP Planning Framework
### Core Feature Definition
Ask yourself:
- What ONE thing must your product do well?
- What's the minimum feature set for customer value?
- What can be added later without losing customers?

### MVP Development Options
**No-Code Solutions:**
- **Websites**: WordPress, Webflow, Squarespace
- **Apps**: Bubble, Glide, Adalo
- **E-commerce**: Shopify, WooCommerce
- **Marketplaces**: Etsy, Amazon, Gumroad

**Service-Based MVPs:**
- Manual delivery of your service
- Concierge approach (do everything manually first)
- Wizard of Oz testing (fake it till you make it)

**Product-Based MVPs:**
- 3D printed prototypes
- Dropshipping arrangements
- Pre-orders before manufacturing

## 30-Day Build Schedule
### Week 1: Planning & Setup
- Finalize MVP feature list
- Choose development platform
- Set up basic infrastructure (domain, hosting, analytics)

### Week 2: Core Development
- Build primary functionality
- Create basic user interface
- Set up payment processing

### Week 3: Testing & Refinement
- Internal testing and bug fixes
- Beta user testing (5-10 friendly customers)
- Iterate based on feedback

### Week 4: Launch Preparation
- Final testing and quality assurance
- Create launch materials (copy, images, videos)
- Set up customer support systems

## Quality Checkpoints
- [ ] Solves the core customer problem
- [ ] Simple and intuitive to use
- [ ] Payments and onboarding work smoothly
- [ ] Mobile-responsive design
- [ ] Analytics tracking implemented`,
        order: 2,
      },
      {
        title: 'Marketing & Customer Acquisition',
        content: `# Getting Your First Customers

The best product in the world means nothing without customers. Here's how to find yours.

## Customer Acquisition Strategy
### Phase 1: Warm Network (Days 1-7)
Start with people who already know and trust you:
- Family and friends
- Social media connections
- Professional network
- Email contacts

**Action Plan:**
- Create personal announcement post
- Send direct messages to 50 warm contacts
- Ask for feedback and referrals

### Phase 2: Content Marketing (Days 8-21)
Establish authority and attract customers:
- Blog posts solving customer problems
- Social media content (daily posts)
- Guest appearances on podcasts/blogs
- YouTube or TikTok videos

**Content Calendar Template:**
- Monday: Industry news commentary
- Tuesday: Behind-the-scenes content
- Wednesday: Educational tutorial
- Thursday: Customer success story
- Friday: Fun/personal content

### Phase 3: Paid Advertising (Days 22-30)
Scale your reach with targeted ads:
- Facebook/Instagram ads to lookalike audiences
- Google Ads for high-intent keywords
- LinkedIn ads for B2B products
- Influencer partnerships

## Channel-Specific Strategies
### Social Media Marketing
**Platform Selection:**
- B2B: LinkedIn, Twitter
- B2C: Instagram, TikTok, Facebook
- Visual products: Pinterest, Instagram
- Education: YouTube, LinkedIn

**Engagement Tactics:**
- Join relevant groups and provide value
- Comment thoughtfully on industry posts
- Share others' content with your insights
- Host live Q&A sessions

### Email Marketing
**List Building:**
- Lead magnets (free guides, templates, trials)
- Webinar registrations
- Contest entries
- Newsletter signups

**Email Sequence:**
1. Welcome and deliver lead magnet
2. Share your story and mission
3. Provide valuable tips/insights
4. Social proof and testimonials
5. Soft product introduction
6. Special offer or demo invitation

## Measuring Success
Track these key metrics:
- **Traffic**: Website visits, social media reach
- **Engagement**: Likes, comments, shares, email opens
- **Conversion**: Email signups, demo requests
- **Sales**: Customers acquired, revenue generated`,
        order: 3,
      },
      {
        title: 'Launch Strategy & First Sales',
        content: `# The 7-Day Launch Sequence

Your launch week is crucial for generating momentum and your first sales.

## Pre-Launch Preparation (7 days before)
### Audience Building
- Aim for 500+ email subscribers
- 1,000+ social media followers
- 50+ engaged community members

### Launch Materials
**Essential Assets:**
- Product demo video (2-3 minutes)
- High-quality product images
- Customer testimonials or case studies
- FAQ document
- Pricing and packages clearly defined

**Launch Sequence Emails:**
1. "Something exciting is coming..."
2. "The story behind [product name]"
3. "Early bird special for subscribers"
4. "We're officially live!"
5. "Don't miss out - limited time offer"
6. "Last chance reminder"
7. "Thank you + what's next"

## The 7-Day Launch Timeline
### Day 1: Soft Launch
- Send announcement to email list
- Post on personal social media
- Reach out to close friends/family
- **Goal**: 5-10 early customers

### Day 2: Social Media Blitz
- Post on all business social channels
- Share in relevant groups/communities
- Ask supporters to share your posts
- **Goal**: 1,000+ people reached

### Day 3: PR and Outreach
- Send press release to local media
- Reach out to industry bloggers/podcasts
- Contact potential partnership opportunities
- **Goal**: 1 media mention secured

### Day 4: Content Marketing Push
- Publish launch announcement blog post
- Guest post on relevant blogs
- Share behind-the-scenes content
- **Goal**: Drive 500+ website visitors

### Day 5: Paid Advertising Launch
- Launch Facebook/Instagram ad campaigns
- Start Google Ads for branded keywords
- Boost top-performing social posts
- **Goal**: 100+ qualified leads

### Day 6: Community Engagement
- Host live Q&A session
- Participate in Twitter chats/LinkedIn discussions
- Answer questions in relevant forums
- **Goal**: Build brand awareness and trust

### Day 7: Final Push
- Send "last chance" email to subscribers
- Post countdown content on social media
- Personal outreach to warm prospects
- **Goal**: Convert remaining interested prospects

## Post-Launch Activities
### Week 2: Analyze and Optimize
- Review all metrics and conversion rates
- Survey customers about their experience
- Identify bottlenecks in sales process
- Plan improvements for next month

### Week 3-4: Build Momentum
- Follow up with new customers for testimonials
- Optimize top-performing marketing channels
- Plan your next product or feature release
- Set systems for ongoing customer acquisition

## Success Benchmarks
By the end of your launch:
- **$1,000+ in revenue** generated
- **20+ customers** acquired
- **80%+ customer satisfaction** score
- **Clear path to profitability** identified`,
        order: 4,
      },
      {
        title: 'Scaling & Long-term Growth',
        content: `# Building a Business That Grows

Now that you've proven your concept, it's time to build systems for sustainable growth.

## Month 2: Optimization & Systems
### Customer Success Focus
- Onboard new customers properly
- Create help documentation and tutorials
- Implement customer feedback loop
- Track customer lifetime value (CLV)

### Process Automation
**Tools to Implement:**
- Email automation (Mailchimp, ConvertKit)
- Customer support (Zendesk, Intercom)
- Social media scheduling (Buffer, Hootsuite)
- Analytics tracking (Google Analytics, Mixpanel)

### Financial Management
- Set up proper bookkeeping system
- Track key financial metrics (MRR, CAC, LTV)
- Separate business and personal finances
- Plan for taxes and business expenses

## Month 3: Scale Preparation
### Team Building
**First Hires to Consider:**
- Virtual assistant for admin tasks
- Freelance content creator
- Customer service representative
- Technical developer or designer

### Product Development
- Analyze customer feedback for improvements
- Plan next product features or versions
- Consider complementary products/services
- Build product roadmap for next 6 months

### Market Expansion
- Identify new customer segments
- Test new marketing channels
- Explore partnership opportunities
- Consider geographic expansion

## Long-term Growth Strategies
### Revenue Diversification
**Multiple Revenue Streams:**
- Core product sales
- Subscription/membership model
- Online courses or coaching
- Affiliate partnerships
- Licensing opportunities

### Customer Retention
**Loyalty Building Tactics:**
- Loyalty program with rewards
- Exclusive member benefits
- Regular customer appreciation events
- Referral incentive programs

### Competitive Advantage
**Building Your Moat:**
- Superior customer service
- Unique brand personality
- Patent or proprietary technology
- Exclusive supplier relationships
- Network effects

## Growth Metrics to Track
### Financial Health
- Monthly Recurring Revenue (MRR)
- Customer Acquisition Cost (CAC)
- Customer Lifetime Value (LTV)
- Gross and net profit margins

### Operational Efficiency
- Customer satisfaction scores
- Response time to inquiries
- Product quality metrics
- Team productivity measures

### Market Position
- Market share growth
- Brand awareness metrics
- Competitive analysis updates
- Industry trend alignment

*Congratulations on building your business! Remember, entrepreneurship is a marathon, not a sprint. Stay focused on serving your customers, and success will follow.*`,
        order: 5,
      },
    ],
  },
  {
    id: 'cooking-mastery',
    name: 'Home Chef Mastery',
    description: 'Transform your kitchen skills from beginner to confident home chef with essential techniques.',
    category: 'Cooking & Lifestyle',
    icon: '👨‍🍳',
    brandConfig: {
      primaryColor: '#F59E0B',
      secondaryColor: '#FCD34D',
      accentColor: '#FEF3C7',
      fontFamily: 'Inter, sans-serif',
      coverStyle: 'gradient',
    },
    estimatedReadTime: '40 minutes',
    targetAudience: 'Cooking beginners to intermediate home cooks',
    chapters: [
      {
        title: 'Welcome to Your Culinary Journey',
        content: `# Home Chef Mastery: From Kitchen Novice to Confident Cook

Welcome to a transformative culinary adventure that will change how you think about cooking forever. Whether you're starting from zero or looking to elevate your existing skills, this guide will give you the confidence to create delicious meals with ease.

## What You'll Master
- Essential knife skills and cooking techniques
- Flavor building and seasoning mastery
- 20+ foolproof recipes that build skills progressively
- Meal planning and kitchen organization
- Confidence to cook without recipes

## Your Culinary Philosophy
Great cooking isn't about perfection—it's about understanding. When you understand how heat, salt, acid, and fat work together, you can turn any ingredients into something delicious.

## How This Guide Works
Each chapter builds essential skills through hands-on practice. Start with the basics and progress at your own pace. Don't worry about mistakes—they're how we learn!

*Remember: Every great chef started with their first meal. Your journey begins now.*`,
        order: 0,
      },
      {
        title: 'Essential Kitchen Setup & Safety',
        content: `# Building Your Foundation: Kitchen Essentials

A well-organized kitchen with the right tools makes cooking enjoyable and efficient.

## Essential Tools (Start Here)
### Knives (The Big 3)
- **Chef's knife (8-10 inch)**: Your workhorse for 80% of tasks
- **Paring knife**: Detail work, small tasks
- **Serrated knife**: Bread, tomatoes, delicate items

### Cookware Basics
- **Large skillet or sauté pan**: For searing, sautéing, one-pan meals
- **Medium saucepan with lid**: Grains, sauces, small batches
- **Large pot**: Pasta, soups, stocks
- **Sheet pan**: Roasting vegetables, baking

### Essential Tools
- Cutting boards (wood for meat, plastic for vegetables)
- Measuring cups and spoons
- Can opener and vegetable peeler
- Wooden spoons and spatula
- Instant-read thermometer
- Kitchen scale (game-changer for baking)

## Kitchen Safety Rules
### Fire Prevention
- Keep pot handles turned inward
- Clean grease regularly
- Never leave oil heating unattended
- Keep a fire extinguisher accessible

### Food Safety Basics
- Wash hands frequently
- Use separate cutting boards for meat and vegetables
- Cook meats to proper internal temperatures
- Refrigerate leftovers within 2 hours

### Knife Safety
- Keep knives sharp (dull knives are dangerous)
- Cut away from your body
- Use proper cutting technique
- Store knives safely in a block or magnetic strip

## Kitchen Organization Tips
### The Work Triangle
Arrange your kitchen for efficiency:
- **Cold storage** (refrigerator)
- **Hot storage** (stove/oven)
- **Wet storage** (sink)

### Mise en Place Philosophy
"Everything in its place" - prep all ingredients before cooking:
- Read the entire recipe first
- Measure all ingredients
- Prep all vegetables
- Arrange tools within reach

*A organized kitchen is a productive kitchen. Take time to set up your space properly.*`,
        order: 1,
      },
      {
        title: 'Knife Skills & Basic Prep Techniques',
        content: `# Mastering the Blade: Essential Knife Skills

Good knife skills are the foundation of efficient cooking. Master these techniques and you'll cook faster, safer, and with more confidence.

## Proper Knife Grip
### The Pinch Grip
- Pinch the blade between thumb and index finger
- Wrap remaining fingers around the handle
- This gives maximum control and reduces fatigue

### The Claw Grip (Non-knife hand)
- Curve fingertips under, knuckles forward
- Use knuckles to guide the knife
- This protects your fingertips

## Essential Cuts
### The Basic Chop
**Perfect for: Onions, herbs, garlic**
1. Rock the knife, keeping tip on cutting board
2. Use a smooth, rocking motion
3. Keep the blade perpendicular to the board

### Julienne (Matchsticks)
**Perfect for: Carrots, bell peppers, ginger**
1. Cut into 2-inch segments
2. Square off the sides
3. Cut into 1/8-inch thick slabs
4. Stack and cut into 1/8-inch strips

### Dice (Small, Medium, Large)
**Perfect for: Onions, tomatoes, potatoes**
- **Small dice**: 1/4 inch
- **Medium dice**: 1/2 inch
- **Large dice**: 3/4 inch

### Chiffonade
**Perfect for: Basil, spinach, large leafed herbs**
1. Stack leaves
2. Roll tightly
3. Cut thin strips perpendicular to the roll

## Vegetable Prep Techniques
### Onion Dicing (The Professional Way)
1. Cut onion in half through root end
2. Peel and trim, leaving root end intact
3. Make horizontal cuts toward root (don't cut through)
4. Make vertical cuts, following the onion's lines
5. Slice perpendicular to create dice

### Garlic Preparation
**Crushing Method:**
- Lay flat side of knife on clove
- Press down firmly to crush
- Peel slides off easily
- Mince with rocking motion

**Mincing Method:**
- Slice thinly lengthwise
- Rock knife over slices repeatedly
- Add a pinch of salt to help break down

### Tomato Preparation
1. Core the tomato
2. For peeling: Score an X, blanch 30 seconds, shock in ice water
3. For dicing: Cut in half, squeeze out seeds, dice flesh

## Practice Exercises
### Week 1: Master the Basics
- Practice the pinch and claw grips daily
- Dice 1 onion perfectly each day
- Mince 3 garlic cloves with consistent size

### Week 2: Build Speed
- Time yourself dicing an onion (aim for under 2 minutes)
- Practice julienning carrots
- Work on herb chiffonade

### Week 3: Precision Focus
- Create perfectly uniform dices
- Practice fine mincing garlic
- Work on brunoise (tiny 1/8-inch dice)

## Knife Maintenance
### Daily Care
- Clean immediately after use
- Dry thoroughly
- Store properly (knife block, magnetic strip, or blade guards)

### Weekly Maintenance
- Hone with a steel rod before each use
- Check for chips or damage
- Clean cutting boards thoroughly

### Professional Sharpening
- Every 3-6 months for home cooks
- Find a local knife sharpening service
- Learn to use a whetstone for ultimate control

*Sharp knives and proper technique make cooking a joy. Practice these skills regularly and you'll see dramatic improvements in your efficiency and confidence.*`,
        order: 2,
      },
      {
        title: 'Heat, Seasoning & Flavor Building',
        content: `# The Science of Flavor: Heat and Seasoning Mastery

Understanding how to control heat and build flavors is what separates good cooks from great ones.

## Understanding Heat
### Heat Transfer Methods
**Conduction**: Direct contact (pan to food)
- Best for: Searing, browning, crisping
- Key: Proper pan temperature

**Convection**: Hot air circulation (oven, air fryer)
- Best for: Even cooking, baking, roasting
- Key: Proper oven positioning

**Radiation**: Direct heat source (broiler, grill)
- Best for: Finishing, charring, melting
- Key: Distance from heat source

### Temperature Control
**High Heat (400°F+ / Searing)**
- Creates Maillard reaction (browning)
- Locks in juices
- Use for: Steaks, stir-fries, vegetables

**Medium Heat (300-400°F / Sautéing)**
- Gentle cooking, prevents burning
- Allows even cooking through
- Use for: Chicken, fish, onions

**Low Heat (200-300°F / Braising)**
- Slow, gentle cooking
- Breaks down tough proteins
- Use for: Stews, braises, sauces

## The Four Pillars of Flavor
### 1. Salt
**Functions of Salt:**
- Enhances existing flavors
- Balances sweetness and bitterness
- Improves texture
- Preserves food

**Types of Salt:**
- **Table salt**: Fine, dissolves quickly
- **Kosher salt**: Easy to pinch, less sodium per volume
- **Sea salt**: Complex flavor, finishing salt
- **Flaky salt**: Texture and burst of salinity

**When to Salt:**
- Proteins: 40 minutes before cooking (draws out moisture, then reabsorbs)
- Vegetables: Just before cooking
- Pasta water: Should taste like seawater
- Finishing: Add flaky salt just before serving

### 2. Fat
**Functions of Fat:**
- Carries flavors
- Creates mouthfeel and richness
- Helps with heat transfer
- Provides satiety

**Types of Cooking Fats:**
- **Butter**: Rich flavor, low smoke point
- **Olive oil**: Fruity flavor, medium smoke point
- **Neutral oils**: High smoke point, clean flavor
- **Animal fats**: Deep flavor, high smoke point

### 3. Acid
**Functions of Acid:**
- Brightens flavors
- Balances richness
- Tenderizes proteins
- Preserves food

**Common Acids:**
- **Lemon/lime juice**: Fresh, bright
- **Vinegars**: Complex, varied flavors
- **Wine**: Adds depth
- **Tomatoes**: Natural acidity

### 4. Heat (Spice)
**Building Heat:**
- Start with small amounts
- Build gradually
- Consider different types of heat
- Balance with other flavors

## Flavor Building Techniques
### Layering Flavors
1. **Base flavors**: Onions, garlic, herbs
2. **Building flavors**: Spices, wine, acids
3. **Finishing flavors**: Fresh herbs, citrus, quality oils

### The Soffritto Method
**Italian Base (Soffritto):**
- Onions, carrots, celery
- Cook slowly in olive oil
- Foundation for soups, sauces, braises

**French Base (Mirepoix):**
- 2 parts onion, 1 part carrot, 1 part celery
- Similar technique, different proportions

### Aromatics and Timing
**Early Additions (Building flavors):**
- Onions, garlic, ginger
- Whole spices (bay leaves, peppercorns)
- Hardy herbs (rosemary, thyme)

**Late Additions (Preserving flavors):**
- Delicate herbs (basil, cilantro, parsley)
- Citrus zest and juice
- Finishing oils

## Seasoning Throughout Cooking
### The Professional Approach
1. **Season ingredients before cooking**
2. **Taste and adjust during cooking**
3. **Final seasoning adjustment before serving**

### Tasting and Adjusting
**If it tastes bland**: Add salt
**If it tastes flat**: Add acid
**If it tastes harsh**: Add fat or sweetness
**If it needs depth**: Add umami (soy sauce, mushrooms, cheese)

## Practice Exercises
### Master the Soffritto
Practice making the perfect aromatic base:
1. Dice onions, carrots, celery finely
2. Cook slowly in olive oil until soft and sweet
3. Use as base for soup, sauce, or braise

### Salt Timing Experiment
Cook two identical steaks:
1. Salt one immediately before cooking
2. Salt one 40 minutes before cooking
3. Compare texture and flavor

### Acid Balance Test
Make a simple tomato sauce:
1. Taste before adding acid
2. Add lemon juice gradually
3. Notice how it brightens the flavors

*Understanding these fundamentals will transform your cooking. Every dish becomes an opportunity to practice balancing these essential elements.*`,
        order: 3,
      },
      {
        title: 'Essential Cooking Methods',
        content: `# Mastering the Methods: Your Cooking Technique Toolkit

Each cooking method serves a specific purpose. Master these techniques and you can handle any recipe with confidence.

## Dry Heat Methods
### Sautéing
**Best for**: Vegetables, thin cuts of meat, quick-cooking proteins

**Technique:**
1. Heat pan over medium-high heat
2. Add fat when pan is hot
3. Add food when fat shimmers
4. Keep food moving for even cooking
5. Don't overcrowd the pan

**Master Recipe: Perfect Sautéed Vegetables**
- 2 tbsp olive oil
- 1 lb mixed vegetables, cut uniformly
- Salt and pepper to taste
- Fresh herbs for finishing

### Roasting
**Best for**: Larger cuts of meat, hearty vegetables, whole fish

**Technique:**
1. Preheat oven (usually 400-425°F)
2. Season food generously
3. Use appropriate pan size
4. Don't overcrowd
5. Let meat rest after cooking

**Master Recipe: Roasted Chicken Thighs**
- 8 chicken thighs, skin-on
- 2 tbsp olive oil
- Salt, pepper, and herbs
- 425°F for 35-40 minutes

### Pan-Searing
**Best for**: Steaks, chops, fish fillets, developing flavor

**Technique:**
1. Pat protein completely dry
2. Season generously
3. Heat pan until smoking
4. Add oil, then protein immediately
5. Don't move until ready to flip
6. Finish in oven if needed

**Master Recipe: Perfect Pan-Seared Steak**
- 1-inch thick steaks, room temperature
- Salt and pepper
- High-heat oil (avocado or grapeseed)
- Finish with butter, garlic, thyme

## Moist Heat Methods
### Braising
**Best for**: Tough cuts of meat, building complex flavors

**Technique:**
1. Sear protein to develop flavor
2. Remove and sauté aromatics
3. Add liquid (stock, wine, etc.)
4. Return protein to pot
5. Cover and cook low and slow
6. Liquid should come 2/3 up the protein

**Master Recipe: Classic Beef Braise**
- 3 lbs chuck roast, cut in large pieces
- Mirepoix (onions, carrots, celery)
- 2 cups red wine
- 2 cups beef stock
- Herbs and aromatics

### Poaching
**Best for**: Delicate proteins, eggs, fruit

**Technique:**
1. Use flavorful liquid (stock, wine, milk)
2. Heat to barely simmering (160-180°F)
3. Submerge food completely
4. Cook gently until done
5. Liquid should never boil

**Master Recipe: Perfectly Poached Eggs**
- Fresh eggs
- Water with splash of vinegar
- Create gentle whirlpool
- 3-4 minutes for runny yolk

### Steaming
**Best for**: Vegetables, fish, dumplings, preserving nutrients

**Technique:**
1. Bring small amount of water to boil
2. Place food in steamer basket
3. Cover tightly
4. Steam until tender
5. Don't let water touch food

## Combination Methods
### Stir-Frying
**Best for**: Quick-cooking vegetables, small pieces of protein

**Key Principles:**
- Very high heat
- Constant motion
- Small, uniform pieces
- Have everything prepped before starting
- Cook in batches if necessary

**Master Recipe: Basic Vegetable Stir-Fry**
- 2 tbsp high-heat oil
- Aromatics (garlic, ginger)
- Firm vegetables first, tender last
- Simple sauce (soy sauce, rice wine, sesame oil)

### Braising with Searing
**Best for**: Maximum flavor development

**Technique:**
1. Sear protein on all sides
2. Remove and sauté vegetables
3. Deglaze pan with liquid
4. Return protein and add more liquid
5. Braise until tender

## Temperature Guidelines
### Protein Doneness Temperatures
**Beef/Lamb:**
- Rare: 120-125°F
- Medium-rare: 130-135°F
- Medium: 135-145°F
- Medium-well: 145-155°F
- Well-done: 155°F+

**Pork:**
- Medium: 145°F (with 3-minute rest)
- Well-done: 160°F

**Chicken/Turkey:**
- Breast: 165°F
- Thigh: 175°F

**Fish:**
- Most fish: 145°F
- Tuna (can be rare): 125°F center

## Common Mistakes to Avoid
### Temperature Control
- **Too high heat**: Burns outside, raw inside
- **Too low heat**: No browning, steaming effect
- **Not preheating**: Uneven cooking

### Overcrowding
- **Problem**: Food steams instead of browning
- **Solution**: Cook in batches

### Not Resting Meat
- **Problem**: Juices run out when cut
- **Solution**: Rest 5-10 minutes before slicing

### Underseasoning
- **Problem**: Bland food
- **Solution**: Season throughout cooking process

## Practice Schedule
### Week 1: Master Sautéing
- Day 1: Sauté different vegetables
- Day 2: Practice with proteins
- Day 3: Combine vegetables and proteins

### Week 2: Perfect Pan-Searing
- Day 1: Sear chicken thighs
- Day 2: Try fish fillets
- Day 3: Attempt steaks

### Week 3: Explore Braising
- Day 1: Simple vegetable braise
- Day 2: Chicken thigh braise
- Day 3: Beef short rib braise

*These fundamental techniques are your building blocks. Master them, and you can tackle any recipe with confidence and creativity.*`,
        order: 4,
      },
      {
        title: 'Recipe Development & Kitchen Confidence',
        content: `# Cooking Without Recipes: Building True Kitchen Confidence

The ultimate goal isn't to follow recipes perfectly—it's to understand cooking so well that you can create delicious meals from whatever you have on hand.

## Understanding Recipe Structure
### The Universal Formula
Most savory dishes follow this pattern:
1. **Aromatics** (onions, garlic, herbs)
2. **Protein** (meat, beans, eggs, cheese)
3. **Vegetables** (whatever's seasonal/available)
4. **Liquid** (stock, wine, cream, tomatoes)
5. **Starch** (rice, pasta, potatoes, bread)
6. **Seasoning** (salt, acid, herbs, spices)

### Flavor Profile Templates
**Italian Style:**
- Aromatics: Onions, garlic, herbs
- Fat: Olive oil
- Acid: Tomatoes, wine, vinegar
- Seasonings: Basil, oregano, parmesan

**Asian Style:**
- Aromatics: Ginger, garlic, scallions
- Fat: Sesame oil, neutral oil
- Acid: Rice vinegar, citrus
- Seasonings: Soy sauce, miso, chili

**Mexican Style:**
- Aromatics: Onions, garlic, chilies
- Fat: Lard, oil
- Acid: Lime, tomatoes
- Seasonings: Cumin, cilantro, lime

## The Substitution Game
### Protein Swaps
- **Chicken** ↔ Turkey, pork, firm fish
- **Beef** ↔ Lamb, venison, mushrooms (for vegetarian)
- **Fish** ↔ Other fish of similar texture
- **Beans** ↔ Other legumes, tofu, tempeh

### Vegetable Substitutions
**By Texture:**
- **Crunchy**: Carrots ↔ Bell peppers ↔ Celery
- **Soft**: Zucchini ↔ Eggplant ↔ Mushrooms
- **Leafy**: Spinach ↔ Kale ↔ Chard

**By Cooking Time:**
- **Quick-cooking**: Spinach, mushrooms, tomatoes
- **Medium**: Bell peppers, zucchini, onions
- **Long-cooking**: Carrots, potatoes, winter squash

### Liquid Substitutions
- **Stock** ↔ Broth ↔ Water + bouillon
- **Wine** ↔ Stock + acid ↔ Grape juice + vinegar
- **Cream** ↔ Milk + flour ↔ Coconut milk

## Building Dishes Intuitively
### The Pasta Formula
1. **Choose your base**: Long pasta (spaghetti) or short (penne)
2. **Select protein**: Chicken, sausage, shrimp, or beans
3. **Pick vegetables**: Whatever needs to be used up
4. **Decide on sauce style**: Oil-based, tomato, or cream
5. **Add aromatics**: Garlic, herbs, onions
6. **Finish with**: Cheese, herbs, acid

**Example Creation:**
- Base: Penne
- Protein: Italian sausage
- Vegetables: Bell peppers, onions
- Sauce: Tomato-based
- Aromatics: Garlic, basil
- Finish: Parmesan, red pepper flakes

### The Stir-Fry Formula
1. **Protein first**: Cook and remove
2. **Aromatics**: Ginger, garlic, chilies
3. **Hard vegetables**: Carrots, broccoli stems
4. **Soft vegetables**: Bell peppers, zucchini
5. **Leafy greens**: Spinach, bok choy
6. **Return protein**: Toss everything together
7. **Sauce**: Soy-based, with acid and sweetness

### The Soup Formula
1. **Sauté aromatics**: Onions, garlic, celery
2. **Add liquid**: Stock, wine, water
3. **Add slow-cooking ingredients**: Root vegetables, grains
4. **Add protein**: If using, add at appropriate time
5. **Add quick-cooking ingredients**: Greens, herbs
6. **Season and adjust**: Salt, acid, herbs

## Improvisation Techniques
### The "Clean Out the Fridge" Method
1. **Inventory**: What proteins, vegetables, grains do you have?
2. **Choose cooking method**: Based on time and equipment
3. **Flavor profile**: Pick a cuisine style
4. **Build the dish**: Using your chosen template

### The "One Missing Ingredient" Rule
When you're missing something from a recipe:
- **Analyze its function**: Flavor, texture, moisture, richness?
- **Find a substitute**: Something that serves the same purpose
- **Adjust quantities**: Taste and modify as needed

### Seasoning on the Fly
**Start conservative**: You can always add more
**Taste frequently**: After each addition
**Balance opposing elements**: Sweet/sour, fat/acid, hot/cool
**Finish strong**: Final seasoning makes the biggest impact

## Confidence-Building Exercises
### Week 1: Master One Template
Choose pasta, stir-fry, or soup. Make it 3 different ways:
- Day 1: Follow a recipe exactly
- Day 2: Make substitutions based on what you have
- Day 3: Create your own version from scratch

### Week 2: Flavor Profile Exploration
Pick one cuisine style (Italian, Asian, Mexican):
- Day 1: Research key ingredients and techniques
- Day 2: Make a traditional dish
- Day 3: Apply those flavors to a different cooking method

### Week 3: Improvisation Challenge
- **Monday**: Create a meal using only 5 ingredients
- **Wednesday**: Make dinner using whatever's in your fridge
- **Friday**: Take a recipe you know and modify it significantly

## Emergency Flavor Fixes
### When Food Tastes Bland
1. **Add salt** (most common fix)
2. **Add acid** (lemon, vinegar)
3. **Add umami** (soy sauce, parmesan, mushrooms)
4. **Add aromatics** (fresh herbs, garlic)

### When Food Is Too Salty
1. **Add acid** to balance
2. **Add fat** (cream, oil, butter)
3. **Add sweet** (sugar, honey, vegetables)
4. **Dilute** with unsalted liquid

### When Food Is Too Spicy
1. **Add dairy** (cream, yogurt, cheese)
2. **Add sweet** (sugar, honey)
3. **Add fat** (oil, butter)
4. **Add starch** (rice, bread, potatoes)

## Building Your Recipe Collection
### Document Your Successes
- **Write down** what you did when something turns out great
- **Note ratios** of ingredients that work
- **Record timing** for perfect doneness
- **Include variations** that you want to try

### Learn from Mistakes
- **Analyze** what went wrong
- **Identify** the cause (too much heat, wrong timing, etc.)
- **Plan** how to fix it next time
- **Practice** the corrected version

### Seasonal Cooking
**Spring**: Fresh herbs, peas, asparagus, lamb
**Summer**: Tomatoes, stone fruits, grilled foods
**Fall**: Squash, apples, braised dishes, spices
**Winter**: Root vegetables, citrus, hearty stews

*True kitchen confidence comes from understanding, not memorization. Trust your senses, taste as you go, and remember that even mistakes teach valuable lessons. Cook with curiosity and joy!*`,
        order: 5,
      },
    ],
  },
];

export function createProjectFromTemplate(template: EbookTemplate, customTitle?: string): EbookProject {
  const chapters: Chapter[] = template.chapters.map((chapter, index) => ({
    id: crypto.randomUUID(),
    title: chapter.title,
    content: chapter.content,
    order: index,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  return {
    id: crypto.randomUUID(),
    title: customTitle || template.name,
    description: template.description,
    author: '',
    chapters,
    brandConfig: { ...template.brandConfig },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}