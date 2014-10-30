from django.db import models
from accounts.models import User
from documents.models import Document


class WorkspaceManager(models.Manager):

    def get_workspace(self, owner):
        if Workspace.objects.filter(owner=owner).exists():
            workspace = self.get(owner=owner)
        else:
            workspace = self.create(owner=owner)

        return workspace


class Workspace(models.Model):
    owner = models.OneToOneField(User, unique=True)
    documents = models.ManyToManyField(Document, blank=True, null=True)

    # assign manager
    objects = WorkspaceManager()

    def __unicode__(self):
        return unicode(self.owner)