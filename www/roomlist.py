# -*- coding: utf-8 -*-
from django.http import HttpResponse
from django.shortcuts import render_to_response
from django.http import Http404, HttpResponseRedirect
from django.core.urlresolvers import reverse
from django.views.decorators.csrf import csrf_exempt
from db.models import Member
from db.models import Room
from www.functions import *

#/index/
def index(request):
	return render_to_response('roomlist.html')

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
	room.roomtype	= request.POST['roomtype']
	room.gametype	= request.POST['gametype']
	room.owner		= Member.objects.get(userID = request.session['userID'])
	room.start		= u'W'
	room.password	= request.POST['password']
	room.gameoption	= request.POST['gameoption_'+room.gametype]
	room.save()
	#print room.entries()
	return HttpResponse('1')

@csrf_exempt
def getRoomListToJson(request):
	start = request.POST['start']
	keyword = request.POST['keyword']
	gametype = request.POST['type']
	#Room.objects.get() 
	print start , keyword , gametype
	return HttpResponse('false')










































