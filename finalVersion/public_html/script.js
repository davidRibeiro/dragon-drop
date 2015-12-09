//variaveis globais
var loggedIn=false;					//false se não tiver o login feito, verdadeiro se tiver o login feito
var cells=0;							//numero de celulas (9, 16, 25)
var tSize=0;							//tamanho do tabuleiro, 3, 4, 5 (3*3, 4*4, 5*5) 
var type="";							//tipo de jogo
var size=0;							//tamanho de jogo a enviar como parametro
var gMode;							//modo de jogo [Array]
var mode=0;							//modo de jogo (Int)
var numberOfPairs=0;				//numero de pares (9, 16, 25) USERNAME
var oponentPairs=0;					//numero de pares (9, 16, 25) OPONENTE
var points=0;						//numero de pontos
var gaming=false;					//false se nao estiver a jogar, true se estiver. Para impedir logins durante jogos
//dados de utilizador
var username="";
var password="";

//variaveis para as funcoes select
var selGameCell=Object;				//celula do tabuleiro seleccionada
var selResCell=Object;				//celula do resultado seleccionada

//variaveis de tempos (tambem para funcoes select, principalmente)
var before;							//inicio de jogada
var current;						//fim da jogada
var difTime;						//tempo que demorou a fazer desaparecer um par

var time;							//temporizador por causa do relogio
var minutos=0;
var segundos=0;


/*	codigos de caracteres especiais
 *  á = \u00E1
 *  ã = \u00E3
 *  ó = \u00F3
 *  ç = \u00E7
 * 	é = \u00E9
*/

//esconde um elemento, mostra outro
function toogleShow (hide, show) {
	document.getElementById(hide).style.display="none";
	document.getElementById(show).style.display="table";
};

//fazer login, username so pode conter letras, numeros e underscore
function login(){
	if(gaming){
		alert("N\u00E3o podes fazer login durante um jogo. Termina ou abandona este jogo antes de fazer login.");
	}
	else{
		username=document.getElementById("un").value;
		password=document.getElementById("pw").value;
		var pattern=/\W/;
		if(!pattern.test(username)){
			registerAssinc(username,password); 		//chamada assincrona
		}
		else{
			alert("O login nu\00E3o foi bem sucedido poque o seu username cont\u00E9m caracteres errados. O username apenas pode conter letras maiusculas, letras minusculas, numeros e underscore ( _ )");
			return loggedIn=false;
		}
	}
};

//fazer logout, esconde o menu e o jogo
function logout(){
	if(gaming){
		alert("N\u00E3o podes fazer logout durante um jogo. Termina ou abandona este jogo antes de fazer logout.");
	}
	else if(confirm("Deseja sair da sua conta?")){
		toogleShow("logout", "userpass");
		document.getElementById("sincronizar").disabled=true;
		document.getElementById("twoPlayers").disabled= true;
		gMode[0].checked=true;
		loggedIn=false;
	}

};

//Botao sincronizar
function synchronize(){
	if(!loggedIn){
		alert("Sincronizar apenas disponivel quando utilizador autentificado!"); 
	}
	else{
		var tableSize = document.getElementsByName("size");
		gMode = document.getElementsByName("config");
		var gType = document.getElementsByName("typeOfGame");
		
		for(var i=0; i<gType.length; i++){
			if(gType[i].checked){
				switch (gType[i].value) {
				case "aritmetica": 
					type="arithmetic";
					break;
				case "sinonimos": 
					type="synonyms";
					break;
				case "antonimos": 
					type="antonyms";
					break;
				case "traducao": 
					type="translation";
					break;
				default: break;
				}
			}
		}
		
		for(var i=0; i<gMode.length; i++){
			if(gMode[i].checked){
				switch (gMode[i].value) {
				case "individual": 	//nao ha sincronizar em modo singleplayer
					alert("Sincronizar \u00E9 usado apenas em modo competitivo!");
					return;
					break;
				case "competitivo": 					//prepara o jogo com definiçoes de inicio para multiplayer
					mode=2;		//multiplayer
					break;
				default: break;
				}
			}
		}
		for(var i=0; i<tableSize.length; i++){
			if(tableSize[i].checked){
				tSize=Math.round(tableSize[i].value);	
			}
		}
		size=tSize-2;
		document.getElementById("syncMessage").innerHTML="";
		document.getElementById("time").innerHTML="";
		joinAssinc(username,password,type,size);
	}
}

//alerta para modo Competitivo
function competitive(){
	//alterei o aviso do modo competitivo estar em execucao
	if(!loggedIn){
		alert("Pedimos desculpa mas o modo Competitivo s\u00F3 se encontra activo para usu\u00E1rios que tenham feito o login.");
		document.getElementById("onePlayer").checked=true;
	}
}

