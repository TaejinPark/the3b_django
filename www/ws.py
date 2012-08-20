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



def proc_login(user , msg):
	print 'LOGIN : ' , user , msg
	return

	
def proc_join(user , msg):
	print 'JOIN : ' , user , msg
	return


def proc_userlist(user , msg):
	print 'USERLIST : ' , user , msg
	return


def proc_chat(user , msg):
	print 'CHAT : ' , user , msg
	return


def proc_ready(user , msg):
	print 'READY : ' , user , msg
	return


def proc_unready(user , msg):
	print 'UNREADY : ' , user , msg
	return


def proc_start(user , msg):
	print 'START : ' , user , msg
	return


def proc_kick(user , msg):
	print 'KICK : ' , user , msg
	return


def proc_quit(user , msg):
	print 'QUIT : ' , user , msg
	return


def proc_change_setting  (user , msg):
	print 'CHANGESETTING : ' , user , msg
	return


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

socket_list = [] # empty socket list
def webSocket(request):
	print socket_list

	if request.environ.get('wsgi.websocket'):

		#get socket meta data
		socket = request.META['wsgi.websocket']

		#insert the socket into socket list
		request.session['sockID'] = `id(socket)`
		conn_user = MemberInRoom.objects.get(userID = request.session['userID'])
		conn_user.sockID = `id(socket)`
		conn_user.save()

		socket_list.append(socket)
		

		print '--Socket ID list--'
		for socket in socket_list:
			print request.session['userID'] , `id(socket)`
		print '------------------'

		print '---Websocket Connection---'
		print 'USER : ' , request.session['userID']
		print 'WS ID: ' , `id(socket)`
		print '--------------------------'

		#listen socket's sending data
		while True:
			msg = socket.receive()#receive data
			userID = request.session['userID']#userID

			cmd = eval(msg) #separate data
			command = cmd.get('cmd')#get command
			data = cmd.get('data')#get data

			#message
			print '--Websocket Message--'
			print 'USER : ' , userID
			print 'MSG  : ' , msg
			print 'CMD  : ' , command
			print '---------------------'

			#excute command
			try:
				print process[command]
				process[command](userID , msg)
			except :
				pass
			


			for socket in socket_list:
				socket.send(`id(socket)`)
	
	return HttpResponse("false")




