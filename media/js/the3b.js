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

//page view control
var buttonFlag = false ;

$(window).resize(function(){
	viewRoomListInit();
	formPosition();
	resizeContent();
});

$("div[data-role='page']").live( "pageshow", function( event ){
	viewRoomListInit();
	resizeContent();
	formPosition();
});

function resizeContent(){
	var header_obj = $("div[data-role='header']") ; // get object header
	var footer_obj = $("div[data-role='footer']") ; // get object footer
	var browserHeight = document.documentElement.clientHeight; // get browser height
	
	// get header height
	var headerHeight=	parseInt( header_obj.height()) +
						parseInt(header_obj.css("padding-bottom")) +
						parseInt(header_obj.css("padding-top")) +
						parseInt(header_obj.css("border-top-width")) +
						parseInt(header_obj.css("border-bottom-width"));
	// get footer height
	var footerHeight=	parseInt(footer_obj.height()) +
						parseInt(footer_obj.css("padding-bottom")) +
						parseInt(footer_obj.css("padding-top")) +
						parseInt($("#footer").css("border-bottom-width")) +
						parseInt(footer_obj.css("border-top-width"));

	var contentHeight = browserHeight - headerHeight - footerHeight ;
	// set content size as browser's height minus fixed header and footer height.
	if(navigator.userAgent.indexOf('iPhone') != -1 || navigator.userAgent.indexOf('iphone') != -1){
		// if os is iphone , content height becomes more higher than PC browser. because 
		$("div[data-role='content']").css("height" , contentHeight + 60); 
	}
	else{// normal browser
		$("div[data-role='content']").css("height" , contentHeight);
	}
}

// url : index
function formPosition(){ // set form position about "login" and "join" input 
	var Y = getNowScroll().Y;
	var height;
	height = $("#header").height();
	$("#join").css("top", Y+height+'px');
	$("#login").css("top", Y+height+'px');
}

function getNowScroll(){ // get current x,y coordinate of scroll-bar position 
	var de = document.documentElement;
	var b = document.body;
	var now = {};
	now.X = document.all ? (!de.scrollLeft ? b.scrollLeft : de.scrollLeft) : (window.pageXOffset ? window.pageXOffset : window.scrollX);
	now.Y = document.all ? (!de.scrollTop ? b.scrollTop : de.scrollTop) : (window.pageYOffset ? window.pageYOffset : window.scrollY);
	return now;			
}

function view_join_login(element){ // disply / non-display to join,login form
	var obj = document.getElementById("join");
	obj.style.display = "none";
	obj = document.getElementById("login");
	obj.style.display = "none";
	obj = document.getElementById(element);
	if(obj.style.display == "none")
		obj.style.display = "block";
	else
		obj.style.display = "none";
	buttonFlag = true;
}

function view_clear(){ // non-display to join, login form
	document.getElementById("join").style.display = "none";
	document.getElementById("login").style.display = "none";
}

function doLogin(obj){
	// call "doLogin" function of index.php file in controller directory
	$.post("/doLogin/",
		{userID:obj.find('input[name=id]').val(),password:obj.find('input[name=pw]').val()},
		function(data){
		if(data=="false") // login fail
			alert("사용자 ID가 잘못되었거나, 비밀번호가 잘못되었습니다.");
		else	// login success
			location.href="/roomlist/";
	});
}

function validForm(){ // check input values
	var obj = $(this);
	var spanobj = obj.next('span');
	if(!obj.val()){
		spanobj.text('불가능');
		return;
	}
	switch(obj.attr('name')){
		case 'id':
			// call "isExistID" function of index.php file in controller directory
			$.post("/isExistID/",{userID:obj.val()},function(data){
				if(data=="false") spanobj.text('불가능');
				else if(data=="true") spanobj.text('가능');
			});
		break;
		case 'pw_verify':
			if($('#join input[name=pw]').val() != obj.val() ) spanobj.text('불가능');
			else spanobj.text('가능');
		break;
		case 'nick_name':
			$.post("/isExistNickname/",{nickname:obj.val()},function(data){
				if(data=="false") spanobj.text('불가능');
				else if(data=="true") spanobj.text('가능');
			});
		break;
	}
}

