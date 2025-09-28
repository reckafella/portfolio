import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useMetaTags } from '../../hooks/useMetaTags';
import { apiRequest } from '../../utils/api';

interface SitemapItem {
  title: string;
  url: string;
  slug?: string;
  last_modified?: string;
}

interface SitemapData {
  pages: SitemapItem[];
  projects: SitemapItem[];
  blog_posts: SitemapItem[];
}

export default function SitemapPage() {
  const [sitemapData, setSitemapData] = useState<SitemapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  usePageTitle('Sitemap');
  
  useMetaTags({
    title: 'Sitemap',
    description: 'Explore the sitemap of our website, including blog posts and projects. Find all pages, projects, and blog posts organized for easy navigation.',
    keywords: 'sitemap, blog, projects, portfolio, navigation, website structure',
    ogTitle: 'Sitemap - Ethan Wanyoike Portfolio',
    ogDescription: 'Explore the sitemap of our website, including blog posts and projects.',
    ogType: 'website',
    ogUrl: `${window.location.origin}/sitemap`,
    twitterTitle: 'Sitemap - Ethan Wanyoike Portfolio',
    twitterDescription: 'Explore the sitemap of our website, including blog posts and projects.',
    canonical: `${window.location.origin}/sitemap`
  });

  useEffect(() => {
    const fetchSitemapData = async () => {
      try {
        setLoading(true);
        const response = await apiRequest('/api/v1/sitemap/');
        setSitemapData(response);
      } catch (err) {
        setError('Failed to load sitemap data');
        console.error('Error fetching sitemap:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSitemapData();
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderSitemapSection = (title: string, items: SitemapItem[], baseUrl: string = '') => (
    <div className="col-lg-4 col-md-6 mb-4">
      <div className="card h-100 shadow-sm">
        <div className="card-header bg-primary text-white">
          <h5 className="card-title mb-0 text-center">
            <i className="bi bi-folder me-2"></i>
            {title}
          </h5>
        </div>
        <div className="card-body">
          {items.length > 0 ? (
            <div className="list-group list-group-flush">
              {items.map((item, index) => (
                <div key={index} className="list-group-item d-flex justify-content-between align-items-start border-0 px-0">
                  <div className="flex-grow-1">
                    <Link 
                      to={baseUrl + item.url} 
                      className="text-decoration-none fw-medium"
                      title={`Visit ${item.title}`}
                    >
                      {item.title}
                    </Link>
                    <div className="small text-muted mt-1">
                      <i className="bi bi-calendar3 me-1"></i>
                      {formatDate(item.last_modified)}
                    </div>
                  </div>
                  <span className="badge bg-secondary rounded-pill">
                    {index + 1}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted py-3">
              <i className="bi bi-inbox display-6"></i>
              <p className="mt-2 mb-0">No {title.toLowerCase()} available</p>
            </div>
          )}
        </div>
        <div className="card-footer bg-light text-center">
          <small className="text-muted">
            {items.length} {title.toLowerCase()} total
          </small>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8 text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading sitemap...</span>
            </div>
            <p className="mt-3 text-muted">Loading sitemap data...</p>
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

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-12">
          <div className="text-center mb-5">
            <h1 className="display-4 fw-bold mb-3">
              <i className="bi bi-sitemap me-3 text-primary"></i>
              Sitemap
            </h1>
            <p className="lead text-muted">
              Explore all pages, projects, and blog posts on this website
            </p>
            <div className="d-flex justify-content-center gap-3 mt-4">
              <Link to="/" className="btn btn-outline-primary">
                <i className="bi bi-house me-2"></i>
                Back to Home
              </Link>
              <a 
                href="/sitemap.xml" 
                className="btn btn-outline-secondary"
                title="View XML sitemap"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="bi bi-file-code me-2"></i>
                XML Sitemap
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {sitemapData && (
          <>
            {renderSitemapSection('Pages', sitemapData.pages)}
            {renderSitemapSection('Projects', sitemapData.projects, '/')}
            {renderSitemapSection('Blog Posts', sitemapData.blog_posts, '/')}
          </>
        )}
      </div>

      {/* Summary Statistics */}
      {sitemapData && (
        <div className="row mt-5">
          <div className="col-12">
            <div className="card bg-light">
              <div className="card-body text-center">
                <h5 className="card-title">Site Statistics</h5>
                <div className="row g-3">
                  <div className="col-md-4">
                    <div className="d-flex flex-column align-items-center">
                      <i className="bi bi-file-text display-4 text-primary mb-2"></i>
                      <h6 className="mb-1">{sitemapData.pages.length}</h6>
                      <small className="text-muted">Pages</small>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="d-flex flex-column align-items-center">
                      <i className="bi bi-code-slash display-4 text-success mb-2"></i>
                      <h6 className="mb-1">{sitemapData.projects.length}</h6>
                      <small className="text-muted">Projects</small>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="d-flex flex-column align-items-center">
                      <i className="bi bi-journal-text display-4 text-info mb-2"></i>
                      <h6 className="mb-1">{sitemapData.blog_posts.length}</h6>
                      <small className="text-muted">Blog Posts</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
