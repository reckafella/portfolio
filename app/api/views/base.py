import os
import mimetypes
import re
from django.views.generic import View
from django.http import HttpResponse, Http404
from django.conf import settings
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.utils.html import escape


@method_decorator(csrf_exempt, name='dispatch')
class FrontendAPIView(View):
    """
    Serve React frontend built files.
    Handles both the main index.html and static assets.
    """

    def get(self, request, *args, **kwargs):
        # Get the path from the request
        path = request.path.lstrip('/')

        # Handle static assets (CSS, JS, images, etc.)
        if path.startswith('assets/'):
            return self.serve_static_file(path)

        # Handle favicon
        if path == 'favicon.svg' or path == 'favicon.ico':
            return self.serve_static_file(path)

        # For all other paths (including React routes), serve index.html
        return self.serve_index()

    def serve_static_file(self, path):
        """Serve static files from the React build directory."""
        file_path = os.path.join(settings.BASE_DIR, 'frontend/build', path)

        if not os.path.exists(file_path):
            raise Http404(f"Static file not found: {path}")

        try:
            with open(file_path, 'rb') as f:
                content = f.read()

            # Determine content type
            content_type, _ = mimetypes.guess_type(file_path)
            if content_type is None:
                content_type = 'application/octet-stream'

            response = HttpResponse(content, content_type=content_type)

            # Add caching headers for static assets
            if path.startswith('assets/'):
                response['Cache-Control'] = 'public, max-age=31536000'  # 1 year

            return response

        except IOError:
            raise Http404(f"Could not read file: {path}")

    def serve_index(self):
        """Serve the main React index.html file with dynamic meta tags."""
        index_path = os.path.join(settings.BASE_DIR, 'frontend/build/index.html')

        if not os.path.exists(index_path):
            return HttpResponse(
                (b'React frontend not built.' +
                 b'Run "npm run build" from the frontend directory.'),
                status=503,
                content_type='text/plain'
            )

        try:
            with open(index_path, 'r', encoding='utf-8') as f:
                content = f.read()

            # Inject dynamic meta tags based on the route
            content = self.inject_meta_tags(content)

            # Replace asset paths to work with Django's static file serving
            content = content.replace(
                '/assets/',
                f'{settings.STATIC_URL}assets/' if not settings.DEBUG else '/assets/'
            )

            response = HttpResponse(content.encode('utf-8'), content_type='text/html')
            # Don't cache the main HTML file
            response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
            response['Pragma'] = 'no-cache'
            response['Expires'] = '0'

            return response

        except IOError:
            return HttpResponse(
                'Error reading React frontend files.'.encode('utf-8'),
                status=500,
                content_type='text/plain'
            )

    def inject_meta_tags(self, html_content):
        """Inject dynamic meta tags based on the current route."""
        path = self.request.path
        base_url = self.request.build_absolute_uri('/').rstrip('/')

        # Check if this is a blog post detail page
        blog_match = re.match(r'^/blog/article/([^/]+)/?$', path)
        if blog_match:
            slug = blog_match.group(1)
            return self.inject_blog_post_meta(html_content, slug, base_url)

        # Check if this is a project detail page
        project_match = re.match(r'^/projects/([^/]+)/?$', path)
        if project_match:
            slug = project_match.group(1)
            return self.inject_project_meta(html_content, slug, base_url)

        # Default: inject basic meta tags for other pages
        return self.inject_default_meta(html_content, path, base_url)

    def inject_blog_post_meta(self, html_content, slug, base_url):
        """Inject meta tags for a specific blog post."""
        try:
            # Import here to avoid circular imports
            from blog.models import BlogPostPage

            # Fetch the blog post
            post = BlogPostPage.objects.filter(slug=slug, published=True).first()

            if not post:
                return html_content

            # Prepare meta tag values
            title = escape(post.title)
            excerpt = escape(post.search_description or '')
            if not excerpt and hasattr(post, 'content'):
                # Extract plain text from content (first 160 chars)
                from django.utils.html import strip_tags
                excerpt = strip_tags(post.content)[:160] + '...'

            author = escape(post.author.get_full_name() or post.author.username) if post.author else 'Ethan Wanyoike'
            cover_image = post.cover_image_url or f'{base_url}/static/assets/images/og-default.jpeg'
            if cover_image and not cover_image.startswith('http'):
                cover_image = f'{base_url}{cover_image}'

            page_url = f'{base_url}/blog/article/{slug}'

            # Build meta tags HTML
            meta_tags = f'''
                <title>Ethan Wanyoike | {title}</title>
                <meta name="description" content="{excerpt}">
                <meta name="author" content="{author}">

                <!-- Open Graph / Facebook -->
                <meta property="og:type" content="article">
                <meta property="og:url" content="{page_url}">
                <meta property="og:title" content="{title} - Ethan Wanyoike">
                <meta property="og:description" content="{excerpt}">
                <meta property="og:image" content="{cover_image}">
                <meta property="og:image:secure_url" content="{cover_image}">
                <meta property="og:image:width" content="1200">
                <meta property="og:image:height" content="630">
                <meta property="og:image:alt" content="{title}">
                <meta property="og:site_name" content="Ethan Wanyoike Portfolio">
                <meta property="article:author" content="{author}">

                <!-- Twitter -->
                <meta name="twitter:card" content="summary_large_image">
                <meta name="twitter:url" content="{page_url}">
                <meta name="twitter:title" content="{title} - Ethan Wanyoike">
                <meta name="twitter:description" content="{excerpt}">
                <meta name="twitter:image" content="{cover_image}">
                <meta name="twitter:image:alt" content="{title}">
                <meta name="twitter:site" content="@frmundu">
                <meta name="twitter:creator" content="@frmundu">

                <!-- Canonical -->
                <link rel="canonical" href="{page_url}">
            '''

            # Replace the closing </head> tag with meta tags + </head>
            html_content = html_content.replace(
                '</head>', f'{meta_tags}\n  </head>')

            return html_content

        except Exception as e:
            # Log the error but don't break the page
            print(f"Error injecting blog post meta tags: {e}")
            return html_content

    def inject_project_meta(self, html_content, slug, base_url):
        """Inject meta tags for a specific project."""
        try:
            # Import here to avoid circular imports
            from app.models import Projects

            # Fetch the project
            project = Projects.objects.filter(slug=slug, live=True).first()

            if not project:
                return html_content

            # Prepare meta tag values
            title = escape(project.title)
            from django.utils.html import strip_tags
            description = strip_tags(project.description)[:160] + '...' if len(strip_tags(project.description)) > 160 else strip_tags(project.description)
            description = escape(description)

            # Get project image
            first_image = project.first_image
            cover_image = f'{base_url}/static/assets/images/og-default.jpeg'
            if first_image:
                if hasattr(first_image, 'optimized_image_url') and first_image.optimized_image_url:
                    cover_image = first_image.optimized_image_url
                elif hasattr(first_image, 'cloudinary_image_url') and first_image.cloudinary_image_url:
                    cover_image = first_image.cloudinary_image_url

            if cover_image and not cover_image.startswith('http'):
                cover_image = f'{base_url}{cover_image}'

            page_url = f'{base_url}/projects/{slug}'
            category = escape(project.category) if hasattr(project, 'category') else 'Project'

            # Build meta tags HTML
            meta_tags = f'''
                <title>Ethan Wanyoike | {title}</title>
                <meta name="description" content="{description}">
                <meta name="author" content="Ethan Wanyoike">

                <!-- Open Graph / Facebook -->
                <meta property="og:type" content="website">
                <meta property="og:url" content="{page_url}">
                <meta property="og:title" content="{title} - Ethan Wanyoike">
                <meta property="og:description" content="{description}">
                <meta property="og:image" content="{cover_image}">
                <meta property="og:image:secure_url" content="{cover_image}">
                <meta property="og:image:width" content="1200">
                <meta property="og:image:height" content="630">
                <meta property="og:image:alt" content="{title}">
                <meta property="og:site_name" content="Ethan Wanyoike Portfolio">

                <!-- Twitter -->
                <meta name="twitter:card" content="summary_large_image">
                <meta name="twitter:url" content="{page_url}">
                <meta name="twitter:title" content="{title} - Ethan Wanyoike">
                <meta name="twitter:description" content="{description}">
                <meta name="twitter:image" content="{cover_image}">
                <meta name="twitter:image:alt" content="{title}">
                <meta name="twitter:site" content="@frmundu">
                <meta name="twitter:creator" content="@frmundu">

                <!-- Canonical -->
                <link rel="canonical" href="{page_url}">
            '''

            # Replace the closing </head> tag with meta tags + </head>
            html_content = html_content.replace(
                '</head>', f'{meta_tags}\n  </head>')

            return html_content

        except Exception as e:
            # Log the error but don't break the page
            print(f"Error injecting project meta tags: {e}")
            return html_content

    def inject_default_meta(self, html_content, path, base_url):
        """Inject default meta tags for pages without specific handlers."""
        try:
            # Map common routes to titles and descriptions
            route_meta = {
                '/': {
                    'title': 'Modern Developer Portfolio',
                    'description': 'Personal portfolio showcasing modern web development projects and skills in React, Django, and more.',
                },
                '/about': {
                    'title': 'About Me',
                    'description': 'Learn more about my journey, skills, and experience as a full-stack developer.',
                },
                '/blog': {
                    'title': 'Blog & Articles',
                    'description': 'Read my latest articles and insights about web development, technology, and software engineering.',
                },
                '/projects': {
                    'title': 'Projects Portfolio',
                    'description': 'Explore my featured projects and technical implementations across various technologies.',
                },
                '/contact': {
                    'title': 'Contact Me',
                    'description': 'Get in touch with me for collaboration, opportunities, or just to say hello!',
                },
                '/services': {
                    'title': 'Services',
                    'description': 'Professional web development and software engineering services I offer.',
                },
            }

            # Get meta info for the current path or use defaults
            meta_info = route_meta.get(path, {
                'title': 'Portfolio',
                'description': 'Personal portfolio showcasing modern web development projects and skills.',
            })

            title = escape(meta_info['title'])
            description = escape(meta_info['description'])
            page_url = f'{base_url}{path}'
            og_image = f'{base_url}/static/assets/images/og-default.jpeg'

            # Build meta tags HTML
            meta_tags = f'''
                <title>Ethan Wanyoike | {title}</title>
                <meta name="description" content="{description}">
                <meta name="author" content="Ethan Wanyoike">

                <!-- Open Graph / Facebook -->
                <meta property="og:type" content="website">
                <meta property="og:url" content="{page_url}">
                <meta property="og:title" content="Ethan Wanyoike | {title}">
                <meta property="og:description" content="{description}">
                <meta property="og:image" content="{og_image}">
                <meta property="og:image:secure_url" content="{og_image}">
                <meta property="og:image:width" content="1200">
                <meta property="og:image:height" content="630">
                <meta property="og:image:alt" content="Ethan Wanyoike Portfolio">
                <meta property="og:site_name" content="Ethan Wanyoike Portfolio">

                <!-- Twitter -->
                <meta name="twitter:card" content="summary_large_image">
                <meta name="twitter:url" content="{page_url}">
                <meta name="twitter:title" content="Ethan Wanyoike | {title}">
                <meta name="twitter:description" content="{description}">
                <meta name="twitter:image" content="{og_image}">
                <meta name="twitter:image:alt" content="Ethan Wanyoike Portfolio">
                <meta name="twitter:site" content="@frmundu">
                <meta name="twitter:creator" content="@frmundu">

                <!-- Canonical -->
                <link rel="canonical" href="{page_url}">
            '''

            # Replace the closing </head> tag with meta tags + </head>
            html_content = html_content.replace(
                '</head>', f'{meta_tags}\n  </head>')

            return html_content

        except Exception as e:
            # Log the error but don't break the page
            print(f"Error injecting default meta tags: {e}")
            return html_content
