from django.conf.urls import include, url
from django.contrib import admin
from django.contrib.staticfiles.urls import staticfiles_urlpatterns

admin.autodiscover()

urlpatterns = [
    url(r'^$', 'neonion.views.render_home'),
    url(r'^my_annotations/$', 'neonion.views.my_annotations'),
    url(r'^annotations_occurrences/(?P<quote>.+)$', 'neonion.views.annotations_occurrences'),
    url(r'^ann_documents/(?P<quote>.+)$', 'neonion.views.ann_documents'),
    url(r'^import/$', 'neonion.views.import_document'),
    url(r'^vocabulary/$', 'neonion.views.render_vocabulary'),
    url(r'^settings/$', 'neonion.views.render_settings'),
    url(r'^query$', 'neonion.views.render_query'),

    url(r'^management/?$', 'neonion.views.accounts_management'),

    url(r'^annotator/(?P<doc_id>.+)$', 'neonion.views.render_annotator'),
    
    url(r'^admin/', include(admin.site.urls)),
    url(r'^api/', include('api.urls')),
    url(r'^accounts/', include('accounts.urls')),
    url(r'^documents/', include('documents.urls')),
    url(r'^endpoint/', include('endpoint.urls')),

    # Elasticsearch proxy
    url(r'^search$', 'neonion.views.resource_search'),

    # Django rest
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework'))
]

urlpatterns += staticfiles_urlpatterns()
#urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)