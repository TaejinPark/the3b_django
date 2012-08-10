# -*- coding: utf-8 -*-
from django.http import HttpResponse
from django.shortcuts import render_to_response
from django.http import Http404, HttpResponseRedirect
from django.core.urlresolvers import reverse
from django.views.decorators.csrf import csrf_exempt
from db.models import *
from www.functions import *
import md5 

#/index/
def index(request):
	return render_to_response('index.html')

#/index/doLogin
def doLogin(request):
	if request.is_ajax() and request.method == 'POST': #check request data
		m = Member.objects.get(userID=request.POST['userID']) #get userID from request data
		if m.password == request.POST['password']: #compare password
			discardSession(request) #discard already exist session
			request.session['userID'] = m.userID #make new session
			return HttpResponse('true')
		else:
			return HttpResponse('false')#not exist id or mismatch id and password

def doJoin(request):
	if request.is_ajax() and request.method == 'POST':
		# check validation
		userID = request.POST['userID']
		userNickname = request.POST['nickname']
		if (checkID(userID) == False) and (checkNickname(userNickname) == False) :
			#save to the database
			newUser = Member()
			newUser.userID = userID
			newUser.nickname = userNickname
			newUser.password = request.POST['password']
			print newUser.userID , newUser.nickname , newUser.password , newUser.penalty , newUser.participation
			newUser.save()
			
			return HttpResponse('true')
		else:
			return HttpResponse('false')
	else:
		HttpResponse('false')

def isExistID(request): #check ID overlappiing
	if checkID(request.POST['userID']):
		return HttpResponse('false')
	else:
		return HttpResponse('true')

def isExistNickname(request): #check nickname overlapping
	if checkNickname(request.POST['nickname']):
		return HttpResponse('false')
	else:
		return HttpResponse('true')

def checkID(ID):
	if Member.objects.filter(userID = ID):
		return True
	else:
		return False

def checkNickname(Nickname):
	if Member.objects.filter(nickname=Nickname):
		return True
	else:
		return False
