# -*- coding: utf-8 -*-
from django.http import HttpResponse
from django.shortcuts import render_to_response
from django.http import Http404, HttpResponseRedirect
from django.core.urlresolvers import reverse
from django.views.decorators.csrf import csrf_exempt
from db.models import *
from www.functions import *
import gevent

#/index/
def index(request , room_seq):
	if Room.objects.filter(seq = room_seq).count() == 0:
		return render_to_response('roomlist.html')

	return render_to_response('playroom.html')

def askPlay(request , room_seq):
	return render_to_response('askplay.html')

def askExit(request , room_seq):
	return render_to_response('askexit.html')

def modify_message(message):
    return message.lower()

def webSocket(request):
	if request.environ.get('wsgi.websocket'):
		ws = request.META['wsgi.websocket']

		socks.append(ws)
		while True:
			msg = ws.receive()
			for sock in socks:
				sock.send(msg+`id(ws)`)
	
	return HttpResponse("false")
