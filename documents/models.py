import uuid

from django.db import transaction
from os.path import splitext, basename
from django.db import models
from django.dispatch import receiver
from django.db.models.signals import post_save
from common.vocab import neonion
from common.mixins import ResourceMixin
from common.sparql import insert_data
from common.statements import metadata_statement


class File(models.Model):
    name = models.CharField('name', max_length=500)
    content_type = models.CharField('content_type', max_length=50, default='', null=True)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now_add=True)
    origin_url = models.CharField('origin_url', max_length=500, null=True)
    raw_data = models.BinaryField()


class DocumentManager(models.Manager):

    SUPPORTED_TYPES = [
        'text/plain',
        'text/html',
        'application/pdf'
    ]

    def create_document(self, id, title, content):
        return self.create(id=id, title=title, content=content)

    def create_document_from_file(self, file, **kwargs):
        if file.content_type in DocumentManager.SUPPORTED_TYPES:
            file_name = file.name.encode('utf-8')
            doc_id = uuid.uuid1().hex

            raw_data = ''
            # read chunks
            for chunk in file.chunks():
                raw_data += chunk

            with transaction.atomic():
                # create new file object
                uploaded_file = File.objects.create(
                    name=file_name,
                    content_type=file.content_type,
                    raw_data=raw_data)

                return self.create(
                    id=doc_id,
                    attached_file=uploaded_file,
                    **{key: value for key, value in kwargs.items()})

        return None

    def create_document_from_url(self, url):
        return None


class Document(ResourceMixin, models.Model):
    title = models.CharField('name', max_length=500)
    attached_file = models.OneToOneField(File, null=True)
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

    class_uri = neonion.DOCUMENT

    # assign manager
    objects = DocumentManager()

    def __unicode__(self):
        return self.id


# Signal which ensures that metadata gets saved automatically after newly created document
@receiver(post_save, sender=Document)
def send_meta_data(sender, instance, **kwargs):
    try:
        # insert data into TDB
        pass
        #insert_data(metadata_statement(instance))
    except Exception as e:
        print(e.message)
