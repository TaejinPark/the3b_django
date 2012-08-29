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
the3b_debug = False
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
	return ret

def proc_join(user , data , request):
	
	#get data if join user
	member = Member.objects.get(userID = user)
	
	#set data to send message
	data = {'userID'	: member.userID ,
			'nickname'	: member.nickname }
	msg = {'cmd':'JOIN','data':data}
	msg = json.dumps(msg)
	sendToAll(user , msg)

	#set data to print message
	ret = {'cmd':'OK','data':''}
	ret = json.dumps(ret)
	return ret


def proc_userlist(user , data , request):
	#get room sequence number
	room_seq = MemberInRoom.objects.get(userID = user).room_seq
	
	#get member list in room
	memlist = MemberInRoom.objects.filter(room_seq = room_seq)
	
	#get member name in member list
	members = []
	for member in memlist:
		member = Member.objects.get(userID = member.userID)
		data = {'userID' : member.userID , 'nickname' : member.nickname }
		members.append(data)

	#make json and send user list
	ret = {'cmd':'USERLIST','data':members}
	ret = json.dumps(ret)	
	return ret


def proc_chat(user , data , request):
	#send chat message wirh user nickname
	conn_user = Member.objects.get(userID = user)
	data = {'nickname':conn_user.nickname,'Message':data['Message']}
	msg = {'cmd':'CHAT','data':data}
	msg = json.dumps(msg)
	sendToAll(user , msg)
	return


def proc_ready(user , data , request):
	
	#set ready flag to user in MemberInRoom
	conn_user = MemberInRoom.objects.get(userID = user)
	conn_user.ready=u'R'
	conn_user.save()
	conn_user = Member.objects.get(userID = user)

	#make to send data and send message to all user in same room
	data = {'nickname':conn_user.nickname}
	msg = {'cmd':'READY','data':data}
	msg = json.dumps(msg)
	sendToAll(user , msg)
	
	#make return message about ready command
	ret = {'cmd':'OK','data':''}
	ret = json.dumps(ret)	
	return ret


def proc_unready(user , data , request):
	#set ready flag to user in MemberInRoom
	conn_user = MemberInRoom.objects.get(userID = user)
	conn_user.ready=u'W'
	conn_user.save()
	conn_user = Member.objects.get(userID = user)

	#make to send data and send message to all user in same room
	data = {'nickname':conn_user.nickname}
	msg = {'cmd':'UNREADY','data':data}
	msg = json.dumps(msg)
	sendToAll(user , msg)
	
	#make return message about ready command
	ret = {'cmd':'OK','data':''}
	ret = json.dumps(ret)	
	return ret


def proc_start(user , data , request):
	msg = {'cmd':'START','data':''}
	msg = json.dumps(msg)
	sendToAll(user , msg)

	if the3b_debug == True:
		print 'START : ' , user , data , ret #status message
	return ret


def proc_kick(user , data , request):
	#get room information
	room_seq = MemberInRoom.objects.get(userID = user).room_seq
	room = Room.objects.get(seq = room_seq)

	#check user who want to kick owner is owner
	if not user == room.owner:
		return

	#send kick message to all user in same room
	kicked = Member.objects.get(userID = data['userID'])
	data = {'nickname':kicked.nickname,'userID':kicked.userID}
	msg = {'cmd':'KICK','data':data}
	msg = json.dumps(msg)
	sendToAll(user , msg)

	#delete kicked user's socket from socket list
	kicked = MemberInRoom.objects.get(userID = kicked.userID)
	for index in range(len(socket_list)):
		if int(kicked.sockID) == int(`id(socket_list[index])`):
			socket_list.pop(index)

	#remove MemeberInRoom data
	kicked.delete()

	#make return message about Kick command
	ret = {'cmd':'OK','data':''}
	ret = json.dumps(ret)
	return 

#to do
def proc_quit(user , data , request):

	#send quit meesage to all user in the same room
	conn_user = Member.objects.get(userID = user)
	data = {'nickname':conn_user.nickname}
	msg = {'cmd':'QUIT','data':data}
	msg = json.dumps(msg)
	sendToAll(user , msg)
	
	#delete socket from socket list
	conn_user = MemberInRoom.objects.get(userID = user)
	room_seq = conn_user.room_seq
	for index in range(len(socket_list)):
		if int(conn_user.sockID) == int(`id(socket_list[index])`):
			socket_list.pop(index)
	
	#delete MemberInRoom data
	conn_user.delete()

	room = Room.objects.get(seq = room_seq)	

	if user == room.owner:
		if room.getCurUserNumber() == 0:
			#destroy the room
			print 'BOOM : ' , room
			room.delete()		
		else:
			#change owner
			new_owner = MemberInRoom.objects.filter(room_seq = room.seq)[0]
			room.owner = new_owner.userID
			room.save()
			new_owner = Member.objects.get(userID = room.owner)
			data = {'userID' : new_owner.userID , 'nickname' : new_owner.nickname }
			msg = {'cmd':'CHANGE_OWNER','data':data}
			msg = json.dumps(msg)
			sendToAll(new_owner.userID , msg)

	return

def proc_change_setting  (user , data , request):
	print 'CHANGE_SETTING : ' , user , msg #status message
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
	#check session (check user's login)		
	if not checkSession(request):
		return HttpResponse("false")
		
	if request.environ.get('wsgi.websocket'):
		#print socket list and check disconnected socket
		for index in range(len(socket_list)):
			try:
				socket_list[index].send(json.dumps({'cmd':'OK','data':''}))
			except:
				socket_list.pop(index)
		
		#get socket meta data
		socket = request.META['wsgi.websocket']
		request.session['sockID'] = `id(socket)`

		#add socket to socket list
		socket_list.append(socket)

		#make MemberInRoom data		
		userID = request.session['userID']
		if MemberInRoom.objects.filter(userID = userID).count():
			conn_user = MemberInRoom.objects.get(userID = userID)
		else:
			conn_user = MemberInRoom()
		conn_user.userID = userID
		conn_user.room_seq = room_seq
		conn_user.sockID = `id(socket)`
		conn_user.save()
		
		print 'Connect :' , request.session['userID'] , `id(socket)`
		
		'''
		print '--Socket ID list--'
			for index in range(len(socket_list)):
					print index , MemberInRoom.objects.get(sockID = `id(socket_list[index])`).userID ,
					print `id(socket_list[index])`
		'''
		
		#listen socket's sending data
		while True:
			msg = socket.receive()#receive data
			userID = request.session['userID']#userID

			msg = eval(msg) #separate data
			command = msg.get('cmd')#get command
			data = msg.get('data')#get data

			#message
			print 'Recv :' , userID , msg
		
			#excute command
			try:
				cmd = process[command](userID , data , request)
				socket.send(cmd)
				print 'Send :' , cmd
			except :
				print 'Send : No'
				continue
	
	return HttpResponse("false")




