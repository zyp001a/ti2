Object.defineProperty(global, '__stack', {
	get: function() {
    var orig = Error.prepareStackTrace;
    Error.prepareStackTrace = function(_, stack) {
      return stack;
    };
    var err = new Error;
    Error.captureStackTrace(err, arguments.callee);
    var stack = err.stack;
    Error.prepareStackTrace = orig;
    return stack;
  }
});
Object.defineProperty(global, '__line', {
	get: function() {
    return __stack[2].getLineNumber();
  }
});
Object.defineProperty(global, '__line2', {
	get: function() {
    return __stack[3].getLineNumber();
  }
});
Object.defineProperty(global, '__function', {
	get: function() {
    return __stack[2].getFunctionName();
  }
});
Object.defineProperty(global, '__file', {
	get: function() {
    return __stack[2].getFileName();
  }
});
function log(str){
	console.log(__line+":"+__file+":"+__function+":"+__line2);
	console.log(str);	
}
function die(){
  for(var i in arguments){
    console.error(arguments[i]);
  }
  console.error(getStackTrace());
  process.exit();
}
function getStackTrace(){
  var obj = {};
  Error.captureStackTrace(obj, getStackTrace);
  return obj.stack.toString().replace("[object Object]\n","");
}

var root = newCpt();
var astCpt = newCpt(root);
newCpt(root, "Undf", {default: undefined}),			
newCpt(root, "Num", {default: 0}),
newCpt(root, "Str", {default: ""}),	
newCpt(root, "Arr", {default: []}),
newCpt(root, "Dic", {default: {}}),
newCpt(root, "Func", {default: (self) => { return function(){} }}),
newCpt(root, "Cpt", {default: (self) => { return newCpt(self.cpt) }}),
newCpt(root, "Obj"),
newCpt(root, "Call", {
	schema:{
		func: root.Func,
		args: root.Arr,
	}
})

//parser function
function copy(item){
  let result = undefined;
  if(!item) return result;
  if(Array.isArray(item)){
    result = [];
    item.forEach(element=>{
      result.push(copy(element));
    });
  }
  else if(item instanceof Object && !(item instanceof Function)){ 
    result = {};
    for(let key in item){
      if(key){
        result[key] = copy(item[key]);
      }
    }
  }
  return result || item;
}
//internal function
function newObj(cpt, proto){
	for(var k in cpt.default){
		if(!haskey(proto, k))
			proto[k] = copy(cpt.default[k])
	}
	for(var k in cpt.schema){
		if(!haskey(proto, k))
			proto[k] = copy(cpt.schema[k].default)
	}
	proto.__ = cpt;
}
function newCpt(cpt, name, conf){
	var proto = {};
	var x = proto.__ = conf || {};
	conf.cpt = cpt;
	Object.defineProperty(proto, '__', {
		enumerable: false,
		configurable: false
	});
	x.index = 0;
  x.name = name;
	if(!cpt){ //isroot
	  x.id = "root";
	}else{
  	if(name == undefined){
  	  name = cpt.__.index.toString();
  		cpt.__.index++;
  	}	
  	if(!cpt.__.pcpt){	//parent isroot
  		x.id = name;	  
  	}else{
  		x.id = cpt.__.path + "_" + name;
  	}
	}
	cpt[name] = proto;
	return proto;
}
async function getCpt(cpt, key){
  if(haskey(cpt, key)){
    return cpt[key];
  }
	let str = await dbGet(cpt.__.id, key)
	if(str){
		var scpt = cpt
		//TODO key match _, get subcpt		
		setCpt(cpt, key, progl2elem(str, scpt));
	}
	return undefined
}
async function setCpt(cpt, key, val){
	var t = stype(val);
	if(t == "CptDef"){
		var ncpt = newCpt(cpt, key);
		ncpt.__.rels = val.val;
	}else if(t == "FuncDef"){
		cpt[key] = val;
	}
}
function type(e){
	var st = stype(e);
	if(st == "Obj")
		return e.__.__.id;
	return st;
}
function stype(e){
	switch(typeof e){
  case "boolean":
    return "Num";
  case "undefined":
    return "Undf";
  case "number":
    return "Num";
  case "string":
    return "Str";
  case "object":
		if(Array.isArray(e)) return "Arr";
		var x = Object.getOwnPropertyDescriptor(e, '__');
		if(!x) return "Dic";
		if(x.enumerable == true)
			return "Obj";
		return "Cpt";
	case "function":
		return "Func"
  default:
    die("wrong cpt type", e);
  }
}
function haskey(x, k){
  return Object.getOwnPropertyDescriptor(x, k);
}
async function exec(cpt, env){
	var t = stype(cpt);
	switch(t){
		
	}
}
async function dbget(id, sname){
  return "";
}
async function progl2elem(str, cpt){
  var ast = proglparser.parse(str);
	return await ast2elem(ast, cpt)
}
async function ast2elem(ast, cpt){
  if(typeof ast != "object") return ast;
  switch(ast[0]){
	  case "call":
		  var func = await ast2elem(ast[1], cpt);
		  var args = await ast2elem(ast[2], cpt);
		return newobj("Call", {
			func: func,
			args: args
		})
		case "id":
		  return getcpt(cpt, ast[1])
		case "arr":
		  var arres = [];
			for(var i in ast[1]){
			  arres[i] = await ast2elem(ast[1][i], cpt);
			}
		  return elem("ArrDef", arres, cpt);
	}
}