function doJoin(form){ // join
	var obj = $(form);
	var id = obj.find('input[name=id]').val();
	var pw = obj.find('input[name=pw]').val();
	var nickname = obj.find('input[name=nick_name]').val();
	$.post("/doJoin/",
		{userID:id,password:pw,nickname:nickname},
		function(data){
		if(data=="false")
			alert("정보가 잘못 입력되었습니다.\n입력 한 정보를 다시 입력해 주세요.");
		else{
			//form clear
			obj.find('input[name=id]').val('');
			obj.find('input[name=pw]').val('');
			obj.find('input[name=pw_verify]').val('');
			obj.find('input[name=nick_name]').val('');
			view_clear();
			location.href="/roomlist/";
		}
	});
}

// url: /roomlist/
function doWithdraw(){
	$.post('/doWithdraw/',
		function(){
			alert('탈퇴 처리 되었습니다.\n그동안 이용해 주셔서 감사합니다.');
			location.href = '/';
	});
}
function viewRoomListInit(){ // initial display setting
	var obj = $("#make_icon");
	var width = $("#make_icon").children("span").width();
	var obj2 = $("#find_room_by_type");

	if(navigator.userAgent.indexOf('Windows') != -1)	
		obj2.css("width" , $("#content").width() - width -30); // windows os
	else												
		obj2.css("width" , $("#content").width() - width -15); // others
	obj.width(obj.children('span').width());

	obj = $("#refresh_icon");
	width = obj.children("span").width();
	obj2 = $("#search_rooms");
	
	if(navigator.userAgent.indexOf('Windows') != -1)	
		obj2.css("width" , $("#content").width() - width -30); // windows os
	else												
		obj2.css("width" , $("#content").width() - width -15); // others
	obj.width(obj.children("span").width());
}

function viewRoomListMenu(element){ // select an menu at room list page
	$("#roomlist").css("display","none");
	$("#status").css("display", "none");
	$("#makeroom").css("display", "none");
	var obj = document.getElementById(element);
	
	if(obj.style.display == "none")
		obj.style.display = "block";
	else
		obj.style.display = "none";
	if(element=="status")			
		loadUserStatus();
	buttonFlag = true;
}

function viewGameOption(value){ // view game option 
	$("#game_B").css("display","none");
	$("#game_D").css("display","none");
	$("#game_L").css("display","none");
	$("#game_P").css("display","none");
	$("#game_"+value).css("display","block");
}

function doLogout(){ // log out
	$.post("/doLogout/",function(){
		alert("로그아웃 되었습니다~");
		location.href="/";
	});
}

function makeRoom(obj){
	var data = {};
	obj.find('input, select').each(function(){
		data[$(this).attr('name')] = $(this).val();
	});
	if(!data.name || data.name=="") {
		alert("방 이름을 입력해 주세요");
		obj.find('input[name=name]').focus();
		return;
	}
	$.post("/doMakeRoom/",
		data,
		function(data){
		switch(data){//data is room number]
			case '-1': 	alert("방 이름을 입력해 주세요.");obj.find('input[name=name]').focus();break;
			case '0':	alert('방 정보가 잘못 되었습니다.');	break;
			default:	location.href="/room/"+data+'/';
		}
	});
}
 
function loadUserStatus(){
	$.post("/getUserInfo/",
		function(data){
			if(!data) return;
			var tmp = eval(data);
			tmp=tmp[0];
			$('#statusUserID').html(tmp['statusUserID']);
			$('#statusNickname').html(tmp['statusNickname']);
			$('#statusTotal').html(tmp['statusTotal']);
			$('#statusWin').html(tmp['statusWin']);
			$('#statusLose').html(tmp['statusLose']);

			$('#bingoTotal').html(tmp['bingoTotal']);
			$('#bingoWin').html(tmp['bingoWin']);
			$('#bingoLose').html(tmp['bingoLose']);

			$('#diceTotal').html(tmp['diceTotal']);
			$('#diceWin').html(tmp['diceWin']);
			$('#diceLose').html(tmp['diceLose']);

			$('#ladderTotal').html(tmp['ladderTotal']);
			$('#ladderWin').html(tmp['ladderWin']);
			$('#ladderLose').html(tmp['ladderLose']);

			$('#pirateTotal').html(tmp['pirateTotal']);
			$('#pirateWin').html(tmp['pirateWin']);
			$('#pirateLose').html(tmp['pirateLose']);
		}
	);
}

