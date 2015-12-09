
// Estrutura dos jogos todos do servidor

/*
 * 
 * struture = [ {object1}, {object2}, ....];
 * 
 * object = { 'key': <key>, 'size': <size>, 'tab': [][] } ;
 * 
 * 
 * objecto index = game_id
 * 
 */

var struture = [];







var mysql = require('mysql');
var http = require('http');
var url = require('url');
var Chance = require('chance');
var chance = new Chance();
var crypto = require('crypto');


var conn;
function handleDisconnect() {
	conn = mysql.createConnection({
			host : 'localhost', // Parâmetros da conexão à BD
			user : 'up201003837',
			password : 'twserver',
			database : 'up201003837'
			});

	conn.connect(function(err) {	
		if(err) { // Servidor em baixo ou inacessível
			console.log(new Date().toUTCString()+"  :  "+'error when connecting to DataBase: ', err);
			setTimeout(handleDisconnect, 2000); // Volta a tentar mais tarde
		}
		else{
			console.log(new Date().toUTCString()+"  :  "+"Connected to DataBase up201003837");
		}
	});
	conn.on('error', function(err) {
		console.log(new Date().toUTCString()+"  :  "+'DataBase error: ', err);
		if(err.code === 'PROTOCOL_CONNECTION_LOST') { // E.g., por timeout
			handleDisconnect();
		} else {
			throw err;
		}
	});
}

handleDisconnect();			//chama a funcao para iniciar o handle de desconecoes a BD




