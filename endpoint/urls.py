from django.conf.urls import url

urlpatterns = [
    url(r'^query$', 'endpoint.views.query'),
]