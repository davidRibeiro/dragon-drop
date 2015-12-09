var elemFade;			//elemento para desaparecer
var opacityState;
var timeFade;			
/*para fazer fade out nos pointsFade*/
function fade(id){
	 elemFade = document.getElementById(id);
	 elemFade.style.display="table";
	 opacityState=1;
	 timeFade=setInterval(fade_, 350);
};

function fade_(){
	opacityState-=0.1;
	elemFade.style.opacity=opacityState;
	if(opacityState==0){
		clearInterval(timeFade);
	}
};
/*criar um canvas para dar mensagem de vencedor ou derrotado*/
function result(bool){
	var c= document.getElementById("resultCanvas");
	c.style.display="block";
	c.setAttribute("width", "1100");
	c.setAttribute("height", "100");
	document.getElementById("logM").appendChild(c);
	var ctx=c.getContext("2d");
	ctx.font="45px Book Antiqua";
	ctx.fillStyle="#000000";
	ctx.shadowOffsetX = 4;
	ctx.shadowOffsetY = 4;
	ctx.shadowBlur = 3;
	ctx.shadowColor = "rgba(0,0,0,0.6)";
	if(bool) ctx.fillText("Parab\u00E9ns, foste t\u00E3o r\u00E1pido que derrotaste o drag\u00E3o!", 50, 50);
	else ctx.fillText("Lamento mas foste muito lento e o drag\u00E3o matou-te.", 50,50);
};