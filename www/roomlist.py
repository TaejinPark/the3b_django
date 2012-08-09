# -*- coding: utf-8 -*-
from django.http import HttpResponse
from django.shortcuts import render_to_response
from django.http import Http404, HttpResponseRedirect
from django.core.urlresolvers import reverse
from django.views.decorators.csrf import csrf_exempt
from db.models import Member;

#/index/
def index(request):
	return render_to_response('roomlist.html')

def doLogout(request):
	request.session['userID'] = 0
	return HttpResponse()