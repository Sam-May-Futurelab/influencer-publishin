import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  type?: 'website' | 'article' | 'product';
  structuredData?: object;
  noindex?: boolean;
  nofollow?: boolean;
}

export function SEO({
  title,
  description,
  keywords,
  canonicalUrl,
  ogImage = '/images/InkfluenceAILogo.png',
  type = 'website',
  structuredData,
  noindex = false,
  nofollow = false
}: SEOProps) {
  useEffect(() => {
    // Set page title
    document.title = title;

    // Create or update meta tags
    const updateMetaTag = (name: string, content: string, property?: boolean) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let tag = document.querySelector(selector) as HTMLMetaElement;
      
      if (!tag) {
        tag = document.createElement('meta');
        if (property) {
          tag.setAttribute('property', name);
        } else {
          tag.setAttribute('name', name);
        }
        document.head.appendChild(tag);
      }
      
      tag.setAttribute('content', content);
    };

    // Basic meta tags
    updateMetaTag('description', description);
    if (keywords) updateMetaTag('keywords', keywords);
    
    // Robots meta tag
    const robotsContent: string[] = [];
    if (noindex) robotsContent.push('noindex');
    else robotsContent.push('index');
    if (nofollow) robotsContent.push('nofollow');
    else robotsContent.push('follow');
    updateMetaTag('robots', robotsContent.join(', '));

    // Open Graph tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:image', `${window.location.origin}${ogImage}`, true);
    updateMetaTag('og:url', canonicalUrl || window.location.href, true);
    updateMetaTag('og:site_name', 'InkfluenceAI', true);

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', `${window.location.origin}${ogImage}`);
    updateMetaTag('twitter:creator', '@InkfluenceAI');
    updateMetaTag('twitter:site', '@InkfluenceAI');

    // Additional SEO meta tags
    updateMetaTag('author', 'InkfluenceAI');
    updateMetaTag('theme-color', '#9b87b8');
    updateMetaTag('msapplication-TileColor', '#9b87b8');

    // Canonical URL
    if (canonicalUrl) {
      let canonicalTag = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonicalTag) {
        canonicalTag = document.createElement('link');
        canonicalTag.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalTag);
      }
      canonicalTag.setAttribute('href', canonicalUrl);
    }

    // Structured Data (JSON-LD)
    if (structuredData) {
      // Remove existing structured data
      const existingScript = document.querySelector('script[type="application/ld+json"]');
      if (existingScript) {
        existingScript.remove();
      }

      // Add new structured data
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }

    // Cleanup function
    return () => {
      // Remove structured data on unmount
      const script = document.querySelector('script[type="application/ld+json"]');
      if (script && structuredData) {
        script.remove();
      }
    };
  }, [title, description, keywords, canonicalUrl, ogImage, type, structuredData, noindex, nofollow]);

  return null; // This component doesn't render anything
}

// Pre-configured structured data schemas
export const createOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "InkfluenceAI",
  "alternateName": "Inkfluence AI",
  "url": "https://inkfluenceai.com",
  "logo": "https://inkfluenceai.com/images/InkfluenceAILogo.png",
  "description": "AI-powered ebook creation platform helping authors, creators, and businesses create professional ebooks with intelligent writing assistance.",
  "foundingDate": "2024",
  "sameAs": [
    "https://twitter.com/InkfluenceAI",
    "https://linkedin.com/company/inkfluenceai"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+1-555-INKFLUENCE",
    "contactType": "Customer Service",
    "email": "support@inkfluenceai.com",
    "availableLanguage": ["English"]
  }
});

export const createSoftwareApplicationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "InkfluenceAI",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web-based",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "priceValidUntil": "2025-12-31",
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "127",
    "bestRating": "5",
    "worstRating": "1"
  },
  "featureList": [
    "AI-powered writing assistant",
    "Custom branding and styling", 
    "Multi-format export (PDF, EPUB, DOCX)",
    "SEO optimization tools",
    "Real-time collaboration",
    "Template gallery",
    "Analytics and insights",
    "Mobile responsive design"
  ],
  "creator": {
    "@type": "Organization",
    "name": "InkfluenceAI"
  }
});

export const createFAQSchema = (faqs: Array<{question: string, answer: string}>) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});

export const createBreadcrumbSchema = (breadcrumbs: Array<{name: string, url: string}>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": breadcrumbs.map((crumb, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": crumb.name,
    "item": crumb.url
  }))
});

export const createArticleSchema = (article: {
  title: string;
  description: string;
  author: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": article.title,
  "description": article.description,
  "author": {
    "@type": "Person",
    "name": article.author
  },
  "publisher": {
    "@type": "Organization",
    "name": "InkfluenceAI",
    "logo": {
      "@type": "ImageObject",
      "url": "https://inkfluenceai.com/images/InkfluenceAILogo.png"
    }
  },
  "datePublished": article.datePublished,
  "dateModified": article.dateModified || article.datePublished,
  "image": article.image || "https://inkfluenceai.com/images/InkfluenceAILogo.png",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": window.location.href
  }
});