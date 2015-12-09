//variaveis globais
var loggedIn=false;					//false se não tiver o login feito, verdadeiro se tiver o login feito
var cells;							//numero de celulas (9, 16, 25)
var tSize;							//tamanho do tabuleiro, 3, 4, 5 (3*3, 4*4, 5*5)
var sinais=['+', '-', '*', '/'];	//sinais para criar as operacoes das celulas do tabuleiro
var numberOfPairs;					//numero de pares (9, 16, 25)
var points;							//numero de pontos
var gaming=false;					//false se nao estiver a jogar, true se estiver. Para impedir logins durante jogos
//dados de utilizador
var username;
var users = {"ricardo":"1234", "david":"1234","teste":"teste1234","Subzero":""};

//variaveis para as funcoes select
var notSelectedGame="url('images/tab_td_background.png')";				//celula do jogo nao seleccionada
var selectedGame="url('images/tab_td_background_selected.jpg')";		//celula do jogo seleccionada
var notSelectedRes="url('images/res_td_background.png')";				//celula de resultado nao seleccionada
var selectedRes="url('images/res_td_background_selected.jpg')";		//celula de resultado seleccionada
var selGameCell=Object;				//celula do tabuleiro seleccionada
var selResCell=Object;				//celula do resultado seleccionada

//variaveis de tempos (tambem para funcoes select, principalmente)
var before;							//inicio de jogada
var current;						//fim da jogada
var difTime;						//tempo que demorou a fazer desaparecer um par

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
			for (u in users){
				if(u == username){			//verifica se username esta contido na base de dados
					if(users[u]== password){	//verifica se a password inserida corresponde ao utilizador existente na base de dados
						document.getElementById("hello").innerHTML="Bem vindo, " + username;
						toogleShow("userpass", "logout");
						document.getElementById("sincronizar").disabled=false;
						var gType = document.getElementsByName("typeOfGame");
						for (var i=1; i<gType.length; i++){
							gType[i].disabled= false;
						}
						document.getElementById("twoPlayers").disabled= false;
						return loggedIn=true;
					}
					else{
						alert("Palavra-Chave errada!");
						return loggedIn=false;
					}
				}
				
			}
			
			alert("Utilizador inv\u00E1lido!");
			return loggedIn=false;
			
			
		}
		else{
			alert("O login nu\00E3o foi bem sucedido poque o seu username cont\u00E9m caracteres errados. O username apenas pode conter letras maiusculas, letras minusculas, numeros e underscore ( _ )");
			return loggedIn=false;
		}
	}
};

//fazer logout, esconde o menu e o jogo
function logout(){
	if(confirm("Deseja sair da sua conta?")){
		toogleShow("logout", "userpass");
		document.getElementById("sincronizar").disabled=true;
		var gType = document.getElementsByName("typeOfGame");
		for (var i=1; i<gType.length; i++){
			gType[i].disabled= true;
		}
		document.getElementById("twoPlayers").disabled= true;
		loggedIn=false;
	}

};

//Botao sincronizar
function synchronize(){
	if(loggedIn){
		alert("Pedimos desculpa mas neste momento ainda nao \u00E9 possivel sincronizar"); 
	}
	
}

