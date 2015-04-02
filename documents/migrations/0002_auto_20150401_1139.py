# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('documents', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='document',
            name='creator',
            field=models.CharField(default=b'', max_length=500, verbose_name=b'creator'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='document',
            name='type',
            field=models.CharField(default=b'', max_length=500, verbose_name=b'type'),
            preserve_default=True,
        ),
    ]
