from django.conf.urls import patterns, url, include
from rest_framework import routers, viewsets
from accounts.models import User
from documents.models import Document
from neonion.models import Workspace
from django.contrib.auth.models import Group
from annotationsets.models import AnnotationSet
from api import views
from api.serializers import UserSerializer, GroupSerializer, AnnotationSetSerializer, \
    WorkspaceSerializer, DocumentSerializer, DetailedDocumentSerializer


# ViewSets for users.
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer


# ViewSets for document.
class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all()

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return DetailedDocumentSerializer
        else:
            return DocumentSerializer


# ViewSets for annotation sets.
class AnnotationSetViewSet(viewsets.ModelViewSet):
    queryset = AnnotationSet.objects.all()
    serializer_class = AnnotationSetSerializer



# ViewSets for document.
class WorkspaceViewSet(viewsets.ModelViewSet):
    queryset = Workspace.objects.all()
    serializer_class = WorkspaceSerializer


# Routers provide an easy way of automatically determining the URL conf.
router = routers.DefaultRouter(trailing_slash=False)
router.register(r'users', UserViewSet)
router.register(r'groups', GroupViewSet)
router.register(r'documents', DocumentViewSet)
router.register(r'workspaces', WorkspaceViewSet)
router.register(r'annotationsets', AnnotationSetViewSet)

urlpatterns = patterns('',
    url(r'^', include(router.urls)),

    url(r'^workspace/documents/$', views.WorkspaceDocumentList.as_view()),
    url(r'^workspace/documents/(?P<pk>.+)/$', views.WorkspaceDocumentList.as_view()),

    # AnnotationStore proxy API
    url(r'^store/$', 'api.views.store_root'),
    url(r'^store/filter/$', 'api.views.store_filter_annotations'),
    url(r'^store/search$', 'api.views.store_search'),
    url(r'^store/annotations$', views.AnnotationListView.as_view()),
    url(r'^store/annotations/(?P<pk>.+)$', views.AnnotationDetailView.as_view()),
)
