from django.conf.urls import patterns, include, url
from django.contrib import admin

admin.autodiscover()

urlpatterns = patterns('',
    url(r'^$', 'neonion.views.home'),
    url(r'^import/$', 'neonion.views.import_document'),
    url(r'^settings/$', 'neonion.views.load_settings'),

    url(r'^annotator/(?P<doc_urn>.+)/$', 'neonion.views.annotator'),
    
    url(r'^admin/', include(admin.site.urls)),
    url(r'^api/', include('api.urls')),
    url(r'^accounts/', include('accounts.urls')),
    url(r'^documents/', include('documents.urls')),
    url(r'^endpoint/', include('endpoint.urls')),
    url(r'^store/', include('store.urls')),

    # Elasticsearch proxy
    url(r'^es/(?P<index>\w+)$', 'neonion.views.resource_search'),
    url(r'^es/create/(?P<index>\w+)$', 'neonion.views.resource_create'),

    # Django rest
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework'))
)