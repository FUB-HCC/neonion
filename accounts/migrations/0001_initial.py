# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.db.models.deletion
import django.utils.timezone
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('auth', '0001_initial'),
        ('documents', '0001_initial'),
        ('annotationsets', '0002_auto_20150818_0905'),
    ]

    operations = [
        migrations.CreateModel(
            name='User',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(default=django.utils.timezone.now, verbose_name='last login')),
                ('is_superuser', models.BooleanField(default=False, help_text='Designates that this user has all permissions without explicitly assigning them.', verbose_name='superuser status')),
                ('email', models.EmailField(unique=True, max_length=75, verbose_name=b'email address')),
                ('name', models.CharField(max_length=256, verbose_name=b'persons name', blank=True)),
                ('surname', models.CharField(max_length=256, verbose_name=b'persons surname', blank=True)),
                ('joined', models.DateTimeField(auto_now_add=True)),
                ('is_active', models.BooleanField(default=True)),
                ('groups', models.ManyToManyField(related_query_name='user', related_name='user_set', to='auth.Group', blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of his/her group.', verbose_name='groups')),
                ('hidden_documents', models.ManyToManyField(related_name=b'hidden_documents', null=True, to='documents.Document', blank=True)),
                ('owned_documents', models.ManyToManyField(to='documents.Document', null=True, blank=True)),
                ('user_permissions', models.ManyToManyField(related_query_name='user', related_name='user_set', to='auth.Permission', blank=True, help_text='Specific permissions for this user.', verbose_name='user permissions')),
            ],
            options={
                'abstract': False,
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Membership',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('date_joined', models.DateField(auto_now_add=True)),
                ('invite_reason', models.CharField(max_length=64, blank=True)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='WorkingGroup',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=128, verbose_name=b'group name')),
                ('comment', models.CharField(max_length=500, verbose_name=b'group description', blank=True)),
                ('concept_set', models.ForeignKey(on_delete=django.db.models.deletion.SET_NULL, blank=True, to='annotationsets.ConceptSet', null=True)),
                ('documents', models.ManyToManyField(to='documents.Document')),
                ('members', models.ManyToManyField(related_name=b'group_members', through='accounts.Membership', to=settings.AUTH_USER_MODEL)),
                ('owner', models.ForeignKey(related_name=b'group_owner', to=settings.AUTH_USER_MODEL, null=True)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.AddField(
            model_name='membership',
            name='group',
            field=models.ForeignKey(to='accounts.WorkingGroup'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='membership',
            name='permissions',
            field=models.ManyToManyField(to='auth.Permission', blank=True),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='membership',
            name='user',
            field=models.ForeignKey(to=settings.AUTH_USER_MODEL),
            preserve_default=True,
        ),
    ]
