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
export const useMetaTags = (config: MetaTagConfig): void => {
  useEffect(() => {
    // Signal when meta tags are updated for prerendering
    const signalPrerenderReady = () => {
      if (window.document.dispatchEvent) {
        window.document.dispatchEvent(new Event('prerender-ready'));
      }
    };
    // Function to ensure URL is absolute
    const getAbsoluteUrl = (url: string) => {
      if (!url) return '';
      if (url.startsWith('http')) return url;
      const base = window.location.origin;
      return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
    };

    const updateMetaTag = (name: string, content: string | undefined, property?: boolean) => {
      if (content === undefined) return;
      
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let metaTag = document.querySelector(selector) as HTMLMetaElement;
      
      if (!metaTag) {
        metaTag = document.createElement('meta');
        if (property) {
          metaTag.setAttribute('property', name);
        } else {
          metaTag.setAttribute('name', name);
        }
        metaTag.setAttribute('data-rh', 'true');
        document.head.appendChild(metaTag);
      }
      
      // Handle URL properties
      if (name.includes('url') || name.includes('image')) {
        content = getAbsoluteUrl(content);
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
    
    // Handle OG image - use provided image or default to logo
    const ogImageUrl = config.ogImage || '/static/assets/images/logo-og.png';
    const imageUrl = ogImageUrl.startsWith('http') 
      ? ogImageUrl 
      : `${window.location.origin}${ogImageUrl}`;
    updateMetaTag('og:image', imageUrl, true);
    updateMetaTag('og:image:secure_url', imageUrl, true);
    updateMetaTag('og:image:width', '1200', true);
    updateMetaTag('og:image:height', '630', true);
    updateMetaTag('og:image:alt', config.ogTitle || config.title || 'Ethan Wanyoike Portfolio', true);
    
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
    
    // Handle Twitter image
    const twitterImageUrl = config.twitterImage || config.ogImage || '/static/assets/images/logo-og.png';
    const twitterImgUrl = twitterImageUrl.startsWith('http') 
      ? twitterImageUrl 
      : `${window.location.origin}${twitterImageUrl}`;
    updateMetaTag('twitter:image', twitterImgUrl, true);
    updateMetaTag('twitter:image:alt', config.twitterTitle || config.title || 'Ethan Wanyoike Portfolio', true);
    
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

    // Signal that all meta tags have been updated
    signalPrerenderReady();

    // Cleanup function to restore default meta tags
    return () => {
      document.title = 'Ethan Wanyoike';
      
      updateMetaTag('description', 'Welcome to my portfolio! Explore my projects, blog, and more.');
      updateMetaTag('keywords', 'portfolio, software engineer, web development, projects, blog, contact');
      updateMetaTag('author', 'Ethan Wanyoike');
      
      updateMetaTag('og:title', 'Ethan Wanyoike | Portfolio', true);
      updateMetaTag('og:description', 'Welcome to my portfolio! Explore my projects, blog, and more.', true);
      updateMetaTag('og:type', 'website', true);
      updateMetaTag('og:url', window.location.origin, true);
      
      updateMetaTag('twitter:card', 'summary_large_image', true);
      updateMetaTag('twitter:site', '@frmundu', true);
      updateMetaTag('twitter:creator', '@frmundu', true);
    };
  }, [config]);
};
