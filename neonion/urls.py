from django.conf.urls import include, url
from django.contrib import admin
from django.contrib.staticfiles.urls import staticfiles_urlpatterns

admin.autodiscover()

urlpatterns = [
    url(r'^$', 'neonion.views.render_home'),
    url(r'^annotations/$', 'neonion.views.annotations'),
    url(r'^annotation_occurrences$', 'neonion.views.annotation_occurrences'),
    url(r'^annotation_documents$', 'neonion.views.annotation_documents'),
    url(r'^import/$', 'neonion.views.import_document'),
    url(r'^vocabulary/$', 'neonion.views.render_vocabulary'),
    url(r'^settings/$', 'neonion.views.render_settings'),
    url(r'^query$', 'neonion.views.render_query'),
    url(r'^workbench$', 'neonion.views.render_workbench'),

    url(r'^management/?$', 'neonion.views.accounts_management'),

    url(r'^annotator/(?P<group_pk>.+)/(?P<document_pk>.+)$', 'neonion.views.render_annotator'),
    
    url(r'^admin/', include(admin.site.urls)),
    url(r'^api/', include('api.urls')),
    url(r'^accounts/', include('accounts.urls')),
    url(r'^documents/', include('documents.urls')),
    url(r'^endpoint/', include('endpoint.urls')),


    # Django rest
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework'))
]

urlpatterns += staticfiles_urlpatterns()
#urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)