# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('documents', '0003_auto_20150413_1848'),
    ]

    operations = [
        migrations.AlterField(
            model_name='document',
            name='contributor',
            field=models.CharField(default=b'', max_length=500, null=True, verbose_name=b'contributor'),
        ),
        migrations.AlterField(
            model_name='document',
            name='coverage',
            field=models.CharField(default=b'', max_length=500, null=True, verbose_name=b'coverage'),
        ),
        migrations.AlterField(
            model_name='document',
            name='creator',
            field=models.CharField(default=b'', max_length=500, null=True, verbose_name=b'creator'),
        ),
        migrations.AlterField(
            model_name='document',
            name='description',
            field=models.CharField(default=b'', max_length=1000, null=True, verbose_name=b'description'),
        ),
        migrations.AlterField(
            model_name='document',
            name='format',
            field=models.CharField(default=b'', max_length=200, null=True, verbose_name=b'format'),
        ),
        migrations.AlterField(
            model_name='document',
            name='identifier',
            field=models.CharField(default=b'', max_length=200, null=True, verbose_name=b'identifier'),
        ),
        migrations.AlterField(
            model_name='document',
            name='language',
            field=models.CharField(default=b'', max_length=200, null=True, verbose_name=b'language'),
        ),
        migrations.AlterField(
            model_name='document',
            name='publisher',
            field=models.CharField(default=b'', max_length=500, null=True, verbose_name=b'publisher'),
        ),
        migrations.AlterField(
            model_name='document',
            name='relation',
            field=models.CharField(default=b'', max_length=500, null=True, verbose_name=b'relation'),
        ),
        migrations.AlterField(
            model_name='document',
            name='rights',
            field=models.CharField(default=b'', max_length=500, null=True, verbose_name=b'rights'),
        ),
        migrations.AlterField(
            model_name='document',
            name='source',
            field=models.CharField(default=b'', max_length=500, null=True, verbose_name=b'source'),
        ),
        migrations.AlterField(
            model_name='document',
            name='subject',
            field=models.CharField(default=b'', max_length=200, null=True, verbose_name=b'subject'),
        ),
        migrations.AlterField(
            model_name='document',
            name='type',
            field=models.CharField(default=b'', max_length=500, null=True, verbose_name=b'type'),
        ),
    ]
