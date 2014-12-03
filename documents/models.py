from django.db import models


class DocumentManager(models.Manager):
    def create_document(self, urn, title, content):
        return self.create(urn=urn, title=title, content=content)


class Document(models.Model):
    urn = models.CharField('urn', unique=True, db_index=True, max_length=200)
    title = models.CharField('name', max_length=500)
    content = models.TextField('content')
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    # assign manager
    objects = DocumentManager()

    def __unicode__(self):
        return self.urn

    class Meta:
        ordering = ('title',)