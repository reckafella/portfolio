# Social Media Sharing Implementation Guide

## Overview

This document explains how social media sharing works for blog posts and how to test it.

## How It Works

### The Problem
Social media crawlers (Facebook, Twitter, LinkedIn) don't execute JavaScript. They only read the initial HTML served by the server. This means client-side meta tag updates via React's `useMetaTags` hook are invisible to these crawlers.

### The Solution
**Server-Side Meta Tag Injection**: Django now detects blog post URLs and injects the appropriate meta tags directly into the HTML before sending it to the client.

### Implementation Details

1. **Enhanced FrontendAPIView** (`/app/api/views/base.py`)
   - Intercepts all requests to the React frontend
   - Detects blog post URLs using regex: `/blog/article/{slug}`
   - Fetches blog post data from the database
   - Injects meta tags into the HTML `<head>` section

2. **Meta Tags Injected**
   - **Title**: Blog post title
   - **Description**: Post excerpt or search description
   - **Author**: Post author name
   - **Cover Image**: Post cover image or default OG image
   - **Open Graph tags**: For Facebook, LinkedIn
   - **Twitter Card tags**: For Twitter/X
   - **Canonical URL**: For SEO

3. **Fallback Behavior**
   - If blog post not found: Returns default HTML (React will show 404)
   - If no cover image: Uses `/static/assets/images/og-default.jpeg`
   - If no excerpt: Extracts first 160 characters from content

## Testing Social Media Previews

### 1. Facebook/Meta Debugger
**URL**: https://developers.facebook.com/tools/debug/

**Steps**:
1. Enter your blog post URL: `https://rohn.live/blog/article/{slug}`
2. Click "Debug"
3. Check the preview and meta tags
4. Click "Scrape Again" to refresh Facebook's cache

### 2. Twitter Card Validator
**URL**: https://cards-dev.twitter.com/validator

**Steps**:
1. Enter your blog post URL
2. Click "Preview card"
3. Verify the card displays correctly with image and text

### 3. LinkedIn Post Inspector
**URL**: https://www.linkedin.com/post-inspector/

**Steps**:
1. Enter your blog post URL
2. Click "Inspect"
3. Review the preview

### 4. Manual Testing with cURL

```bash
# Test if meta tags are present in the HTML
curl -s https://rohn.live/blog/article/your-slug | grep -A 5 "og:image"

# Or view the full head section
curl -s https://rohn.live/blog/article/your-slug | grep -A 50 "<head>"
```

### 5. Local Testing

```bash
# Start your Django server
python manage.py runserver

# In another terminal, test the meta tags
curl -s http://localhost:8000/blog/article/your-slug | grep "og:title"
```

## Required Image Specifications

### Open Graph Image (Facebook, LinkedIn)
- **Recommended size**: 1200 x 630 pixels
- **Aspect ratio**: 1.91:1
- **Format**: JPG or PNG
- **Max file size**: 8 MB

### Twitter Card Image
- **Recommended size**: 1200 x 628 pixels
- **Aspect ratio**: 1.91:1
- **Format**: JPG, PNG, WEBP, or GIF
- **Max file size**: 5 MB

## Troubleshooting

### Preview Not Updating
**Problem**: Old preview still showing after changes

**Solutions**:
1. Clear social media cache using their debugger tools
2. Wait 24-48 hours for automatic cache refresh
3. Ensure your blog post is published (`published=True`)

### Image Not Displaying
**Problem**: No image in social preview

**Checklist**:
- [ ] Blog post has a cover image set
- [ ] Image URL is absolute (includes domain)
- [ ] Image is accessible (not behind authentication)
- [ ] Image meets size requirements
- [ ] Default OG image exists at `/static/assets/images/og-default.jpeg`

### Wrong Title/Description
**Problem**: Incorrect or missing text

**Checklist**:
- [ ] Blog post has a title
- [ ] Post has `search_description` or content
- [ ] Special characters are properly escaped
- [ ] Post is published

### Meta Tags Not Appearing
**Problem**: No meta tags in HTML source

**Checklist**:
- [ ] Frontend is built: `npm run build` in `/frontend`
- [ ] Django is serving the built files
- [ ] URL matches pattern: `/blog/article/{slug}`
- [ ] No errors in Django logs

## Best Practices

1. **Always Set Cover Images**: Every blog post should have a cover image
2. **Write Good Excerpts**: Use the `search_description` field for better previews
3. **Test Before Sharing**: Always test with debugger tools before sharing
4. **Use Default OG Image**: Ensure `/static/assets/images/og-default.jpeg` exists
5. **Monitor Logs**: Check Django logs for any injection errors

## Extending to Other Pages

To add server-side meta tags for other dynamic routes (e.g., projects):

1. Add a new regex pattern in `inject_meta_tags()` method
2. Create a new injection method (e.g., `inject_project_meta()`)
3. Follow the same pattern as `inject_blog_post_meta()`

Example:
```python
def inject_meta_tags(self, html_content):
    path = self.request.path
    base_url = self.request.build_absolute_uri('/').rstrip('/')
    
    # Blog posts
    blog_match = re.match(r'^/blog/article/([^/]+)/?$', path)
    if blog_match:
        return self.inject_blog_post_meta(html_content, blog_match.group(1), base_url)
    
    # Projects (example)
    project_match = re.match(r'^/projects/([^/]+)/?$', path)
    if project_match:
        return self.inject_project_meta(html_content, project_match.group(1), base_url)
    
    return html_content
```

## Additional Resources

- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [Facebook Sharing Best Practices](https://developers.facebook.com/docs/sharing/best-practices)
