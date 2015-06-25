from django.conf.urls import patterns, url

urlpatterns = [
    url(r'^register/?$', 'accounts.views.register'),
    url(r'^login/?$', 'accounts.views.login'),
    url(r'^logout/?$', 'accounts.views.logout'),
]
