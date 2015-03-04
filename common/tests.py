from django.test import TestCase
from uri import generate_uri
from statements import general_statement
from exceptions import NoSemanticAnnotationError
from exceptions import InvalidResourceTypeError


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
        self.noSemanticAnnotation = {
            "quote": "Otto Hahn"
        }

        self.semanticAnnotation = {
            "quote": "Otto Hahn",
            "rdf": {
                "uri": 'http://neonion.org/person/123456',
                "typeof": "http://neonion.org/concept/person"
            }
        }

        self.semanticAnnotationWithSameAs = {
            "quote": "Otto Hahn",
            "rdf": {
                "uri": 'http://neonion.org/person/123456',
                "typeof": "http://neonion.org/concept/person",
                "sameAs": "http://de.dbpedia.org/page/Otto_Hahn"
            }
        }

    def test_no_semantic_annotation(self):
        self.assertRaises(NoSemanticAnnotationError, general_statement, self.noSemanticAnnotation)

    def test_semantic_annotation(self):
        statement = general_statement(self.semanticAnnotation)
        self.assertTrue("rdf:type" in statement)
        self.assertTrue("rdfs:label" in statement)

    def test_semantic_annotation_with_same_as(self):
        statement = general_statement(self.semanticAnnotationWithSameAs)
        self.assertTrue("owl:sameAs" in statement)