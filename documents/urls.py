from django.conf.urls import patterns, include, url

urlpatterns = patterns('',
    url(r'^document/list/$', 'neonion.documents.list', name='doc_list'),
    url(r'^document/get/(?P<doc_id>.+)$', 'neonion.documents.get', name='doc_get'),
    url(r'^document/query/(?P<search_string>.+)$', 'neonion.documents.query', name='doc_query'),
    url(r'^document/meta/(?P<doc_id>.+)$', 'neonion.documents.meta', name='doc_meta'),
)