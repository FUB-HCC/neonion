from django.conf.urls import patterns, url

urlpatterns = patterns('',
    url(r'^list/$', 'documents.views.list'),
    url(r'^get/(?P<doc_urn>.+)$', 'documents.views.get'),
    url(r'^meta/(?P<doc_urn>.+)$', 'documents.views.meta'),
    url(r'^query/(?P<search_string>.+)$', 'documents.views.query'),

    url(r'^euler/import/(?P<doc_urn>.+)$', 'documents.views.euler_import'),
    url(r'^euler/list/$', 'documents.views.euler_list'),
    url(r'^euler/query/(?P<search_string>.+)$', 'documents.views.euler_query'),
    url(r'^euler/meta/(?P<doc_urn>.+)$', 'documents.views.euler_meta'),
    url(r'^euler/hocr$', 'documents.views.euler_hocr'),
)