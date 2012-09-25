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
	else if(gametype == 'B'){
		for(var a=0,loopa=data.length; a<loopa; a++){
			if(data[a].result == 'W'){
				str += '<div style="font-weight:bold; font-size:200%;">';
				str += "빙고! - ";
			}
			else{
				str += '<div style="font-size:150%;">';
				str += "꽝! - ";
			}
			str += ' : ' + data[a].nickname + 
					'</div>' ;
		}
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
	$("#messageWindow").text("");
	if(nickname == turn['curr']){
		startTimeCount(25);
		viewPlay();
		$("#messageWindow").text("당신 차례입니다.");
		switch(gametype){
			case "B" :  
				$("#bingoTable a").click(selectBingoNumber);
				break;
			case "L" :  break;
			case "P" : 
				callback_function = sendRandKnifeNumber;
				$('#pirate_table').css('display','block');
				break;
		}
	}
	else{
		if(turn['next'] == nickname)
			$("#messageWindow").text("다음은 당신 차례입니다.");
		switch(gametype){
			case "B" :  
				$("#bingoTable a").unbind("click");
				break;
			case "L" :  break;
			case "P" : 
				$('#pirate_table').css('display','none'); 
				break;
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
			showUserTurn(data['turn']);
			break;

		case "BINGO_START": 
			$('#shoutbingo').css('display','block');
			$('#shoutbingo').click(shoutbingo);
			showUserTurn(data['turn']);
			callback_function = skipTurn;
			break;

		case "BINGO_NUMBER_SELECT":
			showUserTurn(data['turn']);
			callback_function = skipTurn;
			checkBingoNumber(data['number']);
			break;

		case "BINGO_END":
			clearTimeCount();
			$('#messageWindow').html("서버로 부터 결과를 기다리는 중...");
			var flag = 0;
			if(checkBingo())
				flag = 1;
			sendCmd = "GAMECMD";
			data = {cmd:"BINGO_RESULT",data:flag};
			send("GAMECMD",data);
			break;
		
		case "BINGO_RESULT":
			showResult(data)
			break;

	}
}

