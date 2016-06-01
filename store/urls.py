from django.conf.urls import url
from store import views

urlpatterns = [
    # AnnotationStore API
    url(r'^$', 'store.views.root'),
    url(r'^search$', 'store.views.search'),

    url(r'^(?P<group_pk>.+)/(?P<document_pk>.+)/annotations$', views.AnnotationListView.as_view()),
    url(r'^(?P<group_pk>.+)/(?P<document_pk>.+)/annotations/(?P<annotation_pk>.+)$', views.AnnotationDetailView.as_view()),
    url(r'^(?P<group_pk>.+)/(?P<document_pk>.+)/search$', views.SearchView.as_view()),
]
