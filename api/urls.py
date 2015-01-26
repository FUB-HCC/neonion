from django.conf.urls import patterns, url, include
from rest_framework import routers, viewsets
from accounts.models import User
from documents.models import Document
from neonion.models import Workspace
from annotationsets.models import AnnotationSet, ConceptSource
from api import views
from api.serializers import UserSerializer, AnnotationSetSerializer, ConceptSourceSerializer, \
    WorkspaceSerializer, DocumentSerializer, DetailedDocumentSerializer


# ViewSets for users.
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer


# ViewSets for annotation sets.
class ConceptSourceViewSet(viewsets.ModelViewSet):
    queryset = ConceptSource.objects.all()
    serializer_class = ConceptSourceSerializer


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
router = routers.DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'documents', DocumentViewSet)
router.register(r'workspaces', WorkspaceViewSet)
router.register(r'annotationsets', AnnotationSetViewSet)
router.register(r'conceptsources', ConceptSourceViewSet)

urlpatterns = patterns('',
    url(r'^', include(router.urls)),
    url(r'^workspace/documents/$', views.WorkspaceDocumentList.as_view()),
    url(r'^workspace/documents/(?P<pk>.+)/$', views.WorkspaceDocumentList.as_view()),
)
