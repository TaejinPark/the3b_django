# -*- coding: utf-8 -*-
from django.http import HttpResponse
from django.shortcuts import render_to_response
from django.http import Http404, HttpResponseRedirect
from django.core.urlresolvers import reverse
from django.views.decorators.csrf import csrf_exempt
from www.models import *
from www.functions import *
import json
import md5

#/index/
def index(request):
	return render_to_response('roomlist.html')

#member information handling

@csrf_exempt
def doLogout(request):
	discardSession(request)
	return HttpResponse('true')

@csrf_exempt
def doWithdraw(request):
	#get user name
	userID = request.session['userID']
	
	# delete member
	Member.objects.get(userID = userID).delete()

	# delete all result of withdraw member
	Result.objects.filter(userID = userID).delete()
	
	# discard session 
	discardSession(request) 

	return HttpResponse('true')

@csrf_exempt
def getUserInfo(request):
	m = Member.objects.get(userID = request.session['userID'])
	
	#get status
	userID = m.userID ;
	nickname = m.nickname ;

	# get all result
	all_game = Result.objects.filter(userID = userID) 

	#declare variables
	diceWin = 0
	diceLose = 0
	bingoWin = 0
	bingoLose = 0
	ladderWin = 0
	ladderLose = 0
	pirateWin = 0
	pirateLose = 0

	# get user win or lose
	for R in all_game:
		if R.gametype == 'D' and R.result == 'W':
			diceWin += 1 # get dice win result from all result
		elif R.gametype == 'D' and R.result == 'L':
			diceLose += 1 # get dice lose result from all result
		elif R.gametype == 'B' and R.result == 'W':
			bingoWin +=  1 # get bingo win result from all result
		elif R.gametype == 'B' and R.result == 'L':
			bingoLose  += 1 # get bingo lose result from all result
		elif R.gametype == 'L' and R.result == 'W':
			ladderWin += 1 # get ladder win result from all result
		elif R.gametype == 'L' and R.result == 'L':
			ladderWin += 1 # get ladder lose result from all result	
		elif R.gametype == 'P' and R.result == 'W':
			pirateWin += 1 # get pirate win result from all result
		elif R.gametype == 'P' and R.result == 'L':
			pirateLose += 1 # get pirate lose result from all result

	all_game_win = diceWin + bingoWin + ladderWin + pirateLose 
	all_game_lose= diceLose + bingoLose + ladderLose + pirateWin	

	#make json data
	rooms_json = '['
	rooms_json += json.dumps( 
		{'statusUserID'  : userID ,
		'statusNickname' : nickname,
		'statusTotal' 	: all_game_lose + all_game_win,
		'statusWin' 	: all_game_win,
		'statusLose' 	: all_game_lose,
		'bingoTotal' 	: bingoWin + bingoLose,
		'bingoWin' 		: bingoWin,
		'bingoLose' 	: bingoLose,
		'diceTotal' 	: diceWin + diceLose,
		'diceWin' 		: diceWin,
		'diceLose' 		: diceLose,
		'ladderTotal' 	: ladderWin + ladderLose,
		'ladderWin' 	: ladderWin,
		'ladderLose'	: ladderLose,
		'pirateTotal'	: pirateWin + pirateLose ,
		'pirateWin'		: pirateWin,
		'pirateLose'	: pirateLose
		}) + ','
	rooms_json += ']'

	return HttpResponse(rooms_json)



#room information handling

@csrf_exempt
def checkRoomPasswd(request):

	#get room information
	room_seq = request.POST['room_seq']
	password = md5.md5(request.POST['passwd']).hexdigest()

	#is room exist?
	if Room.objects.filter(seq = room_seq , password = password).count():
		return HttpResponse('true')
	else:
		return HttpResponse('false')


@csrf_exempt
def doMakeRoom(request):
	#make Room instance and fill values
	room = Room()
	room.name		= request.POST['name']
	room.maxuser	= request.POST['maxuser']
	room.private	= request.POST['private']
	room.roomtype	= request.POST['roomtype']
	room.gametype	= request.POST['gametype']
	room.owner		= request.session['userID']
	room.start		= u'W'
	room.gameoption	= request.POST['gameoption_'+room.gametype]
	
	# if password is exist
	if request.POST['password'] != '' : 
		room.password	= md5.md5(request.POST['password']).hexdigest()
	
	# if password not exist
	else: 
		room.password	= request.POST['password']
	
	#save room data to database
	room.save()
	return HttpResponse(room.seq)

@csrf_exempt
def joinInRoom(request):
	room_seq = int(request.POST['room_seq'])
	if Room.objects.filter(seq = room_seq).count():
		room = Room.objects.get(seq = room_seq)
		if room.getCurUserNumber() == room.maxuser:
			return HttpResponse('full')
		else:
			return HttpResponse(room_seq)
	else:
		return HttpResponse('false')

@csrf_exempt
def getRoomListToJson(request):

	#get data to excute query
	start = request.POST['start']
	keyword = request.POST['keyword']
	gametype = request.POST['type']
	
	#set game type
	if gametype == 'A': # all type
		gametype = [u'B',u'D',u'L',u'P']
	else:
		gametype = [gametype]

	#excute query and get data
	roomlist = Room.objects.filter(name__icontains = keyword , gametype__in = gametype)
	
	#get the number of rooms
	room_number = roomlist.count()
	
	#if data is empty
	if room_number == 0:
		#there is no waiting room
		rooms_json = '[]'
	
	#make room list as JSON
	else :
		#set the number of additional room list
		start = int(start)
		end = room_number - start

		if end > 15: 
			#15 room list is shown per when user request
			end = start + 15
		else:
			end += start

		#make json
		rooms_json = '['
		for room in roomlist[start:end] :
			rooms_json += json.dumps( 
			{'room_seq'	:room.seq,
			'name'		: room.name,
			'maxuser'	: room.maxuser,
			'participant':room.getCurUserNumber(),
			'private'	: room.get_private_display(),
			'roomtype'	: room.get_roomtype_display(),
			'gametype'	: room.gametype,
			'gametype_text'	: room.get_gametype_display(),
			'owner'		: room.owner,
			'password'	: room.password,
			'gameoption': room.gameoption,
			'start'		: room.start,
			}) + ','
		rooms_json += ']'

	return HttpResponse(rooms_json)

