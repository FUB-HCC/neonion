from django.conf.urls import url, include
from rest_framework import routers
from viewsets import UserViewSet, WorkingGroupViewSet, DocumentViewSet, ConceptSetViewSet, ConceptViewSet, \
    PropertyViewSet, LinkedConceptViewSet, MembershipViewSet

# Routers provide an easy way of automatically determining the URL conf.
router = routers.DefaultRouter(trailing_slash=False)
router.register(r'users', UserViewSet)
router.register(r'memberships', MembershipViewSet)
router.register(r'groups', WorkingGroupViewSet)
router.register(r'documents', DocumentViewSet)
router.register(r'conceptsets', ConceptSetViewSet)
router.register(r'concepts', ConceptViewSet)
router.register(r'linkedconcepts', LinkedConceptViewSet)
router.register(r'properties', PropertyViewSet)

urlpatterns = [
    url(r'^', include(router.urls)),

    # ElasticSearch proxy
    url(r'^es/search/(?P<index>.+)/(?P<type>.+)/(?P<term>.+)$', 'api.views.entity_search'),
    url(r'^es/import/(?P<index>.+)/(?P<type>.+)$', 'api.views.entity_bulk_import'),
]
