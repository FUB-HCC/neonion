from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.contrib.auth.models import Permission
from django.conf import settings
from documents.models import Document
from annotationsets.models import ConceptSet
from django.dispatch import receiver
from django.db.models.signals import post_save
from django.db import transaction


class User(AbstractBaseUser, PermissionsMixin):
    username = models.CharField('username', max_length=150, unique=True)
    email = models.EmailField('email address', unique=True)
    name = models.CharField('persons name', blank=True, max_length=256)
    surname = models.CharField('persons surname', blank=True, max_length=256)
    joined = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=settings.DEFAULT_USER_ACTIVE_STATE)
    is_staff = models.BooleanField(default=False)

    owned_documents = models.ManyToManyField(Document, blank=True)
    hidden_documents = models.ManyToManyField(Document, related_name='hidden_documents', blank=True)

    USERNAME_FIELD = 'username'

    def join_group(self, group):
        if not Membership.objects.filter(user=self, group=group).exists():
            membership = Membership.objects.create(user=self, group=group)
            membership.save()

    def unjoin_group(self, group):
        if Membership.objects.filter(user=self, group=group).exists():
            # group owner cannot leave group
            if group.owner is not self:
                membership = Membership.objects.get(user=self, group=group)
                membership.delete()
            else:
                # TODO raise exception
                pass

    def join_public_group(self):
        if WorkingGroup.objects.filter(pk=1).exists():
            # get public group
            public_group = WorkingGroup.objects.get(pk=1)
            self.join_group(public_group)

    def hide_document(self, document):
        with transaction.atomic():
            self.hidden_documents.add(document)
            self.owned_documents.remove(document)

    def entitled_groups(self):
        return WorkingGroup.objects.filter(members__in=[self])

    def get_full_name(self):
        return self.name + ' ' + self.surname

    def get_short_name(self):
        pass

    def __unicode__(self):
        return self.email


class WorkingGroup(models.Model):
    name = models.CharField('group name', max_length=128)
    comment = models.CharField('group description', max_length=500, blank=True)
    owner = models.ForeignKey(User, related_name="group_owner", null=True, unique=False)
    members = models.ManyToManyField(User, through='Membership', related_name="group_members")
    documents = models.ManyToManyField(Document, blank=True)
    concept_set = models.ForeignKey(ConceptSet, blank=True, null=True, on_delete=models.SET_NULL)

    def __str__(self):
        return self.name


class Membership(models.Model):
    user = models.ForeignKey(User)
    group = models.ForeignKey(WorkingGroup)
    date_joined = models.DateField(auto_now_add=True)
    invite_reason = models.CharField(max_length=64, blank=True)
    permissions = models.ManyToManyField(Permission, blank=True)


# Signal which ensures that newly created users joins the public group automatically
@receiver(post_save, sender=User)
def user_joins_public_group(sender, instance, created, **kwargs):
    if created:
        instance.join_public_group()
