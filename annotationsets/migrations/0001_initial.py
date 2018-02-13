# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Concept',
            fields=[
                ('id', models.CharField(max_length=50, serialize=False, verbose_name=b'id', primary_key=True)),
                ('label', models.CharField(max_length=100, verbose_name=b'label')),
                ('comment', models.CharField(max_length=500, verbose_name=b'comment', blank=True)),
            ],
        ),
        migrations.CreateModel(
            name='ConceptSet',
            fields=[
                ('id', models.CharField(max_length=50, serialize=False, verbose_name=b'id', primary_key=True)),
                ('label', models.CharField(max_length=100, verbose_name=b'label')),
                ('comment', models.CharField(max_length=500, verbose_name=b'comment', blank=True)),
                ('concepts', models.ManyToManyField(to='annotationsets.Concept', blank=True)),
            ],
        ),
        migrations.CreateModel(
            name='LinkedConcept',
            fields=[
                ('id', models.CharField(max_length=50, serialize=False, verbose_name=b'id', primary_key=True)),
                ('label', models.CharField(max_length=100, verbose_name=b'label')),
                ('comment', models.CharField(max_length=500, verbose_name=b'comment', blank=True)),
                ('endpoint', models.URLField(max_length=300, null=True, verbose_name=b'endpoint', blank=True)),
                ('linked_type', models.URLField(max_length=300, verbose_name=b'linked_type')),
                ('provider_class', models.CharField(max_length=100, null=True, verbose_name=b'provider_class', blank=True)),
                ('custom_query', models.CharField(max_length=500, null=True, blank=True)),
                ('retrieved_at', models.DateTimeField(null=True, blank=True)),
                ('super_types', models.ManyToManyField(related_name='super_types_rel_+', to='annotationsets.LinkedConcept', blank=True)),
            ],
        ),
        migrations.CreateModel(
            name='LinkedProperty',
            fields=[
                ('id', models.CharField(max_length=50, serialize=False, verbose_name=b'id', primary_key=True)),
                ('label', models.CharField(max_length=100, verbose_name=b'label')),
                ('comment', models.CharField(max_length=500, verbose_name=b'comment', blank=True)),
                ('linked_property', models.URLField(max_length=300, verbose_name=b'linked_property')),
            ],
        ),
        migrations.CreateModel(
            name='Property',
            fields=[
                ('id', models.CharField(max_length=50, serialize=False, verbose_name=b'id', primary_key=True)),
                ('label', models.CharField(max_length=100, verbose_name=b'label')),
                ('comment', models.CharField(max_length=500, verbose_name=b'comment', blank=True)),
                ('inverse_property', models.ForeignKey(on_delete=django.db.models.deletion.SET_NULL, blank=True, to='annotationsets.Property', null=True)),
                ('linked_properties', models.ManyToManyField(to='annotationsets.LinkedProperty', blank=True)),
                ('range', models.ManyToManyField(to='annotationsets.Concept', blank=True)),
            ],
        ),
        migrations.AddField(
            model_name='concept',
            name='linked_concepts',
            field=models.ManyToManyField(to='annotationsets.LinkedConcept', blank=True),
        ),
        migrations.AddField(
            model_name='concept',
            name='properties',
            field=models.ManyToManyField(to='annotationsets.Property', blank=True),
        ),
    ]
