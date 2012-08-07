# -*- coding: utf-8 -*-
from django.http import HttpResponse
# Create your views here.
def index(request):
	html = '<html>hello world</html>' 
	return HttpResponse(html)
		