# -*- coding: utf-8 -*-
from django.http import HttpResponse
from django.shortcuts import render_to_response
from django.http import Http404, HttpResponseRedirect
from django.core.urlresolvers import reverse
from django.views.decorators.csrf import csrf_exempt
from db.models import *
from www.functions import *
import json
import md5

#/index/
def index(request):
	return render_to_response('roomlist.html')

@csrf_exempt
def doLogout(request):
	discardSession(request)
	return HttpResponse('true')

@csrf_exempt
def doMakeRoom(request):
	#make Room instance and fill values
	room = Room()
	room.name		= request.POST['name']
	room.maxuser	= request.POST['maxuser']
	room.private	= request.POST['private']
	room.participant= 1
	room.roomtype	= request.POST['roomtype']
	room.gametype	= request.POST['gametype']
	room.owner		= Member.objects.get(userID = request.session['userID'])
	room.start		= u'W'
	room.gameoption	= request.POST['gameoption_'+room.gametype]

	if request.POST['password'] != '' : # if password is exist
		room.password	= md5.md5(request.POST['password']).hexdigest()
	else: # if password not exist
		room.password	= request.POST['password']
	
	room.save()#save room data to database

	return HttpResponse(room.seq)

@csrf_exempt
def getRoomListToJson(request):

	#get data to excute query
	start = request.POST['start']
	keyword = request.POST['keyword']
	gametype = request.POST['type']
	
	#set game type
	if gametype == 'A': # all type
		gametype = [u'B',u'D',u'L',u'P']
	else:
		gametype = [gametype]

	#excute query and get data
	roomlist = Room.objects.filter(name__icontains = keyword , gametype__in = gametype)
	
	room_number = roomlist.count() #get the number of rooms
	
	if room_number == 0: #if data is empty
		rooms_json = '[]' #there is no waiting room
	
	else : #make room list as JSON
		start = int(start)
		end = room_number - start
		if end > 15:
			end = start + 15
		else:
			end += start

		rooms_json = '['
		for room in roomlist[start:end] :
			rooms_json += json.dumps( 
			{'room_seq'		:room.seq,
			'name'		: room.name,
			'maxuser'	: room.maxuser,
			'participant':room.participant,
			'private'	: room.private,
			'roomtype'	: room.roomtype,
			'gametype'	: room.gametype,
			'owner'		: room.owner,
			'password'	: room.password,
			'gameoption': room.gameoption,
			'start'		: room.start,
			}) + ','
		rooms_json = rooms_json + ']'
	return HttpResponse(rooms_json)

@csrf_exempt
def getUserInfo(request):
	pass







































