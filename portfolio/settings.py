"""
Django settings for portfolio project.

Generated by 'django-admin startproject' using Django 4.2.11.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/4.2/ref/settings/
"""

import os.path
from pathlib import Path

from django.contrib import staticfiles

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
FALLBACK_SECRET_KEY = (
    "django-insecure-(mqx%zsxjly7+4g554fulva4zmxb(e=$e7gun91&_v%!oos6v+"
)
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", default=FALLBACK_SECRET_KEY)

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ENVIRONMENT = os.environ.get('ENVIRONMENT', 'development')

# ALLOWED_HOSTS = ['*']
ALLOWED_HOSTS = [
    "127.0.0.1",
    "localhost",
    ".onrender.com",
    ".ethanmuthoni.me",
    ".rohn.live",
]


# Application definition
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "crispy_forms",
    "corsheaders",
    "django_ckeditor_5",
    "app",
    "blog",
]

INSTALLED_APPS += [
    'wagtail.contrib.forms',
    'wagtail.contrib.redirects',
    'wagtail.embeds',
    'wagtail.sites',
    'wagtail.users',
    'wagtail.snippets',
    'wagtail.documents',
    'wagtail.images',
    'wagtail.search',
    'wagtail.admin',
    'wagtail',
    
    'modelcluster',
    'taggit',
]


MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "wagtail.contrib.redirects.middleware.RedirectMiddleware",
]
# "portfolio.middlewares.remove_trailing_slashes.RemoveTrailingSlashMiddleware",
ROOT_URLCONF = "portfolio.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [
            os.path.join(BASE_DIR, "templates"),
            os.path.join(BASE_DIR, "app/templates"),
            os.path.join(BASE_DIR, "blog/templates"),
        ],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "portfolio.wsgi.application"


# Database
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases



if (ENVIRONMENT == 'production' and not DEBUG):
    DATABASES  = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": os.environ.get("SUPABASE_DB_NAME"),
            "USER": os.environ.get("SUPABASE_USER"),
            "PASSWORD": os.environ.get("SUPABASE_DB_PW"),
            "HOST": os.environ.get("SUPABASE_HOST"),
            "PORT": os.environ.get("SUPABASE_PORT"),
        }
    }
    PROJECTS_FOLDER = "portfolio/projests/live"
    POSTS_FOLDER = "portfolio/posts/live"

elif (ENVIRONMENT == 'development' and not DEBUG):
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }
    PROJECTS_FOLDER = "portfolio/projests/dev"
    POSTS_FOLDER = "portfolio/posts/dev"
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }
    PROJECTS_FOLDER = "portfolio/projests/dev"
    POSTS_FOLDER = "portfolio/posts/dev"


# CKEditor Config
CKEDITOR_5_UPLOAD_PATH = "uploads/"
CKEDITOR_5_IMAGE_BACKEND = "pillow"
CKEDITOR_5_IMAGE_QUALITY = 90
CKEDITOR_5_CONFIGS = {
    "default": {
        "toolbar": "Custom",
        "toolbar_Custom": [
            {
                "name": "basicstyles",
                "items": ["Bold", "Italic", "Underline", "Strike", "RemoveFormat"],
            },
            {
                "name": "paragraph",
                "items": ["NumberedList", "BulletedList", "-", "Blockquote"],
            },
            {"name": "links", "items": ["Link", "Unlink"]},
            {"name": "styles", "items": ["Format", "Styles"]},
            {"name": "colors", "items": ["TextColor", "BGColor"]},
            {"name": "tools", "items": ["Maximize"]},
            {"name": "editing", "items": ["Scayt"]},
            {"name": "document", "items": ["Source"]},
        ],
        "width": "100%",
        "extraPlugins": ",".join(
            [
                "uploadimage",
                "autolink",
                "image2",
            ]
        ),
    }
}


# Password validation
# https://docs.djangoproject.com/en/4.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
        "OPTIONS": {
            "min_length": 8,
        },
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
    {
        "NAME": "app.views.helpers.password_validator.ComplexPasswordValidator",
    },
]


