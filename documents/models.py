from django.db import models
from django.dispatch import receiver
from django.db.models.signals import post_save
from common.sparql import insert_data
from common.statements import metadata_statement


class DocumentManager(models.Manager):
    def create_document(self, id, title, content, creator, type):
        return self.create(id=id, title=title, content=content, creator=creator, type=type)


class Document(models.Model):
    id = models.CharField('id', primary_key=True, max_length=200)
    title = models.CharField('name', max_length=500)
    content = models.TextField('content')
    creator = models.CharField('creator', max_length=500, default='')
    type = models.CharField('type', max_length=500, default='')
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    # assign manager
    objects = DocumentManager()

    def __unicode__(self):
        return self.id

    class Meta:
        ordering = ('title',)


# Signal which ensures that metadata gets saved automatically after newly created document
@receiver(post_save, sender=Document)
def send_meta_data(sender, instance, **kwargs):
    insert_data(metadata_statement(instance))