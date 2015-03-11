from django.conf.urls import patterns, url, include
from rest_framework import routers
from api import views
from viewsets import UserViewSet, WorkingGroupViewSet, DocumentViewSet, AnnotationSetViewSet

# Routers provide an easy way of automatically determining the URL conf.
router = routers.DefaultRouter(trailing_slash=False)
router.register(r'users', UserViewSet)
router.register(r'groups', WorkingGroupViewSet)
router.register(r'documents', DocumentViewSet)
router.register(r'annotationsets', AnnotationSetViewSet)

urlpatterns = patterns('',
    url(r'^', include(router.urls)),

    # AnnotationStore proxy API
    url(r'^store/$', 'api.views.store_root'),
    url(r'^store/filter/$', 'api.views.store_filter_annotations'),
    url(r'^store/search$', 'api.views.store_search'),
    url(r'^store/annotations$', views.AnnotationListView.as_view()),
    url(r'^store/annotations/(?P<pk>.+)$', views.AnnotationDetailView.as_view()),
)
