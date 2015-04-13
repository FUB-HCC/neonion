from django.db import models
from django.dispatch import receiver
from django.db.models.signals import post_save
from common.sparql import insert_data
from common.statements import metadata_statement


class DocumentManager(models.Manager):
    def create_document(self, id, title, content, creator=None, type=None, contributor=None, coverage=None,
                        description=None, format=None, identifier=None, language=None, publisher=None, relation=None,
                        rights=None, source=None, subject=None, created=None, updated=None):

        return self.create(id=id, title=title, content=content, creator=creator, type=type, contributor=contributor,
                           coverage=coverage, description=description, format=format, identifier=identifier,
                           language=language, publisher=publisher, relation=relation, rights=rights, source=source,
                           subject=subject, created=created, updated=updated)


class Document(models.Model):
    id = models.CharField('id', primary_key=True, max_length=200)
    title = models.CharField('name', max_length=500)
    content = models.TextField('content')
    creator = models.CharField('creator', max_length=500, default='', null=True)
    type = models.CharField('type', max_length=500, default='', null=True)
    contributor = models.CharField('contributor', max_length=500, default='', null=True)
    coverage = models.CharField('coverage', max_length=500, default='', null=True)
    ### TODO
    ### date = models.DateTimeField('date', default='', null=True, blank=True)
    description = models.CharField('description', max_length=1000, default='', null=True)
    format = models.CharField('format', max_length=200, default='', null=True)
    identifier = models.CharField('identifier', max_length=200, default='', null=True)
    language = models.CharField('language', max_length=200, default='', null=True)
    publisher = models.CharField('publisher', max_length=500, default='', null=True)
    relation = models.CharField('relation', max_length=500, default='', null=True)
    rights = models.CharField('rights', max_length=500, default='', null=True)
    source = models.CharField('source', max_length=500, default='', null=True)
    subject = models.CharField('subject', max_length=200, default='', null=True)
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
    try:
        # insert data into TDB
        pass
        #insert_data(metadata_statement(instance))
    except Exception as e:
        print(e.message)
    