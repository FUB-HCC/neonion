from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.contrib.auth.models import BaseUserManager, Permission
from django.conf import settings
from documents.models import Document


class NeonionUserManager(BaseUserManager):
    def create_user(self, email, password=None, **kwargs):
        user = self.model(email=email, **kwargs)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password, **kwargs):
        user = self.model(email=email, is_superuser=True, **kwargs)
        user.set_password(password)
        user.save()
        return user


class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField('email address', unique=True, db_index=True)
    name = models.CharField('persons name', blank=True, max_length=256)
    surname = models.CharField('persons surname', blank=True, max_length=256)
    joined = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=settings.DEFAULT_USER_ACTIVE_STATE)

    USERNAME_FIELD = 'email'

    def get_full_name(self):
        return self.name + ' ' + self.surname

    def get_short_name(self):
        pass

    def __unicode__(self):
        return self.email


class WorkingGroup(models.Model):
    name = models.CharField('group name', max_length=128)
    comment = models.CharField('group description', max_length=500, blank=True)
    owner = models.ForeignKey(User, related_name="group_owner", null=True)
    members = models.ManyToManyField(User, through='Membership', related_name="group_members")
    documents = models.ManyToManyField(Document)

    def __str__(self):
        return self.name


class Membership(models.Model):
    user = models.ForeignKey(User)
    group = models.ForeignKey(WorkingGroup)
    date_joined = models.DateField(auto_now_add=True)
    invite_reason = models.CharField(max_length=64, blank=True)
    permissions = models.ManyToManyField(Permission, blank=True)