from django.conf.urls import patterns, include, url

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^$', 'neonion.views.home'),
    url(r'^annotator/$', 'neonion.views.home'),
    url(r'^import/$', 'neonion.views.import_document'),
    url(r'^settings/$', 'neonion.views.load_settings'),

    url(r'^annotator/(?P<doc_urn>.+)/$', 'neonion.views.annotator'),
    
    url(r'^admin/', include(admin.site.urls)),
    url(r'^accounts/', include('accounts.urls')),
    url(r'^documents/', include('documents.urls')),
    url(r'^endpoint/', include('endpoint.urls')),
    url(r'^annotations/', include('annotations.urls')),
    url(r'^annotationsets/', include('annotationsets.urls')),

    # Elasticsearch proxy
    url(r'^es/(?P<index>\w+)$', 'neonion.views.elasticsearch'),
    url(r'^es/create/(?P<index>\w+)$', 'neonion.views.elasticsearchCreate'),
)