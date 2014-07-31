from django.conf.urls import patterns, include, url

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^$', 'prototype.views.home', name='home'),
    url(r'^annotator/$', 'prototype.views.home', name='home'),
	url(r'^import/$', 'prototype.views.import_document', name='annotator'),

    url(r'^annotator/(?P<doc_id>.+)/$', 'prototype.views.annotator', name='annotator'),
    url(r'^admin/', include(admin.site.urls)),

    url(r'^accounts/login/$', 'django.contrib.auth.views.login'),

    url(r'^logout/$', 'django.contrib.auth.views.logout', {'next_page': '/'}, name='auth_logout'),
    url(r'^logout/(?P<next_page>.*)/$', 'django.contrib.auth.views.logout', name='auth_logout_next'),


)
