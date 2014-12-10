from django.conf.urls import patterns, url

urlpatterns = patterns('',
    url(r'^$', 'store.views.root'),
    url(r'^annotations/(?P<id>.+)$', 'store.views.read'),
    url(r'^annotations/$', 'store.views.index'),

    url(r'^filter/$', 'store.views.filter_annotations'),

    url(r'^search$', 'store.views.search'),
)