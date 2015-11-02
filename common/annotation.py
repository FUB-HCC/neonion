from common.uri import generate_uri
from exceptions import InvalidAnnotationError
from common.sparql import insert_data
from common.statements import Annotation
from django.conf import settings
from common.vocab import OpenAnnotation
from django.utils.deconstruct import deconstructible
from django.utils.translation import ugettext_lazy as _


@deconstructible
class SemanticAnnotationValidator(object):

    def __init__(self):
        self.message = _('Ensure this annotation has semantic content.')
        self.code = 'invalid'

    def __call__(self, annotation):
        throw_error = False
        if self.has_motivation_field(annotation):
            if self.has_body_field(annotation):
                # check the motivation
                if annotation['oa']['motivatedBy'] == OpenAnnotation.Motivations.commenting.value:
                    # comments has body type text
                    if not annotation['oa']['hasBody']['type'] == OpenAnnotation.DocumentTypes.text.value:
                        throw_error = True
                elif (annotation['oa']['motivatedBy'] == OpenAnnotation.Motivations.classifying.value or
                        annotation['oa']['motivatedBy'] == OpenAnnotation.Motivations.identifying.value):
                    # classifying and identifying motivated annotations has the body type semanticTag
                    if not annotation['oa']['hasBody']['type'] == OpenAnnotation.TagTypes.semanticTag.value:
                        throw_error = True
                    else:
                        if not self.has_typeof_field(annotation):
                            throw_error = True
                elif annotation['oa']['motivatedBy'] == OpenAnnotation.Motivations.linking.value:
                    # linking has the body type semanticTag
                    if not annotation['oa']['hasBody']['type'] == OpenAnnotation.TagTypes.semanticTag.value:
                        throw_error = True
            else:
                # only highlights do not need a body
                if not annotation['oa']['motivatedBy'] == OpenAnnotation.Motivations.highlighting.value:
                    throw_error = True
        else:
            throw_error = True

        if throw_error:
            raise InvalidAnnotationError(self.message, code=self.code, params=annotation)

    def __eq__(self, other):
        return (
            isinstance(other, self.__class__)
            and (self.message == other.message)
            and (self.code == other.code)
        )

    @classmethod
    def has_motivation_field(cls, annotation):
        return 'oa' in annotation and 'motivatedBy' in annotation['oa']

    @classmethod
    def has_body_field(cls, annotation):
        return 'oa' in annotation and 'hasBody' in annotation['oa'] and 'type' in annotation['oa']['hasBody']

    @classmethod
    def has_typeof_field(cls, annotation):
        return 'rdf' in annotation and 'typeof' in annotation['rdf']


def pre_process_annotation(validated_annotation):
    if (motivation_equals(validated_annotation, OpenAnnotation.Motivations.identifying) or
            motivation_equals(validated_annotation, OpenAnnotation.Motivations.classifying)):
        add_resource_uri(validated_annotation)

    return validated_annotation


def post_process_annotation(validated_annotation):
    # TODO serialize general parts of annotation (independent from motivation) to triple store
    if hasattr(settings, 'ENDPOINT_ENABLED') and settings.ENDPOINT_ENABLED:
        # extract data from annotation and insert in triple store
        if (motivation_equals(validated_annotation, OpenAnnotation.Motivations.identifying) or
                motivation_equals(validated_annotation, OpenAnnotation.Motivations.classifying)):
            insert_data(Annotation.statement_about_resource(validated_annotation))

    return validated_annotation


def motivation_equals(annotation, motivation):
    return annotation['oa']['motivatedBy'] == motivation.value


def add_resource_uri(annotation):
    if 'rdf' in annotation:
        if 'uri' not in annotation['rdf']:
            uri = generate_uri(annotation['rdf']['typeof'], annotation['rdf']['label'])
            if uri is not None:
                annotation['rdf']['uri'] = uri
    else:
        raise InvalidAnnotationError(annotation)

    return annotation
