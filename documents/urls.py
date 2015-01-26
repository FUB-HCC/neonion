from django.conf.urls import patterns, url

urlpatterns = patterns('',
    url(r'^upload$', 'documents.views.upload_file'),

    url(r'^cms/import/(?P<doc_urn>.+)$', 'documents.views.cms_import'),
    url(r'^cms/list/$', 'documents.views.cms_list'),
    #url(r'^euler/hocr$', 'documents.views.euler_hocr'),
)