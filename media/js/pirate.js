var ctx ;
var image_knife = new Array();
var KNIFENUMBER = 0 ;

function startPirate()
{
	viewPlay();
	$("#pirate a").click(selectKnife);
	setTimeout(initPirateGame,1000);
	$("#pirate_table").css('width','214px');
	$("#pirate table td a").buttonMarkup({theme: 'a'});
}

function selectKnife(){
	var select = $(this).text() ;
	select -= 1;
	if($("#pirate table td a:eq("+select+")").attr('data-theme') == 'b')
		return; //already selected
	else{
		sendKnifeNumber(select) ; //non selected
	}
}

function sendKnifeNumber(knifenumber){
	clearTimeCount();
	sendCmd = "GAMECMD";
	var data = parseInt(knifenumber) ;
	data = {cmd:"PIRATE_KNIFE_SELECT",data:data};
	send("GAMECMD",data);
}

function sendRandKnifeNumber(){
	var select = (Math.random()*15);
	select = Math.round(select);
	while($("#pirate table td a:eq("+select+")").attr('data-theme') == 'b'){
		select = (Math.random()*15);
		select = Math.round(select);
	}
	sendKnifeNumber(select);
}

function pierceKnife(select){
	if(select > 15 || select < 0)
		return false;
	$("#pirate table td a:eq("+select+")").buttonMarkup({theme: 'b'});
	KNIFENUMBER = select ;
	image_knife[KNIFENUMBER].src = "/media/img/knife_" + KNIFENUMBER + ".png";
	return true;
}

function initPirateGame()
{
	var i ;
	var canvas_height = $("#body").height();
	var canvas_width = $("#body").width();

	//get image size by browser size
	if(canvas_width > canvas_height){
		canvas_width = canvas_height * 2 / 3 ;
	}
	else{
		canvas_height = canvas_width * 1.5 ;
	}

	//set canvas size
	$("#pirate_canvas").attr('height',canvas_height);
	$("#pirate_canvas").attr('width',canvas_width);

	//load context size
	ctx = document.getElementById("pirate_canvas").getContext("2d");
	
	var image_barrel = new Image();
	image_barrel.onload = function(){
		ctx.drawImage(image_barrel , 0 , 0 , canvas_width , canvas_height);	
	}

	image_barrel.src = "/media/img/empty_barrel.png";

	for(i = 0 ; i < 16 ; i++){
		image_knife[i] = new Image();
		image_knife[i].onload = function(){
			ctx.drawImage(image_knife[KNIFENUMBER] , 0 , 0 , canvas_width , canvas_height);
		}
	}

	$("#pirate > table > td > a").click(insertBingo);
}