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
function st(){
  console.log(getStackTrace());
}
function getStackTrace(){
  var obj = {};
  Error.captureStackTrace(obj, getStackTrace);
  return obj.stack.toString().replace("[object Object]\n","");
}
var prefix = process.env.HOME+"/soul/db";

function objInit(){
	var p = {};
	p.__ = {}
	Object.defineProperty(p, '__', {
		enumerable: false,
		configurable: false
	});
	return p;
}
function route(pscope, name, p){
	if(!p) die("error");
	var x = p.__;
	pscope[name] = p;	
  if(name == undefined){
  	name = pscope.__.index.toString();
		x.tmp = 1;
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
	x.scope = pscope
	return p;
}

function scopeInit(pscope, k, parents){
	var p = objInit();
	p.val = {}	
	var pp = p.scopeParents = {};
  for(var i in parents){
    pp[parents[i].__.id] = parents[i];
  }
	if(pscope)
		route(pscope, k, p);
	else //is root
		p.__.index = 0;
	return p;
}
var root = scopeInit();
var def = scopeInit(root, "def");
function classInit(pscope, name, parents, schema){
	var p = objInit();
	var x = p.__;
	p.classParents = {};	
  for(var i in parents){
    x.classParents[parents[i].__.id] = parents[i];//TODO reduce class tree
  }
	p.classSchema = {};	
	for(var k in schema){
		p.classSchema[k] = schema[k];
	}
	if(pscope)
		route(pscope, name, p);
	return p;
}
function consInit(c, limit){
	var p = objInit();
	p.__.class = def.Cons;
	var x = p.__;
	x.consLimit = limit;
	x.consClass = c;
	return p;	
}
classInit(def, "Obj");
classInit(def, "Class", [def.Obj])
classInit(def, "Cons", [def.Obj])
classInit(def, "Scope", [def.Obj])


root.__.class = def.Scope
def.__.class = def.Scope
def.Obj.__.class = def.Class
def.Class.__.class = def.Class
def.Scope.__.class = def.Class

function scopeNew(pscope, k, parents){
	//	x.indc = 0;
  if(pscope && k && k.match("_")){
    var arr = k.split("_");
    var xx = pscope;
    var xr;
    var i;
    for(i=0; i<arr.length;i++){
      xr = haskey(xx, arr[i]);
      if(!xr){
				if(i == arr.length - 1)
					scopeNew(xx, arr[i], parents);
				else
					scopeNew(xx, arr[i]);
			}
      xx = xx[arr[i]];
    }
    return xx;
  }
	
	var p = scopeInit(pscope, k, parents);
	p.__.class = def.Scope;
	return p;
}

function classNew(pscope, name, parents, schema){
	var p = classNew(pscope, name, parents, schema);
	p.__.class = def.Class;
	return p;
}

classNew(def, "Val", [def.Obj])
classNew(def, "Cons", [def.Obj])

function consNew(pscope, name, c, limit){
	var p = consInit(c, limit);
	route(pscope, name, p);
	return p;
}

consNew(def, "Null", def.Val);
consNew(def, "Num", def.Val);
consNew(def, "Sizet", def.Num);
consNew(def, "Str", def.Val)
consNew(def, "Funcv", def.Val);

classNew(def, "Items", [def.Val], {
	itemsType: def.Class
});
consNew(def, "Arr", def.Items)
consNew(def, "Dic", def.Items)
classNew(def, "List", [def.Val]);

classNew(def, "Argt", [def.Obj], {
	//TODO .. argtDefault
	argtName: def.Str,
	argtType: def.Class
});
classNew(def, "Func", [def.Obj], {
	funcReturnt: def.Class,
	funcArgts: consInit(def.Arr, {itemsType: def.Argt})
});
classNew(def, "Block", [def.Class], {
	block: def.Arr,
	blockLabels: consInit(def.Dic,{itemsType: def.Str})
})
consNew(def, "FuncNative", def.Func, {
	func: def.Funcv,
});
consNew(def, "FuncBlock", def.Func, {
	func: def.Block,
});
consNew(def, "FuncTpl", def.Func, {
	func: def.Str,
});
def.Class.classSchema = {
	classGetter: def.Dic,
	classSetter: def.Dic,
	classParents: def.Dic,
	classSchema: def.Dic
}
def.Cons.classSchema = {
	consClass: def.Class,
	cons: def.Dic
}
def.Scope.classSchema = {
	scopeParents: def.Dic
}

classNew(def, "Call", [def.Obj], {
	callFunc: def.Func,
	callArgs:	def.Arr,
})
consNew(def, "CallDic", def.Dic)
consNew(def, "CallArr", def.Arr)

classNew(def, "Ctrl", [def.Obj], {
	ctrlArgs: def.Arr,
})
consNew(def, "CtrlReturn", def.Ctrl)
consNew(def, "CtrlBreak", def.Ctrl)
classNew(def, "Return", [def.Obj], {
	return: def.Obj
})
classNew(def, "Ref", [def.Obj], {
	ref: def.Obj
});
consNew(def, "Ast", def.List);
consNew(def, "Main", def.Ref);


funcNew(function(s){
	console.log(s);
}, [["s"]], def, "log")
/*
funcNew(def, "push", function(arr, e){
	arr.push(e);
	return e;
}, [["arr"], ["e"]])
funcNew(def, "join", function(arr, str){
	return arr.join(str)
}, [["arr"],["str"]])

funcNew(def, "root", function(){
  return root;
})
funcNew(def, "esp", function(){
	var self = this;
	return self.e;
})
funcNew(def, "sp", function(){
	var self = this;
	return self.s;
})
funcNew(def, "state", function(){
	var self = this;
	return self.x.state;
})
funcNew(def, "global", function(){
	var self = this;
	return self.x.global;
})
funcNew(def, "val", async function(p){//property get val
	return p.val;	
}, [["p"]])
funcNew(def, "pget", async function(p, k){//property get
	return await exec(p[k], this);	
}, [["p"], ["k"]])
funcNew(def, "oget", function(p, k){//___ get
	return p.___[k];
}, [["p"], ["k"]])
funcNew(def, "rget", function(p, k){//__ get
	return p.__[k];
}, [["p"], ["k"]])
funcNew(def, "pset", function(p, k, v){
	return p[k] = v;
}, [["p"], ["k"], ["v"]])
funcNew(def, "set", function(p, k, v, t){//t is type 
  //TODO if type, check type
	return scopeSet(p, k, v)
}, [["p"], ["k"], ["v"], ["t"]])
funcNew(def, "get", async function(p, k){
	var r = await scopeGet(p, k);
	if(r)
		return r.value;
}, [["p"], ["k"]])
funcNew(def, "haskey", async function(p, k){
	return await scopeGet(p, k)  
}, [["p"], ["k"]])
funcNew(def, "aget", function(p, k){
  if(!p.___ && typeof p != "string"){
		log(p)
		log(k)		
		die("error")
	}
	return p[k]
}, [["p"], ["k"]])
funcNew(def, "aset", function(p, k, v){
  if(!p.___ && typeof p != "string"){
		log(p)
		log(k)		
		die("error")
	}
	return p[k] = v
}, [["p"], ["k"], ["v"]])
funcNew(def, "concat", function(p, k, v){
	return p[k] += v;
}, [["p"], ["k"], ["v"]])
funcNew(def, "splus", function(l, r){//string add
	return l + r;
}, [["l"], ["r"]])
funcNew(def, "plus", function(l, r){
	return l + r;
}, [["l"], ["r"]])
funcNew(def, "minus", function(l, r){
	return l - r;
}, [["l"], ["r"]])
funcNew(def, "times", function(l, r){
	return l * r;
}, [["l"], ["r"]])
funcNew(def, "obelus", function(l, r){
	return l / r;
}, [["l"], ["r"]])
funcNew(def, "mod", function(l, r){
	return l % r;
}, [["l"], ["r"]])
funcNew(def, "lshift", function(l, r){
	return l << r;
}, [["l"], ["r"]])
funcNew(def, "rshift", function(l, r){
	return l >> r;
}, [["l"], ["r"]])
funcNew(def, "gt", function(l, r){
	return l > r;
}, [["l"], ["r"]])
funcNew(def, "ge", function(l, r){
	return l >= r;
}, [["l"], ["r"]])
funcNew(def, "lt", function(l, r){
	return l < r;
}, [["l"], ["r"]])
funcNew(def, "le", function(l, r){
	return l < r;
}, [["l"], ["r"]])
funcNew(def, "eq", function(l, r){
	return l == r;
}, [["l"], ["r"]])
funcNew(def, "ne", function(l, r){
	return l != r;
}, [["l"], ["r"]])
funcNew(def, "not", function(l){
	return !l;
}, [["l"]])
funcNew(def, "defined", function(l){
	return l != undefined;
}, [["l"]])
funcNew(def, "uc", function(l){
	return l.toUpperCase();
}, [["l"]])
funcNew(def, "lc", function(l){
	return l.toLowerCase();
}, [["l"]])
funcNew(def, "len", function(l){
	return l.length;
}, [["l"]])
funcNew(def, "strlen", function(l){
	return l.length;
}, [["l"]])

funcNew(def, "isleaf", function(o){
	if(typeof o != "object") return 0;
	if(!o.__) return 0;
	return 1
}, [["o"]])

funcNew(def, "fileRead", function(f, c){
	return fs.readFileSync(f).toString();	
})
funcNew(def, "fileWrite", function(f, c){
	return fs.writeFileSync(f, c);
}, [["f"], ["c"]])

funcNew(def, "exec", async function(o, conf){
  if(!conf) conf = this;
	if(o === undefined) return;
	var r = await exec(o, conf);
  return r;
}, [["o"], ["conf"]], 1)
funcNew(def, "call", async function(r, args){
	return await call(r, args, this, 1);
}, [["r"], ["args"]], 1)
funcNew(def, "and", async function(l, r){
	return (await exec(l, this)) && (await exec(r, this));
}, [["l"], ["r"]], 1)
funcNew(def, "or", async function(l, r){
	return (await exec(l, this)) || (await exec(r, this));
}, [["l"], ["r"]], 1)

var execsp = scopeNew(root, "exec");
var execarg = [["o"]];
funcNew(execsp, "Call", async function(o){
  var func = await exec(o.func, this);
  return await call(func, o.args, this);
}, execarg)

//funcNew(execsp, "Block", async function(o){
//	return blockExec(o, this)
//}, execarg)

funcNew(execsp, "Arr$elementCallable", async function(o){
	var self = this;
	var arrx = objNew(def.Arr, []);
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
funcNew(execsp, "Main", async function(o){
	return await blockExec(o.main, this)
}, execarg)
funcNew(execsp, "Val", function(o){
	return o.val;
}, execarg)
funcNew(execsp, "Struct", function(o){
	return o;
}, execarg)
funcNew(execsp, "Class", function(o){
	return o;
}, execarg)


funcNew(execsp, "Ctrl", async function(o){
	var self = this;
	switch(o.ctrl.val){
	case "if":
		var l = o.args.length;
		var i;
		for(i=0;i<l-1;i+=2){
			var c = await exec(o.args[i], self);
			if(c){
				return await blockExec(o.args[i+1], self);
			}
		}
		if(l%2 == 1){
			return await blockExec(o.args[l-1], self);			
		}
		break;
	case "for":
		await exec(o.args[0], self);
		while(1){
			var c = await exec(o.args[1], self);
			if(c){
				var r = await blockExec(o.args[3], self);
				if(typeof r == "object" && r.ctrl){
					if(r.ctrl.val == "return")
						return r;
					if(r.ctrl.val == "break")
						break;
					if(r.ctrl.val == "continue")
						continue;
				}
			}else{
				break;
			}
			await exec(o.args[2], self);
		}
		break;
	case "while":
		while(await exec(o.args[0], self)){
			var r = await blockExec(o.args[1], self);
			if(typeof r == "object" && r.ctrl){
				if(r.ctrl.val == "return")
					return r;
				if(r.ctrl.val == "break")
					break;
				if(r.ctrl.val == "continue")
					continue;
			}		
		}
		break;
	case "foreach":
    var arr = await exec(o.args[1], self);
    var x = await exec(o.args[0].args[0], self)
    var k = await exec(o.args[0].args[1], self)
		for(var i in arr){
      scopeSet(x, k, arr[i])
			var r = await blockExec(o.args[2], self);
			if(typeof r == "object" && r.ctrl){
				if(r.ctrl.val == "return")
					return r;
				if(r.ctrl.val == "break")
					break;
				if(r.ctrl.val == "continue")
					continue;
			}			
		}
		break;    
	case "each":
		break;
	case "goto":
		break;
	case "return":
		o.return = await exec(o.args[0], self);
	case "continue":
	case "break":
		break;
	default:
		console.log(o);
		die("wrong ctrl")
	}
	return o;
}, [["o"]])
*/
//parser function
function valCopy(item){
  let result = undefined;
  if(!item) return result;
  if(Array.isArray(item)){
    result = [];
    item.forEach(element=>{
      result.push(valCopy(element));
    });
  }else if(item instanceof Object && !(item instanceof Function) && !item.__ && !item.___){ 
    result = {};
    for(let key in item){
      if(key){
        result[key] = valCopy(item[key]);
      }
    }
  }
  return result || item;
}
function objNew(cons, o, scope, name){
	if(!cons) die()
	var obj = objInit();
//	if(cons.
	obj.class = cons.
		obj.cons = cons;

	if(typeof proto != "object") die()		
	if(haskey(cla, "schema")){
		//TODO iterate cla parent(s)
		for(var k in cla.schema){
			if(proto[k] == undefined){
				proto[k] = objNew(cla.schema[k]);					
			}
		}
	}
	//TODO restrict
	//TODO other options
	proto.___ = {
		type: cla.__.id,
		ext: {}
	};
	Object.defineProperty(proto, '___', {
		enumerable: false,
		configurable: false
	});	
	return proto;
}

function callNew(func, args){
	if(!func) die("func not defined")
	if(!args) args = objNew(def.Arr, []);
	if(!args.___) args = objNew(def.Arr, args);
	return objNew(def.Call, {
		func: func,
		args: args,
	});
}
//internal function
function fbNew(block, argdef){
	var oo = objInit();
	oo.block = block;
	oo.argdef = argdef;
	return objNew(def.FuncBlock, oo)
}
function ftNew(str){
	var oo = objInit();
	oo.str = objNew(def.Str, {val: str});
	return objNew(def.FuncTpl, oo);
}
function funcNew(scope, name, func, argst, returnt, flagraw){
	var oo = objInit();
	oo.funcArgst = argst || [];
	oo.funcReturnt = returnt;
	oo.func = objNew(def.Func, {val: func});
	var o = objNew(def.FuncNative, oo);
  if(name)
		route(scope, name, o);
	if(flagraw)
		o.__.rawargs = 1;
	return o;
}

function extname(conf){
	var r = "$";
	for(var k in conf){
		r+=k;
		var v = conf[k];
		switch(type(v)){
		case "Meta":
			r+=v.__.id.replace("_", "");
			break;
		case "Num":
			r+=v.toString();
			break;
		case "Str":
			r+=v;
			break;
		case "Dic":
			r+=extname(v)
			break;
		case "Undf":
			break;
		case "Obj":
			log(v)
			die();			
			break;
		default:
			die("TODO: "+type(v))					
		}
	}
	return r;
}
function classSub(c, conf){
  var name = c.__.name + extname(conf);
	if(c.__.parent[name])
		return c.__.parent[name];
  return classNew(c.__.parent, name, [c], conf);
}
function s(x, k, v){
	return w(x)[k] = v	
}
function g(x, k){
	return w(x)[k];
}
function w(x){
	if(ptype(x) == "Obj"){
		return x.val;
	}
	return x;
}
function rw(x){
	var t = ptype(x);
	if(t == "Obj"){
		return x
	}
	return objNew(def[t], {val: x});
}

function ptype(e){
	switch(typeof e){
  case "boolean":
    return "Num";
  case "undefined":
    return "Null";
  case "number":
    return "Num";
  case "string":
    return "Str";
  case "object":
		if(e == null) return "Null";
		var x = Object.getOwnPropertyDescriptor(e, '__');
		if(x && !x.enumerable){
			return "Obj";
		}
		if(Array.isArray(x)) return "Arr"
		return "Dic";
	case "function":
		return "ValFunc";
  default:
    die("wrong cpt type", e);
  }	
}
/*
route:
name
id
ns
scope
tmp

obj:
class
cons
*/
function consInit(c, dic){
	var p = objInit();
	
}
function varNew(pscope, name, cla){
	var p = objInit();
	route(pscope, name, p);
	p.type = cla;
	return p;
}
async function scopeGetOrNew(scope, key){
	var x = await scopeGet(scope, key);
	if(!x) return x = scopeNew(scope, key);
	return x.value;
}
async function scopeGetSub(scope, key, cache){
  var v = haskeyr(scope, key); //get from cache
	if(v){
    return v;
  }
	if(!scope.__){
		console.log(key)		
		die("global or state not defined: " + key);
	}
	let str = await dbGet(scope, key); //get from db
	if(str){
		//TODO scope get sub
		var m = key.match(/^(\S+)_([^_]+)$/);
		var nscope;
		if(m){
			nscope = await scopeGetOrNew(scope, m[1]);
			key = m[2];
		}else{
			nscope = scope;
		}
		str = key + " = " + str		
		var rtn = await progl2obj(nscope, str);
		return haskey(nscope, key);
	}
	for(var k in scope.__.parents){//get from parent
		if(cache[k]) continue;
		cache[k] = 1;
		var r = await scopeGetSub(scope.__.parents[k], key, cache);
		if(r){
//			scope[key] = r.value;
			return r;
		}
	}
}
async function scopeGet(scope, key){
  var cache = {};
	var r = await scopeGetSub(scope, key, cache);
	if(r){
		return r;
	}
	if(scope.__.parent){
		var r2 = await scopeGet(scope.__.parent, key);
    return r2;
  }
}
function scopeSet(x, k, r){
  if(k.match("_")){
    var arr = k.split("_");
    var xx = x;
    var xr;
    var i;
    for(i=0; i<arr.length - 1;i++){
      xr = haskey(xx, arr[i]);
      if(!xr) scopeGetOrNew(xx, arr[i]);
      xx = xx[arr[i]];
    }
    return xx[arr[i]] = r;
  }else{
    return x[k] = r;
  }
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
		var x = Object.getOwnPropertyDescriptor(e, '__');//route
		var y = Object.getOwnPropertyDescriptor(e, '___');//class
		if(x && !x.enumerable){
			if(haskey(x.value, "index"))
				return "Scope";
			return "Class"
		}
		if(y && !y.enumerable)
			return "Obj"
		if(Array.isArray(e)) return "Arr";		
		return "Dic";
	case "function":
		return "Func";
  default:
    die("wrong cpt type", e);
  }
}

