"""
Celery config file

https://docs.celeryproject.org/en/stable/django/first-steps-with-django.html

"""
from __future__ import absolute_import
import os
from celery import Celery
import settings

# This code is a copy of manage.py.
# Set the "celery Django" app's default Django settings module.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_celery_example.settings')

# you change the name here -Django Celery
app = Celery("aviso_tracker")

# read configuration from Django settings, creating celery Django with the CELERY namespace
# config keys have the prefix "CELERY" Django Celery
app.config_from_object('django.conf:settings', namespace='CELERY')

# load tasks.py in django apps - Django Celery
app.autodiscover_tasks(lambda: settings.INSTALLED_APPS)


@app.task
def add(x, y):
    return x / y
# init.py - django redis
# Let's keep modifying django_celery_example/__init__.py

# from __future__ import absolute_import, unicode_literals

# The application will always be imported as a result of this.
#Django launches so that shared taskS can use this application.- django redis

from .celery import app as celery_app

__all__ = ('celery_app',)
