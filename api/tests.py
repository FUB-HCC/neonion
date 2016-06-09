from django.test import TestCase
from accounts.tests import create_test_user
from documents.tests import create_test_document


class DocumentAPITestCase(TestCase):

    def setUp(self):
        # create test user
        self.test_user = create_test_user()

        # create test document
        self.test_document = create_test_document()

    def test_get_documents(self):
        self.assertTrue(self.client.login(email='test@neonin.org', password='tester'))
        response = self.client.get('/api/documents')
        self.assertTrue(len(response.data) == 1)

    def test_get_document(self):
        self.assertTrue(self.client.login(email='test@neonin.org', password='tester'))

        response = self.client.get('/api/documents/' + self.test_document.id)
        self.assertDictContainsSubset({'id': self.test_document.id}, response.data)


class UserAPITestCase(TestCase):

    def setUp(self):
        # create test user
        self.test_user = create_test_user()

    def test_current_user(self):
        self.assertTrue(self.client.login(email='test@neonin.org', password='tester'))

        response = self.client.get('/api/users/current')
        self.assertDictContainsSubset({'email': self.test_user.email}, response.data)


class WorkingGroupAPITestCase(TestCase):

    def setUp(self):
        # create test user
        self.test_user = create_test_user()