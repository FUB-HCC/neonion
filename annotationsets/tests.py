from django.test import TestCase
from models import AnnotationSet, LinkedConcept, Concept


class AnnotationSetsTestCase(TestCase):

    def setUp(self):
        test_set = {
        'uri': 'http://neonion.org/',
        'label': 'Test Document',
        }
        self.annotation_set = AnnotationSet.objects.create(**test_set)