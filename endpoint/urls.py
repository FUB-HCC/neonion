from django.conf.urls import patterns, url

urlpatterns = patterns('',
    url(r'^query$', 'endpoint.views.query'),
    url(r'^form/query$', 'endpoint.views.query_form'),
)