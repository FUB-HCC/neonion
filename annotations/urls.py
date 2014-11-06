from django.conf.urls import patterns, url


urlpatterns = patterns('',
    url(r'^list/$', 'annotations.views.list'),
    url(r'^delete/all', 'annotations.views.delete_all'),
)