
from django.conf.urls import patterns, url, include
from rest_framework import routers, viewsets, status
from accounts.models import User
from documents.models import Document
from neonion.models import Workspace
from annotationsets.models import AnnotationSet
from api import views
from rest_framework.decorators import detail_route
from rest_framework.response import Response
from viewsets import WorkingGroupViewSet
from api.serializers import UserSerializer, AnnotationSetSerializer, \
    WorkspaceSerializer, DocumentSerializer, DetailedDocumentSerializer, DetailedWorkingGroupSerializer


# ViewSets for users.
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer


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
class WorkspaceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Workspace.objects.all()
    serializer_class = WorkspaceSerializer

    @detail_route(methods=['get'])
    def get_documents_by_group(self, request, pk):
        workspace = Workspace.objects.get(pk=pk)
        serializer = DetailedWorkingGroupSerializer(workspace.owner.groups.all(), many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


# Routers provide an easy way of automatically determining the URL conf.
router = routers.DefaultRouter(trailing_slash=False)
router.register(r'users', UserViewSet)
router.register(r'groups', WorkingGroupViewSet)
router.register(r'documents', DocumentViewSet)
router.register(r'workspaces', WorkspaceViewSet)
router.register(r'annotationsets', AnnotationSetViewSet)

urlpatterns = patterns('',
    url(r'^', include(router.urls)),

    url(r'^workspace/$', views.CurrentWorkspaceView.as_view()),
    url(r'^workspace/documents/(?P<pk>.+)$', views.CurrentWorkspaceDocumentView.as_view()),

    # AnnotationStore proxy API
    url(r'^store/$', 'api.views.store_root'),
    url(r'^store/filter/$', 'api.views.store_filter_annotations'),
    url(r'^store/search$', 'api.views.store_search'),
    url(r'^store/annotations$', views.AnnotationListView.as_view()),
    url(r'^store/annotations/(?P<pk>.+)$', views.AnnotationDetailView.as_view()),
)