var server = http.createServer(function (req, res) {
	
	
	var request = url.parse(req.url,true);
	
	
	
	
	if(request.pathname=="/register"){
		register(request,res);				//chamada para a funcao register
		
	}
	
	else if(request.pathname=="/ranking"){
		//devolver ranking pedido
		var info = request.query;		//array associativo de query strings
		var bool= false;
		
		//verificacao do tipo de jogo e tamanho
		conn.query('SELECT * FROM GameTypes',function(err,rows,fields){
			
			if(err){
				
				console.log(new Date().toUTCString()+"  :  "+"Erro de pesquisa");
				bool=false;
				res.end();
			}
			else{
				
				for(var i=0; i<rows.length; i++){	
					if(rows[i].gametype == info.type)		//existe o tipo de jogo
						if(info.size>=1 && info.size<=3){	//existe o tamanho pretendido
							bool = true;					//variavel de controlo passa a verdade e prossegue com as acçoes
							writeRanks(info, res, bool);	//chamar um funcao que trata do resto, caso contrario a callback so seria disparada com o valor de bool depois da funcao executar o que estava depois					
						}
				}
				
			}
			
		});
		
		
		
	}
	else if(request.pathname=="/questions"){
		//devolver questions pedidas
		
		var info= request.query;
		var bool=false;
		
		//verificacao do tipo de jogo e tamanho
		conn.query('SELECT * FROM GameTypes',function(err,rows,fields){
			
			if(err){
				console.log(new Date().toUTCString()+"  :  "+"Erro de pesquisa");
				bool=false;
				res.end();
			}
			else{
				
				for(var i=0; i<rows.length; i++){	
					if(rows[i].gametype == info.type)		//existe o tipo de jogo
						if(info.size>=1 && info.size<=3){	//existe o tamanho pretendido
							bool = true;					//variavel de controlo passa a verdade e prossegue com as acçoes
							giveQuestions(info, res, bool);	//chamar um funcao que trata do resto, caso contrario a callback so seria disparada com o valor de bool depois da funcao executar o que estava depois					
						}
				}
				
			}
			
		});
		
		
	}
	else if(request.pathname=="/notify"){
		//devolver jogadas ao update caso sejam validas
		//devolver erro ao jogador caso o movimento que ele executou nao seja valido
		
		var info = request.query;
		
		conn.query('SELECT * FROM Users WHERE name=?',[info.name], function (err,rows,fields){
			if(err){
				console.log(new Date().toUTCString()+"  :  "+"Erro de pesquisa");
			}
			else{
				if (rows.length==0){
					console.log(new Date().toUTCString()+"  :  "+"Nao existe esse utilizador");
				}
				else{
					testNotify(info, res);
				}
				
				
			}
			
		});
		
		
	}
	else if(request.pathname=="/update"){
		/*
		res.writeHead(200, {
            "Access-Control-Allow-Origin": "*",
            "Content-Type":"text/event-stream"
        });
		
		setInterval(function() {
            console.log("ping");
            res.write("Teste\n\n");
		}, 1000);
		*/
		
		
		
		
	}
	else if(request.pathname== "/join"){
		
		var info = request.query;
		
		
		conn.query('SELECT * FROM Users WHERE name=?',[info.name], function (err,rows,fields){
			if(err){
				console.log(new Date().toUTCString()+"  :  "+"Erro de pesquisa");
				res.end();
			}
			else{
				
				if (rows.length==0){
					console.log(new Date().toUTCString()+"  :  "+"Nao existe esse utilizador");
					res.end();
				}
				else{
					var password = crypto.createHash('md5').update(info.pass.concat(rows[0].salt)).digest('hex');
					if(password == rows[0].pass){
						//ver se pode juntar a um jogo senao cria um
						
						if(struture.length==0){
							//inicia jogo
							var key = crypto.createHash('md5').update(chance.string()).digest('hex');
							var game = struture.length;
							var tab = [];
							
							
							switch (info.size){
							case '1': tab = [[null,null,null,null],			//primeira linha e coluna com null's para poder aceitar row e col de 1 a size
											[null,false, false, false],
											[null,false, false, false],
											[null,false, false, false]]; 
									break;
							case '2': tab = [[null,null,null,null,null],
							                 [null,false, false, false,false],
							                 [null,false, false, false,false],
							                 [null,false, false, false,false],
							                 [null,false, false, false,false]]; 
									break;
							case '3': tab = [[null,null,null,null,null,null],
							                 [null,false, false, false,false,false],
							                 [null,false, false, false,false,false],
							                 [null,false, false, false,false,false],
							                 [null,false, false, false,false,false],
							                 [null,false, false, false,false,false]]; 
									break;
							default: break;
							
							}
							
							var insertStruture = {'game': game, 'key': [key], 'type': info.type, 'size': info.size , 'tab' : tab, 'players': [info.name]};
						
							struture.push(insertStruture);
							console.log(new Date().toUTCString()+"  :  "+info.name+ " criou um jogo");
							
							var myJSON = {};
							myJSON.game=game;
							myJSON.key=key;
							
							var jsonResult = JSON.stringify(myJSON);
							res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8', 
								'Access-Control-Allow-Origin' : '*'}
							);
							res.end(jsonResult);
						}
						else{
							var find = false;
							
							
							for (var i=0; i<struture.length; i++){
						
									if(struture[i].type == info.type && struture[i].size == info.size && struture[i].players.length==1){
										var key = crypto.createHash('md5').update(chance.string()).digest('hex');
										struture[i].key.push(key);
										struture[i].players.push(info.name);
										
										console.log(new Date().toUTCString()+"  :  "+info.name+" juntou-se a um jogo");
										find = true;
										
										var myJSON = {};
										myJSON.game=struture[i].game;
										myJSON.key=struture[i].key[1];
										
										var jsonResult = JSON.stringify(myJSON);
										res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8', 
											'Access-Control-Allow-Origin' : '*'}
										);
										res.end(jsonResult);
										
									}
							}
							if(!find){
									//inicia jogo
									var key = crypto.createHash('md5').update(chance.string()).digest('hex');
									var game = struture.length+1;
									var tab = [];
									
									switch (info.size){
									case '1': tab = [[null,null,null,null],			//primeira linha e coluna com null's para poder aceitar row e col de 1 a size
													[null,false, false, false],
													[null,false, false, false],
													[null,false, false, false]]; 
											break;
									case '2': tab = [[null,null,null,null,null],
									                 [null,false, false, false,false],
									                 [null,false, false, false,false],
									                 [null,false, false, false,false],
									                 [null,false, false, false,false]]; 
											break;
									case '3': tab = [[null,null,null,null,null,null],
									                 [null,false, false, false,false,false],
									                 [null,false, false, false,false,false],
									                 [null,false, false, false,false,false],
									                 [null,false, false, false,false,false],
									                 [null,false, false, false,false,false]]; 
											break;
									default: break;
									
									}
									
									var insertStruture = {'game': game, 'key': [key], 'type': info.type, 'size': info.size, 'tab' : tab, 'players': [info.name]};
								
									struture.push(insertStruture);
									console.log(new Date().toUTCString()+"  :  "+info.name+ " criou um jogo");
									
									var myJSON = {};
									myJSON.game=game;
									myJSON.key=key;
									
									var jsonResult = JSON.stringify(myJSON);
									
									res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8', 
										'Access-Control-Allow-Origin' : '*'}
									);
									res.end(jsonResult);
									
							
							}
							
						
						}
						
						
					}
				}
			}
			
		});
	}
	
}
);
server.listen(8010);
console.log(new Date().toUTCString()+"  :  "+"Listening on server twserver.alunos.dcc.fc.up.pt:8010");
console.log(new Date().toUTCString()+"  :  "+"Listening on port 8010");


