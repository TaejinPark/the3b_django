from www.models import *
from www.functions import *
import random
import ast
import pdb


pirate_pick_number = {}
bingo_ready_member_list = {}

#initial game setting
def initialGameSetting(user ,room):
	if room.gametype == 'P':
		#pick up random number
		pick_number = random.randrange(0,15)
		
		#set random number at pirate_pick_number
		pirate_pick_number.update({room.seq:pick_number})
		turn = turnPrevCurNext(user)
		return turn
	elif room.gametype == 'B':
		#set members in list
		memlist = MemberInRoom.objects.filter(room_seq = room.seq)
		
		for mem in memlist:
			bingo_ready_member_list.update({room.seq:{mem.userID:'W'}})
		

#dice functions
def dice_cmp(dict1 , dict2):
	return cmp(dict1.get(dict1.keys()[0]),dict2.get(dict2.keys()[0]))


temp_room_result = {} #temporary dice result storage
def proc_game_dice_result(user , data , request):
	#get information
	conn_user = MemberInRoom.objects.get(userID = user)
	room_seq = conn_user.room_seq
	room = Room.objects.get(seq = room_seq)
	conn_user = Member.objects.get(userID = user)

	#make temporary result data
	if temp_room_result.get(room_seq):
		temp_room_result[room_seq].update({conn_user.nickname:data})
	else:
		temp_room_result.update({room_seq:{conn_user.nickname:data}})

	#make result data
	if len(temp_room_result.get(room_seq).keys()) == room.getCurUserNumber():
		result_list = []
		for result in temp_room_result.get(room_seq):
			result_list.append({result:temp_room_result[room_seq][result]})

		#delete temporary result from temporary result list
		temp_room_result.pop(room_seq)

		#sort result
		result_list.sort(cmp = dice_cmp)
		
		#game option
		if room.gameoption == 'W':
			result_list.reverse()

		#make ranking
		ranking = 1
		next_ranking = 1
		winner_value = result_list[0].get(result_list[0].keys()[0])

		for index in range(len(result_list)):
			
			#make result data per member in room
			result = Result()
			result.userID = Member.objects.get(nickname = result_list[index].keys()[0]).userID
			result.gametype = room.gametype
			result.gameoption = room.gameoption

			iter_user_value = result_list[index].get(result_list[index].keys()[0])
			
			if winner_value == iter_user_value:
				result.result = ranking
			else:
				result.result = next_ranking
				ranking += 1

			next_ranking += 1

			result_list[index] = {'nickname':result_list[index].keys()[0],'value':iter_user_value,'ranking':result.result}
			
			if ranking == 1 :
				result.result = 'W'
			else:
				result.result = 'L'

			#save to database
			result.save()

		msg = {'cmd':'RESULT','data':{'cmd':'DICE_RESULT','data':result_list}}
		ret = {'cmd':'','data':''}
		ret_msg = {'ret':ret,'msg':msg}
		return ret_msg


#pirate functions
def proc_game_pirate_knife_select(user , data , request):
	knifenumber = data #get knife number
	conn_user = Member.objects.get(userID = user)
	nickname = conn_user.nickname
	room_seq = MemberInRoom.objects.get(userID = user).room_seq
	
	
	if pirate_pick_number[room_seq] == knifenumber:
		msg = make_pirate_result(user,room_seq)
	else:
		turn = turnPrevCurNext(user) #get turn
		msg = {'cmd':'GAMECMD','data':{'cmd':'PIRATE_KNIFE_SELECT','data':{'nickname':nickname,'knifenumber':knifenumber,'turn':turn}}}
		
	ret = {'cmd':'','data':''}
	ret_msg = {'ret':ret,'msg':msg}	
	return ret_msg

def make_pirate_result(user,room_seq):
	room = Room.objects.get(seq = room_seq)
	user_list = MemberInRoom.objects.filter(room_seq = room_seq)

	#decide result
	result = ""
	if room.gameoption == 'W':
		game_result = 'L'
	else:
		game_result = 'W'

	for users in user_list:
		result = Result()
		result.userID = users.userID
		result.gametype = room.gametype
		result.gameoption = room.gameoption
		result.result = game_result
		result.save()

	
	result = Result()
	result.userID = user
	result.gametype = room.gametype
	result.gameoption = room.gameoption
	result.result = room.gameoption
	users.save()

	del pirate_pick_number[room_seq]

	prizewinner = Member.objects.get(userID = user)

	msg = {	'cmd':'GAMECMD',
			'data':{'cmd':'PIRATE_RESULT',
			'data':{'nickname':prizewinner.nickname,'result':result.result}}}

	return msg


#bingo functions
def proc_game_bingo_ready(user , data , request):
	pdb.set_trace()
	room_seq = MemberInRoom.objects.get(userID = user).room_seq
	bingo_ready_member_list.update({room_seq:{user:"R"}})
	pass

def proc_game_bingo_number(user , data , request):
	pass



game_process = {
	'DICE_RESULT' 			: proc_game_dice_result,
	'PIRATE_KNIFE_SELECT' 	: proc_game_pirate_knife_select,
	'BINGO_STAT_READY' 		: proc_game_bingo_ready
}

import operator
def turnPrevCurNext(user):
	room_seq = MemberInRoom.objects.get(userID = user).room_seq
	memlist = MemberInRoom.objects.filter(room_seq = room_seq)
	
	members = []
	mem_numbers = len(memlist)#get the number of members
	for index in range(mem_numbers):
		temp = Member.objects.get(userID = memlist[index].userID)
		members.append(temp)
		if temp.userID == user:
			prev = index

	if index+1 >= mem_numbers:
		curr = (prev+1) - mem_numbers

	if index+2 >= mem_numbers:
		next = (prev+2) - mem_numbers
	
	prev_turn = members[prev].nickname # get user who is previous turn
	curr_turn = members[curr].nickname # get user who is current turn
	next_turn = members[next].nickname # get user who is next turn

	return {'prev':prev_turn , 'curr':curr_turn , 'next':next_turn}















