from django.conf.urls import patterns, url

urlpatterns = patterns('',
    url(r'^profile/(?P<userID>.+)/$', 'accounts.views.profile'),
    url(r'^me/?$', 'accounts.views.me'),
    url(r'^register/?$', 'accounts.views.register'),
    url(r'^login/?$', 'accounts.views.login'),
    url(r'^logout/?$', 'accounts.views.logout'),
    url(r'^list/?$', 'accounts.views.list'),

    url(r'^delete/(?P<userID>.+)/$', 'accounts.views.delete_user'),
    url(r'^edit/(?P<userID>.+)/$', 'accounts.views.edit_user'),
)