/**
 * verifica se o tipo de jogo corresponde a um ja existente, cujos nomes estao na BD
 * se nao houver problemas lista os 10 rankings mais altos por ordem decrescente, assim fica em primeiro o mais alto
 * se houver problemas devolve mensagem 400-Bad Request visto ter sido erro do cliente
 * 
 * 
 * @param info
 * @param res
 * @param bool
 */
function writeRanks(info, res, bool){
	
	if(bool){
	conn.query('SELECT * FROM Rankings WHERE gametype=? && boardsize=? ORDER BY score DESC LIMIT 10',[ info.type, info.size ] , function(err, rows, fields){
		if(err){
			console.log(new Date().toUTCString()+"  :  "+"Erro de pesquisa");
			res.end();
		}
		else{
			
			var ranking = [];
			for(var i = 0; i<rows.length; i++){
			
				//console.log(rows[i].name);
				var entry = {'name' : rows[i].name ,'score': rows[i].score};
				ranking.push(entry);
	
			}

			var myJSON = JSON.stringify({ranking : ranking});
			console.log(new Date().toUTCString()+"  :  "+myJSON);
			res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8', 
				'Access-Control-Allow-Origin' : '*'}
			);
			res.end(myJSON);
		}
	});
	}
	else {
		console.log(new Date().toUTCString()+"  :  "+"Tipo de jogo não existente");
		res.writeHead(400, {'Content-Type': 'application/json; charset=utf-8', 
			'Access-Control-Allow-Origin' : '*'}
		);
		res.end();
	}
}

/**
 * verifica conteudo do campo name se contem os caracteres permitidos
 * verifica se o name esta inserido na base de dados, se nao insere e da OK, se ja estiver compara os hash MD5 concatenado com o salt
 * no final devolve resposta de 200-OK ou 400-Bad Request
 * 
 * @param request
 * @param res
 */
