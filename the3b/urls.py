from django.conf.urls import patterns, include, url

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

import os
ROOT_PATH = os.path.dirname(__file__)

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'the3b.views.home', name='home'),
    # url(r'^the3b/', include('the3b.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),

    #index view url
    url(r'^$','www.index.index'),
    url(r'^index/','www.index.index'),
    url(r'^doLogin/','www.index.doLogin'),
    url(r'^doJoin/','www.index.doJoin'),
    url(r'^isExistID/','www.index.isExistID'),
    url(r'^isExistNickname/','www.index.isExistNickname'),

    #room view url
    url(r'^doLogout/','www.roomlist.doLogout'),
    url(r'^roomlist/','www.roomlist.index'),
    
    #media(js,css,image file) url
    url(r'^media/(?P<path>.*)$', 'django.views.static.serve', {'document_root': ROOT_PATH+'/../media/'}),
)