# Internationalization
# https://docs.djangoproject.com/en/4.2/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.2/howto/static-files/
STATICFILES_FINDERS = [
    "django.contrib.staticfiles.finders.FileSystemFinder",
    "django.contrib.staticfiles.finders.AppDirectoriesFinder",
]
STATIC_URL = "/static/"
STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")
MEDIA_URL = "/media/"
MEDIA_ROOT = os.path.join(BASE_DIR, "media")

STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"


# WAGTAIL SETTINGS
WAGTAIL_SITE_NAME = "Ethan Muthoni"
WAGTAILADMIN_BASE_URL = 'https://ethanmuthoni.me'
WAGTAILDOCS_EXTENSIONS = [
    'csv',
    'docx',
    'key',
    'odt',
    'pdf',
    'pptx',
    'rtf',
    'txt',
    'xlsx',
    'zip'
]

# Default primary key field type
# https://docs.djangoproject.com/en/4.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# LOGIN REDIRECT URL
LOGIN_REDIRECT_URL = "home"
LOGIN_URL = "/login"
LOGOUT_REDIRECT_URL = "/"
LOGOUT_URL = "/logout"
APPEND_SLASH = True

CRISPY_TEMPLATE_PACK = "bootstrap5"

if not DEBUG:
    CSRF_COOKIE_SECURE: bool = True
    SESSION_COOKIE_SECURE: bool = True
    SECURE_SSL_REDIRECT: bool = True
    SECURE_BROWSER_XSS_FILTER: bool = True
    SECURE_CONTENT_TYPE_NOSNIFF: bool = True
    SECURE_HSTS_SECONDS: int = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS: bool = True
    SECURE_HSTS_PRELOAD: bool = True
    CSRF_FAILURE_VIEW: str = "app.views.auth.csrf_failure"
    SECURE_PROXY_SSL_HEADER: tuple = ("HTTP_X_FORWARDED_PROTO", "https")
    SECURE_REF: str = "no-referrer"
    SECURE_REF_POLICY: str = "strict-origin-when-cross-origin"

# CLOUDINARY CONFIG SETTINGS
if ENVIRONMENT == 'production':
    CLOUDINARY_CLOUD_NAME: str = os.environ.get("CLOUDINARY_NAME", '')
    CLOUDINARY_API_KEY: str = os.environ.get("CLOUDINARY_API_KEY", '')
    CLOUDINARY_API_SECRET: str = os.environ.get("CLOUDINARY_API_SECRET", '')
else:
    from app.views.helpers.helpers import get_cloudinary_id_and_secret

    CLOUDINARY_CLOUD_NAME: str = get_cloudinary_id_and_secret()[0]
    CLOUDINARY_API_KEY: str = get_cloudinary_id_and_secret()[1]
    CLOUDINARY_API_SECRET: str = get_cloudinary_id_and_secret()[2]

# Maximum upload size for images in bytes
MAX_UPLOAD_SIZE: int = 5 * 1024 * 1024  # 5MB or 5242880 bytes

# Image links for Error Codes 400, 403, 404, 500
ERROR_404: str = "https://res.cloudinary.com/dg4sl9jhw/image/upload/f_auto,q_auto/v1/portfolio/errors/hgl2jde4zhpslu6c25ne"
ERROR_500: str = "https://res.cloudinary.com/dg4sl9jhw/image/upload/f_auto,q_auto/v1/portfolio/errors/gm4xywf1xczjqu9gtrio"
ERROR_403: str = "https://res.cloudinary.com/dg4sl9jhw/image/upload/f_auto,q_auto/v1/portfolio/errors/hoflqilly08tlvmhbba8"
ERROR_400: str = "https://res.cloudinary.com/dg4sl9jhw/image/upload/f_auto,q_auto/v1/portfolio/errors/aji2laz4uiyj4r1b9kph"
