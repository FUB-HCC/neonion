from django.db import models
from django.contrib.auth.models import AbstractBaseUser
from django.contrib.auth.models import BaseUserManager


class NeonionUserManager(BaseUserManager):
    def create_user(self, email, password=None, **kwargs):
        user = self.model(email=email, **kwargs)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password, **kwargs):
        user = self.model(email=email, is_admin=True, **kwargs)
        user.set_password(password)
        user.save()
        return user


class User(AbstractBaseUser):
    email = models.EmailField('email address', unique=True, db_index=True)
    name = models.CharField('persons name', max_length=256)
    surname = models.CharField('persons surname', max_length=256)
    joined = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=False)
    is_admin = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'

    def get_full_name(self):
        return self.name + ' ' + self.surname

    def get_short_name(self):
        pass

    def __unicode__(self):
        return self.email

