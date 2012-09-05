from www.models import *
from www.functions import *
import ast
import pdb

temp_room_result = {}

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

		msg = {'cmd':'GAMECMD','data':{'cmd':'DICE_RESULT','data':json.dumps(result_list)}}
		msg = json.dumps(msg)
		ret = {'ret':'','msg':msg}

		pdb.set_trace()
		result_list[room_seq]
		#make result data per member in room
		result = Result()
		result.userID = user
		result.gametype = room.gametype
		#result.result = 

		return ret

game_process = {
	'DICE_RESULT' : proc_game_dice_result
}


