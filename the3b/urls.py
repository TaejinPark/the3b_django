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

    #index url
    url(r'^$','www.index.index'),
    url(r'^index/$','www.index.index'),
    url(r'^doLogin/$','www.index.doLogin'),
    url(r'^doJoin/$','www.index.doJoin'),
    url(r'^isExistID/$','www.index.isExistID'),
    url(r'^isExistNickname/$','www.index.isExistNickname'),

    #roomlist url
    url(r'^doLogout/$','www.roomlist.doLogout'),
    url(r'^roomlist/$','www.roomlist.index'),
    url(r'^doMakeRoom/$','www.roomlist.doMakeRoom'),
    url(r'^joinInRoom/$','www.roomlist.joinInRoom'),
    url(r'^getRoomListToJson/$','www.roomlist.getRoomListToJson'),
    url(r'^getUserInfo/$','www.roomlist.getUserInfo'),
    url(r'^doWithdraw/$','www.roomlist.doWithdraw'),
    url(r'^checkRoomPasswd/$','www.roomlist.checkRoomPasswd'),
    

    #room url
    url(r'^room/(?P<room_seq>\d+)/$','www.room.index'),
    url(r'^room/(?P<room_seq>\d+)/askexit\.html/$','www.room.askExit'),
    url(r'^room/(?P<room_seq>\d+)/askplay\.html/$','www.room.askPlay'),


    #websocket
    url(r'^WS/$','www.ws.webSocket'),
    url(r'^disconnectRoom/$','www.ws.disconnectRoom'),

    #functions url
    url(r'^checkLogin/','www.functions.checkLogin'),

    #media(js,css,image file) url
    url(r'^media/(?P<path>.*)$', 'django.views.static.serve', {'document_root': ROOT_PATH+'/../media/'}),
)
