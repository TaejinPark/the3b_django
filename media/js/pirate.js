var ctx ;
var knife_number = 0 ;
var image_knife = new Array();
function startPirate()
{
	viewPlay();
	startTimeCount(10);
	setTimeout(initPirateGame,1000);
	$("#pirate_canvas").css('border','solid black');
}

function initPirateGame()
{
	var i ;
	var canvas_height = $("#content").height();
	var canvas_width = $("#content").width();

	//get image size by browser size
	if(canvas_width < (canvas_height * 2 / 3))
		canvas_height = canvas_width * 1.5 ;
	else
		canvas_width = canvas_height * 2 / 3 ;

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
			ctx.drawImage(image_knife[knife_number] , 0 , 0 , canvas_width , canvas_height);		
		}
	}
}

function drawKnife(number){
	if(number > 15 || number < 0)
		return false;
	knife_number = number ;
	image_knife[knife_number].src = "/media/img/knife_" + knife_number + ".png";
	return true;
}