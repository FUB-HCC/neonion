"""
Django settings for neonion project.

For more information on this file, see
https://docs.djangoproject.com/en/1.6/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.6/ref/settings/
"""

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
import os
BASE_DIR = os.path.dirname(os.path.dirname(__file__))

FILE_UPLOAD_MAX_MEMORY_SIZE = 5242880

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.6/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = '3__0)vupv^xg+pqa#u0)da8hfr-(3xq)h_ptq-tqt3ltvtk_vq'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

TEMPLATE_DEBUG = True

TEMPLATE_DIRS = (
    os.path.join(os.path.dirname(__file__), 'templates'),
)

ALLOWED_HOSTS = ['*']

LOCALE_PATHS = (
    os.path.join(BASE_DIR, 'templates', 'locale',),
)

# Application definition

INSTALLED_APPS = (
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'pipeline',
    'neonion',
    'api',
    'plugins',
    'documents',
    'accounts',
    'endpoint',
    'annotationsets',
)

AUTH_USER_MODEL = 'accounts.User'
AUTHENTICATION_BACKENDS = ['accounts.backends.EmailAuthBackend']
SESSION_EXPIRE_AT_BROWSER_CLOSE = False

MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
)

LOGIN_URL = '/accounts/login'

ROOT_URLCONF = 'neonion.urls'

WSGI_APPLICATION = 'wsgi_dev.application'


# Database
# https://docs.djangoproject.com/en/1.6/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}

# Internationalization
# https://docs.djangoproject.com/en/1.6/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.6/howto/static-files/
# Static asset configuration
# go one folder up from current directory (settings)
PROJECT_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), os.pardir)
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# STATICFILES_DIRS = (
#     os.path.join(PROJECT_PATH, 'staticfiles'),
# )

# django pipeline
# PIPELINE_ENABLED = True

STATICFILES_STORAGE = 'pipeline.storage.PipelineCachedStorage'

STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
    'pipeline.finders.PipelineFinder',
    'pipeline.finders.CachedFileFinder',
)
# PIPELINE_COMPILERS = (
#     'pipeline.compilers.sass.SASSCompiler',
# )

PIPELINE_JS = {
    'stats': {
        'source_filenames': (
            'js/jquery.min.js',
            'js/jquery-ui.min.js',
            'js/angular/lib/angular.min.js',
            'js/angular/lib/angular-cookies.min.js',
            'js/angular/lib/angular-resource.min.js',
            'js/angular/lib/angular-filter.min.js',
            'js/angular/lib/ng-file-upload-shim.min.js',
            'js/angular/lib/ng-file-upload.min.js',
            'js/bootstrap.min.js'
        ),
        'output_filename': 'js/stats.js',
    },
    'annotator': {
        'source_filenames': (
            'js/annotator.min.js',
            'js/annotator.neonion.js',
            'js/annotator.neonion.extensions.js',
            'js/annotator.ner.js',
            'js/annotator.store.min.js',
            'js/pdf.js'
        ),
        'output_filename': 'js/annotator.js',
    },
    'angular_app': {
        'source_filenames': (
            'js/angular/app.js',
            'js/angular/filters.js',
            'js/angular/root.js',
            'js/angular/services/*.js',
            'js/angular/controllers/**/*.js',
        ),
        'output_filename': 'js/angular_app.js',
    }
}


TEMPLATE_CONTEXT_PROCESSORS = (
    "django.contrib.auth.context_processors.auth",
    "django.core.context_processors.debug",
    "django.core.context_processors.i18n",
    "django.core.context_processors.media",
    "django.core.context_processors.static",
    "django.core.context_processors.tz",
    "django.contrib.messages.context_processors.messages",
    "django.core.context_processors.request",
)


REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication'
    ],
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    )
}

# neonion specific settings
NEONION = {
    'BASE_NAMESPACE':  'http://neonion.org/',
}