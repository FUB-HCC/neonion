from django.conf.urls import patterns, url, include
from documents.models import Document
from rest_framework import routers, serializers, viewsets
from neonion.models import Workspace


# Serializers define the API representation.
class DocumentSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Document
        fields = ('urn', 'title', 'created', 'updated')


# ViewSets define the view behavior.
class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer


# ViewSets define the view behavior.
class MyDocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentSerializer

    def get_queryset(self):
        workspace = Workspace.objects.get_workspace(owner=self.request.user)
        return workspace.documents.all()


my_document_list = MyDocumentViewSet.as_view({
    'get': 'list',
})

# Routers provide an easy way of automatically determining the URL conf.
router = routers.DefaultRouter()
router.register(r'documents', DocumentViewSet)
router.register(r'mydocuments', MyDocumentViewSet, base_name='mydocument-list')

urlpatterns = patterns('',
    url(r'^', include(router.urls)),
    url(r'^mydocuments', my_document_list, name='my_document_list'),
    url(r'^meta/(?P<doc_urn>.+)$', 'documents.views.meta'),
    url(r'^query/(?P<search_string>.+)$', 'documents.views.query'),
    url(r'^(?P<doc_urn>.+).json$', 'documents.views.to_json'),
    url(r'^upload$', 'documents.views.upload'),

    url(r'^euler/import/(?P<doc_urn>.+)$', 'documents.views.euler_import'),
    url(r'^euler/list/$', 'documents.views.euler_list'),
    url(r'^euler/query/(?P<search_string>.+)$', 'documents.views.euler_query'),
    url(r'^euler/meta/(?P<doc_urn>.+)$', 'documents.views.euler_meta'),
    url(r'^euler/hocr$', 'documents.views.euler_hocr'),
)