from settings.default import *

# neonion specific
ANNOTATION_STORE_URL = "http://annotator.neonion.imp.fu-berlin.de"
ELASTICSEARCH_URL = "http://localhost:9200"
ENDPOINT = 'http://localhost:8080/openrdf-sesame/repositories/neonion'
ENDPOINT_UPDATE = 'http://localhost:8080/openrdf-sesame/repositories/neonion/statements'
NER_SERVICE_URL = 'http://localhost:5000/'
DEFAULT_USER_ACTIVE_STATE = True

# Path to a class which inherits from common.cms.Contentsystem
#CONTENT_SYSTEM_CLASS = 'plugins.mpi.euler.Euler'