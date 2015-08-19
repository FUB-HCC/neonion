from django.core.exceptions import ValidationError
from common.uri import generate_uri
from exceptions import NoConceptAnnotationError
from common.sparql import insert_data
from common.statements import Annotation
from common.exceptions import InvalidResourceTypeError
from common.vocab import OpenAnnotation
from django.utils.deconstruct import deconstructible
from django.utils.translation import ugettext_lazy as _


@deconstructible
class SemanticAnnotationValidator(object):
    message = _('Ensure this annotation has semantic content.'),
    code = 'invalid'

    def __init__(self, message=None):
        if message:
            self.message = message

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
            else:
                # only highlights do not need a body
                if not annotation['oa']['motivatedBy'] == OpenAnnotation.Motivations.highlighting.value:
                    throw_error = True
        else:
            throw_error = True

        if throw_error:
            raise ValidationError(self.message, code=self.code, params=annotation)

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


def pre_process_annotation(annotation):
    try:
        if (motivation_equals(annotation, OpenAnnotation.Motivations.identifying) or
                motivation_equals(annotation, OpenAnnotation.Motivations.classifying)):
            try:
                add_resource_uri(annotation)
            except InvalidResourceTypeError:
                pass
    except ValidationError as e:
        print(e)


def post_process_annotation(annotation):
    # extract data from annotation and insert in triple store
    try:
        # print(Annotation.create_annotation_statement(annotation))
        # insert_data(Annotation.create_annotation_statement(annotation))
        if (motivation_equals(annotation, OpenAnnotation.Motivations.identifying) or
                motivation_equals(annotation, OpenAnnotation.Motivations.classifying)):
            insert_data(Annotation.statement_about_resource(annotation))
    except Exception as e:
        print(e.message)


def motivation_equals(annotation, motivation):
    if SemanticAnnotationValidator(annotation):
        return annotation['oa']['motivatedBy'] == motivation.value
    else:
        False


def add_resource_uri(annotation):
    if 'rdf' in annotation:
        if 'uri' not in annotation['rdf']:
            uri = generate_uri(annotation['rdf']['typeof'], annotation['rdf']['label'])
            if uri is not None:
                annotation['rdf']['uri'] = uri
    else:
        raise NoConceptAnnotationError(annotation)

    return annotation
