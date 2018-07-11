//parser function
function xp(k, a1, a2){
	switch(k){
	case "id":
		break;
	case "call":
		break;		
	}
}
//internal function
var defaultProtos = {
	"Arr": []
}
function elem(type, proto){
	if(proto == undefined && defaultProtos[type])
		proto = defaultProtos[type];
	
}
function name(e, n){
}
async function get(scope, key, config){
}
async function ast2elem(ast, scope){
}
async function idg(){
}
module.exports = {
	xp: xp,
	
	ast2elem: ast2elem
}
