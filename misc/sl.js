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
var path = require("path")
var prefix = process.env.HOME+"/soul/db0";
var root = scopeNew();
var execsp = scopeNew(root, "exec");
var def = scopeNew(root, "def");

var globalScope = scopeNew(root, "global");
classNew(def, "Class")
classNew(def, "ClassMeta")
classNew(def, "Scope")

classNew(def, "Struct")
classNew(def, "Raw")
classNew(def, "Argt")
classNew(def, "Callable", [def.Raw])
classNew(def, "Struct", [def.Raw])

classNew(def, "Undf", [def.Raw], {
	default: {val: undefined}
})
classNew(def, "Null", [def.Raw], {
	default: {val: null}
})
classNew(def, "Num", [def.Raw], {
	default: {val: 0}
})
classNew(def, "Str", [def.Raw], {
	default: {val: ""}
})
classNew(def, "Function", [def.Raw], {
	default: {val: function(){}}
});

classNew(def, "Arr", [def.Struct], {
	default: []
})
classNew(def, "Dic", [def.Struct], {
	default: {}	
})
classNew(def, "Argdef", [def.Struct], {
	default: [[]]	
})

classNew(def, "Func", [def.Struct]);
classNew(def, "Call", [def.Struct], {
	schema: {
		func: def.Func,
		args: def.Arr,
	}
})
classNew(def, "Ctrl", [def.Struct], {
	schema: {
		type: def.Str,
		args: def.Arr,
		return: def.Class
	}
})
classNew(def, "Var", [def.Raw], {
	schema: {
		type: def.ClassMeta
	}
})
classNew(def, "Block", [def.Struct], {
	schema: {
		arr: def.Arr,
		labels: classSub(def.Dic,{element:def.Str})
	}
})
classNew(def, "FuncInternal", [def.Func], {
})
classNew(def, "FuncNative", [def.Func], {
});
classNew(def, "FuncBlock", [def.Func], {
});
classNew(def, "FuncTpl", [def.Func], {
});

classNew(def, "Main", [def.Struct], {
	schema: {
		main: def.Block
	}
});

funcNew(def, "log", function(s){
	console.log(s);
}, [["s"]])
funcNew(def, "logx", function(s){
	console.log(s.__);
}, [["s"]])
funcNew(def, "match", function(s, r){
  return !!s.match(new RegExp(r))
}, [["s"], ["r"]])
funcNew(def, "push", function(arr, e){
	arr.push(e);
	return e;
}, [["arr"], ["e"]])
funcNew(def, "split", function(s, e){
	
	return s.split(e);
}, [["s"], ["e"]])
funcNew(def, "join", function(arr, e){
	arr.join(e);
	return e;
}, [["arr"], ["e"]])
funcNew(def, "unshift", function(arr, e){
	arr.unshift(e);
	return e;
}, [["arr"], ["e"]])
funcNew(def, "pop", function(arr){
	return arr.pop();
}, [["arr"]])
funcNew(def, "str", function(x){
	return x.toString();
}, [["arr"]])
funcNew(def, "num", function(x){
	return parseFloat(x)
}, [["arr"]])
funcNew(def, "null", function(x){
	return null;
}, [["arr"]])
funcNew(def, "join", function(arr, str){
	return arr.join(str)
}, [["arr"],["str"]])

funcNew(def, "ucfirst", function(){
})
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
funcNew(def, "self", function(){
	var self = this;
	return self;
})
funcNew(def, "objNew", function(c, v){
}, [["c"], ["v"]])
funcNew(def, "replaceAll", function(c, v){
}, [["c"], ["v"]])
funcNew(def, "replace", function(c, v){
}, [["c"], ["v"]])
funcNew(def, "die", function(o){
	die(o)
})
funcNew(def, "val", async function(p){//property get val
	return p.val;	
}, [["p"]])
funcNew(def, "escape", async function(p){//property get val
	return p.replace(/\n/g, "\\n").replace(/\t/g, "\\t").replace(/\r/g, "\\r");	
}, [["p"]])
funcNew(def, "oget", function(p, k){//___ get
	return p.___[k];
}, [["p"], ["k"]])
funcNew(def, "rget", function(p, k){//__ get
	return p.__[k];
}, [["p"], ["k"]])
funcNew(def, "ccGet", function(p, k){	
}, [["p"], ["k"]])
funcNew(def, "ccSet", function(p, k){	
}, [["p"], ["k"]])
funcNew(def, "objGet", async function(p, k){//property get
	if(p[k] == undefined) return
	return await exec(p[k], this);	
}, [["p"], ["k"]])
funcNew(def, "objSet", async function(p, k, v){//property get
	return p[k] = raw2obj(v)
}, [["p"], ["k"], ["v"]])


