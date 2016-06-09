#!/usr/bin/env python
import os
import sys

if __name__ == "__main__":

    # set production environment 
    #os.environ.setdefault("DJANGO_SETTINGS_MODULE", "settings.production")

    # set development environment
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "settings.development")

    # set test environment
    #os.environ.setdefault("DJANGO_SETTINGS_MODULE", "settings.test")

    from django.core.management import execute_from_command_line

    execute_from_command_line(sys.argv)
