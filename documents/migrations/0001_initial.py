# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('annotationsets', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Document',
            fields=[
                ('id', models.CharField(max_length=50, serialize=False, verbose_name=b'id', primary_key=True)),
                ('label', models.CharField(max_length=100, verbose_name=b'label')),
                ('comment', models.CharField(max_length=500, verbose_name=b'comment', blank=True)),
                ('title', models.CharField(max_length=500, verbose_name=b'name')),
                ('creator', models.CharField(default=b'', max_length=500, null=True, verbose_name=b'creator')),
                ('type', models.CharField(default=b'', max_length=500, null=True, verbose_name=b'type')),
                ('contributor', models.CharField(default=b'', max_length=500, null=True, verbose_name=b'contributor')),
                ('coverage', models.CharField(default=b'', max_length=500, null=True, verbose_name=b'coverage')),
                ('description', models.CharField(default=b'', max_length=1000, null=True, verbose_name=b'description')),
                ('format', models.CharField(default=b'', max_length=200, null=True, verbose_name=b'format')),
                ('identifier', models.CharField(default=b'', max_length=200, null=True, verbose_name=b'identifier')),
                ('language', models.CharField(default=b'', max_length=200, null=True, verbose_name=b'language')),
                ('publisher', models.CharField(default=b'', max_length=500, null=True, verbose_name=b'publisher')),
                ('relation', models.CharField(default=b'', max_length=500, null=True, verbose_name=b'relation')),
                ('rights', models.CharField(default=b'', max_length=500, null=True, verbose_name=b'rights')),
                ('source', models.CharField(default=b'', max_length=500, null=True, verbose_name=b'source')),
                ('subject', models.CharField(default=b'', max_length=200, null=True, verbose_name=b'subject')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.CreateModel(
            name='File',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=500, verbose_name=b'name')),
                ('content_type', models.CharField(default=b'', max_length=50, null=True, verbose_name=b'content_type')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now_add=True)),
                ('origin_url', models.CharField(max_length=500, null=True, verbose_name=b'origin_url')),
                ('raw_data', models.BinaryField()),
            ],
        ),
        migrations.AddField(
            model_name='document',
            name='attached_file',
            field=models.OneToOneField(null=True, to='documents.File'),
        ),
        migrations.AddField(
            model_name='document',
            name='concept_set',
            field=models.ForeignKey(on_delete=django.db.models.deletion.SET_DEFAULT, default=b'default', to='annotationsets.ConceptSet'),
        ),
    ]
