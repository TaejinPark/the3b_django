/* time count function */
var remain_time = null;
var remain_time_interval ;

function startTimeCount(time_to_count){
	$("#remaintime").css('display','block');
	remain_time = time_to_count ; 
	remain_time_interval = setInterval(showRemainTime,1000);
}

function clearTimeCount(){
	$("#remaintime").css('display','none');
	clearInterval(remain_time_interval);
}

function showRemainTime(){
	$("#remaintime span").text(remain_time);
	if(remain_time <= 0)
		clearTimeCount();
	remain_time -= 1
}
/* time count function */

function showResult(list){
	var str = '<center style="margin:10px; padding:10px;" >' ;
	for(var a=0,loopa=list.length; a<loopa; a++){
		if(list[a].ranking == 'W' || list[a].ranking == 1) 
			str += '<div style="font-weight:bold; font-size:200%;">';
		else
			str += '<div style="font-size:150%;">';
		str += list[a].ranking ;
		
		if(gametype == 'D')
			str += ' 등 - 주사위값 ' + list[a].value;

		str += ' : ' + list[a].nickname + 
				'</div>' ;
	}
	str += '</center>';
	$("#gamedisplay").css('display','none');
	$("#gameResult").html(str).css('display','block');
}


function game_process(data){
	switch(data.cmd){
		case "DICE_RESULT":
				startTimeCount(5);
				showResult(data.data)
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

