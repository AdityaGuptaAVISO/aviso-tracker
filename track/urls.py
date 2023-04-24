"""
this file contains the urls for the track app
"""
from django.conf.urls import url
from django.views.decorators.csrf import csrf_exempt
from . import views

urlpatterns = [
    url(r'^pixel.png/$', views.pixel),
    url(r'^generate-pixel/$', views.generate_pixel, name='generate_pixel'),
    url(r'^track-links/$', views.track_link, name='track-links'),
    url(r'^open-link/$', views.open_link, name='track-links'),
    # url(r'^consume_open/$', views.consume_open, name='consume_open'),
    # url(r'^consume_click/$', views.consume_click, name='consume_click'),
    # url(r'^consume_unsubscribe/$', views.consume_unsubscribe, name='consume_unsubscribe'),
    # url(r'^consume_bounce/$', views.consume_bounce, name='consume_bounce'),
    # url(r'^consume_spam/$', views.consume_spam, name='consume_spam'),
]