function register(request, res){
	var info = request.query;		//array associativo de query strings
	
	
	var bool = false;
	var jsonResult = {};
	var pattern=/\W/;
	if(!pattern.test(info.name)){		//nome aceite pelo servidor		
		conn.query("SELECT * FROM Users WHERE name=?", info.name, function(err,rows,fields){
			if(err){
				console.log(new Date().toUTCString()+"  :  "+"ERRO de pesquisa");
				res.end();
			}
			else{
				if(rows.length==0){
					console.log(new Date().toUTCString()+"  :  "+"Sem resultados");
					//inserir user na BD
					conn.beginTransaction(function(err) {
						if (err) { throw err; }
						var sal = chance.string({length:4, alpha: true});
						var password = crypto.createHash('md5').update(info.pass.concat(sal)).digest('hex');
						
						conn.query('INSERT INTO Users SET name=?, pass=?, salt=?', [ info.name, password, sal ], function(err, result) {
							if (err) {
								conn.rollback(function() { throw err; });
							}
							conn.commit(function(err) {
								if (err) {
									conn.rollback(function() { throw err; });
								}
								console.log(new Date().toUTCString()+"  :  "+'Utilizador inserido');
							});
						});
				
					});
					bool=true;
					console.log(new Date().toUTCString()+"  :  "+"Tentativa com sucesso para o utilizador: "+info.name);
					res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8', 
						'Access-Control-Allow-Origin' : '*'}
					);
					res.end(JSON.stringify(jsonResult));
				}
				else{
					//verificar se as credenciais do utilizador estao de acordo com a BD
					
					
					
					for(var i=0; i<rows.length;i++){
						var password = crypto.createHash('md5').update(info.pass.concat(rows[i].salt)).digest('hex');
						
						
						if(rows[i].pass==password){
							
							bool = true;
							console.log(new Date().toUTCString()+"  :  "+"Tentativa com sucesso para o utilizador: "+info.name);
							res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8', 
								'Access-Control-Allow-Origin' : '*'}
							);
							res.end(JSON.stringify(jsonResult));
						}
					}
					if(!bool){
						jsonResult.error = 'Utilizador registado com senha diferente';
						console.log(new Date().toUTCString()+"  :  "+"Tentativa falhada para o utilizador: "+info.name);
						res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8', 
							'Access-Control-Allow-Origin' : '*'}
						);
						res.end(JSON.stringify(jsonResult));
					}
					
				}	
			}	
		});
	}
	else{
		console.log(new Date().toUTCString()+"  :  "+"Nome contém caracteres não suportados para username");
		res.writeHead(400, {'Content-Type': 'application/json; charset=utf-8', 
			'Access-Control-Allow-Origin' : '*'}
		);
		res.end();
	}
	
}

function giveQuestions(info, res, bool){
	
	if(bool){
		var type = "";
	
		var size= 0;
	
		switch(info.size){
		case '1': size=3; break;
		case '2': size=4; break;
		case '3': size=5; break;
		default : break;
		}
		
		switch(info.type){
		case "antonyms": type= "Antonyms"; break;
		case "synonyms": type= "Synonyms"; break;
		case "translation": type= "Translation"; break;
		case "arithmetic": type= "Arithmetic"; break;
		default : break;
	
		}
		var m = size*size;
	
		if(type=="Arithmetic"){
			var array = randomArray(150);
			var questions = [];
			for(var i=1;i<=m; i++){
				var entry = {'question': makeAProblem(array[i], array.length) , 'answer' : array[i]};
				questions.push(entry);
				if(questions.length==m){				//significa que ja foram colacadas todas as questoes no objecto, enviar a resposta
					var myJSON = JSON.stringify( {questions : questions});
					console.log(new Date().toUTCString()+"  :  "+myJSON);
					res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8', 
						'Access-Control-Allow-Origin' : '*'}
					);
					res.end(myJSON);
				}
			}
			
		}
		else{
			conn.query('SELECT COUNT(*) AS count FROM ??', type, function(err,rows,fields){
				if(err){
					console.log(new Date().toUTCString()+"  :  "+"Erro de pesquisa1");
					res.end();
				}
				else{
			
					
					var n = rows[0].count;
					var array = randomArray(n);
					var questions = [];
				
					for(var i=1; i<=m; i++){		//comeca em 1 por causa dos id's e dos indices de array[i]
					
						conn.query('SELECT * FROM ?? WHERE id=? ', [type , array[i] ] ,function(err,rows,fields){
							if(err){
								console.log(new Date().toUTCString()+"  :  "+"Erro de pesquisa2");
								res.end();
							}
							else{
								//guardar par de question e answer na nossa resposta
								var entry = {'question': rows[0].question , 'answer' : rows[0].answer};
								//console.log(rows[0].id+" "+rows[0].question+" "+rows[0].answer);
								questions.push(entry);
							
								if(questions.length==m){				//significa que ja foram colacadas todas as questoes no objecto, enviar a resposta
									var myJSON = JSON.stringify( {questions : questions});
									console.log(new Date().toUTCString()+"  :  "+myJSON);
									res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8', 
										'Access-Control-Allow-Origin' : '*'}
									);
									res.end(myJSON);
								}
							
							}
						});
					
					}
				
				
				}
			});
		}
	}
	else{
		console.log(new Date().toUTCString()+"  :  "+"Tipo de jogo não existente");
		res.writeHead(400, {'Content-Type': 'application/json; charset=utf-8', 
			'Access-Control-Allow-Origin' : '*'}
		);
		res.end();
	}
	
}