//começar jogo
function beginGame(){
	
	var tableSize = document.getElementsByName("size");
	var gMode = document.getElementsByName("config");
	var gType = document.getElementsByName("typeOfGame");
	
	for(var i=0; i<gType.length; i++){
		if(gType[i].checked){
			switch (gType[i].value) {
			case "aritmetica": 
				type="arithmetic";
				break;
			case "sinonimos": 
				type="synonyms";
				break;
			case "antonimos": 
				type="antonyms";
				break;
			case "traducao": 
				type="translation";
				break;
			default: break;
			}
		}
	}
	
	for(var i=0; i<gMode.length; i++){
		if(gMode[i].checked){
			switch (gMode[i].value) {
			case "individual": 					
				//muda o modo para modo=1 (SinglePlayer)
				mode=1;
				break;
			case "competitivo": 					
				alert("Utiliza sincronizar para jogares em modo Competitivo");
				return ;   //para a funcao e evita mudar de janela
				break;
			default: break;
			}
		}
	}
	for(var i=0; i<tableSize.length; i++){
		if(tableSize[i].checked){
			tSize=Math.round(tableSize[i].value);	
		}
	}
	
	size=tSize-2;			
	questionsAssinc(type,size);												//busca questions
	
	
	
};

//criar jogo (tabuleiro + resultados)
function createGame(questions, answers){
	document.getElementById("resultCanvas").style.display="none";
	var tab = document.getElementById("tab");
	var res = document.getElementById("results");
	
	//var sequenceId = randomArray();
	var index = randomArray();
	cells=tSize*tSize;
	var k=0;
	
	
	
	for(var i=1; i<=tSize; i++){
		//criar linha do tabuleiro
		var trGame= document.createElement("tr");
		//trGame.setAttribute("id", "gameLine"+i);
		//criar linha dos resultados
		var trResults=document.createElement("tr");
		trResults.setAttribute("id", "resLine"+i);
		
		for(var j=1; j<=tSize; j++){
			//criar celula do tabuleiro
			var tdGame = document.createElement("td");
			//tdGame.setAttribute("id", "gameCell"+k);
			tdGame.setAttribute("class", "gameCell");
			tdGame.setAttribute("class", "c"+k);
			
			//criar celula dos resultados
			var tdResults = document.createElement("td");
			//tdResults.setAttribute("id", "r" + index[k]);
			tdResults.setAttribute("class", "resCell");
			tdResults.setAttribute("class", "c"+index[k]);

			//anexar conteudo as celulas
			tdGame.innerHTML=questions[k];
			tdResults.innerHTML=answers[index[k]];
			
			//formatar tamanho das celulas do tabuleiro
			tdGame.style.width=(640/tSize)-10 +"px";
			tdGame.style.height= (480/tSize)-10 +"px";

			//adicionar event listener as celulas
			//tdGame.addEventListener("click", selectGameCell, false);
			//tdResults.addEventListener("click", selectResCell, false);
			
			
			tdResults.setAttribute('draggable', 'true');
			tdResults.addEventListener('dragstart', dragIt, true);
			tdGame.setAttribute("ondrop", "dropIt(event);");
			tdGame.setAttribute("ondragover", "event.preventDefault();");
			
			
			//acrescentar celulas as linhas respectivas
			trGame.appendChild(tdGame);
			trResults.appendChild(tdResults);
			k++;
			
		}
		tab.appendChild(trGame);
		res.appendChild(trResults);
	}
	
	if(mode==1){
		
		
		
		numberOfPairs=0;													//0 pares resolvidos
		points=0;															//0 pontos
		before=new Date();													//altura em q comeca o jogo
		 	//actualizar os pontos no html
		
		
		//apenas no final muda a tela e poe certas funcionalidades operacionais depois de passar nos botoes radio
		gaming=true;
		//esconde a configuracao e mostra o jogo
		toogleShow('configuracao', 'jogo');
		document.getElementById('control').style.display="none";
		//esconde tabela de highscores e mostra pontos
		document.getElementById("logM").style.display="block";
		toogleShow("highscores", "logM");
		points=0;
		//esconder winning_message
		document.getElementById("progressBar").style.backgroundImage="none";
		document.getElementById("progressBar").style.display="table";
		document.getElementById("progress").style.marginLeft="-1050px";				//inicia a barra progresso
		document.getElementById("progress").style.display="table";
		document.getElementById("dragon").style.display="table";
		
		//comecar relogio
		document.getElementById("points").innerHTML="Pontos: "+points;
		document.getElementById("time").innerHTML="00:00";
		minutos=0;
		segundos=0;
		time=setInterval(refreshClock,1000);
		
		
	}
	else if(mode==2){
		
		
		//prepara modo multiplayer
		numberOfPairs=0;
		oponentPairs=0;
		
		gaming=true;
		document.getElementById("progressBar").style.backgroundImage="none";
		document.getElementById("progressBar").style.display = "block";
		document.getElementById("progress").style.marginLeft="-1050px";
		document.getElementById("progress").style.display="table";
		document.getElementById("dragon").style.marginRight="-1050px";
		document.getElementById("dragon").style.display="table";
		
		
		document.getElementById("time").innerHTML="00:00";
		minutos=0;
		segundos=0;
	}
	
};


