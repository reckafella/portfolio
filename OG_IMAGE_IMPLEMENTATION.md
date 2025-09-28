# Open Graph Image Implementation

## Overview

This document describes the implementation of dynamic Open Graph (OG) images across your portfolio website. The system now uses your logo as the default OG image for all pages, except for project detail and blog detail pages where specific images are used when available.

## Implementation Details

### 1. Django Backend Changes

#### Context Processor Updates

**File**: `app/context/context_processors.py`

Added a new context variable `logo_og_image` that provides the absolute URL to the logo image for OG usage:

```python
def metadata_context(request):
    """Add metadata context variables to all templates"""
    admin_user = User.objects.get(is_superuser=True, username='ethan')
    return {
        'site_title': admin_user.get_full_name(),
        'site_description': 'A showcase of my projects and skills',
        'default_og_image': request.build_absolute_uri(
            '/static/assets/images/og-default.jpeg'),
        'logo_og_image': request.build_absolute_uri(
            '/static/assets/images/logo-og.png')  # Default logo for OG images
    }
```

#### Meta Tags Template Updates

**File**: `app/templates/app/includes/meta_tags.html`

Updated the meta tags template to use the logo as default when no specific image is provided:

```html
{% if image %}
<meta property="og:image" content="{{ image }}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="{{ title|default:site_title }}">
{% else %}
<meta property="og:image" content="{{ logo_og_image|default:default_og_image }}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="{{ title|default:site_title }}">
{% endif %}
```

#### Template Updates

**Blog Post Templates**:

- `blog/templates/blog/post_details.html`: Uses `article.cover_image_url`
- `blog/templates/blog/blog_post_page.html`: Uses `post.cover_image_url`

**Project Detail Template**:

- `app/templates/app/projects/project_details.html`: Uses `project.first_image.optimized_image_url`

**Base Template**:

- `app/templates/app/base.html`: Removed default image fallback to let meta tags template handle it

### 2. React Frontend Changes

#### Meta Tags Hook Updates

**File**: `frontend/src/hooks/useMetaTags.ts`

Updated the `useMetaTags` hook to use the logo as default OG image:

```typescript
// Handle OG image - use provided image or default to logo
const ogImageUrl = config.ogImage || '/static/assets/images/logo-og.png';
const imageUrl = ogImageUrl.startsWith('http') 
  ? ogImageUrl 
  : `${window.location.origin}${ogImageUrl}`;
updateMetaTag('og:image', imageUrl, true);
```

#### Component Updates

**Blog Detail Page**:

- `frontend/src/pages/blog/BlogDetailPage.tsx`: Uses `post?.cover_image_url || post?.featured_image_url`

**Project Detail Page**:

- `frontend/src/pages/projects/ProjectDetailPage.tsx`: Uses `project?.first_image?.optimized_image_url || project?.first_image?.cloudinary_image_url`

**Frontend Index**:

- `frontend/index.html`: Updated default OG image to use logo

### 3. Image Assets

Created `logo-og.png` files in both Django and React static directories:

- `app/static/assets/images/logo-og.png`
- `frontend/public/static/assets/images/logo-og.png`

These are copies of the existing logo.png file optimized for OG usage.

## How It Works

### Default Behavior (All Pages Except Project/Blog Details)

1. When no specific image is provided, the system uses the logo as the OG image
2. The logo provides consistent branding across all shared links
3. Fallback chain: `provided_image` → `logo_og_image` → `default_og_image`

### Project Detail Pages

1. Uses the project's first image if available
2. Falls back to logo if no project image exists
3. Image priority: `first_image.optimized_image_url` → `first_image.cloudinary_image_url` → `logo_og_image`

### Blog Detail Pages

1. Uses the blog post's cover image if available
2. Falls back to logo if no cover image exists
3. Image priority: `cover_image_url` → `featured_image_url` → `logo_og_image`

## Testing

### Manual Testing

1. **Home Page**: Should show logo as OG image
2. **About Page**: Should show logo as OG image
3. **Projects List**: Should show logo as OG image
4. **Project Detail**: Should show project's first image (if available) or logo
5. **Blog List**: Should show logo as OG image
6. **Blog Detail**: Should show blog's cover image (if available) or logo

### Testing Tools

Use these tools to verify OG image implementation:

1. **Facebook Sharing Debugger**: <https://developers.facebook.com/tools/debug/>
2. **Twitter Card Validator**: <https://cards-dev.twitter.com/validator>
3. **LinkedIn Post Inspector**: <https://www.linkedin.com/post-inspector/>
4. **Open Graph Preview**: <https://www.opengraph.xyz/>

### Browser Testing

1. Open browser developer tools
2. Navigate to any page
3. Check the `<head>` section for meta tags
4. Verify `og:image` and `twitter:image` tags contain correct URLs

## Benefits

1. **Consistent Branding**: Logo appears on all shared links, maintaining brand consistency
2. **Dynamic Content**: Project and blog pages show relevant images when available
3. **Fallback Strategy**: Graceful degradation when specific images aren't available
4. **SEO Optimization**: Proper OG images improve social media sharing appearance
5. **Performance**: Optimized image loading with proper fallbacks

## Maintenance

### Adding New Page Types

To add OG image support for new page types:

1. **Django**: Update the template to include meta tags with appropriate image
2. **React**: Update the component to use `useMetaTags` hook with appropriate image
3. **Follow the pattern**: Use specific image if available, fallback to logo

### Updating Logo

To update the logo used for OG images:

1. Replace `logo-og.png` in both static directories
2. Ensure the new logo is optimized for OG usage (1200x630px recommended)
3. Test across different social media platforms

### Image Optimization

For best results:

- OG images should be 1200x630 pixels
- Use PNG or JPG format
- Keep file size under 1MB
- Ensure images are accessible via HTTPS

## Troubleshooting

### Common Issues

1. **Images not showing**: Check if image URLs are absolute and accessible
2. **Wrong image showing**: Verify the image priority chain is correct
3. **Social media not updating**: Use sharing debuggers to refresh cache
4. **Performance issues**: Optimize image sizes and use CDN if available

### Debug Steps

1. Check browser developer tools for meta tags
2. Use social media sharing debuggers
3. Verify image URLs are accessible
4. Check console for JavaScript errors (React frontend)
5. Review Django template context variables

This implementation provides a robust, scalable solution for OG image management across your portfolio website.
