# -*- coding: utf-8 -*-
from django.http import HttpResponse
from django.shortcuts import render_to_response
from django.http import Http404, HttpResponseRedirect
from django.core.urlresolvers import reverse
from django.views.decorators.csrf import csrf_exempt
# Create your views here.

def index(request):
	return render_to_response('index.html')

def roomlist(request):
	return render_to_response('roomlist.html')