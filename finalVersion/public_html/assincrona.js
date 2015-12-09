var game="";							//identificador de jogo
var key="";							//chave para acesso ao jogo
var winner="";							//jogador que ganhou a partida
var quest= Object;					//perguntas e respostas para o jogo usadas posteriormente para comparar os resultados
var message="";
var sync=false;
var oponent="";						//nome de oponente
var oponentpoints=0;				//pontos de oponente
var mypoints=0;						//meus pontos


function registerAssinc(name,pass){
	var url = "http://twserver.alunos.dcc.fc.up.pt:8010/register?name="+encodeURIComponent(name)+"&pass="+encodeURIComponent(pass);
	var loginmensage= document.getElementById("loginmensage");
	var request = new XMLHttpRequest();
	request.open("GET",url,false);
	request.onreadystatechange = function(){
		if (request.readyState != 4 ) {
			return ;
		}
		if (request.status != 200){ 
			//tratamento de resposta
			alert("Error: Response not 200!"); 
			return ;
		}
		var serverResponse = JSON.parse(request.responseText);
		if(serverResponse.error){
			loginmensage.innerHTML=""+serverResponse.error; //escreve mensagem de erro por baixo do botao login
		}
		else{
			loginmensage.innerHTML="";    					//apaga mensagem de erro de login
			document.getElementById("hello").innerHTML="Bem vindo, " + name;
			toogleShow("userpass", "logout");
			document.getElementById("sincronizar").disabled=false;
			var gType = document.getElementsByName("typeOfGame");
			for (var i=1; i<gType.length; i++){
				gType[i].disabled= false;
			}
			document.getElementById("twoPlayers").disabled= false;
			loggedIn=true;
		}
	};
	request.send(null);
}

function joinAssinc(name,pass,type,size){
	var url = "http://twserver.alunos.dcc.fc.up.pt:8010/join?name="+encodeURIComponent(name)+"&pass="+encodeURIComponent(pass)+"&type="+encodeURIComponent(type)+"&size="+encodeURIComponent(size);
	var request = new XMLHttpRequest();
	request.open("GET",url,false);
	request.onreadystatechange = function(){
		if (request.readyState != 4 ) {
			return ;
		}
		if (request.status != 200){ 
			//tratamento de resposta
			alert("Error: Response not 200!"); 
			return ;
		}
		var serverResponse = JSON.parse(request.responseText);
		if(serverResponse.error){
			alert("serverResponse.error");
		}
		else{
			//mode=2;
			game=serverResponse.game;
			key=serverResponse.key;
			sync=true;
			gaming=true;
			updateAssinc(name,key,game);
			
		}	
			
	};
	request.send(null);
}

