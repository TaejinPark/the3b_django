# -*- coding: utf-8 -*-
from django.http import HttpResponse
from django.shortcuts import render_to_response
from django.http import Http404, HttpResponseRedirect
from django.core.urlresolvers import reverse
from django.views.decorators.csrf import csrf_exempt
from db.models import Member
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
		
		#get data from POST data
		userID = request.POST['userID']
		password = request.POST['password']
		nickname = request.POST['nickname']
		
		#save to the database
		newUser = Member()
		newUser.userID = userID
		newUser.password = md5.md5(password).hexdigest()
		newUser.nickname = nickname
		newUser.save()

def isExistID(request): #check ID overlappiing
	if request.is_ajax() and request.method == 'POST':
		if Member.objects.filter(userID = request.POST['userID']):
			return HttpResponse('false')
		else:
			return HttpResponse('true')
	else:
		return HttpResponse('false')

def isExistNickname(request): #check nickname overlapping
	if request.is_ajax() and request.method == 'POST':
		if Member.objects.filter(nickname = request.POST['nickname']):
			return HttpResponse('false')
		else:
			return HttpResponse('true')
	else:
		return HttpResponse('false')

