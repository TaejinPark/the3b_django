//django jquery ajax comunication
$(document).ajaxSend(function(event, xhr, settings) {
	function getCookie(name) {
		var cookieValue = null;
		if (document.cookie && document.cookie != '') {
			var cookies = document.cookie.split(';');
			for (var i = 0; i < cookies.length; i++) {
				var cookie = jQuery.trim(cookies[i]);
				// Does this cookie string begin with the name we want?
				if (cookie.substring(0, name.length + 1) == (name + '=')) {
					cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
					break;
				}
			}
		}
		return cookieValue;
	}
	function sameOrigin(url) {
		// url could be relative or scheme relative or absolute
		var host = document.location.host; // host + port
		var protocol = document.location.protocol;
		var sr_origin = '//' + host;
		var origin = protocol + sr_origin;
		// Allow absolute or scheme relative URLs to same origin
		return (url == origin || url.slice(0, origin.length + 1) == origin + '/') ||
			(url == sr_origin || url.slice(0, sr_origin.length + 1) == sr_origin + '/') ||
			// or any other URL that isn't scheme relative or absolute i.e relative.
			!(/^(\/\/|http:|https:).*/.test(url));
	}
	function safeMethod(method) {
		return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
	}


	if (!safeMethod(settings.type) && sameOrigin(settings.url)) {
		xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
	}
});

$(window).resize(function() {
	resizeContent();
});

$("div[data-role='page']").live( "pageshow", function( event )
{
	resizeContent();
});

var play = false;
var contentHeight = 0 ;
function resizeContent()
{
	var header_obj = $("div[data-role='header']") ;
	var footer_obj = $("div[data-role='footer']") ;
	var browserWidth = document.documentElement.clientWidth;
	var browserHeight = document.documentElement.clientHeight;
    var headerHeight = parseInt( header_obj.height())+parseInt(header_obj.css("padding-bottom"))+parseInt(header_obj.css("padding-top"))+parseInt(header_obj.css("border-top-width"))+parseInt(header_obj.css("border-bottom-width"));
    var footerHeight = parseInt(footer_obj.height())+parseInt(footer_obj.css("padding-bottom"))+parseInt(footer_obj.css("padding-top"))+parseInt($("#footer").css("border-bottom-width"))+parseInt(footer_obj.css("border-top-width"));
    
    // set content size as browswer heigt - fixed header height
    if(navigator.userAgent.indexOf('iPhone') != -1 || navigator.userAgent.indexOf('iphone') != -1)
		$("#content").css("height" , browserHeight - headerHeight - footerHeight + 65); // if browser is iphone , content height becomes more higher than PC browser
	else // normal browser
		$("#content").css("height" , browserHeight - headerHeight - footerHeight);
	contentHeight = $("#content").height();
	
	$("#chat").css("height" , contentHeight);
	$("#gamedisplay").css("height" , browserHeight);
	
	if(	$("#participant_list").height() < contentHeight)
		$("#participant_list").css("height" , contentHeight);
	
	$("#chat").css("width" , browserWidth -30);
	$("#button_list").css("width" , browserWidth-10);
	$("#chat_input").css("width" , browserWidth - $("#chat_send").width() - 30);
	
	$(".turnuser").css("width", browserWidth / 2 - 24);
	
	var ctx = document.getElementById("dice_canvas").getContext("2d");
	ctx.fillStyle = "white";
	ctx.font = "italic 20pt Calibri" ;
	ctx.fillText("Let's Dice!!!",80,80);
}

function view_config(id){
	$("#room_info").css("display" , "none");
	$("#room_config").css("display" , "none");
	if(id != 'none')
		$("#"+id).css("display" , "block");
}

function view_folding(flag){
	$("#unfold").css("display" , "none");
	$("#fold").css("display" , "none");
	$("#"+flag).css("display" , "block");
	if(flag == 'unfold'){
		$("#room_info").css("display" , "none");
		$("#room_config").css("display" , "none");
	}
}

function viewPlay(){
	$("#chat").css('display','none');
	$("#participant_list").css('display','none');
	$("#gamedisplay").css('display','block');
}

function viewChat(){
	if($("#chat").css('display')=='block' && play) return viewPlay();
	$("#participant_list").css('display','none');
	if(play) {
		$("#gamedisplay").css('display','none');
	}
	$("#chat").css('display','block');
}

function viewParticipant(){
	if($("#participant_list").css('display')=='block') return viewChat();
	$("#chat").css('display','none');
	if(play) {
		$("#gamedisplay").css('display','none');
	}
	$("#participant_list").css('display','block');
}

function viewGameOption(value){
	$("#game_0").css("display","none");
	$("#game_1").css("display","none");
	$("#game_2").css("display","none");
	$("#game_3").css("display","none");
	$("#game_"+value).css("display","block");
}

/* websocket */

var socket;
var sendCmd;
var userlist;
var debug = true;
var currentNumber = 1;
var bingoSelect = [];
var selectActivate = false;
var currentSelectTime = 0;
var currentSelectTime2 = 0;
var bingoUser = [];
var bingoEndUser = [];
var bingoLine = 0;
var currentBingo = 0;
var interval = null;
var interval2 = null;
var currentNickname = '';