function updateAssinc(name,key,game){
	var url = "http://twserver.alunos.dcc.fc.up.pt:8010/update?name="+encodeURIComponent(name)+"&game="+encodeURIComponent(game)+"&key="+encodeURIComponent(key);
	var request = new EventSource(url);
	//message = document.getElementById('syncMessage');
	request.onmessage=function (event){
		var serverResponse = JSON.parse(event.data);
		
		if(serverResponse.error){
			document.getElementById("syncMessage").innerHTML = "";
			alert(serverResponse.error);
			document.getElementById("abandonarJogo").disabled=false;   //sair de um jogo que esteja "empancado" por ter havido erro
			request.close();
		}
		
		
		if(oponent==""){
			document.getElementById("syncMessage").innerHTML = "Aguarde por conex\u00E3o de jogador...";
			document.getElementById("iniciarJogo").disabled=true;
			document.getElementById("abandonarJogo").disabled=false; //o jogador pode abandonar uma juncao a uma partida
			document.getElementById("sincronizar").disabled=true;
			sync=true;	//o jogador neste momento ainda nao tem adversario podendo desistir por sync=true;
			
			if(serverResponse.scores){
				for (jogador in serverResponse.scores){
					if(username != jogador)	{						//oponente
						oponent = jogador;
						oponentpoints= serverResponse.scores[jogador];
					}
					else{
						points = serverResponse.scores[jogador];   //sou eu
					}
				}
			}
		
		}
		else{		//existe um jogador ja...
			//botoes todos disabled em multiplayer (jogador forcado a acabar a partida)
			document.getElementById("iniciarJogo").disabled=true;
			document.getElementById("abandonarJogo").disabled=true;
			document.getElementById("sincronizar").disabled=true;
			sync=false;	//o jogador ja nao se encontra a sincronizar mas sim em contagem para o jogo
			document.getElementById("syncMessage").style.display="table";
			
			if(serverResponse.countdown==0){
				//melhorar a apresentacao de mensagens
				document.getElementById("control").style.display="none";
				document.getElementById("syncMessage").innerHTML="";
				document.getElementById("points").innerHTML=username+": " + points;
				document.getElementById("pointsB").innerHTML=oponent+": " + oponentpoints;
				document.getElementById("abandonarJogo2").style.display="none";
				//document.getElementById("syncMessage").innerHTML = username+"&nbsp;&nbsp;&nbsp;&nbsp;vs&nbsp;&nbsp;&nbsp;&nbsp;"+oponent+"<br>"+points+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+oponentpoints;
				//inicia o jogo mostrando as perguntas
				
				//esconde a configuracao e mostra o jogo
				toogleShow("highscores", "logM");
				toogleShow('configuracao', 'jogo');
				time=setInterval(refreshClock,1000);
				
			}
			if(serverResponse.countdown)
				//document.getElementById("syncMessage").style.display="table";
				document.getElementById("syncMessage").innerHTML="Countdown: "+serverResponse.countdown;
			if(serverResponse.questions){
				//chamar funcao para colocar questoes no tabuleiro com respostas
				makeQuestions(serverResponse.questions);
			}
			if(serverResponse.move){
				var tab=document.getElementById("tab");
				var res=document.getElementById("results");
				
				tab.rows[serverResponse.move.row-1].cells[serverResponse.move.col-1].style.visibility="hidden";
				var ind = tab.rows[serverResponse.move.row-1].cells[serverResponse.move.col-1].getAttribute("class");
				for(var i=0; i<tSize;i++){
					for(var j=0; j<tSize;j++){
						if(res.rows[i].cells[j].getAttribute("class")==ind)
							res.rows[i].cells[j].style.visibility="hidden";
					}
				}
				if(serverResponse.move.name == username){
					//actualizar meu avanco
					numberOfPairs++;
					var marginleft =(numberOfPairs/cells*1050)-1050; 
					document.getElementById("progress").style.marginLeft = marginleft + "px";
				}
				if(!(serverResponse.move.name==username)){
					//actualizar avanco adversario
					oponentPairs++;
					var marginright = (oponentPairs/cells*1050)-1050;
					document.getElementById("dragon").style.marginRight = marginright + "px";
				}
			}
			if(serverResponse.scores){
				for (jogador in serverResponse.scores){
					if(username != jogador)	{						//oponente
						oponent = jogador;
						oponentpoints= serverResponse.scores[jogador];
					}
					else{
						points = serverResponse.scores[jogador];   //sou eu
					}
				}
				document.getElementById("points").innerHTML=username+": " + points;
				document.getElementById("pointsB").innerHTML=oponent+": " + oponentpoints;
				//document.getElementById("syncMessage").innerHTML = username+"&nbsp;&nbsp;&nbsp;&nbsp;vs&nbsp;&nbsp;&nbsp;&nbsp;"+oponent+"<br>"+points+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+oponentpoints;
			}
			if(serverResponse.winner){
				result(serverResponse.winner==username);
				/*var resultado="";
				if(serverResponse.winner!=username)
					resultado="Perdeste!";
				else
					resultado="Ganhaste!";
				alert("Winner: "+ serverResponse.winner+"\nE tu "+resultado);
				*/
				oponent="";
				clearInterval(time);
				document.getElementById("control").style.display="table";
				//document.getElementById("syncMessage").style.display="none";
				document.getElementById("iniciarJogo").disabled=true;
				document.getElementById("abandonarJogo").disabled=false;
				document.getElementById("sincronizar").disabled=true;
				gaming=false;
				request.close;
			}
			
			
			
		}
		
		
		
	};
	
	document.getElementById("abandonarJogo").disabled=false;   //o jogo empanca e preciso sair dele
	
	
}

