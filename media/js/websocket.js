/* websocket */
var socket;
var sendCmd;
var userlist;
var debug = true;

function init(){
  var host = "ws://localhost:8000/WS/"+room_seq+"/";
  try{
    socket = new WebSocket(host);
    
    log('WebSocket - status '+socket.readyState);

    socket.onopen = function(msg){ 
    	log("Welcome - status "+this.readyState);
    	sendLoginInfo(sessionid,userid);
    }
    socket.onmessage= function(msg){ 
    	log("Received: "+msg.data); 
    	process(msg.data); 
    }
    socket.onclose	= function(msg){
    	log("Disconnected - status "+this.readyState);
    	location.reload();
    };
  }
  catch(ex){ log(ex); }
}

function sendDebug(){
  var txt,msg;
  txt = $("#debug input");
  msg = txt.val();
  if(!msg){ alert("Message can not be empty"); return; }
  txt.val("");
  txt.focus();
  var data = msg.indexOf(' ');
  var cmd;
  if(data==-1) { data = ''; cmd = msg; }
  else { data = eval('('+msg.substr(data+1)+')'); cmd = msg.substr(0,msg.indexOf(' ')); }
  data = {cmd:cmd,data:data};
  try{ socket.send(JSON.stringify(data)); log('Sent: '+JSON.stringify(data)); } catch(ex){ log(ex); }
}

// Utilities
function log(msg){ if(debug) $("#debug div").append("<br>"+msg); }
function trim(str) { return str.replace(/^\s\s*/, '').replace(/\s\s*$/, ''); }
String.prototype.trim = function() { return this.replace(/^\s\s*/, '').replace(/\s\s*$/, ''); }

