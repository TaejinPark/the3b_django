# -*- coding: utf-8 -*-
from django.http import HttpResponse
from django.shortcuts import render_to_response
from django.http import Http404, HttpResponseRedirect
from django.core.urlresolvers import reverse
from django.views.decorators.csrf import csrf_exempt
import json
#pdb.set_trace()
#manage session
def checkSession(request):
	try:
		if request.session['userID']:
			return True
	except:
		return False

def discardSession(request):
	del request.session['userID']

def setSession(request,userID):
	request.session['userID'] = userID

def getSession(request):
	return request.session['userID']
	
#manage login
@csrf_exempt
def checkLogin(request):
	if checkSession(request):
		return HttpResponse('true')
	else:
		return HttpResponse('false')
