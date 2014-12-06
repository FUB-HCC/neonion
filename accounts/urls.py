from django.conf.urls import patterns, url, include
from django.views.generic import ListView
from accounts.models import User
from django.contrib.auth.decorators import login_required
from rest_framework import routers, serializers, viewsets


# Serializers define the API representation.
class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ('email', 'name', 'surname', 'joined')


# ViewSets define the view behavior.
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

# Routers provide an easy way of automatically determining the URL conf.
router = routers.DefaultRouter()
router.register(r'users', UserViewSet)


urlpatterns = patterns('',
    url(r'^', include(router.urls)),
    url(r'^me/?$', 'accounts.views.me'),
    url(r'^register/?$', 'accounts.views.register'),
    url(r'^login/?$', 'accounts.views.login'),
    url(r'^logout/?$', 'accounts.views.logout'),
    url(r'^list/?$', login_required(ListView.as_view(model=User)), name='user_list'),
    url(r'^profile/(?P<userID>.+)/$', 'accounts.views.profile'),

    url(r'^delete/(?P<userID>.+)/$', 'accounts.views.delete_user'),
    url(r'^edit/(?P<userID>.+)/$', 'accounts.views.edit_user'),
)
