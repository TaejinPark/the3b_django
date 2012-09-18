/* time count function */
var remain_time = null;
var remain_time_interval ;
var callback_function ;
function startTimeCount(time_to_count){
	clearTimeCount();
	$("#remaintime").css('display','block');
	remain_time = time_to_count ; 
	remain_time_interval = setInterval(showRemainTime,1000);
	$("#remaintime span").text(remain_time);
}

function clearTimeCount(){
	$("#remaintime").css('display','none');
	clearInterval(remain_time_interval);
}

function showRemainTime(){
	remain_time -= 1
	$("#remaintime span").text(remain_time);
	if(remain_time <= 0){
		clearTimeCount();
		if(typeof callback_function == "function")
			callback_function();
	}
}


function showResult(data){
	$("#turn").css('display','none');
	var str = '<center style="margin:10px; padding:10px;" >' ;
	if(gametype == 'D'){
		for(var a=0,loopa=data.length; a<loopa; a++){
			if(data[a].ranking == 'W' || data[a].ranking == 1) 
				str += '<div style="font-weight:bold; font-size:200%;">';
			else
				str += '<div style="font-size:150%;">';
			str += data[a].ranking ;
			str += ' 등 - 주사위값 ' + data[a].value;
			str += ' : ' + data[a].nickname + 
					'</div>' ;
		}
	}
	else if(gametype == 'P'){
		str += 	'<div style="font-weight:bold; font-size:200%;">';
		if(data['result']=='W')
			str += "승리 : ";
		else
			str += "패배 : ";
		str +=  	data['nickname']+ "님." +
				'</div>' ;
	}

	str += '</center>';
	$("#gamedisplay").css('display','none');
	$("#dice").css('display','none');
	$("#pirate").css('display','none');
	$("#ladder").css('display','none');
	$("#bingo").css('display','none');
	$("#gameResult").html(str).css('display','block');
	play = false;
}

function showUserTurn(turn){
	$("#turn").css('display','block');
	$("#turn").html("<center>"+turn['prev']+"-> <strong>"+turn['curr']+"</strong> ->"+turn['next']+"</center>");
	if(nickname == turn['curr']){
		startTimeCount(25);
		switch(gametype){
			case "B" :  break;
			case "L" :  break;
			case "P" : 
				callback_function = sendRandKnifeNumber;
				$('#pirate_table').css('display','block');
			break;
		}
	}
	else{
		switch(gametype){
			case "B" :  break;
			case "L" :  break;
			case "P" : $('#pirate_table').css('display','none'); break;
		}
	}
}

function game_process(data){
	callback_function = 0 ;
	cmd = data.cmd ;
	data = data.data ;
	switch(cmd){
		/* dice game cmd */
		case "DICE_RESULT":
				showResult(data)
			break;
			
		case "PIRATE_RESULT":
				showResult(data)
			break;

		/* pirate cmd */
		case "PIRATE_KNIFE_SELECT":
			pierceKnife(data['knifenumber']);
			showUserTurn(data['turn'])
			break;

		case "BINGO_START": 
			$("#remaintime").css('display','none').next().css('display','none'); 
			$("#turn").css('display','block');
			$("#bingoTable a").unbind("click").click(bingo);
			break;
		
		case "BINGO_CURRENT": 
			$("#turn > div").eq(0).text(data.data.CurrentNickname).end().eq(1).text(data.data.NextNickname);
			currentNickname = data.data.CurrentNickname;
			if(data.data.CurrentNickname==nickname) showMyTurn();
			break;
		
		case "BINGO_SELECT": 
			bingoUser = []; bingoEndUser = []; markSelect(data.data); break;
		
		case "BINGO_BINGO": 
			bingoUser.push(data.data.nickname);
			message(bingoUser.join(", ")+"님이 한줄 이상을 완성 했습니다!"+(bingoEndUser.length>0?"<br />"+bingoEndUser.join(", ")+"님이 빙고를 완성 했습니다!":""));
			break;
		
		case "BINGO_LAST": 
			bingoUser.push(data.data.nickname);
			message((bingoUser.length>0?bingoUser.join(", ")+"님이 빙고 한줄을 완성 했습니다!":"")+bingoEndUser.join(", ")+"님이 빙고를 완성 했습니다!");
			break;
		
		case "BINGO_END": 
			showResult(data.data.result); break;
		
		case "INSTANCE_EXIT": 
			setTimeout(goExit,10000); break;
	}
}