funcNew(def, "propGet", async function(p, k){//property get
	if(p[k] == undefined) return undefined;
  var r = await exec(p[k], this);
  if(k == "func" && !r){
		log(k)
    log(p[k])
    die("func not defined")
  }  
	return r;	
}, [["p"], ["k"]])
funcNew(def, "propSet", function(p, k, v){
	return p[k] = v;
}, [["p"], ["k"], ["v"]])
funcNew(def, "classGet", async function(p, k){//property get
	return await exec(p[k], this);	
}, [["p"], ["k"]])
funcNew(def, "classSet", function(p, k, v){
	return p[k] = v;
}, [["p"], ["k"], ["v"]])
funcNew(def, "scopeSet", function(p, k, v, t){//t is type 
  //TODO if type, check type
	return scopeSet(p, k, v)
}, [["p"], ["k"], ["v"], ["t"]])
funcNew(def, "scopeGet", async function(p, k){
	var r = await scopeGet(p, k);
	if(r)
		return r.value;
}, [["p"], ["k"]])
funcNew(def, "innateGet",  async function(p, k){
	return p.__[k]
}, [["p"], ["k"]])
funcNew(def, "innateSet",  async function(p, k, v){
	return p.__[k]
}, [["p"], ["k"], ["v"]])
funcNew(def, "scopeGetLocal", async function(p, k){
	return haskey(p, k)
}, [["p"], ["k"]])
funcNew(def, "haskey", async function(p, k){
	return await scopeGet(p, k)  
}, [["p"], ["k"]])
funcNew(def, "itemsGet", function(p, k){
/*  if(!p.___ && typeof p != "string"){
		log(p)
		log(k)		
		die("error")
	}*/
	return p[k]
}, [["p"], ["k"]])
funcNew(def, "itemsSet", function(p, k, v){
/*  if(!p.___ && typeof p != "string"){
		log(p)
		log(k)		
		die("error")
	}*/
	return p[k] = v
}, [["p"], ["k"], ["v"]])
funcNew(def, "globalSet", function(k, v){
	if(k == undefined) die("")
	if(v.__) v.__.name = k;
	if(v.__) v.__.id = k;
	return this.x.global[k] = v;
}, [["k"], ["v"]])
funcNew(def, "globalGet", function(k){
	if(k == undefined) die("")	
	return this.x.global[k];
}, [["k"]])
funcNew(def, "stateSet", function(k, v){
	if(k == undefined) die("stateSet")	
	return this.x.state[k] = v;
}, [["k"], ["v"]])
funcNew(def, "stateGet", function(k){
	if(k == undefined) die("stateGet")
	return this.x.state[k];
}, [["k"]])
funcNew(def, "splus", function(l, r){//string add
	return l + r;
}, [["l"], ["r"]])
funcNew(def, "plus", function(l, r){
	return l + r;
}, [["l"], ["r"]])
funcNew(def, "mod", function(l, r){
	return l % r;
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
funcNew(def, "len", function len(l){
	return l.length;
}, [["l"]])
funcNew(def, "strlen", function strlen(l){
	return l.length;
}, [["l"]])
funcNew(def, "repr", function repr(l){
}, [["l"]])

funcNew(def, "isleaf", function(o){
	if(typeof o != "object") return 0;
	if(!o.__) return 0;
	return 1
}, [["o"]])
funcNew(def, "isarg", function(o){
	return o.isarg
}, [["o"]])
funcNew(def, "isdef", function(o){
	return o.isdef
}, [["o"]])
funcNew(def, "issizet", function(o){
	return (parseInt(o.val).toString() == o.val.toString())
}, [["o"]])

funcNew(def, "fileRead", function(f){
	return fs.readFileSync(f).toString();	
})
funcNew(def, "pathResolve", function(f){
	return path.resolve(f)
}, [["f"]])
funcNew(def, "pathDirname", function(f){
	return path.dirname(f)
}, [["f"]])
funcNew(def, "fileExists", function(f){
	return fs.existsSync(f)
})
funcNew(def, "fileWrite", function(f, c){
	return fs.writeFileSync(f, c);
}, [["f"], ["c"]])

funcNew(def, "exec", async function(o, conf){
	if(o === undefined) return;
	var nconf;
//  if(!conf)
//		nconf = this;
//	else{
//	nconf = await exec(conf, this);
	//
	var r = await exec(o, conf);
  return r;
}, [["o"], ["conf"]])
funcNew(def, "call", async function(r, args, conf){
	return await call(r, args, conf, 1);
}, [["r"], ["args"], ["conf"]])
funcNew(def, "type", async function(o){
	return type(o)
}, [["o"]])
funcNew(def, "rawType", async function(o){
	return rawType(o)
}, [["o"]])
funcNew(def, "isdic", async function(o){
  if(o.___.type == "Dic")
    return 1;
  if(o.___.type == "Dic$elementCallable")
    return 1;
  return 0
}, [["o"]])
funcNew(def, "and", async function(l, r){
	return (await exec(l, this)) && (await exec(r, this));
}, [["l"], ["r"]], 1)
funcNew(def, "or", async function(l, r){
	return (await exec(l, this)) || (await exec(r, this));
}, [["l"], ["r"]], 1)

funcNew(def, "suid", async function(env){
	var r = env.s.__.index.toString()
	env.s.__.index ++;	
	return r
})
funcNew(def, "callNative", async function(func, args){
})


var execarg = [["o"]];
funcNew(execsp, "Call", async function(o){
  var func = await exec(o.func, this);
	if(!func){
		console.log(o.func)
		if(!o) die("func not defined")		
	}
  return await call(func, o.args, this);
}, execarg)

//funcNew(execsp, "Block", async function(o){
//	return blockExec(o, this)
//}, execarg)

funcNew(execsp, "Arr$elementCallable", async function(o){
	var self = this;
	var arrx = objNew(def.Arr, []);
	for(var i in o){
		arrx[i] = await exec(o[i], self);
	}
	return arrx;
}, execarg)

funcNew(execsp, "Dic$elementCallable", async function(o){
	var dicx = [];
	for(var k in o){
		dicx[k] = await exec(o[k], this);
	}
	return dicx;
}, execarg)
funcNew(execsp, "Main", async function(o){
	return await blockExec(o.main, this)
}, execarg)
funcNew(execsp, "Raw", function(o){
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
//    var x = await exec(o.args[0].args[0], self)
		//    var k = await exec(o.args[0].args[0], self)
		var k = o.args[0].val
		for(var i in arr){
      self.x.state[k] = arr[i];
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
    var dic = await exec(o.args[2], self);
//    var x = await exec(o.args[0].args[0], self)
		//    var k = await exec(o.args[0].args[0], self)
		var k = o.args[0].val
		var vk = o.args[1].val
		for(var key in dic){
      self.x.state[k] = raw2obj(key);
      self.x.state[vk] = raw2obj(dic[key]);
			var r = await blockExec(o.args[3], self);
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

var undf = objNew(def.Undf, {val: undefined})
var nul = objNew(def.Null, {val: null})
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
function fbNew(block, argdef, r){
	var oo = routeInit();
	oo.func = block;
	oo.funcArgts = objNew(def.Arr, [])
  for(var i in argdef){
    oo.funcArgts[i] = objNew(def.Argt, argdef[i]);
  }
  oo.funcReturn = r;
	return objNew(def.FuncBlock, oo)
}
function ftNew(str){
	var oo = routeInit();
	oo.func = objNew(def.Str, {val: str});
	return objNew(def.FuncTpl, oo);
}
function funcNew(scope, name, func, argdef, flagraw){
	var oo = routeInit();
	oo.funcArgts = objNew(def.Arr, [])
  for(var i in argdef){
    oo.funcArgts[i] = objNew(def.Argt, argdef[i]);
  }  
	oo.func = objNew(def.Func, {val: func});
	var o = objNew(def.FuncNative, oo);
  if(name)
		route(scope, name, o);
	if(flagraw)
		o.___.rawargs = 1;
	return o;
}

function objNew(cla, proto){
	if(!cla) die()
	if(!proto){
		//TODO iterate cla parent(s) 
		if(haskey(cla, "default")){
			proto = valCopy(cla.default)
		}else{
			proto = {};
		}
	}
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
	proto.__ = {}
	Object.defineProperty(proto, '__', {
		enumerable: false,
		configurable: false
	});	
	return proto;
}
function extname(conf){
	var r = "$";
	for(var k in conf){
		r+=k;
		var v = conf[k];
		switch(type(v)){
		case "Class":
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
		case "Null":
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
function cons(c, conf){
  var x= classInit([c], conf);
	x.__.iscons = 1
	x.__.cons = conf
	x.__.consClass = c	
	return x
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
	x.parent = pscope
	return p;
}
function routeInit(){
	var p = {};
	p.__ = {}
	Object.defineProperty(p, '__', {
		enumerable: false,
		configurable: false
	});
	return p;
}

function classInit(cla, conf){
	var p = routeInit();
	var x = p.__;
	x.isclass = 1;
	for(var k in conf){
		x[k] = conf[k];
	}
	x.parents = {};
  if(!cla){
		if(!def.Class){
      def.Class = p;
      p.__.id = "Class"
    }
		cla = [def.Class];
	}
  for(var i in cla){
    x.parents[cla[i].__.id] = cla[i];//TODO reduce class tree
  }
	return p;
}
function classNew(pscope, name, cla, conf){
	var p = classInit(cla, conf);
	route(pscope, name, p);
	return p;
}
function varNew(pscope, name, cla){
	var p = routeInit();
	route(pscope, name, p);
	for(var key in cla){
		p[key] = cla[key];
	}
	return p;
}
function scopeInit(parents){
	var p = routeInit();
	var x = p.__;
	x.parents = {};
  for(var i in parents){
    x.parents[parents[i].__.id] = parents[i];
  }
	x.index = 0;	
//	x.indc = 0;
	return p;
}
function scopeNew(pscope, k, parents){//TODO
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
	var p = scopeInit();
	if(pscope && !k){
		k = pscope.__.index.toString();
		pscope.__.index ++;
	}
	if(pscope)
		route(pscope, k, p);
	return p;
}
async function scopeGetOrNew(scope, key){
	var x = await scopeGet(scope, key);
	if(!x) return x = scopeNew(scope, key);
	return x.value;
}
async function scopeGetSub(scope, key, cache){
  var v = haskeyr(scope, key);
	if(v){
    return v;
  }
	if(!scope.__){
		console.log(key)		
		die("global or state not defined: " + key);
	}
	let str = await dbGet(scope, key);
	if(str){
		var m = key.match(/^(\S+)_([^_]+)$/);
		var nscope;
		if(m){
			nscope = await scopeGetOrNew(scope, m[1]);
			key = m[2];
		}else{
			nscope = scope;
		}
		str = key + " = " + str
		if(key == "0"){
			return haskey(nscope, "0");
		}
		var rtn = await progl2obj(nscope, str);
		return haskey(nscope, key);
	}
	for(var k in scope.__.parents){
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
  if(key == undefined) die("scopeGet undefined key")
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
		if(!e) return "Null"
		var x = Object.getOwnPropertyDescriptor(e, '__');//route
		var y = Object.getOwnPropertyDescriptor(e, '___');//class
		if(x && !x.enumerable){
			if(haskey(x.value, "index"))
				return "Scope";
			if(haskey(x.value, "isclass"))
				return "Class";
//			return "Class"
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
  if(!obj.__){
    log(obj.toString());
    die("wrong obj")
  }
	if(obj.__.iscons) return "Cons";	
	if(obj.__.isclass) return "Class";
	return "Scope";
}
async function execGet(sp, esp, t, cache){
  if(t == undefined) die("wrong t")
  if(!cache) cache = {};
	var r = await scopeGet(esp, t);
	if(r) return r.value;
	var tt = await scopeGet(sp, t)
  tt = tt.value;
	for(var k in tt.__.parents){
    if(k == "undefined") die("parents undefined")
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
	if(!obj) die("error: exec not obj")
	var t = type(obj)
  var ex;
	execInit(x);
  if(!x[t]){
		ex = await execGet(s, e, t);
		if(!ex)
			die(t + " not exec defined");
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
    if(!d) die("args error")
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
//  log(obj.arr[obj.arr.length -1].args[0])
//  log(r)  
	return r.return;
}
async function call(func, argsn, conf, rawflag){
	if(!func){
		log(argsn[0])
		die("error no func")
	}
	if(func.___.type == "FuncTpl"){//is FuncTpl
		return await tplCall(func.func.val, argsn, conf);
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
	
  if(func.___.type == "FuncNative"){//is FuncNative
		if(func.___.rawargs)
			return await func.func.val.apply(conf, argsn)
		else
			return await func.func.val.apply(conf, args)			
  }
	//is FuncBlock
//	if(func.___.type == "FuncInternal"){
//		return func.__.name
//	}
	if(!func.funcArgts){
		log(func.__)
		die("func not defined")
	}
	var x = conf.x;
	var state = stateNew(func.funcArgts, args);
	x.stack.push(x.state);
	x.state = state;
	var r = await blockExec(func.func, conf);
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
	case "Null":
		return nul;
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
	case "null":
		return nul;
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
		if(!func){
			die("error")
		}
		//TODO classSub		
		var args = objNew(def.Arr, await ast2arr(scope, v2))
		if(v[0] == "objget")
			args.unshift(func.args[0]);
    if(!func){
      log(ast)
      die("func not defined")
    }
		return callNew(func, args);
		
	case "assign":
		var args = [];
		var t = v[1][0];
		if(v[0][0] == "id" &&
			 (t == "func" || t == "class" || t == "scope"
				|| t == "tpl" || t == "obj" || t == "cons")){
			//predefine not call assign
			var res;
			if(t == "func"){
				var ori = fbNew(); 
				route(scope, v[0][1], ori);
				res = await ast2obj(scope, v[1]);
//        if(!res.func){
//          log(v)
//          die("lib func not defined")
//        }
				ori.func = res.func;
				ori.funcArgts = res.funcArgts;
				ori.funcReturn = res.funcReturn;        
				ori.isdef = 1;
				return ori;
			}else{
				res = await ast2obj(scope, v[1]);
				route(scope, v[0][1], res);
				res.isdef = 1;				
				return res;
			}
//			return vv;
		}

		var vv = await ast2obj(scope, v[1]);
		if(v[2]){
			var getv = await ast2obj(scope, v[0]);								
//			if(v[2] == "splus"){
//				return callNew(def.concat, [getv, vv]);
//			}
			vv = callNew(def[v[2]], [getv, vv]);
		}

		if(v[0][0] == "local"){
			varNew(scope, v[0][1], {type:def.Class, isstate:1});
			return callNew(def.stateSet, [raw2obj(v[0][1]), vv]);			
		}
		if(v[0][0] == "global"){
			varNew(globalScope, v[0][1], {type:def.Class});			
			return callNew(def.globalSet, [raw2obj(v[0][1]), vv]);			
		}
		if(v[0][0] == "id"){
			var k = v[0][1];
      if(!k) die("k not defined")
			if(haskey(scope, k) && (scope[k].isstate || scope[k].isarg)){
				return callNew(def.stateSet, [raw2obj(k), vv]);
			}else if(haskey(globalScope, k)){
				return callNew(def.globalSet, [raw2obj(k), vv]);
			}else{
				var r = await scopeGet(scope, k);
				if(r)
					return callNew(def.scopeSet, [r.__.parent, raw2obj(k), v]);
				return callNew(def.globalSet, [raw2obj(k), vv]);			
			}
		}
		if(v[0][0] == "get"){
			var a0 = await ast2obj(scope, v[0][1]);
			var a1 = await ast2obj(scope, v[0][2]);
			//TODO split arrget and dicget
			var v3 = v[0][3]
			return callNew(def[v3+"Set"], [a0, a1, vv]);			
		}
		log(ast)
		die(" not defined for assign op")
	case "idf":
		var r =	await scopeGet(scope, v);
		if(!r) die(v + " is not defined, "+dbPath(scope));
		return r.value;
		
	case "id":
		var k = v;
		if(haskey(scope, k) && (scope[k].isstate || scope[k].isarg)){			
			return callNew(def.stateGet, [raw2obj(k)]);
		}else if(haskey(globalScope, k)){
			return callNew(def.globalGet, [raw2obj(k)]);
		}else{
			var r = await scopeGet(scope, k);
			if(r)
				return r.value;
			return callNew(def.globalGet, [raw2obj(k)]);			
		}
		
	case "local":
		if(v2)
			t = await ast2obj(scope, v2);
		else
			t = def.Class;
		varNew(scope, v, {type: t, isstate:1});
		return callNew(def.stateGet, [raw2obj(v)]);		
		
	case "global":
		var t;
		if(v2)
			t = await ast2obj(globalScope, v2);
		else
			t = def.Class;
		varNew(globalScope, v, {type:t});
		return callNew(def.globalGet, [raw2obj(v)]);
		
	case "get":
		var a0 = await ast2obj(scope, v);
		var a1 = await ast2obj(scope, v2);
    //TODO split arrget and dicget
		var v3 = ast[3]
		return callNew(def[v3+"Get"], [a0, a1]);
		
	case "arr":
		var arrx = await ast2arr(scope, v);
		var c = classSub(def.Arr, {element: def.Callable});
		return objNew(c, arrx)
	case "func":
		var block = v[0];
		var argdef = v[1];
		var a = objNew(def.Arr, []);
		var a0 = argdef[0];
		for(var i in a0){
			var d = a0[i];
			a[i] = [d[0]];
			if(d[1])
				a[i][1] = await ast2obj(scope, d[1])
		}
    var r;
		if(argdef[1])
			r = await ast2obj(scope, argdef[1]);
		if(!block) return fbNew(undefined, a, r)
		block[2] = "Block";
		var nscope = scopeNew(scope);
		//		nscope.__.indc = scope.__.indc + 1;
		for(var i in a0){
			var d = a0[i];
			var x = {type: await ast2obj(scope, d[1]), isarg:1};
			varNew(nscope, i, x)
			varNew(nscope, d[0], x)			
		}
		var b = await ast2obj(nscope, block);
		return fbNew(b, a, r)
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
		if(v2 == "Block" || v2 == "Blockx"){
			var arr = objNew(def.Arr, []);
			var labels = {};
			for(var i in v){
				var x = v[i];
				var y = await ast2obj(scope, x[0]);
				arr.push(y);
				labels[x[1]] = objNew(def.Num, {val: Number(i)});
			}
			if(v2 == "Blockx"){
				return objNew(def.Block, {arr:arr, labels: {}, scope: scope, novar: objNew(def.Num, {val:1})});
			}
			return objNew(def.Block, {arr:arr, labels: {}, scope: scope});
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
		if(v == "foreach"){
			varNew(scope, v2[0][1], {type: def.Class, isarg:1});
			v2[2][2] = "Blockx"
		}		
		if(v == "each"){
			varNew(scope, v2[0][1], {type: def.Str, isarg:1});
			varNew(scope, v2[1][1], {type: def.Class, isarg:1});
			v2[3][2] = "Blockx"			
		}
    if(v == "for"){
      v2[3][2] = "Blockx"
    }
    if(v == "while"){
      v2[1][2] = "Blockx"
    }
		if(v == "if"){
			for(var i=1; i<v2.length; i+=2){
				v2[i][2] = "Blockx"
			}
			if(v2.length %2 == 1){
				v2[v2.length-1][2] = "Blockx"
			}
		}
		var args = await ast2arr(scope, v2);
		var r = objNew(def.Ctrl, {
			ctrl: objNew(def.Str, {val: v}),
			args: objNew(def.Arr, args),
		});
		return r;
	case "obj":
		var c = await ast2obj(scope, v);
    if(v2[0] == "func"){
		  var f = await ast2obj(scope, v2);
      f.___.type = c.__.id;
      return f;
    }else{
		  var dic = await ast2obj(scope, v2);
		  var r = objNew(c, dic)
		  return r;
    }
		break;
	case "class":
		var arr = await ast2arr(scope, v);
		var dic = await ast2obj(scope, v2);
//		if(type(dic) == "Dic$elementCallable")
//			die("dynmaic expression not allowed in class definition");
		return classInit(arr, dic);
	case "cons":
		var c = await ast2obj(scope, v);
		var dic = await ast2obj(scope, v2);
//		if(type(dic) == "Dic$elementCallable")
		//			die("dynmaic expression not allowed in subclass definition");
		return cons(c, dic);		
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
