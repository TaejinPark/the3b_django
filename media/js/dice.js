// dice game functions

var canvas_width ;	// canvas width
var canvas_height ;	// canvas height
var canvas_mid_pos_y ;	//coordinate X of canvas middle point
var canvas_mid_pos_x ;	//coordinate Y of canvas middle point
var square_side_length ;	//the length of square side
var square_distance ;		//the distance between squares
var dot_radius ; //dice dot radius
var ctx 		//canvas context	
var i ;
var dice_num = Array() ;	//dice number 1~6
var result_interval ;
function startDice()
{
	viewPlay();
	$("#cast_dice a").click(function(){
		sendDiceResult();
	});
	draw_dice()
	startTimeCount(10);
	setTimeout(draw_dice,10000);
	setTimeout(sendDiceResult,10000);
}

function sendDiceResult(){
	clearInterval(rolling_interval);
	clearTimeCount();
	var dice_result = dice_num[0] + dice_num[1] + dice_num[2] ;
	var innerhtml = "<center>당신의 주사위의 합은 " + dice_result + " 입니다.<br/>서버로 부터 결과를 기다리고 있습니다.</center>";
	$("#cast_dice").html(innerhtml);
	$("#dice_result").css("display","block");
	setTimeout(function(){
		var data = {};
		data = {cmd:"DICE_RESULT",data:dice_result};
		send("GAMECMD",data);
	},1000)
}

function draw_dice()
{
	//get device width and set canvas size as device width
	canvas_width  = document.documentElement.clientWidth -20 ;//get device width
	canvas_height = canvas_width;// get device height

	//set canvas size
	$("#dice_canvas").attr("width",canvas_width);
	$("#dice_canvas").attr("height",canvas_height);
	
	//calculate square size and distance between squares
	var side = 0 ;
	if(canvas_width > canvas_height)
		side = canvas_height ;
	else
		side = canvas_width ;
	
	square_distance = side / 10 ;
	square_side_length = side / 2 - square_distance ; 
	dot_radius = square_side_length / 9 ;
	
	//calculate coordinate X and Y of canvas middle point
	canvas_mid_pos_y = canvas_width / 2 ;
	canvas_mid_pos_x = canvas_height / 2 ;
	
	//calculate coordinate X and Y of canvas middle point
	canvas_mid_pos_y = canvas_width / 2 ;
	canvas_mid_pos_x = canvas_height / 2 ;
	
	ctx = document.getElementById("dice_canvas").getContext("2d");
	ctx.clearRect(0,0,canvas_width,canvas_height); // clear canvas	
	ctx.lineWidth= 5 ;
	
	rolling_interval = setInterval(roll_dice,100);
}

function roll_dice()
{
	ctx.clearRect(0,0,canvas_width,canvas_height); // clear canvas	
	for(  i = 0 ; i < 3 ; i++)
		dice_num[i] = Math.floor(Math.random() * 6 ) + 1; // get random number of three dices
	
	draw_sqrt_top_mid(dice_num[0]);
	draw_sqrt_btm_left(dice_num[1]);
	draw_sqrt_btm_right(dice_num[2]);
}

function draw_sqrt_top_mid(dice_num)
{
	var X = canvas_width / 2 ;
	var Y = canvas_height / 4 ;
	draw_sqaure( X ,Y , square_side_length);
	draw_dice_dot(dice_num, X , Y , dot_radius );
}
function draw_sqrt_btm_left(dice_num) 
{
	var X = canvas_width / 4 ;
	var Y = canvas_height * 3 / 4 ;
	draw_sqaure( X ,Y , square_side_length );
	draw_dice_dot(dice_num, X , Y , dot_radius );
}
function draw_sqrt_btm_right(dice_num) 
{
	var X = canvas_width * 3 / 4 ;
	var Y = canvas_height * 3 / 4 ;
	draw_sqaure( X ,Y , square_side_length );
	draw_dice_dot(dice_num , X , Y , dot_radius );
}
function draw_sqaure( X ,Y , side_length)// X,Y are middle coordinate of square
{
	var sqrt_start_x = X - side_length / 2;
	var sqrt_start_y = Y - side_length / 2;
	ctx.fillStyle = "#4e93be";
	ctx.beginPath();
	ctx.rect( sqrt_start_x , sqrt_start_y , side_length , side_length);
	ctx.closePath();
	ctx.fill();
}
function draw_dice_dot( dice_number , X , Y , R )
{
	switch(dice_number)
	{
		case 1 : draw_dot_center_mid(X,Y,R); break;
		case 2 : draw_dot_top_left(X,Y,R); 
				 draw_dot_btm_right(X,Y,R); break;
		case 3 : draw_dot_top_right(X,Y,R); 
				 draw_dot_center_mid(X,Y,R); 
				 draw_dot_btm_left(X,Y,R); break;
		case 4 : draw_dot_top_left(X,Y,R);
				 draw_dot_top_right(X,Y,R);
				 draw_dot_btm_left(X,Y,R);
				 draw_dot_btm_right(X,Y,R); break;
		case 5 : draw_dot_top_left(X,Y,R);
				 draw_dot_top_right(X,Y,R);
				 draw_dot_center_mid(X,Y,R);
				 draw_dot_btm_left(X,Y,R);
				 draw_dot_btm_right(X,Y,R);break;
		case 6 : draw_dot_top_left(X,Y,R);
				 draw_dot_top_right(X,Y,R);
				 draw_dot_center_left(X,Y,R);
				 draw_dot_center_right(X,Y,R);
				 draw_dot_btm_left(X,Y,R);
				 draw_dot_btm_right(X,Y,R); break;
	}
}
function draw_dot_top_left( X , Y , R )//X,Y are square middle cooradinate , R is radius
{
	X -= square_side_length / 4 ;
	Y += square_side_length / 4 ;
	draw_dot( X , Y , R )
}
function draw_dot_top_right( X , Y , R )//X,Y are square middle cooradinate , R is radius
{
	X += square_side_length / 4 ;
	Y += square_side_length / 4 ;
	draw_dot( X , Y , R )
}
function draw_dot_center_left( X , Y , R )//X,Y are square middle cooradinate , R is radius
{
	X -= square_side_length / 4 ;
	draw_dot( X , Y , R )
}
function draw_dot_center_right( X , Y , R )//X,Y are square middle cooradinate , R is radius
{
	X += square_side_length / 4 ;
	draw_dot( X , Y , R )
}
function draw_dot_center_mid( X , Y , R )//X,Y are square middle cooradinate , R is radius
{
	draw_dot( X , Y , R )
}		
function draw_dot_btm_left( X , Y , R )//X,Y are square middle cooradinate , R is radius
{
	X -= square_side_length / 4 ;
	Y -= square_side_length / 4 ;
	draw_dot( X , Y , R )
}
function draw_dot_btm_right( X , Y , R )//X,Y are square middle cooradinate , R is radius
{
	X += square_side_length / 4 ;
	Y -= square_side_length / 4 ;
	draw_dot( X , Y , R )
}
function draw_dot( X , Y , R )//X,Y are center coordinate of dot
{
	ctx.fillStyle = "#ed1c24";
	ctx.beginPath();
	ctx.arc(X,Y,R,0,Math.PI*2,true);
	ctx.closePath();
	ctx.fill();
}