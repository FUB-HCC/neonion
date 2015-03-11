# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('documents', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('annotationsets', '__first__'),
    ]

    operations = [
        migrations.CreateModel(
            name='Workspace',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('active_annotationset', models.OneToOneField(null=True, blank=True, to='annotationsets.AnnotationSet')),
                ('documents', models.ManyToManyField(to='documents.Document', null=True, blank=True)),
                ('hidden_documents', models.ManyToManyField(related_name=b'hidden_documents', null=True, to='documents.Document', blank=True)),
                ('owner', models.ForeignKey(to=settings.AUTH_USER_MODEL)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]
