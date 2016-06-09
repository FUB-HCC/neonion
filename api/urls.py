from django.conf.urls import url, include
from rest_framework import routers
from api import views, annotationstore
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

    # AnnotationStore proxy API
    url(r'^store/$', 'api.annotationstore.root'),
    url(r'^store/search$', 'api.annotationstore.search'),

    url(r'^store/(?P<group_pk>.+)/(?P<document_pk>.+)/annotations$', annotationstore.AnnotationListView.as_view()),
    url(r'^store/(?P<group_pk>.+)/(?P<document_pk>.+)/annotations/(?P<annotation_pk>.+)$', annotationstore.AnnotationDetailView.as_view()),
    url(r'^store/(?P<group_pk>.+)/(?P<document_pk>.+)/search$', annotationstore.SearchView.as_view()),

    # ElasticSearch proxy
    url(r'^es/search/(?P<index>.+)/(?P<type>.+)/(?P<term>.+)$', 'api.views.es_search'),
    url(r'^es/import/(?P<index>.+)/(?P<type>.+)$', 'api.views.es_bulk_import'),
]
