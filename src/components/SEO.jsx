import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * SEO Component for dynamic meta tags and structured data
 */
function SEO({ 
  title = 'WowMart - Toys & Gadgets for Kids & Teens',
  description = 'Discover amazing toys and gadgets for kids and teenagers. Safe, fun, and exciting products that kids love!',
  image = '/images/LOGO PNG B.png',
  type = 'website',
  product = null,
  url = null
}) {
  const location = useLocation();
  const currentUrl = url || `${window.location.origin}${location.pathname}`;
  
  useEffect(() => {
    // Update document title
    document.title = title;
    
    // Update or create meta tags
    const updateMetaTag = (name, content, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };
    
    // Basic meta tags
    updateMetaTag('description', description);
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', image, true);
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:url', currentUrl, true);
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);
    
    // Add canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', currentUrl);
    
    // Add structured data (JSON-LD)
    let structuredData = document.querySelector('script[type="application/ld+json"]');
    if (!structuredData) {
      structuredData = document.createElement('script');
      structuredData.setAttribute('type', 'application/ld+json');
      document.head.appendChild(structuredData);
    }
    
    // Generate structured data based on page type
    let jsonLd = {};
    
    if (product) {
      // Product structured data
      jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description,
        image: product.images || [image],
        brand: product.brand ? {
          '@type': 'Brand',
          name: product.brand
        } : undefined,
        offers: {
          '@type': 'Offer',
          price: product.price,
          priceCurrency: 'INR',
          availability: product.inStock 
            ? 'https://schema.org/InStock' 
            : 'https://schema.org/OutOfStock',
          url: currentUrl
        },
        aggregateRating: product.reviewCount > 0 ? {
          '@type': 'AggregateRating',
          ratingValue: product.rating,
          reviewCount: product.reviewCount
        } : undefined
      };
    } else {
      // Organization/Website structured data
      jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'WowMart',
        description: description,
        url: window.location.origin,
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${window.location.origin}/products?search={search_term_string}`
          },
          'query-input': 'required name=search_term_string'
        }
      };
    }
    
    structuredData.textContent = JSON.stringify(jsonLd);
    
  }, [title, description, image, type, currentUrl, product]);
  
  return null; // This component doesn't render anything
}

export default SEO;