/**
 * Funcao auxiliar para obter o vector com os indices baralhados de forma a nao obter numeros repetidos
 * 
 * @param size
 * @returns
 */
function randomArray (size){
	var array = new Array();
		
		for (var i=1; i<=size;i++)
			array[i]=i;
		
		for (var k=1; k<=size; k++){
			var j = Math.floor(Math.random()*size);
			var temp = array[k];
			array[k] = array[j];
			array[j] = temp;
		}
		
		return array;
		
}

function makeAProblem( num , size){
	
	var a = Math.floor(Math.random()*size+1);
	
	var b = num-a;
	
	if(b<0){
		return a +""+b;
	}
	else{
		return a +"+"+b;
	}
	
}

/**
 * 
 * 
 * @param info
 * @param res
 */
function testNotify(info, res){
	 
	var size=0;
	
	switch (struture[info.game].size){
	case '1': size=3;
	case '2': size=4;
	case '3': size=5;
	default: break;
	
	}
	

	
	
	conn.query('SELECT * FROM Users WHERE name=?', [info.name], function(err,rows,fields){
		if(err){
			console.log(new Date().toUTCString()+"  :  "+"Erro de pesquisa");
			res.end();
		}
		else{
			if(struture[info.game].game==info.game){
				var bool=false;
				for(var i=0; i<struture[info.game].key.length;i++){
					if(struture[info.game].key[i]==info.key && struture[info.game].players[i]==info.name){
						bool=true;
					}
				}	
					
					if(bool){
						
							if(info.row>=1 && info.col>=1 && info.row<=size && info.col<=size){
							
								var jsonResult={};
							
								if(struture[info.game].tab[info.row][info.col]==false){ //ladrilho ainda nao foi removido logo a jogada é valida
								 
									struture[info.game].tab[info.row][info.col]=true;
									res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8', 
										'Access-Control-Allow-Origin' : '*'}
									);
									res.end(JSON.stringify(jsonResult));
								}
								else{ //ladrilho ja foi removido
									jsonResult.error = 'Ladrilho ' + info.row+ ', ' + info.col + ' ja foi removido';
									console.log(JSON.stringify(jsonResult));
									res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8', 
										'Access-Control-Allow-Origin' : '*'}
									);
									res.end(JSON.stringify(jsonResult));
								}
							
							
							}
							else{
								console.log(new Date().toUTCString()+"  :  "+"Célula inválida");
								res.end();
							}
					}
					else{
						console.log(new Date().toUTCString()+"  :  "+"Chave incorrecta para o jogo");
						res.end();
					}
				
			}
			else{
				console.log(new Date().toUTCString()+"  :  "+"Jogo inexistente");
				res.end();
			}
		}
		
	});
	
};
