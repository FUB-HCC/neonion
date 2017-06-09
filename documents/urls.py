from django.conf.urls import url

urlpatterns = [
    url(r'^upload$', 'documents.views.upload_file'),
    url(r'^(?P<document_pk>.+)/modify$', 'documents.views.modify_document'),
    url(r'^search_metadata/(?P<title>.+)$', 'documents.views.search_metadata'),
    url(r'^viewer/(?P<pk>.+)$', 'documents.views.viewer'),
]
