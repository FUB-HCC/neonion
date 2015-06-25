from django.test import TestCase
from django.core.urlresolvers import reverse
from accounts.tests import create_test_user
from documents.tests import create_test_document
from neonion import views


class ViewTestCase(TestCase):

    def setUp(self):
        # create test user
        self.test_user = create_test_user()

        # create test document
        self.test_document = create_test_document()

    def test_neonion_views(self):
        self.assertTrue(self.client.login(email='test@neonin.org', password='tester'))

        # annotator - success
        response = self.client.get(reverse(views.render_annotator, args=[self.test_document.id]))
        self.assertEqual(response.status_code, 200)

        # annotator - fail
        response = self.client.get(reverse(views.render_annotator, args=[-1]))
        self.assertEqual(response.status_code, 404)

        # home
        response = self.client.get(reverse(views.render_home))
        self.assertEqual(response.status_code, 200)

        # my annotations
        response = self.client.get(reverse(views.my_annotations))
        self.assertEqual(response.status_code, 200)

        # accounts
        response = self.client.get(reverse(views.accounts_management))
        self.assertEqual(response.status_code, 200)

        # query
        response = self.client.get(reverse(views.render_query))
        self.assertEqual(response.status_code, 200)

        # import
        response = self.client.get(reverse(views.import_document))
        self.assertEqual(response.status_code, 200)

        # settings
        response = self.client.get(reverse(views.render_settings))
        self.assertEqual(response.status_code, 200)