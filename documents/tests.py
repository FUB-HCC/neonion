from django.test import TestCase
from models import Document


class DocumentsTestCase(TestCase):

    def setUp(self):
        Document.objects.create(urn="12345", title="Test Document", content="Content of the document")