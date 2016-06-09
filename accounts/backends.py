from accounts.models import User


class EmailAuthBackend(object):
    """
    A custom authentication backend. Allows users to log in using their email address.
    """

<<<<<<< HEAD
    def authenticate(self, email=None, password=None):
=======
    def authenticate(self, username=None, password=None):
>>>>>>> 1bea216863a0081c62611ce1969537c2b6a727d8
        """
        Authentication method
        """
        try:
<<<<<<< HEAD
            user = User.objects.get(email=email)
=======
            user = User.objects.get(username=username)
>>>>>>> 1bea216863a0081c62611ce1969537c2b6a727d8
            if user.check_password(password):
                return user
        except User.DoesNotExist:
            return None

    def get_user(self, user_id):
        try:
            user = User.objects.get(pk=user_id)
            if user.is_active:
                return user
            return None
        except User.DoesNotExist:
            return None
