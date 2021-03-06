var fs = require("fs");
var path = require("path");

module.exports = {
	setroot: setroot,
	open: open,
	close: close,
	get: get,
	set: set
}
var root = __dirname + "/../root";
function setroot(_root){
	root = _root;	
}

function get(key, fn){
	var tpath = path.join(root, key.replace(/([^_\/])_/, "$1/"));
	if(fs.existsSync(tpath+'.sl')){
		return fn(fs.readFileSync(tpath +".sl").toString() || "");		
	}
	fn();
}
function set(key, str, fn){
	var tpath = path.join(root, key+".t");
	fs.writeFileSync(tpath, str);
	fn();
}
/*
function unparse(obj){
	var str = "";
	var type = typeof obj.val;
	if(type == "object"){
		for(var key in obj){
		}
	}else if(type == "string"){
		str = "\""+obj.val+"\"";
	}else if(type == "number"){
		str = obj.val.toString();
	}else{
		console.log("!!!");		
		console.log(obj);
	}
	return str;	
}
*/
function open(fn){
	fn()
}
function close(fn){
	fn();
}
