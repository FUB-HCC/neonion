from django.conf.urls import patterns, url, include
from annotationsets.models import AnnotationSet
from rest_framework import routers, serializers, viewsets


# Serializers define the API representation.
class AnnotationSetSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = AnnotationSet
        fields = ('uri', 'label', 'allow_creation')


# ViewSets define the view behavior.
class AnnotationSetViewSet(viewsets.ModelViewSet):
    queryset = AnnotationSet.objects.all()
    serializer_class = AnnotationSetSerializer

# Routers provide an easy way of automatically determining the URL conf.
router = routers.DefaultRouter()
router.register(r'list', AnnotationSetViewSet)


urlpatterns = patterns('',
    url(r'^', include(router.urls)),
)