from django.conf.urls import patterns, url
from django.views.generic import ListView
from accounts.models import User
from django.contrib.auth.decorators import login_required

urlpatterns = patterns('',

    url(r'^me/?$', 'accounts.views.me'),
    url(r'^register/?$', 'accounts.views.register'),
    url(r'^login/?$', 'accounts.views.login'),
    url(r'^logout/?$', 'accounts.views.logout'),
    url(r'^list/?$', login_required(ListView.as_view(model=User)), name='users.list'),
    url(r'^profile/(?P<userID>.+)/$', 'accounts.views.profile'),

    url(r'^delete/(?P<userID>.+)/$', 'accounts.views.delete_user'),
    url(r'^edit/(?P<userID>.+)/$', 'accounts.views.edit_user'),
)
