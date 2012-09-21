/*bingo global variables*/

/*initial : bingo number select part variables*/
init_current_number = 1 ;
init_selected_number = Array() ;
/*bingo functions*/
function startBingo(){
	viewPlay();
	startTimeCount(60);
	
	callback_function = function(){
		fillBingoEmptyBlank();
		sendCmd = "GAMECMD";
		data = {cmd:"BINGO_STAT_READY",data:{}};
		send("GAMECMD",data);
		$("#inputEnd").parent().css('display','none');
	}

	//make selected number list
	for(var i = 0 ; i < 25 ; i++)
		init_selected_number[i] = false ;
	viewUnselectedNumber();

	$("#bingoTable a").click(insertBingoNumber);
	$("#inputEnd").click(endInputBingoNumber);
}

function viewUnselectedNumber(){
	var str = "미 선택 : ";
	var i ;
	var none_flag = true;
	for( i = 0 ; i < 25 ; i++){
		if(init_selected_number[i] == false){
			str += (i+1) + " ";
			none_flag = false ;
		}
	}
	if(none_flag)
		str = "미 선택 숫자 없음"
	$("#bingoUnselect").text(str);
}

function insertBingoNumber(){
	var i ;
	var bingo_obj = $("#bingoTable a span");
	
	// next number to select differs from selected slide number
	if(init_current_number != $("#currentSelect").val())
		init_current_number =  $("#currentSelect").val()

	//alreay input number
	if(init_selected_number[init_current_number-1]){
		for( i = 0 ; i < 25 ; i++ ){
			if($("#bingoTable a span span:eq("+i+")").text() == init_current_number){
				init_selected_number[$(this).text()-1] = false ;
				$("#bingoTable a span span:eq("+i+")").text("x");
				$("#bingoTable a:eq("+i+")").buttonMarkup({theme: 'b'});
				break;
			}
		}
	}

	//change button theme and number on button
	$(this).buttonMarkup({theme: 'c'});
	$(this).children("span").children("span").text(init_current_number);
	init_selected_number[init_current_number-1] = true ;
	

	//decide next init_current_number
	for(i = 0 ; i < 25 ; i++){
		if(init_selected_number[i] == false){
			init_current_number = i + 1 ;
			break;
		}
	}

	//change slider state
	if(init_current_number<26){
		$("#currentSelect").val(init_current_number);
		$('#currentSelect').slider('refresh');
	}

	//renewal unselected number list
	viewUnselectedNumber()
}

function endInputBingoNumber(){
	var flag = false;
	$("#bingoTable a").each(function(){
		//there exist unselected bingo blank
		if($(this).text()=="x") 
			flag = true;
	});

	if(flag==true){
		if(confirm("아직 작성하지 않은 빙고가 있습니다.\n입력을 완료 하시겠습니까?")){
			fillBingoEmptyBlank();
		}
		else {
			return;
		}
	}
	clearTimeCount();
	sendCmd = "GAMECMD";
	data = {cmd:"BINGO_STAT_READY",data:{}};
	send("GAMECMD",data);
	$("#inputEnd").parent().css('display','none');
}

function fillBingoEmptyBlank(){
	var currentList = [];
	var idxList = [];
	var flag = false;
	var i;
	
	var obj = $("#bingoTable a");
	//make unselected list and the number
	var unselected_number_list = Array();
	var the_number_of_unselected_numbers = 0 ;

	//change current theme to selected theme
	obj.buttonMarkup({theme: 'c'});
	
	//find unselected number
	for( i = 0 ; i < 25 ; i++){
		if(init_selected_number[i] == false){
			unselected_number_list[the_number_of_unselected_numbers] = i+1 ;
			the_number_of_unselected_numbers++;
		}
	}

	//fill the blank as unselected number
	for( i = 0 ; i < 25 ; i++){
		//unchecked blank
		if(obj.children("span:eq("+i+")").text() == "x"){
			while(1){
				//get number randomly in unselected number list
				tmp_number = Math.round(Math.random() * the_number_of_unselected_numbers);
				tmp_number = unselected_number_list[tmp_number];

				//check selected number
				if(init_selected_number[tmp_number-1] == false){
					init_selected_number[tmp_number-1] = true ;
					break;
				}
			}
			//fill the blank
			obj.children("span:eq("+i+")").text(tmp_number);
		}
	}
	viewUnselectedNumber();
}
