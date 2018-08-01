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
var execsp = scopeNew(root, "exec");
var def = scopeNew(root, "def");
var astScope = scopeNew(def);
classNew(def, "Class")
classNew(def, "Obj")
classNew(def, "Callable")
classNew(def, "Raw", {}, [def.Callable])
classNew(def, "Var", {
	schema: {
		type: def.Class
	}
})
classNew(def, "Undf", {
  default: undefined
}, [def.Raw])
classNew(def, "Num", {
  default: 0
}, [def.Raw])
classNew(def, "Str", {
  default: "",
}, [def.Raw])
classNew(def, "Arr", {
  default: []
}, [def.Raw])
classNew(def, "Dic", {
  default: {}
}, [def.Raw])
classNew(def, "Argdef", {
  default: [[]]
}, [def.Raw])
classNew(def, "Call", {
	schema:{
		func: def.Func,
		args: def.Arr,
	}
}, [def.Callable])
classNew(def, "Ctrl")
classNew(def, "Block", {
	default: {
		block: [],
		labels: {}
	}
}, [def.Raw])
classNew(def, "Func");	
classNew(def, "Function", {
  default: function(){}
}, [def.Raw]);
classNew(def, "FuncNative", {
  schema: {
    func: def.Function,
    argdef: def.Argdef,
  }
}, [def.Func]);
classNew(def, "FuncBlock", {
  schema: {
    block: def.Block,
    argdef: def.Argdef,
  }
}, [def.Func]);

funcNew(def, "log", function(s){
	console.log(s);
}, [["s"]])
funcNew(def, "state", function(){
	var self = this;
	return self.x.state;
})
funcNew(def, "global", function(){
	var self = this;
	return self.x.global;
})
funcNew(def, "set", function(p, k, v){
	return p[k] = v;
}, [["p"], ["k"], ["v"]])
funcNew(def, "get", function(p, k){
	return p[k];
}, [["p"], ["k"]])
funcNew(def, "concat", function(p, k, v){
	return p[k] += v;
}, [["p"], ["k"], ["v"]])


var execarg = [["o"]];
funcNew(execsp, "Call", async function(o){
  var func = await exec(o.func, this);
	var arrx = [];
	for(var i in o.args){
		arrx[i] = await exec(o.args[i], this);
	}
  return await call(func, arrx, this);
}, execarg)

funcNew(execsp, "Block", async function(o){
	return blockExec(o, this)
}, execarg)

funcNew(execsp, "Arr$elementCallable", async function(o){
	var self = this;
	var arrx = [];
	for(var i in o.val){
		arrx[i] = await exec(o.val[i], self);
	}
	return arrx;
}, execarg)

funcNew(execsp, "Dic$elementCallable", async function(o){
	var dicx = [];
	for(var k in o.val){
		dicx[k] = await exec(o.val[k], this);
	}
	return dicx;
}, execarg)

funcNew(execsp, "Raw", function(o){
	return o.val;
}, execarg)