function haskey(x, k){
  return Object.getOwnPropertyDescriptor(x, k);
}
function haskeyr(x, k){
  if(k.match("_")){
    var arr = k.split("_");
    var xx = x;
    var xr;
    for(var i in arr){
      if(!xx) return;
      xr = haskey(xx, arr[i]);
      if(!xr) return;
      xx = xr.value
    }
    return xr;
  }else{
    return Object.getOwnPropertyDescriptor(x, k);
  }
}
async function istype(obj, type){
  var t = type(obj);
}
function type(obj){
  if(obj.___) return obj.___.type;
	if(obj.__.index) return "Scope";
	return "Meta";
}
async function execGet(sp, esp, t, cache){
  if(!cache) cache = {};
	var r = await scopeGet(esp, t);
	if(r) return r.value;
	var tt = await scopeGet(sp, t)
  tt = tt.value;
	for(var k in tt.__.parents){
    if(cache[k]) return;
    cache[k] = 1;
		r = await execGet(sp, esp, k, cache);
		if(r) return r;
	}	
}
function execInit(x){
	if(!x.init){
    if(!haskey(x, "state"))
		  x.state = objNew(def.Dic, {})
    if(!haskey(x, "stack"))    
		  x.stack = objNew(def.Arr, [])
    if(!haskey(x, "global"))    
		  x.global = objNew(def.Dic, {})
		x.init = 1;
	}
	return x
}
async function exec(obj, conf){
	var s = conf.s;
	var e = conf.e;
	var x = conf.x;
	var t = type(obj)
  var ex;
	execInit(x);
  if(!x[t]){
		ex = await execGet(s, e, t);
		if(!ex)
			die(t+" not exec defined");
    x[t] = ex
  }else{
		ex = x[t];
	}
  return await call(ex, objNew(def.Arr, [obj]), conf, 1);
}
function stateNew(a0, args){
	var state = objNew(def.Dic, {});
	for(var i in args){
		var d = a0[i];
		state[i] = state[d[0]] = args[i];
	}
	state.$arglen = args.length;
	return state;
}
async function blockExec(b, conf, stt){
	if(stt) stt = b.labels[stt].val;
	for(var i in b.arr){
		if(stt && stt < i)
			continue;
		var r = await exec(b.arr[i], conf);
		if(rawType(r) == "Obj" && r.ctrl && 
       (r.ctrl.val == "return" || r.ctrl.val == "break" || r.ctrl.val == "continue"))
			return r;
	}
}
async function tplCall(str, args, conf){
	if(!str) return "";
	var tstr = tplparser.parse(str);
	var scope = scopeNew(def);
	var obj = await progl2obj(scope, tstr);
	var nconf = {
		s: scopeNew(def),
		e: execsp,
		x: execInit({
      global: conf.x.global
    }),
	}
  nconf.x.state.$conf = conf;
	for(var i in args){
		nconf.x.state[i] = args[i]
	}
	nconf.x.state.$arglen = args.length;
	var r = await blockExec(obj, nconf);
	return r.return;
}
async function call(func, argsn, conf, rawflag){
	if(func.str){//is FuncTpl
		return await tplCall(func.str.val, argsn, conf);
	}
	//Process args
	if(!rawflag){
		var args = [];
		for(var i in argsn){
			args[i] = await exec(argsn[i], conf);
		}
	}else{
		args = argsn;
	}
	
  if(func.func){//is FuncNative
		//log(func.__.name)
		if(func.___.rawargs)
			return await func.func.val.apply(conf, argsn)
		else
			return await func.func.val.apply(conf, args)			
  }
	//is FuncBlock

	var x = conf.x;
	var state = stateNew(func.argdef[0], args);
	x.stack.push(x.state);
	x.state = state;
	var r = await blockExec(func.block, conf);
	if(rawType(r) == "Obj" && r.ctrl && r.ctrl.val == "return")
    r = r.return;
	x.state = x.stack.pop();
	return r;
}
function dbPath(x){
	var ns;	
	if(!x.__.ns)
		ns = ""
	else
		ns = "/" + x.__.ns
	if(!x.__.id)
		return ns;
	return ns + "/" + x.__.id.replace(/_/g, "/")
}
async function dbGet(scope, key){
	if(scope.__.tmp) return "";
	var p = prefix + dbPath(scope) + "/"+ key.replace(/_/g, "/");
	if(fs.existsSync(p+".sl")){
		return fs.readFileSync(p+".sl").toString();
	}
	if(fs.existsSync(p+".slt")){
		return "@`"+fs.readFileSync(p+".slt").toString()+"`";
	}
	if(fs.existsSync(p)){
		return "<<>>"
	}
	
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
		return undf;
	default:
		return r;
	}
}

