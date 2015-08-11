from django.conf.urls import url, include
from rest_framework import routers
from api import views
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
    url(r'^store/$', 'api.views.store_root'),
    url(r'^store/search$', 'api.views.store_search'),
    url(r'^store/annotations$', views.AnnotationListView.as_view()),
    url(r'^store/annotations/(?P<pk>.+)$', views.AnnotationDetailView.as_view()),
]
