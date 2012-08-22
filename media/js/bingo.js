
function startBingo(){
	play = true;
	viewPlay();
	$("#bingoTable a").click(insertBingo);
	$("#currentSelect").change(function(){
		currentNumber = $(this).val();
		if(!selectActivate) {
			viewUnselect();
			selectActivate = true;
		}
	});
	$("#inputEnd").click(function(){
		var flag = false;
		$("#bingoTable a").each(function(){
			if($(this).text()=="x") flag = true;
		});
		if(flag==true){
			if(confirm("아직 작성하지 않은 빙고가 있습니다.\n입력을 완료 하시겠습니까?")){
				forceInsert();
			} else {
				return;
			}
		}
		sendCmd = "BINGO_WRITED";
		send("BINGO_WRITED",{});
		interval = setInterval(forceStart,(50-currentSelectTime)*1000);
		currentSelectTime = 49;
		$("#inputEnd").parent().css('display','none');
	});
	$("#okSelect a").click(currentSelectEnd);

	//init
	bingoLine = $("#bingo_option_line input").val();
	currentBingo = 0;
	bingoUser = [];
	bingoEndUser = [];
	currentSelectTime = 0;
	selectActivate = false;
	bingoSelect = [];
	currentNumber = 1;
	interval = null;

	setTimeout(selectEnd,1000);
}

function insertBingo(){
	if(currentSelectTime==50) return;
	//font-size 13px;
	if($(this).children("span").children("span").text() == "x"){
		$(this).children("span").children("span").text(currentNumber++);
		$(this).attr('data-theme','c');
		if(currentNumber<26) $("#currentSelect").val(currentNumber);
		if(selectActivate || currentNumber==26) viewUnselect();
	} else {
		var arr = {};
		var idx = 1;
		var obj = $("#bingoTable a");
		obj.each(function(){
			if($(this).text()=="x") return;
			if(typeof arr[$(this).text()] == "undefined") {
				arr[$(this).text()] = [];
				arr[$(this).text()].push(idx++);
			} else {
				arr[$(this).text()].push(idx++);
				for(var a=0,loopa=arr[$(this).text()].length; a<loopa; a++){
					obj.eq(arr[$(this).text()][a]).attr('data-theme','e');
				}
			}
		});
	}
	$("#bingoTable a").trigger("create");
	$("#bingoTable a").css('font-size','13px');
	$(this).css('font-size',"15px");
}

function viewUnselect(){
	var unselectList = [];
	for(var a=1; a<=25; a++){
		var flag = false;
		for(var b=0, loopb= bingoSelect.length; b<loopb; b++){
			if(a==bingoSelect[b]) {
				flag = true;
				break;
			}
		}
		if(!flag) unselectList.push(a);
	}
	$("#bingoUnselect").text(unselectList.join(", "));
}

function selectEnd(){
	$("#remaintime span").text(50 - ++currentSelectTime);
	if(currentSelectTime<50) setTimeout(selectEnd,1000);
	else {
		forceInsert();
		if(interval==null)
			forceStart();
		else
			clearInterval(interval);
	}
}

function forceInsert(){
	var currentList = [];
	var idxList = [];
	var obj = $("#bingoTable a");
	obj.each(function(){
		currentList.push($(this).text());
	});
	var notInsertList = [];
	for(var a=1; a<=25; a++){
		var flag = false;
		for(var b=0,loopb=currentList.length; b<loopb; b++){
			if(currentList[b]==a) { flag = true; break; }
		}
		if(flag) continue;
		notInsertList.push(a);
	}
	obj.each(function(){
		if($(this).text()!="x") return;
		while(true){
			var idx = parseInt(Math.random()*(parseInt(currentList.length/10)+1)*10);
			var flag = false;
			for(var a=0,loopa=idxList.length; a<loopa; a++){
				if(idxList[a]==idx) { flag = true; break; }
			}
			if(flag) continue;
			if(notInsertList.length<idx) continue;
			if(!notInsertList[idx]) continue;
			idxList.push(idx);
			$(this).children('span').text(notInsertList[idx]);
			break;
		}
	}).attr('data-theme','c').trigger("create");
}

function forceStart(){
	if(owner != userid) return;
	sendCmd = "BINGO_START";
	send("BINGO_START",{});
	if(interval!=null)
		clearInterval(interval);
}

function bingo(){
	if(currentNickname!=nickname) return;
	if($(this).attr('data-theme')!='c') return;
	$("#bingoTable a[data-theme=e]").attr('data-theme','c');
	$(this).attr('data-theme','e');
	$("#bingoTable").trigger("create");
	$("#bingoTable a").css('font-size','13px');
	$(this).css('font-size',"15px");
}

function currentSelectEnd(){
	currentSelectTime2 = 14;
}

function sendSelectNumber(){
	var obj = $("#bingoTable");
	if(obj.find('a[data-theme=e]').size()==0){
		var max = obj.find('a[data-theme=c]').size();
		while(true){
			var idx = parseInt(Math.random()*(parseInt(max/10)+1)*10);
			if(max<idx) continue;
			obj.find('a[data-theme=c]').eq(idx).attr('data-theme','e');
			break;
		}
	}
	$("#bingoTable").trigger("create");
	var currentNumber = obj.find('a[data-theme=e]').text();
	var data = {};
	$("#remaintime").css('display','none');
	$("#okSelect").css('display','none');
	data.SelectedNumber = currentNumber;
	send("BINGO_SELECT",data);
}

function showMyTurn(){
	$("#okSelect").css('display','block');
	currentSelectTime2 = 0;
	$("#remaintime").css('display','block');
	$("#remaintime span").text(15);
	interval2 = setInterval(showTurnRemainTime,1000);
}

function showTurnRemainTime(){
	$("#remaintime span").text(15 - ++currentSelectTime2);
	if(currentSelectTime2>=15) {
		clearInterval(interval2);
		sendSelectNumber();
	}
}

function markSelect(data){
	if(currentBingo>=bingoLine) return;
	var obj = $("#bingoTable a");
	obj.each(function(idx){
		if(parseInt($(this).text())==data.SelectedNumber){
			$(this).buttonMarkup({ theme: "a" });
			var curidx = idx + 1;
			var col = curidx % 5;
			var row = parseInt(curidx / 5);
			var addBingo = 0;
			//row check
			if(obj.slice(row*5-1,row*5+4).filter("[data-theme=a]").size()==5) addBingo++;
			//col check
			var tmp = 0;
			for(var a=0; a<5; a++)
				if(obj.eq(col-1+a*5).attr("data-theme")=="a")
					tmp++;
			if(tmp==5) addBingo++;
			//cross check
			if(col == row){
				tmp = 0;
				for(var a=0; a<5; a++)
					if(obj.eq(a+a*5).attr("data-theme")=="a")
						tmp++;
				if(tmp==5) addBingo++;
			}
			if(5-col == row){
				tmp = 0;
				for(var a=0; a<5; a++)
					if(obj.eq(4-a+a*5).attr("data-theme")=="a")
						tmp++;
				if(tmp==5) addBingo++;
			}
			if(addBingo>0){
				sendCmd = "BINGO_BINGO";
				send("BINGO_BINGO",{Bingo:addBingo});
			}
			currentBingo += addBingo;
			if(currentBingo>=bingoLine){
				$("#bingoTable a").unbind("click");
			}
		}
	});
	$("#bingoTable").trigger("create");
}
