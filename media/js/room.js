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
	switch(gametype){
		case "B" : $("#bingo").css('display','block'); break;
		case "D" : $("#dice").css('display','block'); break;
		case "L" : $("#ladder").css('display','block'); break;
		case "P" : $("#pirate").css('display','block'); break;
	}
}

function viewChat(){
	if($("#chat").css('display')=='block' && play) 
		return viewPlay();
	$("#participant_list").css('display','none');
	if(play)
		$("#gamedisplay").css('display','none');
	$("#chat").css('display','block');
}

function viewParticipant(){
	if($("#participant_list").css('display')=='block') 
		return viewChat();
	$("#chat").css('display','none');
	if(play)
		$("#gamedisplay").css('display','none');
	$("#participant_list").css('display','block');
}

function view_config(id){
	$("#room_info").css("display" , "none");
	$("#room_config").css("display" , "none");
	if(id != 'none')
		$("#"+id).css("display" , "block");
}

function viewGameOption(value){ // view game option
	$("#game_B").css("display","none");
	$("#game_D").css("display","none");
	$("#game_L").css("display","none");
	$("#game_P").css("display","none");
	$("#game_"+value).css("display","block");
}

function changeLadderOption(){
	var maxuser = $("#maxuser").val()
	var str = '<br/>'
	for(i = 1 ; i <= maxuser ; i++)
		str += '<input type="text" id="penalty' + i +'" placeholder="벌칙' + i +'"/><br/>'
	$("#gameoption_L").html(str).parent().trigger("create");
}
