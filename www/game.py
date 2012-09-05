from www.models import *
from www.functions import *
import ast
import pdb

temp_room_result = {}
def dice_cmp(dict1 , dict2):
	return cmp(dict1.get(dict1.keys()[0]),dict2.get(dict2.keys()[0]))

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
			
			#save to database
			#result.save()

		msg = {'cmd':'GAMECMD','data':{'cmd':'DICE_RESULT','data':result_list}}
		ret_msg = {'ret':'','msg':json.dumps(msg)}
		return ret_msg

game_process = {
	'DICE_RESULT' : proc_game_dice_result
}