//alerta para modo Competitivo
function competitive(){
	if(loggedIn){
		alert("Pedimos desculpa mas o modo Competitivo ainda se encontra em constru\u00E7\u00E3o");
	}
	else alert("Pedimos desculpa mas o modo Competitivo s\u00F3 se encontra activo para usu\u00E1rios que tenham feito o login.");
	document.getElementById("onePlayer").checked=true;
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
				gtype="aritmetica";
				break;
			case "sinonimos": 
				gtype="sinonimos";
				alert("Este tipo de jogo ainda se encontra em desenvolvimento...");
				return gType[0].checked=true;
				break;
			case "antonimos": 
				gtype="antonimos";
				alert("Este tipo de jogo ainda se encontra em desenvolvimento...");
				return gType[0].checked=true;
				break;
			case "traducao": 
				gtype="traducao";
				alert("Este tipo de jogo ainda se encontra em desenvolvimento...");
				return gType[0].checked=true;
				break;
			default: break;
			}
		}
	}
	
	for(i=0; i<gMode.length; i++){
		if(gMode[i].checked){
			switch (gMode[i].value) {
			case "individual": 					//prepara o jogo com definiçoes de inicio para singleplayer
				//reset ao progresso
				document.getElementById("progress").style.backgroundPosition="0px";
				
				break;
			case "competitivo": 					//prepara o jogo com definiçoes de inicio para multiplayer
				alert("Modo de Jogo em fase de desenvolvimento...");
				return gMode[0].checked=true;   //para a funcao e evita mudar de janela forcando o singleplayer nesta fase
				//mostrar outra barra de progresso com o jogador B
				break;
			default: break;
			}
		}
	}
	for(i=0; i<tableSize.length; i++){
		if(tableSize[i].checked){
			tSize=Math.round(tableSize[i].value);	
		}
	}
	createGame();	
	numberOfPairs=0;													//0 pares resolvidos
	points=0;															//0 pontos
	before=new Date();													//altura em q comeca o jogo
	document.getElementById("points").innerHTML="Pontos:<br>"+points; 	//actualizar os pontos no html
	document.getElementById("progress").style.display="table";
	
	//apenas no final muda a tela e poe certas funcionalidades operacionais depois de passar nos botoes radio
	gaming=true;
	//esconde a configuracao e mostra o jogo
	toogleShow('configuracao', 'jogo');
	//troca o enabled dos botoes
	document.getElementById("iniciarJogo").disabled=true;
	document.getElementById("abandonarJogo").disabled=false;
	//esconde tabela de highscores e mostra pontos
	toogleShow("highscores", "points");
	points=0;
	//esconder winning_message
	document.getElementById("progressBar").style.backgroundImage="none";
	document.getElementById("progress").style.display="table";
	document.getElementById("dragon").style.display="table";
	
	
};

//criar jogo (tabuleiro + resultados)
function createGame(){
	
	var tab=document.getElementById("tab");
	var res=document.getElementById("results");
	
	var sequenceId = randomArray();
	cells=tSize*tSize;
	var k=1;
	
	for(var i=1; i<=tSize; i++){
		//criar linha do tabuleiro
		var trGame= document.createElement("tr");
		trGame.setAttribute("id", "gameLine"+i);
		//criar linha dos resultados
		var trResults=document.createElement("tr");
		trResults.setAttribute("id", "resLine"+i);
		
		for(var j=1; j<=tSize; j++){
			//criar celula do tabuleiro
			var tdGame = document.createElement("td");
			tdGame.setAttribute("id", "gameCell"+sequenceId[k]);
			tdGame.setAttribute("class", "gameCell");
			
			//criar celula dos resultados
			var tdResults = document.createElement("td");
			tdResults.setAttribute("id", "resCell" + k);
			tdResults.setAttribute("class", "resCell");

			//anexar conteudo as celulas
			tdGame.innerHTML=makeAProblem(sequenceId[k]);
			tdResults.innerHTML=k;
			
			//formatar tamanho das celulas do tabuleiro
			tdGame.style.width=(640/tSize)-10 +"px";
			tdGame.style.height= (480/tSize)-10 +"px";

			//adicionar event listener as celulas
			tdGame.addEventListener("click", selectGameCell, false);
			tdResults.addEventListener("click", selectResCell, false);
			
			//acrescentar celulas as linhas respectivas
			trGame.appendChild(tdGame);
			trResults.appendChild(tdResults);
			k++;
			
		}
		tab.appendChild(trGame);
		res.appendChild(trResults);
	}
};

//criar um array, randomizar a ordem para depois ser inserida essa ordem nas celulas da tabela, já baralhadas
function randomArray (){
var array = new Array();
	
	for (var i=1; i<=tSize*tSize;i++)
		array[i]=i;
	
	for (var k=1; k<=tSize*tSize; k++){
		var j = Math.floor(Math.random()*tSize*tSize+1);
		var temp = array[k];
		array[k] = array[j];
		array[j] = temp;
	}
	
	return array;
	
};