function dropIt(ev){
	ev.preventDefault();
	if(!(selResCell==Object)){
		
			if(mode==1){
				//alert(ev.target.getAttribute("class")+" "+selResCell.getAttribute("class"));
				if(ev.target.getAttribute("class")==selResCell.getAttribute("class")){		//compara se a seleccao das duas celulas esta correcta
					//esconde as celulas e aumenta o numero de pares ja resolvidos
					selResCell.style.visibility="hidden";
					ev.target.style.visibility="hidden";
					numberOfPairs++;
					//descobre o tempo que demorou para acabar a jogada e actualiza tempo inicial para a proxima jogada
					current=new Date();
					difTime=current.getTime()-before.getTime();
					before=current;
					//actualiza pontos
					points+= Math.floor(1000*(Math.exp(-difTime/10000)));
					
					//manda o numero de pontos da jogada para função de h5.js
					document.getElementById("pointsFade").innerHTML="&nbsp;+ " + Math.floor(1000*(Math.exp(-difTime/10000)));
					fade("pointsFade");					
					
					document.getElementById("points").innerHTML="Pontos: "+points;
					var marginleft =(numberOfPairs/cells*1050)-1050;
					document.getElementById("progress").style.marginLeft = marginleft + "px";
					if(numberOfPairs==cells){
						//document.getElementById("progressBar").style.backgroundImage="url('images/winning_message.png')";
						//document.getElementById("progress").style.display="none";
						//document.getElementById("dragon").style.display="none";
						result(true);
						clearInterval(time);
					}
				}
			}
			if(mode==2){
				//multiplayer
				if(ev.target.getAttribute("class")==selResCell.getAttribute("class")){
					notifyAssinc(username, key, game, ev.target.parentNode.rowIndex+1, ev.target.cellIndex+1);
				}
			}
		
	}
	
	
};
function dragIt(e){
	e.dataTransfer.effectAllowed = 'Move';
	e.dataTransfer.setData('Text', e.target);	
	//e.dataTransfer.setDragImage(e.target, 20, 20);
	selResCell=e.target;
};


//criar um array, randomizar a ordem para depois ser inserida essa ordem nas celulas da tabela, já baralhadas
function randomArray (){
var array = new Array();
	
	for (var i=0; i<tSize*tSize;i++)
		array[i]=i;
	
	for (var k=0; k<tSize*tSize; k++){
		var j = Math.floor(Math.random()*tSize*tSize);
		var temp = array[k];
		array[k] = array[j];
		array[j] = temp;
	}
	
	return array;
	
};

//actualizar relogio
function refreshClock(){
	var gt=document.getElementById("time");
	segundos++;
	if(segundos==60){
		minutos++;
		segundos=segundos-60;
	}
	if(segundos<10){
		if(minutos<10){
			gt.innerHTML="0"+minutos+":0"+segundos;
		}
		else{
			gt.innerHTML=minutos+":0"+segundos;
		}
	}
	else{
		if(minutos<10){
			gt.innerHTML="0"+minutos+":"+segundos;
		}
		else{
			gt.innerHTML=minutos+":"+segundos;
		}
	}
};


//abandonar jogo
function endGame(){
	//apaga tabuleiro
	deleteGame();
	//troca os enable's nos botoes
	document.getElementById("abandonarJogo").disabled=true;
	document.getElementById("iniciarJogo").disabled=false;
	document.getElementById("sincronizar").disabled=false;
	document.getElementById("control").style.display="table";
	//esconde jogo e pontos, mostra highscores e configuracoes
	document.getElementById("syncMessage").innerHTML="";
	if(mode==2){
		oponent="";
		document.getElementById("syncMessage").innerHTML="";
		rankingAssinc(type,size);
		if(sync)
			leaveAssinc(username,key,game);
		
	}
	toogleShow("progressBar", "highscores");
	toogleShow('jogo', 'configuracao');
	document.getElementById("yourScore").innerHTML=points;
	document.getElementById("userPoints" ).style.display="table-footer-group";
	if(loggedIn){
		document.getElementById("namePoints").innerHTML=username;
	}
	else document.getElementById("namePoints").innerHTML="Jogador";
	
	selGameCell=Object;
	selResCell=Object;
	gaming=false;
	clearInterval(time);
};

//apagar jogo (tabuleiro + resultados)
function deleteGame(){
	var tab=document.getElementById("tab");
	var res=document.getElementById("results");
	while(tab.firstChild){
		tab.removeChild(tab.firstChild);
	}
	while(res.firstChild){
		res.removeChild(res.firstChild);
	}
	document.getElementById("logM").style.display="none";
	document.getElementById('control').style.display="table";
};