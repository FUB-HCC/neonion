# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('documents', '0002_auto_20150401_1139'),
    ]

    operations = [
        migrations.AddField(
            model_name='document',
            name='contributor',
            field=models.CharField(default=b'', max_length=500, verbose_name=b'contributor'),
        ),
        migrations.AddField(
            model_name='document',
            name='coverage',
            field=models.CharField(default=b'', max_length=500, verbose_name=b'coverage'),
        ),
        migrations.AddField(
            model_name='document',
            name='description',
            field=models.CharField(default=b'', max_length=1000, verbose_name=b'description'),
        ),
        migrations.AddField(
            model_name='document',
            name='format',
            field=models.CharField(default=b'', max_length=200, verbose_name=b'format'),
        ),
        migrations.AddField(
            model_name='document',
            name='identifier',
            field=models.CharField(default=b'', max_length=200, verbose_name=b'identifier'),
        ),
        migrations.AddField(
            model_name='document',
            name='language',
            field=models.CharField(default=b'', max_length=200, verbose_name=b'language'),
        ),
        migrations.AddField(
            model_name='document',
            name='publisher',
            field=models.CharField(default=b'', max_length=500, verbose_name=b'publisher'),
        ),
        migrations.AddField(
            model_name='document',
            name='relation',
            field=models.CharField(default=b'', max_length=500, verbose_name=b'relation'),
        ),
        migrations.AddField(
            model_name='document',
            name='rights',
            field=models.CharField(default=b'', max_length=500, verbose_name=b'rights'),
        ),
        migrations.AddField(
            model_name='document',
            name='source',
            field=models.CharField(default=b'', max_length=500, verbose_name=b'source'),
        ),
        migrations.AddField(
            model_name='document',
            name='subject',
            field=models.CharField(default=b'', max_length=200, verbose_name=b'subject'),
        ),
    ]