async function progl2obj(scope, str){
  var ast = proglparser.parse(str);
//	log(ast[1])
	var r = await ast2obj(scope, ast);
	return r;
}
async function ast2obj(scope, ast){
  if(typeof ast != "object") return ast;
	var t = ast[0];
	var v = ast[1];
	var v2 = ast[2];	
  switch(t){
	case "undf":
		return undf;
	case "num":
		var p = {};
		var c = 1;
		while(c){
			var l = v[v.length-1];
			switch(l){
			case "u":
				p.unsigned = undefined;
				break;
			case "s":
				p.short = undefined;
				break;
			case "l":
				p.long = undefined;
				break;
			case "b":
				p.big = undefined;
				break;
			case "f":
				p.float = undefined;
				break;
			default:
				c = 0;
				continue;
			}
			v = v.substr(0, v.length - 1);			
		}
		if(v.match("\\.")){
			if(!haskey(p, "float")) p.double = undefined;
		}else{
			if(!haskey(p, "short") && !haskey(p, "long") && !haskey(p, "big"))
				p.int = undefined
		}
		if(v.match(/[eE]/)) p.sci = undefined;
		if(v.match(/[xX]/)) p.hex = undefined;
		p.val = Number(v);
		return objNew(def.Num, p);
		
	case "str":
		return objNew(def.Str, {val: v});
	
	case "call":
		
		var func = await ast2obj(scope, v);
	//TODO classSub		
		var args = objNew(def.Arr, await ast2arr(scope, v2))
		if(v[0] == "get")
			args.unshift(func.args[0]);
		return callNew(func, args);
		
	case "assign":
		var args = [];
		var t = v[1][0];
		if(v[0][0] == "id" &&
			 (t == "func" || t == "class" || t == "scope" || t == "tpl")){
			//predefine not call assign
			var res;
			if(t == "func"){
				var ori = fbNew();
				route(scope, v[0][1], ori);
				res = await ast2obj(scope, v[1]);
				ori.block = res.block;
				ori.argdef = res.argdef;
			}else{
				res = await ast2obj(scope, v[1]);
				route(scope, v[0][1], res);
			}
			return vv;
		}
		var getv = await ast2obj(scope, v[0]);		
		var vv = await ast2obj(scope, v[1]);		
		args[2] = vv;
		if(type(getv) == "Call"){
			args[0] = getv.args[0];
			args[1] = getv.args[1];
		}else{
			args[0] = getv.__.parent;
			args[1] = raw2obj(getv.__.name);
		}
		if(!v[2]){//not += -=
			if(getv.func.__.name == "aget")
				return callNew(def.aset, args);				
			return callNew(def.set, args);
		}
		if(v[2] == "splus"){
			return callNew(def.concat, args);
		}
		args[2] = callNew(def[v[2]], [getv, args[2]]);
		if(getv.func.__.name == "aget")
			return callNew(def.aset, args);						
		return callNew(def.set, args);
		
	case "idf":
		var r =	await scopeGet(scope, v);
		if(!r) die(v + " is not defined, "+dbPath(scope));
		return r.value;
		
	case "id":
		var a0;
		var f;
	  if(haskey(scope, v)){
			//search lex scope(repr state), if exists -> get from state 
			a0 = callNew(def.state);
			f = def.sget
//TODO search lex global scope, if exists -> get from global			
		}else{
			//search library
			var r = await scopeGet(scope, v);
			if(r)
				return r.value;
			a0 = callNew(def.global);
			f = def.get
		}
		a1 = raw2obj(v);
		return callNew(f, [a0, a1]);
		
	case "local":
		var t;
		if(v2)
			t = await ast2obj(scope, v2);
		else
			t = def.Class;
		varNew(scope, v, t);
		var a0 = callNew(def.state);
		var a1 = raw2obj(v);
		return callNew(def.aget, [a0, a1]);		
		
	case "get":
		var a0 = await ast2obj(scope, v);
		var a1 = await ast2obj(scope, v2);
    //TODO split arrget and dicget
		return callNew(def.get, [a0, a1]);
		
	case "arrget":
		var a0 = await ast2obj(scope, v);
		var a1 = await ast2obj(scope, v2);
		return callNew(def.aget, [a0, a1]);
		
	case "arr":
		var arrx = await ast2arr(scope, v);
		var c = classSub(def.Arr, {element: def.Callable});
		return objNew(c, arrx)
	case "func":
		var block = v[0];
		var argdef = v[1];
		var a = objNew(def.Argdef, [[]]);
		var a0 = argdef[0];
		for(var i in a0){
			var d = a0[i];
			a[0][i] = [d[0]];
			if(d[1])
				a[0][i][1] = await ast2obj(scope, d[1])
		}
		if(argdef[1])
			a[1] = await ast2obj(scope, argdef[1]);
		block[2] = "Block";
		var nscope = scopeNew(scope);
//		nscope.__.indc = scope.__.indc + 1;
		for(var i in a0){
			var d = a0[i];
			nscope[i] = nscope[d[0]] = {type: d[1]};
		}
		var b = await ast2obj(nscope, block);
		return fbNew(b, a)
	case "tpl":		
		return ftNew(v);	
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
			var arr = objNew(def.Arr, []);
			var labels = {};
			for(var i in v){
				var x = v[i];
				var y = await ast2obj(scope, x[0]);
				arr.push(y);
				labels[x[1]] = objNew(def.Num, {val: Number(i)});
			}
			return objNew(def.Block, {arr:arr, labels: {}});
		}
		if(v2 == "Dic"){
			var dicx = {};
			var iscallable = 0;
			for(var i in v){
				var x = v[i];
				var y = await ast2obj(scope, x[0]);
				dicx[x[1]] = y;
				if(!iscallable && y && !haskey(y, "val")){
					iscallable = 1;
				}
			}
			var c;
			if(iscallable){
				c = classSub(def.Dic, {element: def.Callable});
			}else{
				c = def.Dic;
			}
			return objNew(c, dicx);			
		}
	case "ctrl":
		var args = await ast2arr(scope, v2);
		var r = objNew(def.Ctrl, {
			ctrl: objNew(def.Str, {val: v}),
			args: objNew(def.Arr, args),
		});
		return r;
	case "subclass":
		var c = await ast2obj(scope, v);
		var dic = await ast2obj(scope, v2);
		if(type(dic) == "Dic$elementCallable")
			die("dynmaic expression not allowed in subclass definition");
		return classSub(c, dic);
	case "class":
		var arr = await ast2arr(scope, v);
		var dic = await ast2obj(scope, v2);
		if(type(dic) == "Dic$elementCallable")
			die("dynmaic expression not allowed in class definition");
		return classInit(arr, dic);
	case "scope":
		var arr = await ast2arr(scope, v);
		return scopeInit(arr);
	default:
		console.log(ast);
		die("type error");
	}
}
async function ast2arr(scope, v){
	var args = [];
	for(var i in v){
		args[i] = await ast2obj(scope, v[i]);
	}
	return args;
}
