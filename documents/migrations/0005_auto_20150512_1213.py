# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('documents', '0004_auto_20150413_1851'),
    ]

    operations = [
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
            options={
            },
            bases=(models.Model,),
        ),
        migrations.AddField(
            model_name='document',
            name='attached_file',
            field=models.OneToOneField(null=True, to='documents.File'),
            preserve_default=True,
        ),
    ]
