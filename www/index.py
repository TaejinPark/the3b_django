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
@csrf_exempt
def doLogin(request):
	print request.POST	
	if request.is_ajax() and request.method == 'POST': #check request data
		
		m = Member.objects.filter(userID=request.POST['userID']) #get userID from request data

		if m.count() == 0: #there is no exist userID
			return HttpResponse('false')

		elif m.password == md5.md5(request.POST['password']).hexdigest(): #compare password
			setSession(request,m.userID)#make new session
			return HttpResponse('true')
		
		else:
			return HttpResponse('false')#mismatch password	
	
	else:
		return HttpResponse('false')

@csrf_exempt
def doJoin(request):
	if request.is_ajax() and request.method == 'POST':
		# check validation
		userID = request.POST['userID']
		userNickname = request.POST['nickname']
		if (checkID(userID) == False) and (checkNickname(userNickname) == False) :
			#set data to Member instance
			newUser = Member()
			newUser.userID = userID
			newUser.nickname = userNickname
			newUser.password = md5.md5(request.POST['password']).hexdigest()
			newUser.save()#save to the database
			setSession(request,userID)
			return HttpResponse('true')
		else:
			return HttpResponse('false')

	else:
		HttpResponse('false')

@csrf_exempt
def isExistID(request): #check ID overlappiing
	if checkID(request.POST['userID']):
		return HttpResponse('false')
	else:
		return HttpResponse('true')

@csrf_exempt
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

