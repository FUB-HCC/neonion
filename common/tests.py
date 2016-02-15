from django.test import TestCase
from common.uri import generate_uri
from common.statements import Annotation
from common.annotation import add_resource_uri, SemanticAnnotationValidator, pre_process_annotation
from common.exceptions import InvalidAnnotationError, InvalidResourceTypeError
from common.vocab import neonion, OpenAnnotation
from django.core.validators import URLValidator
from documents.tests import create_test_document
from common.statements import metadata_statement


class AnnotationValidationTestCase(TestCase):

    def setUp(self):
        self.valid = {
            'highlight': {
                'oa': {'motivatedBy': OpenAnnotation.Motivations.highlighting.value}
            },
            'comment': {
                'text': 'Comment text',
                'oa': {
                    'motivatedBy': OpenAnnotation.Motivations.commenting.value,
                    'hasBody': {'type': OpenAnnotation.DocumentTypes.text.value}
                },
            },
            'classification': {
                'oa': {
                    'motivatedBy': OpenAnnotation.Motivations.classifying.value,
                    'hasBody': {'type': OpenAnnotation.TagTypes.semanticTag.value},
                },
                'rdf': {
                    'typeof': 'http://neonion.org/concept1',
                    'label': 'Name of the instance'
                }
            },
            'identification': {
                'oa': {
                    'motivatedBy': OpenAnnotation.Motivations.identifying.value,
                    'hasBody': {'type': OpenAnnotation.TagTypes.semanticTag.value},
                },
                'rdf': {
                    'uri': 'http://neonion.org/instance1',
                    'typeof': 'http://neonion.org/concept1',
                    'label': 'Name of the instance'
                }
            },
            'linking': {
                'oa': {
                    'motivatedBy': OpenAnnotation.Motivations.linking.value,
                    'hasBody': {'type': OpenAnnotation.TagTypes.semanticTag.value},
                    'hasTarget': {}
                },
            }
        }

        self.invalid = {
            'noMotivation': {
                'oa': {}
            },
            'commentWithoutBody': {
                'oa': {'motivatedBy': OpenAnnotation.Motivations.commenting.value}
            },
            'commentWithInvalidBodyType': {
                'oa': {
                    'motivatedBy': OpenAnnotation.Motivations.commenting.value,
                    'hasBody': {'type': 'someType'}
                }
            },
            'classificationWithInvalidBodyType': {
                'oa': {
                    'motivatedBy': OpenAnnotation.Motivations.classifying.value,
                    'hasBody': {'type': 'someType'},
                }
            },
            'classificationWithoutConceptType': {
                'oa': {
                    'motivatedBy': OpenAnnotation.Motivations.classifying.value,
                    'hasBody': {'type': OpenAnnotation.TagTypes.semanticTag.value},
                }
            },
            'linkingWithInvalidBodyType': {
                'oa': {
                    'motivatedBy': OpenAnnotation.Motivations.linking.value,
                    'hasBody': {'type': 'someType'},
                    'hasTarget': {}
                }
            }
        }

    def test_valid_annotations(self):
        validate = SemanticAnnotationValidator()
        self.assertIsNone(validate(self.valid['comment']))
        self.assertIsNone(validate(self.valid['highlight']))
        self.assertIsNone(validate(self.valid['classification']))
        self.assertIsNone(validate(self.valid['identification']))
        self.assertIsNone(validate(self.valid['linking']))

    def test_invalid_annotations(self):
        validate = SemanticAnnotationValidator()
        self.assertRaises(InvalidAnnotationError, validate, self.invalid['noMotivation'])
        self.assertRaises(InvalidAnnotationError, validate, self.invalid['commentWithoutBody'])
        self.assertRaises(InvalidAnnotationError, validate, self.invalid['commentWithInvalidBodyType'])
        self.assertRaises(InvalidAnnotationError, validate, self.invalid['classificationWithInvalidBodyType'])
        self.assertRaises(InvalidAnnotationError, validate, self.invalid['classificationWithoutConceptType'])
        self.assertRaises(InvalidAnnotationError, validate, self.invalid['linkingWithInvalidBodyType'])


