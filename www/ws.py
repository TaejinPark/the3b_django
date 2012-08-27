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
import pdb

socket_list = [] # empty socket list

def sendToAll(user,msg):
	room_seq = MemberInRoom.objects.get(userID = user).room_seq
	members = MemberInRoom.objects.filter(room_seq = room_seq)
	for socket in socket_list:
		sockID = int(`id(socket)`)
		for member in members:
			if int(member.sockID) == sockID:
				socket.send(msg)
	
	print 'SendToALL : ' , msg #status message

def proc_login(user , data , request):
	#make return message
	ret = {'cmd':'OK','data':''}
	ret = json.dumps(ret)

	print 'LOGIN : ' , user , data , ret #status message
	return ret

def proc_join(user , data , request):
	
	#get data if join user
	member = Member.objects.get(userID = user)
	
	#set data to send message
	data = {'userID'	: member.userID ,
			'nickname'	: member.nickname }
	msg = {'cmd':'JOIN','data':data}
	msg = json.dumps(msg)

	#set data to print message
	ret = {'cmd':'OK','data':''}
	ret = json.dumps(ret)
	
	sendToAll(user , msg)

	print 'JOIN : ' , user , data , ret #status message
	return ret


def proc_userlist(user , data , request):
	print 'USERLIST'
	room_seq = MemberInRoom.objects.get(userID = user).room_seq
	memlist = MemberInRoom.objects.filter(room_seq = room_seq)
	members = []
	for member in memlist:
		member = Member.objects.get(userID = member.userID)
		data = {'userID' : member.userID , 'nickname' : member.nickname }
		members.append(data)

	msg = {'cmd':'USERLIST','data':members}
	msg = json.dumps(msg)

	sendToAll(user , msg)

	print 'USERLIST : ' , user , data , ret #status message
	return ret


def proc_chat(user , data , request):
	print 'CHAT : ' , user , data  #status message
	conn_user = Member.objects.get(userID = user)
	data = {'nickname':conn_user.nickname,'Message':data['Message']}
	msg = {'cmd':'CHAT','data':data}
	msg = json.dumps(msg)
	sendToAll(user , msg)
	return ret


def proc_ready(user , data , request):
	print 'READY : ' , user , data , ret #status message
	return ret


def proc_unready(user , data , request):
	print 'UNREADY : ' , user , data , ret #status message
	return ret


def proc_start(user , data , request):
	print 'START : ' , user , data , ret #status message
	return ret


def proc_kick(user , data , request):
	print 'KICK : ' , user , data , ret #status message
	return ret

#to do
def proc_quit(user , data , request):
	conn_user = Member.objects.get(userID = user)
	data = {'nickname':conn_user.nickname}
	msg = {'cmd':'QUIT','data':data}
	msg = json.dumps(msg)
	sendToAll(user , msg)
	conn_user = MemberInRoom.objects.get(userID = user)
	conn_user.delete()
	print 'QUIT : ' , user , msg #status message
	return

def proc_change_setting  (user , data , request):
	print 'CHANGESETTING : ' , user , msg #status message
	print data
	return data
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
def webSocket(request,room_seq):
	if request.environ.get('wsgi.websocket'):
		#print socket list and check disconnected socket
		for index in range(len(socket_list)):
			try:
				socket_list[index].send(json.dumps({'cmd':'OK','data':''}))
			except:
				socket_list.pop(index)
		print 'Socket List Check: Done'

		#check session (check user's login)
		print 'Check Session' ,
		if not checkSession(request):
			return HttpResponse("false")
		print ': Done'
		
		#get socket meta data
		socket = request.META['wsgi.websocket']
		print 'Get Socket : Done'

		
		#insert the socket into socket list
		userID = request.session['userID']
		if MemberInRoom.objects.filter(userID = userID).count():
			conn_user = MemberInRoom.objects.get(userID = userID)
		else:
			conn_user = MemberInRoom()

		request.session['sockID'] = `id(socket)`
		conn_user.userID = userID
		conn_user.room_seq = room_seq
		conn_user.sockID = `id(socket)`
		conn_user.save()
		print 'Set Data : Done' ,
		
		socket_list.append(socket)
		print 'Add Socket to Socket List : Done'
		
		print '--Socket ID list--'
		for index in range(len(socket_list)):
				print index , MemberInRoom.objects.get(sockID = `id(socket_list[index])`).userID ,
				print `id(socket_list[index])`

		print 'Connect : ' , request.session['userID'] , `id(socket)`
		
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
			
			socket.send(cmd)
	
	return HttpResponse("false")




