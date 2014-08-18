from django.conf.urls import patterns, include, url

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^$', 'prototype.views.home', name='home'),
    url(r'^annotator/$', 'prototype.views.home', name='home'),
	url(r'^import/$', 'prototype.views.import_document', name='annotator'),

    url(r'^annotator/(?P<doc_id>.+)/$', 'prototype.views.annotator', name='annotator'),
    url(r'^admin/', include(admin.site.urls)),

    url(r'^accounts/', include('accounts.urls', namespace='accounts')),

    # Elasticsearch proxy
    url(r'^es/(?P<index>\w+)$', 'prototype.views.elasticsearch', name='elasticsearch'),
    # Loomp proxy
    url(r'^loomp/content/get$', 'prototype.views.loomp_get', name='loomp_get'),
    url(r'^loomp/content/getAll$', 'prototype.views.loomp_getAll', name='getAll'),
    # url(r'^loomp/delete/(?P<query>[\w ]+)/?$', 'prototype.views.loomp_getAll', name='getAll'),

# // GET services
# get : "/content/get?uri=%(uri)s",
# getAll : "/content/getAll?type=%(type)s",

# delete : "/content/delete?uri=%(uri)s",
# // POST services
# save : "/content/save",
# create : "/content/save"




)