//criar conteudo das celulas do tabuleiro
//recebe resultado e retorna expressao para colocar na celula do tabuleiro
function makeAProblem(z) {
	var op=Math.floor(Math.random()*4);	//sinal da operacao
	//adicao
	if(sinais[op]==='+'){
		while(true){
			var x=Math.floor(Math.random()*cells);
			if(z-x>0) return x+" + " + (z-x);
		}
	}
	//subtracao
	if(sinais[op]==='-'){
		while(true){
			var x=Math.floor(Math.random()*cells/4);	// dividir por 4 para nao gerar expressoes com valores muito grandes (eg: 45-22)
			return Math.max((z+x), x) + " - " + Math.min((z+x), x);
		}
	}
	//se z for primo, entao z*1=z e z/1=z
	if(isPrime(z)) return z + " " + sinais[op] + " 1";
	
	//multiplicacao
	if(sinais[op]==='*'){
		while(true){
			 var x=Math.floor(Math.random()*z+1);
			 if(z%x==0) return x + " * " + (z/x);
		}
	}
	//divisao
	if(sinais[op]==='/'){
		while(true){
			var x=Math.floor(Math.random()*30+1);	//*30 para gerar divisoes "mais interessantes" e +1 para nao gerar casos tipo 0/0
			if(x%z==0) return Math.max(x, (x/z)) + " / " + Math.min(x,(x/z));
		}
	}
};



//testar se um numero é primo
function isPrime(number){
	for(var i=2; i<number; i++){
		if(number%i==0) return false;
	}
	return true;
};

//utilizar clica numa celula do tabuleiro
function selectGameCell(x) {
	//por todas as celulas com border = not selected
	var i=1;
	while(i<=cells){
		document.getElementById("gameCell"+i).style.backgroundImage=notSelectedGame;
		i++;
	}
	if(!(selGameCell === this)){ //como pressiona uma celula diferente marca
			this.style.backgroundImage=selectedGame;
			selGameCell=this;
			if(eval(selGameCell.innerHTML)==selResCell.innerHTML){		//compara se a seleccao das duas celulas esta correcta
				//esconde as celulas e aumenta o numero de pares ja resolvidos
				selResCell.style.visibility="hidden";
				selGameCell.style.visibility="hidden";
				numberOfPairs++;

				//descobre o tempo que demorou para acabar a jogada e actualiza tempo inicial para a proxima jogada
				current=new Date();
				difTime=current.getTime()-before.getTime();
				before=current;
				//actualiza pontos
				points+= Math.floor(1000*(Math.exp(-difTime/10000)));
				document.getElementById("points").innerHTML="Pontos:<br>"+points;
				//actualizar barra de progresso
				document.getElementById("progress").style.backgroundPosition=(numberOfPairs/cells*720)+ "px";
				if(numberOfPairs==cells){
					document.getElementById("progressBar").style.backgroundImage="url('images/winning_message.png')";
					document.getElementById("progress").style.display="none";
					document.getElementById("dragon").style.display="none";
				}
		}

	}
	else{ //como pressiona sobre a mesma celula desmarca
		this.style.backgroundImage==notSelectedGame;
		selGameCell=Object;	
	}
};



//mesma coisa que o selectGameCell mas se se clicar primeiro numa celula dos restultados
function selectResCell(x) {
	//por todas as celulas com border = not selected
	var i=1;
	while(i<=cells){
		document.getElementById("resCell"+i).style.backgroundImage=notSelectedRes;
		i++;
	}
	if(!(selResCell === this)){ //como pressiona uma celula diferente marca
			this.style.backgroundImage=selectedRes;
			selResCell=this;
			if(eval(selGameCell.innerHTML)==selResCell.innerHTML){		//compara se a seleccao das duas celulas esta correcta
				//esconde as celulas e aumenta o numero de pares ja resolvidos
				selResCell.style.visibility="hidden";
				selGameCell.style.visibility="hidden";
				numberOfPairs++;
			//descobre o tempo que demorou para acabar a jogada e actualiza tempo inicial para a proxima jogada
			current=new Date();
			difTime=current.getTime()-before.getTime();
			before=current;
			//actualiza pontos
			points+= Math.floor(1000*(Math.exp(-difTime/10000)));
			document.getElementById("points").innerHTML="Pontos:<br>"+points;
			document.getElementById("progress").style.backgroundPosition=(numberOfPairs/cells*720)+ "px";
			if(numberOfPairs==cells){
				document.getElementById("progressBar").style.backgroundImage="url('images/winning_message.png')";
				document.getElementById("progress").style.display="none";
				document.getElementById("dragon").style.display="none";
			}
		}
			
	}
	else{ 
		this.style.backgroundImage=notSelectedRes;
		selResCell=Object;	
	}
};

//abandonar jogo
function endGame(){
	//apaga tabuleiro
	deleteGame();
	//troca os enable's nos botoes
	document.getElementById("abandonarJogo").disabled=true;
	document.getElementById("iniciarJogo").disabled=false;
	//esconde jogo e pontos, mostra highscores e configuracoes
	toogleShow("points", "highscores");
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
};