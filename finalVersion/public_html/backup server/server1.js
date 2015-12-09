
var mysql = require('mysql');
/*
var conn = mysql.createConnection({
host : 'localhost', // Parâmetros da conexão à BD
user : 'up201003837',
password : 'twserver',
database : 'up201003837'
});
conn.connect(function(err) {
	if (err) {
	// Tratamento do erro
		console.log("ERRO: "+err);
	
	} else {
		console.log('Connected!');
	}
});
*/

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




var http = require('http');
var url = require('url');
var Chance = require('chance');
var chance = new Chance();
var crypto = require('crypto');

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
		
		coon.query('SELECT * FROM ?? WHERE name=?',[Users, info.name], function (err,rows,fields){
			if(err){
				
			}
			
			
		});
		
		
	}
	else if(request.pathname=="/update"){
		
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
	var password = crypto.createHash('md5').update(info.pass).digest('hex');
	
	var bool = false;
	var jsonResult = {};
	var pattern=/\W/;
	if(!pattern.test(info.name)){		//nome aceite pelo servidor		
		conn.query("SELECT * FROM Users WHERE name=?", info.name, function(err,rows,fields){
			if(err)
				console.log(new Date().toUTCString()+"  :  "+"ERRO de pesquisa");
			else{
				if(rows.length==0){
					console.log(new Date().toUTCString()+"  :  "+"Sem resultados");
					//inserir user na BD
					conn.beginTransaction(function(err) {
						if (err) { throw err; }
						var sal = chance.string({length:4});
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
						if(rows[i].pass.concat(rows[i].salt)==password.concat(rows[i].salt)){
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
				}
				else{
			
					
					var n = rows[0].count;
					var array = randomArray(n);
					var questions = [];
				
					for(var i=1; i<=m; i++){		//comeca em 1 por causa dos id's e dos indices de array[i]
					
						conn.query('SELECT * FROM ?? WHERE id=? ', [type , array[i] ] ,function(err,rows,fields){
							if(err){
								console.log(new Date().toUTCString()+"  :  "+"Erro de pesquisa2");
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
	
	
