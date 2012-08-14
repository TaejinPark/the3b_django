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

socket_list = [] # empty socket list
def webSocket(request):
	print socket_list

	if request.environ.get('wsgi.websocket'):

		#get socket meta data
		socket = request.META['wsgi.websocket']

		#insert the socket into socket list
		socket_list.append(socket)
		for socket in socket_list:
			print socket

		request.session['socketID'] = `id(socket)`

		print 'Websocket User Connection'
		print 'USER : ' , request.session['userID']
		print 'WS ID: ' , `id(socket)`

		#listen socket's sending data
		while True:
			msg = socket.receive()#receive data
			print 'Websocket Message'
			print 'USER : ' , request.session['userID']
			print 'MSG  : ' , msg

			for socket in socket_list:
				print 'a'
				socket.send(msg+`id(socket)`)
	
	return HttpResponse("false")
