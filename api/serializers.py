from rest_framework import serializers
from accounts.models import User
from documents.models import Document
from neonion.models import Workspace
from annotationsets.models import AnnotationSet, ConceptSource


# Serializers define the API representation.
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('email', 'name', 'surname', 'joined')


# Serializers define the API representation.
class ConceptSourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConceptSource
        fields = ('linked_concept_uri', 'provider', 'class_name')


# Serializers define the API representation.
class AnnotationSetSerializer(serializers.ModelSerializer):
    sources = ConceptSourceSerializer(many=True)

    class Meta:
        model = AnnotationSet
        fields = ('uri', 'label', 'allow_creation', 'sources')


# Serializers define the API representation.
class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ('urn', 'title', 'created', 'updated')


# Serializers define the API representation.
class DetailedDocumentSerializer(DocumentSerializer):
    class Meta:
        model = Document
        fields = ('urn', 'title', 'content', 'created', 'updated')


# Serializers define the API representation.
class WorkspaceSerializer(serializers.HyperlinkedModelSerializer):
    owner = UserSerializer()
    documents = DocumentSerializer(many=True)
    annotation_sets = AnnotationSetSerializer(many=True)

    class Meta:
        model = Workspace
        fields = ('owner', 'documents', 'annotation_sets')
