from django.test import TestCase
from models import Document


def create_test_document(doc_id='12345'):
    test_document = {
        'id': doc_id,
        'title': 'Test Document',
        'content': 'Content of the document',
        'type': 'Article',
        'creator': 'test@nutzer.com'
    }
    return Document.objects.create(**test_document)


class DocumentsTestCase(TestCase):

    def setUp(self):
        self.test_document = create_test_document()