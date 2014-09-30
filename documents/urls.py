from django.conf.urls import patterns, url

urlpatterns = patterns('',
    url(r'^list/$', 'documents.views.list', name='doc_list'),
    url(r'^get/(?P<doc_id>.+)$', 'documents.views.get', name='doc_get'),
    url(r'^query/(?P<search_string>.+)$', 'documents.views.query', name='doc_query'),
    url(r'^meta/(?P<doc_id>.+)$', 'documents.views.meta', name='doc_meta'),
)