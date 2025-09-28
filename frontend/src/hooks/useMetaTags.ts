import { useEffect } from 'react';

interface MetaTagConfig {
  title?: string;
  description?: string;
  keywords?: string;
  author?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterSite?: string;
  twitterCreator?: string;
  canonical?: string;
}

/**
 * Custom hook to manage meta tags for SEO and social sharing
 * @param config - Meta tag configuration object
 */
export const useMetaTags = (config: MetaTagConfig) => {
  useEffect(() => {
    const updateMetaTag = (name: string, content: string, property?: boolean) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let metaTag = document.querySelector(selector) as HTMLMetaElement;
      
      if (!metaTag) {
        metaTag = document.createElement('meta');
        if (property) {
          metaTag.setAttribute('property', name);
        } else {
          metaTag.setAttribute('name', name);
        }
        document.head.appendChild(metaTag);
      }
      
      metaTag.setAttribute('content', content);
    };

    const updateLinkTag = (rel: string, href: string) => {
      let linkTag = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
      
      if (!linkTag) {
        linkTag = document.createElement('link');
        linkTag.setAttribute('rel', rel);
        document.head.appendChild(linkTag);
      }
      
      linkTag.setAttribute('href', href);
    };

    // Update title
    if (config.title) {
      document.title = `Ethan Wanyoike | ${config.title}`;
    }

    // Update basic meta tags
    if (config.description) {
      updateMetaTag('description', config.description);
    }
    if (config.keywords) {
      updateMetaTag('keywords', config.keywords);
    }
    if (config.author) {
      updateMetaTag('author', config.author);
    }

    // Update Open Graph tags
    if (config.ogTitle) {
      updateMetaTag('og:title', config.ogTitle, true);
    }
    if (config.ogDescription) {
      updateMetaTag('og:description', config.ogDescription, true);
    }
    if (config.ogImage) {
      // Ensure the image URL is absolute
      const imageUrl = config.ogImage.startsWith('http') 
        ? config.ogImage 
        : `${window.location.origin}${config.ogImage}`;
      updateMetaTag('og:image', imageUrl, true);
      updateMetaTag('og:image:width', '1200', true);
      updateMetaTag('og:image:height', '630', true);
      updateMetaTag('og:image:alt', config.ogTitle || config.title || 'Ethan Wanyoike Portfolio', true);
    }
    if (config.ogUrl) {
      updateMetaTag('og:url', config.ogUrl, true);
    }
    if (config.ogType) {
      updateMetaTag('og:type', config.ogType, true);
    }

    // Update Twitter Card tags
    if (config.twitterCard) {
      updateMetaTag('twitter:card', config.twitterCard, true);
    }
    if (config.twitterTitle) {
      updateMetaTag('twitter:title', config.twitterTitle, true);
    }
    if (config.twitterDescription) {
      updateMetaTag('twitter:description', config.twitterDescription, true);
    }
    if (config.twitterImage) {
      // Ensure the image URL is absolute
      const imageUrl = config.twitterImage.startsWith('http') 
        ? config.twitterImage 
        : `${window.location.origin}${config.twitterImage}`;
      updateMetaTag('twitter:image', imageUrl, true);
      updateMetaTag('twitter:image:alt', config.twitterTitle || config.title || 'Ethan Wanyoike Portfolio', true);
    }
    if (config.twitterSite) {
      updateMetaTag('twitter:site', config.twitterSite, true);
    }
    if (config.twitterCreator) {
      updateMetaTag('twitter:creator', config.twitterCreator, true);
    }

    // Update canonical URL
    if (config.canonical) {
      updateLinkTag('canonical', config.canonical);
    }

    // Cleanup function to restore default meta tags
    return () => {
      // Restore default title
      document.title = 'Ethan Wanyoike';
      
      // Restore default meta tags
      updateMetaTag('description', 'Welcome to my portfolio! Explore my projects, blog, and more.');
      updateMetaTag('keywords', 'portfolio, software engineer, web development, projects, blog, contact');
      updateMetaTag('author', 'Ethan Wanyoike');
      
      // Restore default Open Graph tags
      updateMetaTag('og:title', 'Ethan Wanyoike | Portfolio', true);
      updateMetaTag('og:description', 'Welcome to my portfolio! Explore my projects, blog, and more.', true);
      updateMetaTag('og:type', 'website', true);
      updateMetaTag('og:url', window.location.origin, true);
      
      // Restore default Twitter tags
      updateMetaTag('twitter:card', 'summary_large_image', true);
      updateMetaTag('twitter:site', '@devrohn', true);
      updateMetaTag('twitter:creator', '@devrohn', true);
    };
  }, [config]);
};