function process(msg){
	if(msg.substr(0,1)!="{") msg = msg.substr(1);
	if(msg.substr(msg.length-1,1)!="}") msg = msg.substr(0,msg.length-1);
	try{ 
	var data = JSON.parse(msg);
	} catch (ex){ log(ex); }
	switch(data.cmd){
		case "JOIN":
			if(nickname != data['data']['nickname'])
				chatAppend('['+data['data']['nickname']+"] 님이 참가 하셨습니다."); 
			break;
			
		case "USERLIST": 
			makeUserList(data.data); break;
		
		case "CHAT": 
			chatAppend(data.data.nickname+" : "+data.data.Message);break;
		
		case "KICK": 
			chatAppend('['+data.data.nickname+"] 님이 강퇴 당하셨습니다.");
			$('.user_'+data.data.userID).remove();
			if(data.data.userID == userid)
				location.href = '/roomlist/'
			break;
		
		case "CHANGE_SETTING": 
			chatAppend("방 설정이 다음과 같이 변경되었습니다.");
			chatAppend("최대 인원: "+data.data.maxuser+"명 , " + data.data.gameoption_text);
			gametype = data.data.gametype;
			gameoption = data.data.gameoption;
			$("#maxUsers").text(data.data.maxuser); 
			$("#gameOption").text(data.data.gameoption_text);
			$("#gameType").text(data.data.gametype_text);
			$("#room_config").find("input").filter("[name=maxuser]").val(data.data.maxuser).end()
			.filter("[name=gameoption]").val(gameoption);
			break;
		
		case "CHANGE_OWNER": 
			owner = data.data.userID;
			chatAppend('['+data.data.nickname+'] 님이 방장이 되셨습니다.');
			if(owner == userid){
				$('#start_button').css('display','block');
				$("#ready_button").css('display','none'); 
				$("#unready_button").css('display','none'); 
			}
			sendCmd="USERLIST";
			send("USERLIST",{});
			break;
		
		case "READY": 
			chatAppend('['+data.data.nickname+"] 님이 준비가 완료되었습니다.");
			$('.nick_'+data.data.nickname).buttonMarkup({theme: 'b'});
			break;
		
		case "UNREADY": 
			chatAppend('['+data.data.nickname+"] 님이 준비를 취소 하였습니다.");
			$('.nick_'+data.data.nickname).buttonMarkup({theme: 'e'});
			break;
		
		case "WAIT":
			for( i = 0 ; i < data.data.length ; i++)
				if(data.data[i] == nickname)
					chatAppend('['+data.data[i]+"] 님 준비해 주시기 바랍니다."); 
				else	
					chatAppend('['+data.data[i]+"] 님이 준비가 되지 않았습니다."); 
			break; 
		case "START": 
			chatAppend("게임이 곧 시작됩니다. 준비하세요!");
			gameStartTimeCount();
			play = true ;
			$("#start_button").css('display','none');
			$("#ready_button").css('display','none');
			$("#unready_button").css('display','none');
			$("#exit_button").css('display','none');
			switch(gametype){
				case "B" : 
					setTimeout(startBingo, 0000); 
					break;
				case "D" : 
					setTimeout(startDice , 5000); 
					break;
				case "L" : 
					setTimeout(startLadder,5000); 
					break;
				case "P" : 
					showUserTurn(data.data);
					setTimeout(startPirate,5000); 
					break;
			}
			break;
		
		case "QUIT": 
			if(nickname==data.data.nickname) location.href="/roomlist/";
			chatAppend('['+data.data.nickname+"] 님이 방에서 나갔습니다.");
			$('.nick_'+data.data.nickname).parent().remove(); break;
		
		case "OK":
			switch(sendCmd){
				case "LOGIN": 
					sendJoin(); 
					break;
		
				case "JOIN": 
					initJoin(); 
					chatAppend("방에 접속하였습니다."); 
					sendUserList();
					break;
				
				case "READY": 	
					$("#ready_button").css('display','none'); 
					$("#unready_button").css('display','block');
					break;
								
				case "UNREADY": 
					$("#ready_button").css('display','block'); 
					$("#unready_button").css('display','none'); 
					break;
			}
			break;

		case "GAMECMD":
			game_process(data.data);
			break;

		case "RESULT":
			game_process(data.data);
			break;

		case "REGAME":
			play = false;
			$('#gameResult center').html($('#gameResult center').html()+'잠시뒤 결과 화면이 사라지고 , 채팅화면이 나타납니다.')
			setTimeout(function(){location.href = '/room/'+room_seq+'/'},10000);
			break;

		case "BOOM":
			$('#gameResult center').html($('#gameResult center').html()+'일회성 방이므로 잠시뒤 , 자동으로 종료됩니다.')
			setTimeout(function(){location.href = /roomlist/;},10000);
			break;
	}
}

function chatAppend(msg){
	var obj = $("#chat");
	obj.append("<br/>"+msg);
	var scroll_position  = $("#chat").scrollTop();
	$("#chat").scrollTop(scroll_position+20);
}

function message(msg){
	$("#messageWindow").html(msg);
}

function send(command,data){
	data = {cmd:command,data:data};
	try{
		socket.send(JSON.stringify(data));
		log('Sent: '+JSON.stringify(data));
	} catch(ex){ log(ex); }
}

function sendLoginInfo(sessionid,userid){
	sendCmd = "LOGIN";
	var data = {};
	data.Sessionid = sessionid;
	data.userID = userid;
	data.room_seq = room_seq
	send("LOGIN",data);
}

function sendJoin(){
	sendCmd = "JOIN";
	var data = {};
	data.room_seq = room_seq;
	send("JOIN",data);
}

function sendUserList(){
	sendCmd = "USERLIST";
	var data = {};
	send("USERLIST",data);
}

