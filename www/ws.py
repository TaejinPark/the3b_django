# -*- coding: utf-8 -*-
from django.http import HttpResponse
from django.shortcuts import render_to_response
from django.http import Http404, HttpResponseRedirect
from django.core.urlresolvers import reverse
from django.views.decorators.csrf import csrf_exempt
from www.models import *
from www.functions import *
import gevent
import ast

socket_list = [] # empty socket list

def sendToAll(user,msg):
	for socket in socket_list:
		socket.send(msg)
	print 'SendToALL : ' , msg

def proc_login(user , data , request):
	
	ret = {'cmd':'OK','data':''}
	ret = json.dumps(ret)
	print 'LOGIN : ' , user , data , ret
	return ret

def proc_join(user , data , request):
	
	member = Member.objects.get(userID = user)
	
	data = {'userID'	: member.userID ,
			'nickname'	: member.nickname }
	msg = {'cmd':'JOIN','data':data}
	msg = json.dumps(msg)

	ret = {'cmd':'OK','data':''}
	ret = json.dumps(ret)
	
	sendToAll(user , msg)
	print 'JOIN : ' , user , data , ret
	return ret


def proc_userlist(user , data , request):
	room_seq = MemberInRoom.objects.get(userID = user).room_seq
	
	print 'USERLIST : ' , user , data , ret
	return ret


def proc_chat(user , data , request):
	print 'CHAT : ' , user , data , ret
	return ret


def proc_ready(user , data , request):
	print 'READY : ' , user , data , ret
	return ret


def proc_unready(user , data , request):
	print 'UNREADY : ' , user , data , ret
	return ret


def proc_start(user , data , request):
	print 'START : ' , user , data , ret
	return ret


def proc_kick(user , data , request):
	print 'KICK : ' , user , data , ret
	return ret


def proc_quit(user , data , request):
	print 'QUIT : ' , user , data , ret
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
process = {
	'LOGIN' 			: proc_login ,
	'JOIN' 				: proc_join ,
	'USERLIST' 			: proc_userlist ,
	'CHAT' 				: proc_chat ,
	'READY' 			: proc_ready ,
	'UNREADY' 			: proc_unready ,
	'START' 			: proc_start ,
	'KICK' 				: proc_kick ,
	'QUIT' 				: proc_quit ,
	'CHANGE_SETTING' 	: proc_change_setting  
}
#import pdb;pdb.set_trace();
def webSocket(request):
	if request.environ.get('wsgi.websocket'):

		#print socket list and check disconnected socket
		for index in range(len(socket_list)):
			try:
				socket_list[index].send(json.dumps({'cmd':'OK','data':''}))
			except:
				print 'Pop - ' , 
				print MemberInRoom.objects.get(sockID = `id(socket_list[index])`).userID ,
				socket_list.pop(index)

		#check session (check user's login)
		print 'Check Session' ,
		if not checkSession(request):
			return HttpResponse("false")
		print ': Done'
		
		print 'Get Socket' , 
		#get socket meta data
		socket = request.META['wsgi.websocket']
		print ': Done'

		print 'Set Data' ,
		#insert the socket into socket list
		request.session['sockID'] = `id(socket)`
		conn_user = MemberInRoom.objects.get(userID = request.session['userID'])
		conn_user.sockID = `id(socket)`
		conn_user.save()
		print ': Done'

		print 'Add Socket to Socket List' ,		
		socket_list.append(socket)
		print ': Done'



		print 'Socket List Check: Done'
		
		print '--Socket ID list--'
		for index in range(len(socket_list)):
				print MemberInRoom.objects.get(sockID = `id(socket_list[index])`).userID ,
				print `id(socket_list[index])`
		print '------------------'

		print '---Websocket Connection---'
		print 'USER : ' , request.session['userID']
		print 'WS ID: ' , `id(socket)`
		print '--------------------------'

		#listen socket's sending data
		while True:
			msg = socket.receive()#receive data
			userID = request.session['userID']#userID

			msg = eval(msg) #separate data
			command = msg.get('cmd')#get command
			data = msg.get('data')#get data

			#message
			print 'Recv : ' , userID , msg

			#excute command
			try:
				cmd = process[command](userID , data , request)
			except :
				continue
			
			try:
				if cmd:
					socket.send(cmd)
			except:
				pass
	
	return HttpResponse("false")




