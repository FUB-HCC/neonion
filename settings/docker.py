from settings.default import *

# TODO check the collectstatic settings
# STATIC_ROOT = "/var/www/neonion/static/"

# neonion specific
# TODO DEFAULT_USER_ACTIVE_STATE = False for production environment? what does this variable do?
DEFAULT_USER_ACTIVE_STATE = True

# neonion specific settings
NEONION_BASE_NAMESPACE = 'http://neonion.org/'
ELASTICSEARCH_URL = "http://elasticsearch:9200"
ELASTICSEARCH_INDEX = "neonion"

# set environment
DEBUG = True