class AnnotationPreProcessTestCase(TestCase):

    def setUp(self):
        self.pre_process = {
            'classification': {
                'oa': {
                    'motivatedBy': OpenAnnotation.Motivations.classifying.value,
                    'hasBody': {'type': OpenAnnotation.TagTypes.semanticTag.value},
                },
                'rdf': {
                    'typeof': 'http://neonion.org/concept1',
                    'label': 'Name of the instance'
                }
            },
            'identification': {
                'oa': {
                    'motivatedBy': OpenAnnotation.Motivations.identifying.value,
                    'hasBody': {'type': OpenAnnotation.TagTypes.semanticTag.value},
                },
                'rdf': {
                    'typeof': 'http://neonion.org/concept1',
                    'label': 'Name of the instance'
                }
            }
        }

    def test_pre_process(self):
        # following two calls ensures if a URI is added in pre-process
        # (1) annotation is motivated by classification
        annotation = pre_process_annotation(self.pre_process['classification'])
        self.assertTrue('uri' in annotation['rdf'])
        # (2) annotation is motivated by classification
        annotation = pre_process_annotation(self.pre_process['identification'])
        self.assertTrue('uri' in annotation['rdf'])


class UriTestCase(TestCase):

    def setUp(self):
        self.resourceType = "http://neonion.org/concept/person"
        self.invalidResourceType = "person"

    def test_equal_uri_mapping(self):
        uri1 = generate_uri(resource_type=self.resourceType, name="Otto Hahn")
        uri2 = generate_uri(resource_type=self.resourceType, name="Otto Hahn")

        self.assertEqual(uri1, uri2)

    def test_not_equal_uri_mapping(self):
        uri1 = generate_uri(resource_type=self.resourceType, name="Otto Hahn")
        uri2 = generate_uri(resource_type=self.resourceType, name="Max Planck")

        self.assertNotEqual(uri1, uri2)

    def test_random_uri_mapping(self):
        uri1 = generate_uri(resource_type=self.resourceType)
        uri2 = generate_uri(resource_type=self.resourceType)

        self.assertNotEqual(uri1, uri2)

    def test_invalid_uri_mapping(self):
        self.assertRaises(InvalidResourceTypeError, generate_uri, resource_type=self.invalidResourceType)


class StatementsTestCase(TestCase):

    def setUp(self):
        self.noConceptAnnotation = {
            "quote": "Otto Hahn"
        }

        self.conceptAnnotationWithoutURI = {
            "quote": "Otto Hahn",
            "oa": {
                "hasBody": {
                    "type": "oa:SemanticTag"
                }
            },
            "rdf": {
                "label": "Name of resource",
                "typeof": "http://neonion.org/concept/person"
            }
        }

        self.conceptAnnotation = {
            "quote": "Otto Hahn",
            "oa": {
                "hasBody": {
                    "type": "oa:SemanticTag"
                }
            },
            "rdf": {
                "label": "Name of resource",
                "uri": "http://neonion.org/person/123456",
                "typeof": "http://neonion.org/concept/person"
            }
        }

        self.conceptAnnotationWithSameAs = {
            "quote": "Otto Hahn",
            "oa": {},
            "rdf": {
                "label": "Name of resource",
                "uri": 'http://neonion.org/person/123456',
                "typeof": "http://neonion.org/concept/person",
                "sameAs": "http://de.dbpedia.org/page/Otto_Hahn"
            }
        }

        self.test_general_document = create_test_document()

    def test_no_semantic_annotation(self):
        self.assertRaises(InvalidAnnotationError, Annotation.statement_about_resource, self.noConceptAnnotation)

    def test_semantic_annotation(self):
        statement = Annotation.statement_about_resource(self.conceptAnnotation)
        self.assertTrue("rdf:type" in statement)
        self.assertTrue("rdfs:label" in statement)

    def test_semantic_annotation_with_same_as(self):
        statement = Annotation.statement_about_resource(self.conceptAnnotationWithSameAs)
        self.assertTrue("owl:sameAs" in statement)

    def test_add_uri_to_invalid_annotation(self):
        self.assertRaises(InvalidAnnotationError, add_resource_uri, self.noConceptAnnotation)

    def test_add_uri_to_valid_annotation(self):
        annotation = self.conceptAnnotationWithoutURI
        self.assertFalse("uri" in annotation['rdf'])
        annotation = add_resource_uri(self.conceptAnnotationWithoutURI)
        self.assertTrue("uri" in annotation['rdf'])

    def test_general_document(self):
        statement = metadata_statement(self.test_general_document)
        self.assertTrue("dc:title" in statement)
        self.assertTrue("dc:creator" in statement)
        self.assertTrue("dc:type" in statement)


class VocabTestCase(TestCase):

    def test_valid_urls(self):
        """ Tests whether the vocab contains only valid URLs. """
        vocab = neonion()
        vocab_uri = [
            vocab.CONCEPT_SET, vocab.CONCEPT, vocab.LINKED_CONCEPT,
            vocab.PROPERTY, vocab.LINKED_PROPERTY,
            vocab.DOCUMENT, vocab.ANNOTATION_STORE_GRAPH
        ]
        validate = URLValidator()
        for uri in vocab_uri:
            self.assertIsNone(validate(uri))
