# -*- coding: utf-8 -*-
from django.http import HttpResponse
from django.shortcuts import render_to_response
from django.http import Http404, HttpResponseRedirect
from django.core.urlresolvers import reverse
from django.views.decorators.csrf import csrf_exempt
import json

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



def proc_login(user , data , request):
	print 'LOGIN : ' , user , data , 
	ret = {'cmd':'OK','data':''}
	ret = json.dumps(ret)
	print ret
	return ret


def proc_join(user , data , request):
	print 'JOIN : ' , user , data ,
	member = Member.objects.get(userID = user)
	data = {'userID'	: member.userID ,
			'nickname'	: member.nickname }
	ret = {'cmd':'OK','data':''}
	ret = json.dumps(ret)
	print ret
	return ret


def proc_userlist(user , data , request):
	print 'USERLIST : ' , user , data ,
	print ret
	return ret


def proc_chat(user , data , request):
	print 'CHAT : ' , user , data ,
	print ret
	return ret


def proc_ready(user , data , request):
	print 'READY : ' , user , data ,
	print ret
	return ret


def proc_unready(user , data , request):
	print 'UNREADY : ' , user , data ,
	print ret
	return ret


def proc_start(user , data , request):
	print 'START : ' , user , data ,
	print ret
	return ret


def proc_kick(user , data , request):
	print 'KICK : ' , user , data ,
	print ret
	return ret


def proc_quit(user , data , request):
	print 'QUIT : ' , user , data ,
	print ret
	return ret

@csrf_exempt
def disconnectRoom(request):
	print 'disconnectRoom'
	
	conn_user = MemberInRoom.objects.get(userID = request.session['userID'])
	sockID = conn_user.sockID
	conn_user.sockID = 0 ;
	conn_user.save()

	for a in range(len(socket_list)):
		print sockID , `id(socket_list[a])`
		if sockID == `id(socket_list[a])`:
			socket_list.pop(a)

	return HttpResponse('')

def proc_change_setting  (user , msg , request):
	print 'CHANGESETTING : ' , user , msg
	print msg
	return msg