funcNew(execsp, "Class", function(o){
	return o;
}, execarg)
var objList = {};
objList.undf = objNew(def.Undf, {val: undefined})
//parser function
function valCopy(item){
  let result = undefined;
  if(!item) return result;
  if(Array.isArray(item)){
    result = [];
    item.forEach(element=>{
      result.push(valCopy(element));
    });
  }else if(item instanceof Object && !(item instanceof Function) && !item.__){ 
    result = {};
    for(let key in item){
      if(key){
        result[key] = valCopy(item[key]);
      }
    }
  }
  return result || item;
}
function callNew(func, args){
	if(!args) args = []
	return objNew(def.Call, {
		func: func,
		args: args
	});
}
//internal function
function funcNew(scope, name, func, argdef){
	var a = objNew(def.Argdef, argdef);
	var o = objNew(def.FuncNative, {
		argdef: a,
		func: func
	}, name);
	return scope[name] = o;
}
function objNew(cla, proto, name){
	if(!cla) die()
	if(!proto) proto = {};
	for(var k in cla.default){
		if(!haskey(proto, k))
			proto[k] = valCopy(cla.default[k])
	}
	proto.__ = {
		type: cla.__.id,
		ext: {}
	};
  if(name)
    proto.__.name = name
	return proto;
}
function extname(conf){
	var r = "";
	for(var k in conf){
		r+=k;
		var v = conf[k];
		switch(rawType(v)){
		case "Class":
			r+=v.__.id.replace("_", "");
			break;
		case "Num":
			r+=v.toString();
			break;
		case "Str":
			r+=v;
			break;
		default:
			die("TODO: "+rawType(v))					
		}
	}
	return r;
}
function classSub(c, conf){
  var name = c.__.name + "$"+extname(conf);
	if(c.__.parent[name])
		return c.__.parent[name];
  return classNew(c.__.parent, name, conf, [c]);
}
function route(pscope, name){
	var p = {};
	var x = p.__ = {};
	Object.defineProperty(p, '__', {
		enumerable: false,
		configurable: false
	});
	if(!pscope) return p;
	pscope[name] = p;	
  if(name == undefined){
  	name = pscope.__.index.toString();
  	pscope.__.index++;
  }
	x.name = name;	
	
  if(!pscope.__.id){	//parent isroot
		x.id = ".";
		x.ns = name;
  }else if(pscope.__.id == "."){	//grandparent is root
  	x.id = name;
		x.ns = pscope.__.ns;		
  }else{
  	x.id = pscope.__.id + "_" + name;
		x.ns = pscope.__.ns;				
  }
	x.parent = pscope
	return p;
}
function classNew(pscope, name, conf, cla){
	var p = route(pscope, name);
	var x = p.__;
	for(var k in conf){
		x[k] = conf[k];
	}
	x.parents = {};
  if(!cla)
		cla = [def.Class];		
  for(var i in cla){
    x.parents[cla[i].__.name] = cla[i];
  }	
	return p;
}
function varNew(pscope, name, cla){
	var p = route(pscope, name);
	p.type = cla;
	return p;
}
function scopeNew(pscope, name){
	var p = route(pscope, name);	
	var x = p.__;
	x.parents = {};
	x.index = 0;
	return p;
}
async function scopeGetOrNew(scope, key){	
	var x = await scopeGet(scope, key);
	if(!x) x = scopeNew(scope, key);
	return x;
}
async function scopeGetSub(scope, key, cache){
	if(haskey(scope, key)){
    return scope[key];
  }
	let str = await dbGet(scope.__.ns, scope.__.id, key);
	if(str){
		//TODO key match _, get subcpt		
		var rtn = await progl2obj(str, scope);
		return scope[key] = rtn;
	}
	for(var k in scope.__.parents){
		if(cache[k]) continue;
		cache[k] = 1;		
		var r = await scopeGetSub(scope.__.parents[k], key, cache);
		if(r) return r;		
	}
}
async function scopeGet(scope, key){	
	var r = await scopeGetSub(scope, key, {});
	if(r) return scope[key] = r;
	if(scope.__.parent)
		return await scopeGet(scope.__.parent, key);
}

function rawType(e){
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
		if(!x || !x.value) return "Dic";
		if(x.enumerable == true)
			return "Obj";
		if(haskey(x.value, "index"))
			return "Scope";
		return "Class";
	case "function":
		return "Func";
  default:
    die("wrong cpt type", e);
  }
}