function userAppend(a_userid,a_nickname){

	var str ='<div class="user_'+a_userid+'">' ;
		if(owner == userid && owner == a_userid)
			str +=	'<a class="host_'+a_nickname+'" type="button" data-inline="true" data-theme="e">방장';
		else if(owner != userid && owner == a_userid)
			str +=	'<a class="nick_'+a_nickname+'" type="button" data-inline="true" data-theme="e">시작요청';
		else
			str +=	'<a class="nick_'+a_nickname+'" type="button" data-inline="true" data-theme="e">준비요청';
		str +=	'</a>' ;
		
		if(owner == userid && owner != a_userid)
			str += '<a class="kick_'+a_nickname+'" type="button" data-inline="true" data-theme="e">강퇴</a>';		
		
		str +=	'<span>'+a_nickname+'</span>'+
			'</div>';
	$("#participant_list").append(str).parent().trigger("create");
	
	$(".nick_"+a_nickname).unbind('click').click(function(){
		if(userid == a_userid)
				return;
			sendCmd = "CHAT";
			var data = {};
			if(a_userid == owner)
				data.Message = a_nickname + " 님 게임 시작 부탁드립니다.";
			else	
				data.Message = a_nickname + " 님 레디 부탁드립니다.";
			send("CHAT",data);
			return;
	});

	$(".kick_"+a_nickname).unbind('click').click(function(){
		//can't kick the room owner
		if(owner != userid)
			return;
		//only user can kick the other user
		var kickuser = $(this).parent().attr('class').replace("user_","");
		if(kickuser == userid) { 
			alert("자기 자신은 강퇴 안되요 ^^"); 
			return; 
		}
		if(confirm(a_nickname+" 님을 강퇴 시키시겠습니까?")){
			sendCmd = "KICK";
			var data = {};
			data.userID = kickuser;
			send("KICK",data);
		}	
	});
}
function makeUserList(list){
	$("#participant_list").html("");
	for(var a=0; a<list.length; a++){
		userAppend(list[a].userID,list[a].nickname);
	}
	$("#joinUsers").text(list.length);
}

function sendChat(){
	sendCmd = "CHAT";
	var data = {};
	data.Message = $("#msg").val();
	if(data.Message == "" | !data.Message)
		return ;
	$("#msg").val("");
	send("CHAT",data);
}

function sendReady(){
	sendCmd = "READY";
	var data = {};
	send("READY",data);
}

function sendUnready(){
	sendCmd = "UNREADY";
	var data = {};
	send("UNREADY",data);
}

function sendStart(){
	sendCmd = "START";
	var data = {};
	send("START",data);
}

function initJoin(){
	if(userid == owner){
		$("#start_button").css('display','block');
		$("#config_change").css('display','block');
	}
	else{
		$("#ready_button").css('display','block');
	}
	$("#msg").keypress(function(e){
		if(e.keyCode==13) sendChat();
	});
	$("#play_button a").click(function(){
		if($(this).text()=="준비")
			sendReady();
		else if($(this).text()=="준비취소") 
			sendUnready();
	});
	$("#exit_button a").click(function(){
		sendCmd = "QUIT";
		send("QUIT",{});
	});
	$("#config_confirm").click(function(){
		if(owner!=userid) 
			return;
		var data = {};
		var gametype = $(this).parent().find("#gametype").val();
		
		//set gametype and gameoption
		data.maxuser = $("#maxuser").val() ;
		data.gametype = gametype ;
		if(gametype != 'L')
			data.gameoption = $(this).parent().find("#gameoption_"+gametype).val();
		else{
			data.gameoption = {} ;
			for( i = 1 ; i <= data.maxuser ; i++)
				data.gameoption['penalty'+i] = $('#penalty'+i).val()
		}

		sendCmd = "CHANGE_SETTING";
		send("CHANGE_SETTING",data);
		$("#fold a").click();
	});
}

function goExit(){
	sendCmd = "QUIT";
	send("QUIT",{});
}

var startcount;
var gamestart_interval ;

function gameStartTimeCount(){
	startcount = 5 ;
	chatAppend("게임시작 까지 "+startcount+"초 남았습니다.")
	gamestart_interval = setInterval(startCount,1000);
}
function startCount(){
	startcount -= 1 ;
	if(startcount <= 0){
		clearInterval(gamestart_interval);
		view_folding('unfold');
	}
	chatAppend("게임시작 까지 "+startcount+"초 남았습니다.")
}