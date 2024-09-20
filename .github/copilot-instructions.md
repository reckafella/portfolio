# Portfolio Project - AI Agent Instructions

## Architecture Overview

This is a Django-based personal portfolio website with **three main apps**:
- `app/` - Core portfolio functionality (projects, home page, services)
- `authentication/` - User authentication, profiles, and social links
- `blog/` - Wagtail CMS-powered blog with advanced features

**Key architectural decision**: Uses Wagtail CMS for blog management while maintaining custom Django views for portfolio content. Environment-specific configurations handle development (SQLite) vs production (PostgreSQL + Redis + Cloudinary).

## Critical Developer Workflows

### Environment Setup
```bash
# Virtual environment setup
python3 -m venv .env
source .env/bin/activate
pip install -r requirements.txt

# Development database
python manage.py makemigrations
python manage.py migrate
python manage.py collectstatic --no-input

# Local credential files required:
# cloudinary.json - Cloudinary API credentials
# redis.json - Redis connection details (dev only)
```

### Deployment (Render.com)
- Uses `render.yaml` for service configuration
- `build.sh` script handles build process
- Environment variables: `ENVIRONMENT=production`, Supabase DB credentials, Cloudinary API keys
- Production uses PostgreSQL (Supabase) + Redis caching + Cloudinary image hosting

### Image Management
- **All images use Cloudinary**: `app/views/helpers/cloudinary.py` handles uploads
- Modern image cropping system in `/static/assets/javascript/images/` (ES6 modules)
- Legacy cropping code in `/static/assets/js/cropImages/` (being phased out)
- Profile images: Use `ProfileImageCropper` class for square 500x500-2000x2000 validation

## Project-Specific Patterns

### Environment Configuration
```python
# Settings pattern for dev/prod split
if ENVIRONMENT == 'production' and not DEBUG:
    # PostgreSQL + Redis + env vars
else:
    # SQLite + local JSON files
    from app.views.helpers.helpers import get_cloudinary_creds
```

### View Architecture
- **Base classes**: `BaseProjectView`, `BasePostView`, `BaseAuthentication` provide common functionality
- **Mixins pattern**: `LoginRequiredMixin + UserPassesTestMixin` for staff-only operations
- **AJAX responses**: All forms handle both regular and AJAX requests via `is_ajax()` helper

### Frontend JavaScript Organization
- **Modern modules**: `/static/assets/javascript/` - ES6 classes, proper imports/exports
- **Legacy scripts**: `/static/assets/js/` - IIFE patterns, global functions
- **Form validation**: `ValidateForms.js` orchestrates all form types (Auth, Blog, Projects, Contact)
- **Image handling**: `ImageCropManager` → `ProfileImageCropper` inheritance pattern

### Security & Rate Limiting
- **Custom middleware**: `RateLimitMiddleware` (1000 req/hour per IP), `ViewCountSecurityMiddleware`
- **CSRF protection**: All AJAX forms include CSRF tokens from meta tags or hidden inputs
- **File validation**: `MAX_UPLOAD_SIZE` (15MB), `ALLOWED_IMAGE_TYPES` in settings

## Integration Points

### Wagtail CMS Integration
- Blog posts use `BlogPostPage` (Wagtail) with custom view count logic
- Admin accessible at `/cms/admin/` (custom redirect from `/admin/`)
- Rich text fields use Draftail editor with restricted feature set

### Cloudinary Integration
```python
# Standard upload pattern
uploader = CloudinaryImageHandler()
response = uploader.upload_image(image, folder="portfolio/projects/dev")
# Returns: {cloudinary_image_id, cloudinary_image_url, optimized_image_url}
```

### Rate Limiting System
- Global: 1000 requests/hour per IP (configurable via `RATELIMIT` env var)
- View-specific: Blog post views have 30-second cooldown per visitor
- Bot detection: User-agent analysis in `ViewCountSecurityMiddleware`

## Testing & Debugging

### Key Commands
```bash
# Check for errors without running server
python manage.py check

# View all middleware in order
grep -A 20 "MIDDLEWARE" portfolio/settings.py

# Test image upload functionality
# Ensure cloudinary.json exists with valid credentials
```

### Common Issues
- **Daphne dependency**: Remove `'daphne'` from `INSTALLED_APPS` for local development. This happens if the virtual environment is not activated. To activate the virtual environment, run `source .env/bin/activate` (Linux/Mac) or `.env\Scripts\activate` (Windows).
- **Static file missing**: Run `python manage.py collectstatic --no-input`
- **Image upload failures**: Verify Cloudinary credentials and file size limits
- **Rate limiting**: Check middleware order and cache backend configuration

## Templates & Static Files

### Template Hierarchy
- `app/templates/app/base.html` - Main layout with Bootstrap 5, vendor JS
- Apps have isolated template directories: `app/templates/app/`, `blog/templates/blog/`
- Shared components in `app/templates/app/includes/`

### CSS/JS Loading Order
1. Bootstrap + vendor libraries (from base.html)
2. Custom CSS files (project-specific)
3. `main.js` (vanilla JS utilities)
4. Module scripts (`type="module"` for ES6 classes)
5. Theme system (`themes.js` - localStorage-based dark/light mode)

## Data Models

### Key Relationships
- `Projects` → `Image` (one-to-many) + `Video` (one-to-many)
- `BlogPostPage` → `BlogPostImage` (one-to-many) + `BlogPostComment` (one-to-many)
- `Profile` → `SocialLinks` + `UserSettings` + `UserProfileImage`
- All models use `created_at/updated_at` timestamps and slug-based URLs
