# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('neonion', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='workspace',
            name='active_annotationset',
        ),
        migrations.RemoveField(
            model_name='workspace',
            name='documents',
        ),
        migrations.RemoveField(
            model_name='workspace',
            name='hidden_documents',
        ),
        migrations.RemoveField(
            model_name='workspace',
            name='owner',
        ),
        migrations.DeleteModel(
            name='Workspace',
        ),
    ]