function loadRoomList(start){
	var roomstr = '';
	$.post("/getRoomListToJson/",
	{start:start,keyword:$('input[name=search]:eq(0)').val(),type:$('select[name=find_room_by_type]').val()},
	function(data){
		if(!data) return;
		
		var list = eval(data);
		if(list.length < 15) $('#roomlist > a').css('display','none');
		
		var str = '';
		for(var a=0,loopa=list.length; a<loopa; a++){
			if(parseInt(list[a]["private"])) continue ; // privacy room is non-displayed
			str+='<div data-role="collapsible" data-collapsed="true" data-content-theme="e">'+
					'<h3>'+
						'[<span class="roomnumber">'+list[a].room_seq+'</span>]<span> '+list[a].name+'</span>'+ // room sequence
						'<span class="gametype">'+
							'[<span> '+list[a].participant+' / '+list[a].maxuser+' </span>]&nbsp;'+ // user number
							'<img src="/media/img/'+(parseInt(list[a].start) ? 'playing' : 'waiting')+'_icon.png"/>&nbsp;'; // playing / non-playing
					
			switch(list[a].gametype){
				case "B" : 	str += '<img src="/media/img/bingo_icon.png"/>'; break;
				case "D" : 	str += '<img src="/media/img/dice_icon.png"/>'; break;
				case "L" : 	str += '<img src="/media/img/ladder_icon.png"/>'; break;
				case "P" : 	str += '<img src="/media/img/pirate_icon.png"/>'; break;
			}
			str+=	'&nbsp;'+
							'<img class="lock" src="/media/img/'+(list[a].password ? 'lock':'unlock')+'_icon.png"/>'+
						'</span>'+
					'</h3>'+
					'<p>'+
					'<div>참가자 : '+
						'<span>'+list[a].participant+'</span>/'+
						'<span>'+list[a].maxuser+'</span>'+
					'</div>'+
					'<div>방 유형 : '+
						'<span>'+list[a].roomtype+'</span>'+
					'</div>'+
					'<div>게임 종류 : '+
						'<span>'+list[a].gametype_text+'</span>'+
					'</div>'+
					'<div>게임 옵션 : ';

			switch(list[a].gametype){
				case "B" : 	str += '승리 빙고 : '+'<b>' + list[a].gameoption+'줄 </b>' ; break;
				case "D" : 	str += '주사위 숫자가 큰 사람이 <b>' + (list[a].gameoption ? '승리' : '패배') +'</b>'; break; 
				case "L" : 	str += '방 접속시 공개' ; break;
				case "P" : 	str += '당첨 칼을 꽂는 사람이 <b>' + (list[a].gameoption ? '승리' : '패배') + '</b>'; break; 
			}
			str +=	'</div>';
					
			if(list[a].password)str += '<input class="password" type="text" data-role="input" data-theme="a" placeholder="비밀번호를 입력해 주세요." value=""></input>';
			else 				str += '<div>' ;
			
			if(!parseInt(list[a].start))
				str +='<button class="join" data-role="button" data-theme="a" data-icon="star">방 참가</button></div>';
			str += '</div>'+
					'</p>'+
				'</div>';
		}
		
		if(start==0) {
			$('#RoomList').html(str).parent().trigger("create");
			$('#roomlist > a').css('display','block');
		} 
		else 
			$('#RoomList').append(str).parent().trigger("create");
		
		$('#RoomList .join').unbind('click').click(function(){
			var room_seq = 0 ;
			var passwd = 0 ;
			var permission 	= 1 ;
			var lock = $(this).parent().parent().parent().find('.lock').attr('src'); // get locked / unlocked room

			if(lock == "/media/img/lock_icon.png"){
				room_seq= parseInt($(this).parent().parent().parent().find('.roomnumber').text()); // get room sequence number
				passwd 	= $(this).parent().parent().parent().find('.password').attr('value'); // get room password
				if(!passwd){
					alert("비밀번호를 입력해 주세요")
					$(this).parent().parent().parent().parent().find('.password').focus(); // focus on password input element
				}

				$.post("/checkRoomPasswd/",
				{passwd:passwd,room_seq:room_seq},
				function(data){ // compare user input password with room password
					if(data=='true')
						location.href="/room/"+room_seq+'/'; // go room
					else
						alert("비밀번호가 일치하지 않습니다."); // not match
				});
			}
			else{
				room_seq = parseInt($(this).parent().parent().parent().parent().find('.roomnumber').text());
				$.post('/joinInRoom/',
					{room_seq:room_seq},
					function(data){
						if(data == 'full')
							alert('인원이 가득 찼습니다.')
						else if(data != 'false')
							location.href="/room/"+data+'/'; // go game room
						else
							alert('방이 존재하지 않습니다.')
					}
				);
			}
		});
	});
}


