from django.conf.urls import patterns, url, include
from rest_framework import routers, serializers, viewsets
from accounts.models import User
from documents.models import Document
from neonion.models import Workspace
from annotationsets.models import AnnotationSet


# Serializers define the API representation.
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('email', 'name', 'surname', 'joined')


# ViewSets for users.
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer


# Serializers define the API representation.
class AnnotationSetSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnnotationSet
        fields = ('uri', 'label', 'allow_creation')


# ViewSets for annotation sets.
class AnnotationSetViewSet(viewsets.ModelViewSet):
    queryset = AnnotationSet.objects.all()
    serializer_class = AnnotationSetSerializer


# Serializers define the API representation.
class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ('urn', 'title', 'created', 'updated')


# ViewSets for document.
class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer


# Serializers define the API representation.
class WorkspaceSerializer(serializers.HyperlinkedModelSerializer):
    owner = UserSerializer()
    documents = DocumentSerializer(many=True)
    annotation_sets = AnnotationSetSerializer(many=True)

    class Meta:
        model = Workspace
        fields = ('owner', 'documents', 'annotation_sets')


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

urlpatterns = patterns('',
    url(r'^', include(router.urls)),
    url(r'^workspace', 'api.views.personal_workspace'),
)
