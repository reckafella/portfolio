/* XML Sitemap Generator */

import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../utils/api';

interface SitemapItem {
  title: string;
  url: string;
  slug?: string;
  last_modified?: string;
  priority?: string;
  changefreq?: string;
}

interface SitemapData {
  pages: SitemapItem[];
  projects: SitemapItem[];
  blog_posts: SitemapItem[];
}

const SitemapPageXML: React.FC = () => {
  const [sitemapData, setSitemapData] = useState<SitemapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSitemapData = async () => {
      try {
        setLoading(true);
        const response = await apiRequest('/api/v1/sitemap/');
        const data = await response.json() as SitemapData;
        setSitemapData(data);
      } catch (err) {
        setError(`Failed to load sitemap data: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchSitemapData();
  }, []);

  const formatDateForXML = (dateString?: string) => {
    if (!dateString) return new Date().toISOString().split('T')[0];
    return new Date(dateString).toISOString().split('T')[0];
  };

  const generateXMLSitemap = () => {
    if (!sitemapData) return '';

    const baseUrl = window.location.origin;
    const currentDate = new Date().toISOString().split('T')[0];

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add static pages
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>1.0</priority>\n`;
    xml += `  </url>\n`;

    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/about</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += `  </url>\n`;

    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/projects</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.9</priority>\n`;
    xml += `  </url>\n`;

    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/blog</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>0.9</priority>\n`;
    xml += `  </url>\n`;

    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/contact</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>monthly</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    xml += `  </url>\n`;

    // Add dynamic pages from API
    sitemapData.pages.forEach(page => {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}${page.url}</loc>\n`;
      xml += `    <lastmod>${formatDateForXML(page.last_modified)}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq || 'weekly'}</changefreq>\n`;
      xml += `    <priority>${page.priority || '0.6'}</priority>\n`;
      xml += `  </url>\n`;
    });

    // Add projects
    sitemapData.projects.forEach(project => {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/projects/${project.slug || project.url}</loc>\n`;
      xml += `    <lastmod>${formatDateForXML(project.last_modified)}</lastmod>\n`;
      xml += `    <changefreq>monthly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    });

    // Add blog posts
    sitemapData.blog_posts.forEach(post => {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/blog/article/${post.slug || post.url}</loc>\n`;
      xml += `    <lastmod>${formatDateForXML(post.last_modified)}</lastmod>\n`;
      xml += `    <changefreq>monthly</changefreq>\n`;
      xml += `    <priority>0.7</priority>\n`;
      xml += `  </url>\n`;
    });

    xml += '</urlset>';

    return xml;
  };

  const downloadXMLSitemap = () => {
    const xmlContent = generateXMLSitemap();
    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sitemap.xml';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    const xmlContent = generateXMLSitemap();
    navigator.clipboard.writeText(xmlContent).then(() => {
      alert('XML sitemap copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy to clipboard');
    });
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8 text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Generating XML sitemap...</span>
            </div>
            <p className="mt-3 text-muted">Generating XML sitemap...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="alert alert-danger" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const xmlContent = generateXMLSitemap();

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-12">
          <div className="text-center mb-4">
            <h1 className="fw-bold mb-3">
              <i className="bi bi-file-code me-3 text-primary"></i>
              XML Sitemap
            </h1>
            <p className="lead text-muted">
              View and download my website's XML sitemap
            </p>
          </div>
        </div>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="bi bi-file-code me-2"></i>
                Generated XML Content
              </h5>
            </div>
            <div className="card-body p-0">
              <pre className="mb-0 p-3" style={{ maxHeight: '500px', overflow: 'auto' }}>
                <code>{xmlContent}</code>
              </pre>
            </div>
          </div>
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="bi bi-gear me-2"></i>
                Sitemap Actions
              </h5>
            </div>
            <div className="card-body">
              <div className="d-flex flex-wrap gap-3 mb-4">
                <button 
                  onClick={downloadXMLSitemap}
                  className="btn btn-primary"
                >
                  <i className="bi bi-download me-2"></i>
                  Download XML Sitemap
                </button>
                <button 
                  onClick={copyToClipboard}
                  className="btn btn-outline-secondary"
                >
                  <i className="bi bi-clipboard me-2"></i>
                  Copy to Clipboard
                </button>
                <a 
                  href="/sitemap" 
                  className="btn btn-outline-info"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="bi bi-box-arrow-up-right me-2"></i>
                  View Live Sitemap
                </a>
              </div>

              {sitemapData && (
                <div className="row g-3 mb-4">
                  <div className="col-md-4">
                    <div className="d-flex flex-column align-items-center p-3 rounded">
                      <i className="bi bi-file-text display-6 text-primary mb-2"></i>
                      <h6 className="mb-1">{sitemapData.pages.length}</h6>
                      <small className="text-muted">Static Pages</small>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="d-flex flex-column align-items-center p-3 rounded">
                      <i className="bi bi-code-slash display-6 text-success mb-2"></i>
                      <h6 className="mb-1">{sitemapData.projects.length}</h6>
                      <small className="text-muted">Projects</small>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="d-flex flex-column align-items-center p-3 rounded">
                      <i className="bi bi-journal-text display-6 text-info mb-2"></i>
                      <h6 className="mb-1">{sitemapData.blog_posts.length}</h6>
                      <small className="text-muted">Blog Posts</small>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SitemapPageXML;