function makeQuestions(questionsServer){
	quest=questionsServer;
	var quiz=Array(quest.length);
	var answer=Array(quest.length);
	for(var i=0;i<quest.length;i++){
		quiz[i]=quest[i].question;
		answer[i]=quest[i].answer;
	}
	
	createGame(quiz,answer);
	
	
}
function questionsAssinc(type,size){
	var url = "http://twserver.alunos.dcc.fc.up.pt:8010/questions?type="+encodeURIComponent(type)+"&size="+encodeURIComponent(size);
	var request = new XMLHttpRequest();
	request.open("GET",url,false);
	request.onreadystatechange = function(){
		if (request.readyState != 4 ) {
			return ;
		}
		if (request.status != 200){ 
			//tratamento de resposta
			alert("Error: Response not 200!"); 
			return ;
		}
		var serverResponse = JSON.parse(request.responseText);
		if(serverResponse.error){
			alert("serverResponse.error");
		}	
		else{
			makeQuestions(serverResponse.questions);
		}
	};
	request.send(null);
}

function rankingAssinc(type,size){
	var url = "http://twserver.alunos.dcc.fc.up.pt:8010/ranking?type="+encodeURIComponent(type)+"&size="+encodeURIComponent(size);
	
	var request = new XMLHttpRequest();
	request.open("GET",url,false);
	request.onreadystatechange = function(){
		if (request.readyState != 4 ) {
			return ;
		}
		if (request.status != 200){ 
			//tratamento de resposta
			alert("Error: Response not 200!"); 
			return ;
		}
		var serverResponse = JSON.parse(request.responseText);
		if(serverResponse.error){
			alert(serverResponse.error);
		}
		else{
			var rank = serverResponse.ranking; 			//array associativo de rankings
			var highscores = document.getElementById('ranking');
			
			
			while (highscores.firstChild)
				highscores.removeChild(highscores.firstChild);
			
			for(var i=0;i<rank.length;i++){
				var tr = document.createElement('tr');
				var thnum =document.createElement('th');
				thnum.innerHTML=i+1;
				var tdjog =document.createElement('td');
				tdjog.innerHTML=rank[i].name;
				var tdpoints = document.createElement('td');
				tdpoints.innerHTML=rank[i].score;
				
				tr.appendChild(thnum);
				tr.appendChild(tdjog);
				tr.appendChild(tdpoints);
				highscores.appendChild(tr);
			}
		
	
		}
	};
	request.send(null);
	
}

function leaveAssinc(name,key,game){
	var url = "http://twserver.alunos.dcc.fc.up.pt:8010/leave?name="+encodeURIComponent(name)+"&game="+encodeURIComponent(game)+"&key="+encodeURIComponent(key);
	var request = new XMLHttpRequest();
	request.open("GET",url,false);
	request.onreadystatechange = function(){
		if (request.readyState != 4 ) {
			return ;
		}
		if (request.status != 200){ 
			//tratamento de resposta
			alert("Error: Response not 200!"); 
			return ;
		}
		var serverResponse = JSON.parse(request.responseText);
		if(serverResponse.error){
			alert(serverResponse.error);
			toogleShow( "highscores","points");
			toogleShow('configuracao','jogo');
		}	
		
		document.getElementById("iniciarJogo").disabled=false;
		document.getElementById("abandonarJogo").disabled=true;
		document.getElementById("sincronizar").disabled=false;
		
		if(sync == true)
			sync=false;
	};
	request.send(null);
}

function notifyAssinc(name,key,game,row,col){
	var url = "http://twserver.alunos.dcc.fc.up.pt:8010/notify?name="+encodeURIComponent(name)+"&game="+encodeURIComponent(game)+"&key="+encodeURIComponent(key)+"&row="+encodeURIComponent(row)+"&col="+encodeURIComponent(col);
	var request = new XMLHttpRequest();
	request.open("GET",url,false);
	request.onreadystatechange = function(){
		if (request.readyState != 4 ) {
			return ;
		}
		if (request.status != 200){ 
			//tratamento de resposta
			alert("Error: Response not 200!"); 
			return ;
		}
		var serverResponse = JSON.parse(request.responseText);
		if(serverResponse.error){
			//criar um div tipo log de jogadas onde vai ficar registado as jogadas todas...
		}
		
		
	};
	request.send(null);
}