function init(){
  var host = "ws://localhost:8000/WS/";
  try{
    socket = new WebSocket(host);
    
    log('WebSocket - status '+socket.readyState);

    socket.onopen = function(msg){ 
    	log("Welcome - status "+this.readyState);
    	sendLoginInfo(sid,userid);
    }
    socket.onmessage= function(msg){ 
    	log("Received: "+msg.data); 
    	process(msg.data); 
    }
    socket.onclose	= function(msg){
    	log("Disconnected - status "+this.readyState); 
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
			chatAppend('['+data.data.nickname+"] 님이 참가 하셨습니다."); 
			userAppend(data.data.UserID,data.data.nickname); break;
		
		case "USERLIST": 
			makeUserList(data.data); break;
		
		case "CHAT": 
			chatAppend(data.data.nickname+": "+data.data.Message);break;
		
		case "KICK": 
			chatAppend('['+data.data.nickname+"] 님이 강퇴 당하셨습니다.");
			$('.user_'+data.data.UserID).remove(); break;
		
		case "CHANGE_SETTING": 
			chatAppend("방 설정이 다음과 같이 변경되었습니다.");
			chatAppend("최대 인원: "+data.data.MaxUser+"명, 승리조건: "+data.data.GameOption+"줄");
			$("#maxUsers").text(data.data.MaxUser); $("#gameOption").text(data.data.GameOption);
			$("#room_config").find("input").filter("[name=maxuser]").val(data.data.MaxUser).end()
			.filter("[name=gameoption]").val(data.data.GameOption);
			break;
		
		case "CHANGE_OWNER": 
			owner = data.data.UserID; chatAppend('['+data.data.nickname+'] 님이 방장이 되셨습니다.');
			sendCmd="USERLIST"; send("USERLIST",{});
			break;
		
		case "READY": 
			chatAppend('['+data.data.nickname+"] 님이 준비가 완료되었습니다."); break;
		
		case "UNREADY": 
			chatAppend('['+data.data.nickname+"] 님이 준비를 취소 하였습니다."); break;
		
		case "START": 
			chatAppend("게임이 곧 시작됩니다. 준비하세요!"); 
			setTimeout(startBingo,4000); 
			break;
		
		case "QUIT": 
			if(nickname==data.data.nickname) location.href="/roomlist/";
			
			//chatAppend($('.user_'+data.data.nickname+' span').text()+"님이 방에서 나갔습니다.");
			chatAppend('['+data.data.nickname+"] 님이 방에서 나갔습니다.");
			$('.nick_'+data.data.nickname).parent().remove(); break;
		
		case "BINGO_START": 
			$("#remaintime").css('display','none').next().css('display','none'); $("#turn").css('display','block');
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
		
		case "OK":
			switch(sendCmd){
				case "LOGIN": 
					sendJoin(); break;
				case "JOIN": 
					initJoin(); 
					chatAppend("방에 접속하였습니다."); 
					sendUserList(); break;
				
				case "READY": 	$("#ready_button").css('display','none'); 
								$("#already_button").css('display','block'); 
								break;
								
				case "UNREADY": $("#ready_button").css('display','block'); 
								$("#already_button").css('display','none'); 
								break;
			}
			break;
	}
}

function chatAppend(msg){
	var obj = $("#chat");
	obj.append("<br />"+msg);
	var scroll_position  = $("#chat").scrollTop();
	$("#chat").scrollTop(scroll_position+20);
}

function message(msg){
	$("#messageWindow").html(msg);
}

function userAppend(a_userid,a_nickname){
	var str = '<div class="user_'+a_userid+'">'+
			'<a class="nick_'+a_nickname+'" type="button" data-inline="true">'+(owner==a_userid?'방장':'강퇴')+'</a>'+
			'<span>'+a_nickname+'</span>'+
			'</div>';
	$("#participant_list").append(str).parent().trigger("create");
	$('#participant_list div a').unbind('click').click(function(){
		if($(this).text()=="방장") return;
		if(owner!=userid) return;
		var kickuser = $(this).parent().attr('class').replace("user_","");
		if(kickuser == userid) { alert("자기 자신은 강퇴 안되요 ^^"); return; }
		sendCmd = "KICK";
		var data = {};
		data.UserID = kickuser;
		send("KICK",data);
	});
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
	data.UserID = userid;
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

function makeUserList(list){
	$("#participant_list").html("");
	for(var a=0; a<list.length; a++){
		userAppend(list[a].UserID,list[a].Nickname);
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
	$("#msg").keypress(function(e){
		if(e.keyCode==13) sendChat();
	});
	$("#play_button a").click(function(){
		if($(this).text()=="시작") sendStart();
		else if($(this).text()=="준비") sendReady();
		else if($(this).text()=="준비취소") sendUnready();
	});
	$("#exit_button a").click(function(){
		sendCmd = "QUIT";
		send("QUIT",{});
	});
	$("#config_confirm").click(function(){
		if(owner!=userid) return;
		var data = {};
		var obj = $(this).parent().find("input");
		data.MaxUser = obj.filter('[name=maxuser]').val();
		data.GameOption = obj.filter('[name=gameoption]').val();
		sendCmd = "CHANGE_SETTING";
		send("CHANGE_SETTING",data);
		$("#fold a").click();
	});
}

function showResult(list){
	var str = "";
	for(var a=0,loopa=list.length; a<loopa; a++){
		str += '<div>'+
				'<span>'+list[a].Nickname+'</span>'+
				list[a].result+'등'+
				'</div>';
	}
	$("#gamedisplay").css('display','none');
	$("#gameResult").html(str).css('display','block');
}

function goExit(){
	sendCmd = "QUIT";
	send("QUIT",{});
	setTimeout(function(){
		location.href="/roomlist/";
	},1000);
}