from django.test import TestCase
from models import WorkingGroup, Membership
from backends import EmailAuthBackend
from accounts.models import User
from django.core.urlresolvers import reverse
from accounts import views


def create_test_user(email='test@neonin.org'):
    if not WorkingGroup.objects.filter(name="Public").exists():
        WorkingGroup.objects.create(name="Public")

    test_user = {
        'email': email,
        'password': 'tester'
    }
    user = User.objects.create(**test_user)
    user.set_password(test_user['password'])
    user.save()
    return user


def create_test_group(group_name):
    return WorkingGroup.objects.create(name=group_name)


class AccountsTestCase(TestCase):
    def setUp(self):
        self.test_user = create_test_user()
        self.test_group = create_test_group('Closed')

    def test_member_of_public_group(self):
        public_group = WorkingGroup.objects.get(pk=1)
        self.assertTrue(Membership.objects.filter(user=self.test_user, group=public_group).exists())

    def test_user_membership(self):
        # test join group
        self.test_user.join_group(self.test_group)
        self.assertTrue(Membership.objects.filter(user=self.test_user, group=self.test_group).exists())

        # test if method entitled_groups contains test group
        self.assertTrue(self.test_group in self.test_user.entitled_groups())

        # test unjoin group
        self.test_user.unjoin_group(self.test_group)
        self.assertFalse(Membership.objects.filter(user=self.test_user, group=self.test_group).exists())


class AuthenticationTestCase(TestCase):
    def setUp(self):
        self.test_user = create_test_user()

        self.test_inactive_user = create_test_user("inactive@neonion.org")
        self.test_inactive_user.is_active = False
        self.test_inactive_user.save()

    def test_authentication(self):
        auth = EmailAuthBackend()
        # test existing user with valid password
        self.assertEqual(auth.authenticate(email=self.test_user.email, password='tester'), self.test_user)

        # test existing user with invalid passwort
        self.assertIsNone(auth.authenticate(email=self.test_user.email, password='invalid password'))

        # test not existing user
        self.assertIsNone(auth.authenticate(email="not@exist.ing", password='invalid password'))

    def test_get_user(self):
        auth = EmailAuthBackend()
        # try to get an active existing user
        self.assertEqual(auth.get_user(self.test_user.pk), self.test_user)

        # try to get an inactive existing user
        self.assertIsNone(auth.get_user(self.test_inactive_user.pk))

        # try to get an not existing user
        self.assertIsNone(auth.get_user(9999))


class ViewTestCase(TestCase):
    def setUp(self):
        self.test_user = create_test_user()

    def test_login(self):
        # get login page
        response = self.client.get(reverse(views.login))
        self.assertEqual(response.status_code, 200)

        # post login credentials
        response = self.client.post(reverse(views.login),
                                    data={
                                        "email": self.test_user.email,
                                        "password": "tester"
                                    })
        self.assertRedirects(response, "/")

    def test_logout(self):
        self.assertTrue(self.client.login(email='test@neonin.org', password='tester'))

        response = self.client.get(reverse(views.logout), follow=True)
        # check if redirection works
        self.assertRedirects(response, reverse(views.login))
        # check if user successfully logged out
        self.assertNotIn('_auth_user_id', self.client.session)