function haskey(x, k){
  return Object.getOwnPropertyDescriptor(x, k);
}
async function istype(obj, type){
  
}
async function execGet(sp, esp, t){
	var r = await scopeGet(esp, t);
	if(r) return r;
	var tt = await scopeGet(sp, t);
	for(var k in tt.__.parents){
		r = await execGet(sp, esp, k);
		if(r) return r;
	}	
}
async function exec(obj, conf){
	var s = conf.s;
	var e = conf.e;
	var x = conf.x;
	var t = obj.__.type;
//	console.log(t)
  var ex;
	if(!x.init){
		x.state = objNew(def.Dic, {})
		x.stack = objNew(def.Arr, [])
		x.global = objNew(def.Dic, {})
		x.init = 1;
	}
  if(!x[t]){
		ex = await execGet(s, e, t);
		if(!ex)
			die(t+" not exec defined");
    x[t] = ex
  }else{
		ex = x[t];
	}
  return await call(ex, [obj], conf);
}
function stateLoad(argdef, args, x){
	return objNew(def.Dic, {})
}
async function blockExec(b, conf, stt){
	if(stt) stt = b.labels[stt];
	var r;
	for(var i in b.arr){
		if(stt && stt < i)
			continue;
		r = await exec(b.arr[i], conf);

		if(rawType(r) == "Obj" && r.__.type == "Return")
			return r.args[0];
	}
	return r;
}
async function call(func, args, conf){
  if(func.func){//is FuncNative
//		log(func.__.name)
    return await func.func.apply(conf, args)
  }
		//is FuncBlock
	var x = conf.x;
	var state = stateLoad(func.argdef, args, x);
	x.stack.val.push(x.state);
	x.state = state;
	var r= await blockExec(func.block, conf);
	x.state = x.stack.val.pop();
	return r;
}
function dbPath(x){
	var prefix = "~/soul/db";
	var id, ns;
	if(!x.__.id)
		id = "."
	else
		id = x.__.id
	if(!x.__.ns)
		ns = ""
	else
		ns = "/" + x.__.ns
	return prefix + ns + "/" + id.replace("_", "/")
}
async function dbGet(ns, id, sname){
//	die()
  return "";
}
function raw2obj(r){
	var t = rawType(r)
	switch(t){
	case "Num":
		return objNew(def.Num, {val: r});
	case "Str":
		return objNew(def.Str, {val: r});
	case "Undf":
		return objList.undf;
	default:
		return r;
	}
}
async function progl2obj(str, cpt){
  var ast = proglparser.parse(str);
	log(ast)
	return await ast2obj(cpt, ast)
}
async function ast2obj(scope, ast){
  if(typeof ast != "object") return ast;
	var t = ast[0];
	var v = ast[1];
	var v2 = ast[2];	
  switch(t){
	case "main":
		return 
	case "num":
		var p = {};
		var c = 1;
		while(c){
			var l = v[v.length-1];
			switch(l){
			case "u":
				p.unsigned = 1;
				break;
			case "s":
				p.storage = "short";
				break;
			case "l":
				p.storage = "long";
				break;
			case "b":
				p.storage = "big";
				break;
			case "f":
				p.storage = "float";
				break;
			default:
				c = 0;
				continue;
			}
			v = v.substr(0, v.length - 1);			
		}
		if(v.match("\\.")) p.float = 1;
		if(v.match(/[eE]/)) p.sci = 1;
		if(v.match(/[xX]/)) p.hex = 1;
		p.val = Number(v);
		return objNew(def.Num, p);
		
	case "str":
		return objNew(def.Str, {val: v});
	
	case "call":
		var func = await ast2obj(scope, v);
		var args = await ast2obj(scope, ['arr', v2]);
		if(v[0] == "get")
			args.val.unshift(func.args[0]);
		return callNew(func, args.val);
		
	case "assign":
		var args = [];
		var getv = await ast2obj(scope, v[0]);
		if(getv.__.type == "Call"){
			args[0] = getv.args[0];
			args[1] = getv.args[1];
		}else{
			args[0] = getv.__.parent;
			args[1] = raw2obj(getv.__.name);
		}
		args[2] = await ast2obj(scope, v[1]);
		if(!v[2]){
			return callNew(def.set, args);
		}
		if(v[2] == "plus"){
			return callNew(def.concat, args);
		}
		args[2] = callNew(def[v[2]], [getv, args[2]]);
		return callNew(def.set, args);
		
	case "idf":
		return await scopeGet(scope, v);
		
	case "id":
		var a0;
		if(scope[v]){
			a0 = callNew(def.state);
		}else{
			var r = await scopeGet(scope, v);
			if(r)
				return r;
			a0 = callNew(def.global);
		}
		a1 = raw2obj(v);
		return callNew(def.get, [a0, a1]);
	case "local":
		var t;
		if(v2)
			t = await ast2obj(scope, v2);
		else
			t = def.Class;
		varNew(scope, v, t);
		var a0 = callNew(def.state);
		var a1 = raw2obj(v);
		return callNew(def.get, [a0, a1]);		
		
	case "get":
		var a0 = await ast2obj(scope, v[0]);
		var a1 = await ast2obj(scope, v[0]);
		return callNew(def.get, [a0, a1]);
		
	case "arr":
		var arrx = [];
		for(var i in v){
			arrx[i] = await ast2obj(scope, v[i]);
		}
		var c = classSub(def.Arr, {element: def.Callable});
		return objNew(c, {
			val: arrx
		})
	case "func":
		return;
	case "dic":
		if(!v2){
			var kall = 1;
			for(var i in v){
				if(!haskey(v[i], 1)){
					kall = 0;
					break;
				}
			}
			if(kall) v2 = "Dic";
			else v2 = "Block";
		}
		if(v2 == "Block"){
			var arr = [];
			var labels = {};
			for(var i in v){
				var x = v[i];
				var y = await ast2obj(scope, x[0]);
				arr.push(y);
				labels[x[1]] = i;
			}
			return objNew(def.Block, {arr:arr, labels: {}});
		}
		if(v2 == "Dic"){
			var dicx = {};
			var iscallable = 0;
			for(var i in v){
				var x = v[i];
				var y = await ast2obj(x[0], scope);
				dicx[x[1]] = y;
				if(!iscallable && istype(y, "Callable")){
					iscallable = 1;
				}
			}
			var c;
			if(iscallable)
				c = classSub(def.Dic, {element: def.Callable});
			else
				c = def.Dic;
			return objNew(c, {val: dicx});			
		}
	case "ctrl":
		return;
	default:
		console.log(ast);
		die("type error");
	}
}
