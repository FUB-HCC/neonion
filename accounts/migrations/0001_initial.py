# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.db.models.deletion
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('documents', '0001_initial'),
        ('auth', '0006_require_contenttypes_0002'),
        ('annotationsets', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='User',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(null=True, verbose_name='last login', blank=True)),
                ('is_superuser', models.BooleanField(default=False, help_text='Designates that this user has all permissions without explicitly assigning them.', verbose_name='superuser status')),
                ('username', models.CharField(unique=True, max_length=150, verbose_name=b'username')),
                ('email', models.EmailField(unique=True, max_length=254, verbose_name=b'email address')),
                ('name', models.CharField(max_length=256, verbose_name=b'persons name', blank=True)),
                ('surname', models.CharField(max_length=256, verbose_name=b'persons surname', blank=True)),
                ('joined', models.DateTimeField(auto_now_add=True)),
                ('is_active', models.BooleanField(default=True)),
                ('is_staff', models.BooleanField(default=False)),
                ('groups', models.ManyToManyField(related_query_name='user', related_name='user_set', to='auth.Group', blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', verbose_name='groups')),
                ('hidden_documents', models.ManyToManyField(related_name='hidden_documents', to='documents.Document', blank=True)),
                ('owned_documents', models.ManyToManyField(to='documents.Document', blank=True)),
                ('user_permissions', models.ManyToManyField(related_query_name='user', related_name='user_set', to='auth.Permission', blank=True, help_text='Specific permissions for this user.', verbose_name='user permissions')),
            ],
        ),
        migrations.CreateModel(
            name='Membership',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('date_joined', models.DateField(auto_now_add=True)),
                ('invite_reason', models.CharField(max_length=64, blank=True)),
            ],
        ),
        migrations.CreateModel(
            name='WorkingGroup',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=128, verbose_name=b'group name')),
                ('comment', models.CharField(max_length=500, verbose_name=b'group description', blank=True)),
                ('concept_set', models.ForeignKey(on_delete=django.db.models.deletion.SET_NULL, blank=True, to='annotationsets.ConceptSet', null=True)),
                ('documents', models.ManyToManyField(to='documents.Document', blank=True)),
                ('members', models.ManyToManyField(related_name='group_members', through='accounts.Membership', to=settings.AUTH_USER_MODEL)),
                ('owner', models.ForeignKey(related_name='group_owner', to=settings.AUTH_USER_MODEL, null=True)),
            ],
        ),
        migrations.AddField(
            model_name='membership',
            name='group',
            field=models.ForeignKey(to='accounts.WorkingGroup'),
        ),
        migrations.AddField(
            model_name='membership',
            name='permissions',
            field=models.ManyToManyField(to='auth.Permission', blank=True),
        ),
        migrations.AddField(
            model_name='membership',
            name='user',
            field=models.ForeignKey(to=settings.AUTH_USER_MODEL),
        ),
    ]
