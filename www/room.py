#-*- coding: utf-8 -*-
from django.http import HttpResponse
from django.shortcuts import render_to_response
from django.http import Http404, HttpResponseRedirect
from django.core.urlresolvers import reverse
from django.views.decorators.csrf import csrf_exempt
from www.models import *
from www.functions import *
import pdb
#/index/
def index(request , room_seq):
	#check session
	if not checkSession(request):
		return render_to_response('index.html')

	if Room.objects.filter(seq = room_seq).count() == 0 :
		return render_to_response('roomlist.html')

	room = Room.objects.get(seq = room_seq)
	user = Member.objects.get(userID = request.session['userID'])
	
	info = {
		'name'		: room.name , 
		'room_seq'	: room_seq , 
		'userID'	: user.userID ,
		'nickname'	: user.nickname ,
		'owner'		: room.owner ,
		'sessionid'		: user.userID ,
		'curuser'	: room.getCurUserNumber() ,
		'maxuser'	: room.maxuser ,
		'gametype_letter' : room.gametype ,
		'gametype_text'	: room.get_gametype_display() ,
		'gameoption': gameOptionToText(room) , 
		'option'	: room.gameoption
	}
	return render_to_response('room.html',info)
	
def askPlay(request , room_seq):
	return render_to_response('askplay.html')

def askExit(request , room_seq):
	return render_to_response('askexit.html')

def gameOptionToText(room):
	data = ''
	if room.gametype == 'B' :
		gameoption_text = str(room.gameoption) + " 줄 완성시 승리"

	elif room.gametype == 'D' : 
		gameoption_text = "주사위 합이 큰 사람이" + dict_OUTCOME[str(room.gameoption)]

	elif room.gametype == 'L' : 
		gameoption_text =  "벌칙 목록 - "
		for penalty in eval(room.gameoption):
			gameoption_text += eval(room.gameoption)[penalty] + ' , '

	elif room.gametype == 'P' : 
		gameoption_text = "당첨 칼을 꽂는 사람이" + dict_OUTCOME[str(room.gameoption)]

	else:
		gameoption_text = "false"

	return gameoption_text #return generated text





















