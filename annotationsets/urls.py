from django.conf.urls import patterns, url

urlpatterns = patterns('',
    url(r'^list/?$', 'annotationsets.views.list'),
)