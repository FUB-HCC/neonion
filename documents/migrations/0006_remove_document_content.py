# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('documents', '0005_auto_20150512_1213'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='document',
            name='content',
        ),
    ]
