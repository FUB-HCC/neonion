from django.conf.urls import patterns, include, url

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^$', 'neonion.views.home', name='home'),
    url(r'^annotator/$', 'neonion.views.home', name='home'),
	url(r'^import/$', 'neonion.views.import_document', name='annotator'),

    url(r'^annotator/(?P<doc_id>.+)/$', 'neonion.views.annotator', name='annotator'),
    
    url(r'^admin/', include(admin.site.urls)),
    url(r'^accounts/', include('accounts.urls', namespace='accounts')),
    url(r'^documents/', include('documents.urls', namespace='documents')),

    # Elasticsearch proxy
    url(r'^es/(?P<index>\w+)$', 'neonion.views.elasticsearch', name='elasticsearchSearch'),
    url(r'^es/create/(?P<index>\w+)$', 'neonion.views.elasticsearchCreate', name='elasticsearchCreate'),

    # Loomp proxy
    url(r'^loomp/content/get$', 'neonion.views.loomp_get', name='loomp_get'),
    url(r'^loomp/content/getAll$', 'neonion.views.loomp_getAll', name='getAll'),
    url(r'^loomp/content/save$', 'neonion.views.loomp_save', name='save'),
)