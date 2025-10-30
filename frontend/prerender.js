/* eslint-disable no-undef */
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import * as dotenv from 'dotenv';
import { dirname } from 'path';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

const BASE_URL = process.env.VITE_APP_URL || 'https://rohn.live';

// Use require for CommonJS modules
const Prerenderer = require('@prerenderer/prerenderer');
const PuppeteerRenderer = require('@prerenderer/renderer-puppeteer');

const routes = [
  '/',
  '/about',
  '/blog',
  '/projects',
  '/contact',
  '/services',
  // Add other routes that need prerendering
];

async function prerender() {
  const prerenderer = new Prerenderer({
    staticDir: path.join(__dirname, 'build'),
    renderer: new PuppeteerRenderer({
      renderAfterDocumentEvent: 'prerender-ready',
      renderAfterTime: 5000, // Fallback timeout
      maxConcurrentRoutes: 4,
      headless: true,
      inject: {
        isPrerendering: true
      }
    })
  });

  try {
    await prerenderer.initialize();
    const renderedRoutes = await prerenderer.renderRoutes(routes);

    // Handle dynamic meta tags
    for (const route of renderedRoutes) {
      // Update meta tags based on the route
      const routeTitle = getRouteTitle(route.route);
      const routeDescription = getRouteDescription(route.route);
      
      // Update OpenGraph meta tags
      route.html = route.html
        .replace(
          /<meta[^>]*?property="og:url"[^>]*?>/,
          `<meta property="og:url" content="${BASE_URL}${route.route}">`
        )
        .replace(
          /<meta[^>]*?property="og:title"[^>]*?>/,
          `<meta property="og:title" content="Ethan Wanyoike | ${routeTitle}">`
        )
        .replace(
          /<meta[^>]*?property="og:description"[^>]*?>/,
          `<meta property="og:description" content="${routeDescription}">`
        )
        .replace(
          /<meta[^>]*?property="og:image"[^>]*?>/,
          `<meta property="og:image" content="${BASE_URL}/static/assets/images/logo-og.png">`
        )
        // Update Twitter meta tags
        .replace(
          /<meta[^>]*?property="twitter:title"[^>]*?>/,
          `<meta property="twitter:title" content="Ethan Wanyoike | ${routeTitle}">`
        )
        .replace(
          /<meta[^>]*?property="twitter:description"[^>]*?>/,
          `<meta property="twitter:description" content="${routeDescription}">`
        )
        .replace(
          /<meta[^>]*?property="twitter:image"[^>]*?>/,
          `<meta property="twitter:image" content="${BASE_URL}/static/assets/images/logo-og.png">`
        );

      // Update page title
      route.html = route.html.replace(
        /<title>[^<]*<\/title>/,
        `<title>Ethan Wanyoike | ${routeTitle}</title>`
      );
    }

    // Helper functions for route-specific content
    function getRouteTitle(route) {
      switch (route) {
        case '/':
          return 'Modern Developer Portfolio';
        case '/about':
          return 'About Me';
        case '/blog':
          return 'Blog & Articles';
        case '/projects':
          return 'Projects Portfolio';
        case '/contact':
          return 'Contact Me';
        case '/services':
          return 'Services';
        default:
          return 'Portfolio';
      }
    }

    function getRouteDescription(route) {
      switch (route) {
        case '/':
          return 'Personal portfolio showcasing modern web development projects and skills in React, Django, and more.';
        case '/about':
          return 'Learn more about my journey, skills, and experience as a full-stack developer.';
        case '/blog':
          return 'Read my latest articles and insights about web development, technology, and software engineering.';
        case '/projects':
          return 'Explore my featured projects and technical implementations across various technologies.';
        case '/contact':
          return 'Get in touch with me for collaboration, opportunities, or just to say hello!';
        case '/services':
          return 'Professional web development and software engineering services I offer.';
        default:
          return 'Personal portfolio showcasing modern web development projects and skills.';
      }
    }

    await prerenderer.destroy();
  } catch (err) {
    console.error('Error during prerendering:', err);
    process.exit(1);
  }
}

// Run the prerender function
prerender().catch(err => {
  console.error('Prerender failed:', err);
  process.exit(1);
});
