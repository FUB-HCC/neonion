from django.test import TestCase
from models import User


class AccountsTestCase(TestCase):

    def setUp(self):
        User.objects.create(email="test1@neonion.org")

    def test_has_no_groups(self):
        user = User.objects.get(email="test1@neonion.org")
        self.assertEqual(len(user.groups.all()), 0)