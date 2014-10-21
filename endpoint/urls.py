from django.conf.urls import patterns, url

urlpatterns = patterns('',
    url(r'^annotationcreated$', 'endpoint.views.annotation_created'),
)