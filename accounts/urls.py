from django.conf.urls import patterns, url

urlpatterns = patterns('',
    url(r'^register/?$', 'accounts.views.register'),
    url(r'^login/?$', 'accounts.views.login'),
    url(r'^logout/?$', 'accounts.views.logout'),
    url(r'^profile/(?P<userID>.+)/$', 'accounts.views.profile'),
)
