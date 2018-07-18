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

var root = scopeNew();
var astScope = scopeNew(root);
classNew(root, "Class"),
classNew(root, "Undf", {
  default: undefined
}),
classNew(root, "Num", {
  default: 0,
}),
classNew(root, "Int", {
	parent: [root.Num],
  default: 0,
}),
classNew(root, "Str", {
  default: "",
}),	
classNew(root, "Arr", {
  default: []
}),
classNew(root, "Dic", {
  default: {}
}),
classNew(root, "Func", {
  default: function(){} 
}),
classNew(root, "Obj"),
classNew(root, "Call", {
	schema:{
		func: root.Func,
		args: root.Arr,
	}
})
classNew(root, "ArrCall", {
	parent: [root.Arr],
	element: root.Call,
})
classNew(root, "Addr", {
	schema:{
		lexScope: root.Scope,
		args: root.Arr,
		level: root.Int
	}
})
classNew(root, "Stack", {
  default: []	
})
funcNew(root, "Stack_pop", {
})
funcNew(root, "Stack_push", {
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
						function funcNew(){
						}
function objNew(scope, proto){
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
function scopeNew(pscope, name, parent){
	var proto = {};
	var x = proto.__ = {parent: pscope};
	Object.defineProperty(proto, '__', {
		enumerable: false,
		configurable: false
	});
	x.index = 0;
  x.name = name;
	if(!pscope){ //isroot
	  x.id = "root";
	}else{
  	if(name == undefined){
  	  name = pscope.__.index.toString();
  		pscope.__.index++;
  	}	
  	if(!pscope.__.parent){	//parent isroot
  		x.id = name;	  
  	}else{
  		x.id = pscope.__.path + "_" + name;
  	}
	}
	pscope[name] = proto;
	return proto;
}
function classNew(scope, name, conf){
	var p = scope[name] = conf || {}
	p.__ = [root.Class]
	return p;
}
async function scopeGet(scope, key){
  if(haskey(scope, key)){
    return scope[key];
  }
	let str = await dbGet(scope.__.id, key)
	if(str){
		//TODO key match _, get subcpt		
		scopeSet(scope, key, progl2elem(str, scope));
	}
	return undefined
}
async function scopeSet(cpt, key, val){
	cpt[key] = val;
}

function type(e){
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
		return "Scope";
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
	var t = type(cpt);
	switch(t){
		
	}
}
async function dbGet(id, sname){
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
