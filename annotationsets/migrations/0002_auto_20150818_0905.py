# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('annotationsets', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='linkedconcept',
            name='custom_query',
            field=models.CharField(max_length=500, null=True, blank=True),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='linkedconcept',
            name='retrieved_at',
            field=models.DateTimeField(null=True, blank=True),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='linkedconcept',
            name='provider_class',
            field=models.CharField(max_length=100, null=True, verbose_name=b'provider_class', blank=True),
        ),
    ]
