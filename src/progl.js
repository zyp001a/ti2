var utils = require("./utils");
var die = utils.die;
var log = utils.log;
var parser = require("./progl-parser");
var tpl = require("./tpl-parser");
var db = require("./db");
var fs = require("./fs");
var system = require('child_process').exec;
var currfunc;
var currfile;
function pop(env){
	env.$ = env.stack.pop();
}
function push(env, $new){
	env.stack.push(env.$);
	env.$ = $new || newcpt({}, "Dic");
  env.$.__.execd = 1;
	if(env.stack.length > 50) die("stack overflow")
}
function hashpush(hash, val){
	hash[hashlen(hash).toString()] = val;
	hash.__.length += 1;
}
function hashlen(hash){
	return hash.__.length;
}
var minify;
try{
	var ug = require("uglify-js");
	minify = function(str){
		return ug.minify(str).code;
	}
}catch(e){
	minify = function(str){return str};
}
var cache = {};
function cacheadd(dic, key){
	var p = dic.__.path;
	if(!(p in cache)){
		cache[p] = {};
	}
	cache[p][key]	= dic[key];
}
var _do;
var its = {
	mkdir: function(d){
		this.fn(fs.mkdir(d))
	},	
	exist: function(df){
		var fn = this.fn;
		if(fs.exist(df)){
			var stat = fs.stat(df);
			if(stat.isFile()) return get(_do, "File", {local:1}, fn);
			if(stat.isDirectory()) return get(_do, "Dir", {local:1}, fn);
			if(stat.isSymbolicLink()) return get(_do, "Symboliclink", {local:1}, fn);			
		}
		fn()
	},	
	write: function(fd, x){
		this.fn(fs.write(fd, x));
	},
	read: function(fd, buffer, offset, length, position){
		this.fn();
	},
	match: function(str, reg, op){		
		var r = new RegExp(reg, op)
		var m = str.match(r)
		if(!m) return this.fn();
		var rtn = newcpt([], "Array");
		for(var i=1; i<m.length; i++){
			rtn.push(m[i])
		}
		this.fn(rtn)
	},
	open: function(fname, mod){
		this.fn(fs.open(fname, mod));
	},
	close: function(fd){
		this.fn(fs.close(fd));
	},
	addrget: function(x, k){
		if(x==undefined) die("addrget empty: ", k, currargs)
		this.fn(newcpt([x, k.toString()], "Addr"));
	},
	addrset: function(x, k, v){
		if(x==undefined) die("addrset empty: ", k, currargs)
    x[k] = v;
		this.fn(v);
	},
	system: function(str){
    log(str);
		var fn = this.fn;
		var x = system(str,  {cwd: global.process.env.pwd});
		x.stdout.pipe(process.stdout);
		x.stderr.pipe(process.stderr);
		x.on('exit', function (code, info) {
			if(code == null) die(info)
			fn(code);
		});
	},
	log: function(c, l){
		logcpt(c)
		this.fn()
	},
	haskey: function(h, k){
		var v = !!Object.getOwnPropertyDescriptor(h, k.toString());
		this.fn(v);
	},
	len: function(arr){
		if(!arr) die(arr)
		if(arr.length) this.fn(arr.length);
		else this.fn(hashlen(arr));
	},
	strlen: function(str){
		this.fn(str.length);
	},
	diclen: function(dic){
		this.fn(Object.keys(dic).length);
	},
	free: function(addr){
		addrdel(this.env, addr);
		this.fn();
	},
	makecall: function(k, arg){//AGAIN
		var fn = this.fn;
		var env = this.env;
		get(env.__.dic, k, {}, function(addr){
			var addrx = copy(addr)
			var newarg = newcpt([], "Array");
			utils.eachsync(arg, function(x, fnsub){
				convert(x, "", env, 0, function(xx){
					hashpush(newarg, xx)
					fnsub();
				});
			}, function(){
				var x = noexec(newcpt([addrx, newarg], "Call"));
				fn(x)
			})
		})
	},
	call: function(f, argv){
		var x = newcpt([f, argv], "Call");
		execcall(x, this.env, this.fn);
	},
	main: function(main){
		var env = this.env;
		var fn = this.fn;		
		execblock(main, env, fn);
	},
	parse: function(input, brch){
		progl2cpt(input, brch, this.fn);
	},
	getp: function(cpt, k){
		this.fn(cpt.__[k])
	},
	setp: function(cpt, k, v){
		cpt.__[k] = v;
		this.fn(v)
	},
	noexec: function(cpt){
		var x = noexec(copy(cpt));
		this.fn(x);
	},
	id: function(s){
		var fn = this.fn;
		get(this.env.$._dic, s, {}, function(addr){
			fn(addr);
		})		
	},
	idglobal: function(s){
		var fn = this.fn;
		get(rootdic, s, {local:1, notaddr:1}, function(cpt){
			fn(cpt);
		})
	},
	type: function(x){
		this.fn(gettype(x));
	},
	get: function(ns, s){
		var fn = this.fn;
		get(ns, s, {notnew:1}, function(x){
			fn(x)
		})
	},
	eval: function(str){
		_eval(str, this.env, this.fn);
	},
	plus: function(l, r){
		this.fn(l+r);
	},
	minus: function(l, r){
		this.fn(l-r);
	},
	times: function(l, r){
		this.fn(l*r);		
	},
	not: function(c){
		this.fn(!c);		
	},
	and: function(l, r){
		if(!l) return this.fn(false);
		exec(r, this.env, this.fn);
	},
	or: function(l, r){
		if(l) return this.fn(true);
		exec(r, this.env, this.fn);
	},  
	eq: function(l, r){
    if(typeof l == "object" && typeof r == "object"){
      var tl = gettype(l);
      var tr = gettype(r);
      if(tl != tr) return this.fn(0);      
      if(tl == "Class") return this.fn(l.__.path == r.__.path);
    }else{
		  this.fn(l==r);
    }
	},
	lt: function(l, r){
		this.fn(l<r);
	},
	gt: function(l, r){
		this.fn(l>r);				
	},
	assign: function(r, l){
		addrset(this.env, l, r);
		this.fn(r);
	},
	concat: function(r, l){
    var v = addrget(this.env, l);
    v += r;
		addrset(this.env, l, v);
		this.fn(r);
	},
	default: function(r, l){
    var v = addrget(this.env, l);
    if(v === undefined)      
		  addrset(this.env, l, r);
		this.fn(r);
	},
  defined: function(v){
    if(v === undefined) return this.fn(0);
    this.fn(1);
  },
	return: function(rtn){
		this.fn(newcpt([rtn], "Return"));
	},
	def: function(x, t){
		if(x[0][0] == "argdef") die("defined in argdef: "+x[1])
		x[0][1] = t;
	},
	break: function(){
		this.fn(newcpt([1], "Ctrl"));
	},
	continue: function(){
		this.fn(newcpt([0], "Ctrl"));				
	},	
	each: function(k, v, c, bl){
		eachsub(this.env, k, v, c, bl).then(this.fn);		
	},
	while: function(end, bl){
		var env = this.env;
		var fn = this.fn;
		endwhile(env, end, bl).then(fn);
	},
	for: function(stt, end, inc, bl){
		var env = this.env;
		var fn = this.fn;
		exec(stt, env, function(sttr){
			endfor(env, end, inc, bl).then(fn);
		});
	},
	if: function(x, bif, bels){
		var env = this.env;
		var fn = this.fn;
		if(x){
			exec(bif, env, function(rtn){
				fn(rtn)
			});
		}else{
			exec(bels, env, fn);			
		}
	},
	int: function(x){
		this.fn(parseInt(x))
	},
	string: function(x){
		if(x == undefined) return this.fn("");
		if(typeof x == "object") return this.fn(utils.stringify(x));
		return this.fn(x.toString());
	},
  block: function(x){
    var fn = this.fn;
		if(typeof x != "object") return fn(x);
    if(gettype(x) == "Call"){
      return fn(noexec(newcpt([x], "Block", x.__.dic)));
    }
    fn(x)
  },
}
function copy(cpt){
	var t = gettype(cpt);
//	if(cpt && cpt.__ && cpt.__.fixed) return cpt;
	
	var ncpt = utils.isarr(cpt)?[]:{};
	switch(t){
	case "String":
	case "Undefined":
	case "Number":
	case "Int":		
	case "Dic":
		return cpt;
	case "Addr":
		ncpt[0] = cpt[0];
		ncpt[1] = cpt[1];
		ncpt[2] = cpt[2];
		ncpt[3] = cpt[3];		
		break;
	case "Block":
		for(var k in cpt){
			ncpt[k] = copy(cpt[k]);
		}
		break;
	case "Call":
		ncpt[0] = copy(cpt[0]);
		ncpt[1] = copy(cpt[1]);
		break;
	case "Array":
		for(var i in cpt){
			ncpt[i] = copy(cpt[i]);
		}
		break;
	case "Function":
		ncpt[0] = copy(cpt[0]);
		ncpt[1] = copy(cpt[1]);
		break;
	case "Argdef":
		ncpt[0] = copy(cpt[0])
		ncpt[1] = cpt[1];
		break;
	default:
		die(t);
	}
	ncpt.__ = {};		
	Object.defineProperty(ncpt, '__', {
		enumerable: false,
		configurable: false
	});
	for(var k in cpt.__){
		ncpt.__[k] = cpt.__[k]
	}	
	return ncpt;
}
function noexec(cpt){
	var t = gettype(cpt);
	switch(t){
	case "Call":
		cpt.__.noexec = 1;
		noexec(cpt[0]);
		noexec(cpt[1]);		
		break;
	case "Block":
	case "Array":
		cpt.__.noexec=1;
		for(var i in cpt){
			noexec(cpt[i]);
		}
		break;
	case "Addr":
		cpt.__.noexec=1;		
		break;
	case "Function":
//		cpt = copy(cpt);
		noexec(cpt[0])
		break;
	case "String":
	case "Undefined":
	case "Number":
	case "Int":
	case "Dic":    
		break;
	default:
		die(t)
	}
	return cpt;
}
async function endwhile(env, end, bl){
	while(await utils.tp(exec, [end, env])){
		let blr = await utils.tp(exec, [bl, env]);
		if(gettype(blr) == "Return")
			return blr;
		if(gettype(blr) == "Ctrl"){
			if(blr[0]) break;
			else continue;
		}		
	};
}
async function endfor(env, end, inc, bl){
	while(await utils.tp(exec, [end, env])){
		let blr = await utils.tp(exec, [bl, env]);
		await utils.tp(exec, [inc, env]);
		if(gettype(blr) == "Return")
			return blr;
		if(gettype(blr) == "Ctrl"){
			if(blr[0]) break;
			else continue;
		}		
	};	
}
async function eachsub(env, k, v, c, bl){
	for(let key in c){
		addrset(env, k, key)
		addrset(env, v, c[key])		
		const blr = await utils.tp(exec, [bl, env]);
		if(gettype(blr) == "Return")
			return blr;
		if(gettype(blr) == "Ctrl"){
			if(blr[0]) break
			else continue;
		}		
	}
}

function execcall(cpt, env, fn){
	currfunc = cpt[0][1];
  currargs = "";  
	convert(cpt[0], "Function", env, 1, function(func){
		//generate call stack [args/local, ]
		var argdefall = func[1] || [];
		var argdefs = argdefall[0] || [];//{key, type}
		var rtndef = argdefall[1];
		var args = cpt[1];
		
		var $args = newcpt({}, "Dic");
    $args.__.execd = 1;
		var argtmp = [];
		$args.$=$args;
		utils.eachsync(Object.keys(args), function(i, fnsub){
      currargs += cpt2str(cpt[1][i]) + ",";
			var argdef = argdefs[i] || [];
			var argp = args[i];
			//if callable, keep arguments uncalled
			convert(argp, argdef[1], env, 1, function(carg){
				$args[i] = carg;
				argtmp[i] = carg;
				if(argdef[0]){
					$args[argdef[0]] = carg;
				}
				fnsub();						
			});
		}, function(){
			$args.__.length = argtmp.length;
			if(func.__.native){
				func.__.native.apply({fn: fn, env: env}, argtmp);
				return;
			}
			$args._dic = func[0].__.dic;
			$args._func = func;
			if($args._dic.__.level == env.$._dic.__.level + 1){
				$args._parent = env.$;
			}else{
				$args._parent = env.$._parent;
			}
			push(env, $args);
			if(func.__.tpl){
				render(func[0][0], env, function(rtn){
					pop(env);
					fn(rtn)
				});
				return;
			}
			exec(func[0], env, function(rtn){
				var rtype = gettype(rtn);
				if(rtype == "Return"){
					rtn = rtn[0];
				}
				convert(rtn, rtndef, env, 0, function(rtnf){
					pop(env);
					fn(rtnf);
				})
			});
		});
	});
}
function newcpt(val, type, dic, name){
	if(typeof val != "object") return val;
	var c = val.__ = {length: val.length || 0};
	Object.defineProperty(val, '__', {
		enumerable: false,
		configurable: false
	});
	c.type = type || "Dic";
	c.rels = {};
	if(dic){
		if(!name){
			name = hashlen(dic).toString();
			hashpush(dic, val);
		}else{
			dic[name] = val;			
		}
		if(dic.__.path)
			c.path = dic.__.path + "/" + name;
		else
			c.path = name;
		c.level = dic.__.level + 1;//for closure			
	}
	c.indent = 0;
	c.dic = dic;
	c.name = name;
	return val;
}
function addrdel(env, addr){
	if(addr[3] != undefined){
		delete addr[3][addr[1]];
	}	
	if(addr[2] != undefined){
		if(addr[2])
			delete env.$._parent[addr[1]];//this
		else
			delete env.$[addr[1]];
		return;
	}
	delete addr[0][addr[1]];
}
function addrget(env, addr){
	if(addr[3] != undefined){
		return addr[3][addr[1]];
	}
	if(addr[2] != undefined){
		if(addr[2])
			return env.$._parent[addr[1]];//this
		else
			return env.$[addr[1]];
		return;
	}
	return addr[0][addr[1]];	
}
function addrpreload(env, addr){
	if(addr[3] != undefined) return;
	if(addr[2] != undefined){
		if(addr[2])
			addr[3] = env.$._parent
		else
			addr[3] = env.$		
	}
}
function addrset(env, addr, val){
	var h;
	if(addr[3] != undefined)
		h = addr[3]
	if(addr[2] != undefined){
		if(addr[2])
			h = env.$._parent
		else
			h = env.$
	}else{
		h	= addr[0];
	}
	if(addr[1].match(/^\d+$/)){
		var i = parseInt(addr[1]);
		if(i >= hashlen(h)){
			h.__.length = i+1;
		}
	}
	if(addr[3]){
		var t = gettype(val);		
		addr[3][1] = t;
	}
	h[addr[1]] = val;
	return val;
}
var rootdic = newcpt({}, "Dic");
rootdic.__.path = "";
rootdic.__.level = 0;
rootdic.__.isroot = 1;
rootdic.__.fixed = 1;
rootdic.__.execd = 1;

function progl2cpt(str, dic, fn){
	var ast = parser.parse(str);
	ast2cpt(ast, dic, function(cpt){
		fn(cpt);
	});
}
function cpt2str(cpt){
	var t = gettype(cpt);
	switch(t){
	case "String":
		return '"'+cpt.toString()+'"';		
	case "Number":
	case "Int":		
		return cpt.toString();
	case "Undefined":
		return "_";
	case "Call":
		var args = "";
		for(var i in cpt[1]){
			args += cpt2str(cpt[1][i]) + ",";
		}
		return cpt2str(cpt[0]) + "(" + args + ")";
	case "Block":
		var b = "";
		for(var i in cpt){
			args += cpt2str(cpt[i]) + "\n";
		}
		return "{" +b+"}"
	case "Addr":
		if(typeof cpt[0] != "object" || cpt[0].__.path == "_do")
			return cpt[1]
		else
			return cpt[0].__.path+"/"+cpt[1];
	case "Array":
		var args = "";
		for(var i in cpt){
			args += cpt2str(cpt[i]) + ",";
		}		
		return "[" + args + "]";
	case "Dic":
		var args = "";
		for(var k in cpt){
			args += k + ":" + "\n";
		}
		return "@{\n" + args + "}";    
	case "Class":
		return "Class: "+cpt.__.name;    
	case "Function":
		return "Function: "+cpt.__.path;
  case "Argdef":
//    log(cpt)
    return "Argdef";
	default:
		die(t)
	}
	
}
function logcpt(cpt){
	log(cpt2str(cpt));
}
function block2arr(es, dic, fn){
	var arr = [];
	utils.eachsync(Object.keys(es), function(k, fnsub){
		var arg = es[k];
		ast2cpt(arg, dic, function(argcpt){
			arr[k] = argcpt;
			fnsub();
		});
	}, function(){
		fn(arr);
	});
}
function block2dic(es, dic, fn){
	var arr = {};
	utils.eachsync(Object.keys(es), function(k, fnsub){
		var arg = es[k];
		ast2cpt(arg, dic, function(argcpt){
			arr[k] = argcpt;
			fnsub();
		});
	}, function(){
		fn(arr);
	});
}
function setrels(cpt, rels, fn){
	var crels = cpt.__.rels;
	utils.eachsync(rels, function(k, fnsub){
		get(rootdic, k, {notaddr: 1}, function(rel){
			if(typeof rel != "object")
				die("wrong rel " + rel);
			crels[rel.__.path] = rel;
			fnsub();	
		});
	}, function(){
		fn(cpt);
	})	
}
function ast2cpt(ast, dic, fn){
	var c = ast[0];
	var e = ast[1];
	switch(c){
	case "obj":
		var ee = ast[2];
		fn(newcpt(ee, e));
		break;
	case "id":
		if(Object.getOwnPropertyDescriptor(dic, e)){
			var ee = dic[e];
			if(ee && ee.__ && ee.__.fixed)//is named function
				return fn(newcpt([dic,e], "Addr"));
			return fn(newcpt([dic, e, 0], "Addr"));
		}else if(Object.getOwnPropertyDescriptor(dic.__.dic, e)){//TODO multi level
			var ee = dic.__.dic[e];			
			if(ee && ee.__ && ee.__.fixed)//is named function
				return fn(newcpt([dic.__.dic,e], "Addr"));			
			return fn(newcpt([dic.__.dic, e, 1],"Addr"));			
		}else{
      //TODO import
			get(dic, e, {notnew: 1}, function(addr){
				if(addr){
					if(gettype(addr) !="Addr"){
						die(gettype(addr))
					}
					fn(addr);
				}else{					
					dic[e] = newcpt(["local"], "Array");//set lexical scope					
					fn(newcpt([dic, e, 0],"Addr"));
				}
			});
		}
		break;
	case "reg":
		if(!dic[e])
			dic[e] = newcpt(["local"], "Array");//set lexical scope
		fn(newcpt([dic, e, 0], "Addr"));//addr stack
		break;	
	case "tpl":
		var newdic = newcpt({}, "Dic", dic);
    newdic.execd = 1;
    var toeval;
    if(e == ""){
      toeval = ""
    }else{
		  try{
 			  toeval = tpl.parse(e);
		  }catch(err){
			  logcpt(currfile)
			  log(e)			
			  die(err)
		  }
    }
		var tpl0 = newcpt([toeval], "Tpl", newdic);		
//		log(toeval);
		var tplfunc = newcpt([tpl0, [[]]], "Function", dic);
		tplfunc.__.tpl = 1;		
		fn(tplfunc);
		break;
	case "native":		
	case "function":
		var newdic = newcpt({}, "Dic", dic, e[3]?"_"+e[3]:undefined);
    newdic.__.execd = 1;
		newdic.__.indent = dic.__.indent + 1;
		var func = newcpt([], "Function", dic, e[3]);
//		newdic.this = func;
		if(e[3])
			func.__.fixed = 1;
		if(e[1]){
			func[1] = newcpt(e[1], "Argdef");
			var x = func[1][0];
			newcpt(x, "Array");
			for(var i in x){
				newdic[x[i][0]] = newcpt(["argdef", x[i][1]], "Array")
				newcpt(x[i], "Array");
			}
		}
		ast2cpt(e[0], newdic, function(ee){
			var t = gettype(ee);
			if(t != "Call" && t!="Block") die(e);
			func[0] = ee;
			setrels(func, ast[2], function(){
				if(c=="native"){
					func.__.native = 1;
					func[0].__.native = 1;
				}
				fn(func);
			})			
		});
		break;
	case "block":
		block2arr(e, dic, function(ee){
			fn(newcpt(ee, "Block", dic));
		});
		break;
	case "call":
		ast2cpt(e[0], dic, function(func){
			block2arr(e[1], dic, function(args){
				newcpt(args, "Array", dic);
				return fn(newcpt([func, args], "Call", dic));
			});
		});
		break;
	case "arr":
		block2arr(e, dic, function(cpt){
			newcpt(cpt, "Array", dic);
			fn(cpt);
		});
		break;
	case "dic":
    block2dic(e, dic, function(cpt){
		  newcpt(cpt, "Dic", dic);    
		  setrels(cpt, ast[2], function(){
			  fn(cpt);			
		  })
    });
		break;
	case "class":
    block2dic(e, dic, function(cpt){
		  newcpt(cpt, "Class", dic);    
		  setrels(cpt, ast[2], function(){
			  fn(cpt);			
		  })
    });
		break;
	default:
		die("wrong ast", ast);
	}
}
var intypes = {
	"Undefined":1,
	"Number": 1,
	"Int": 1,	
	"String": 1,
	"Array": 1,  
	"Dic": 1,
	
	"Block": 1,	
	"Function": 1,
  "Argdef": 1,
	
	"Addr": 1,
	"Call": 1,
	"Return": 1,
	"Ctrl": 1	
}
function gettype(cpt){
	switch(typeof cpt){
	case "boolean":
		return "Int";
	case "undefined":
		return "Undefined"
	case "number":
		if(parseInt(cpt) == cpt)
			return "Int"
		return "Number"
	case "string":
		return "String"
	case "object":
		if(!cpt.__) die("not cpt: ", cpt)
		return cpt.__.type;
	default:
		die("wrong cpt type", cpt);
	}
}

var currfunc;
var currargs;
function convert(cpt, type, env, flag, fn){
	var otype = gettype(cpt);
	if(type == "Int") type = "Number";
	if(otype == "Int") otype = "Number";	
	if(cpt && cpt.__ && cpt.__.noexec) return fn(cpt)
	if(otype == "Addr" && type != "Addr"){
		convert(addrget(env, cpt), type, env, 0, fn);
		return;
	}	
	if(type == "Callable"){
    /*
		if(typeof cpt == "object" && typeof(cpt.__.dic) == "object"){
      if(otype == "Call"){
        cpt = newcpt([cpt], "Block", cpt.__.dic);
      }      
			cpt.__.indent = cpt.__.dic.__.indent + 1;
    }
*/
//		if(otype == "Addr"){
//			exec(cpt, env, fn);
//		}else{
		fn(cpt);
//		}
		return;
	}
	if(type == "Addr" && otype == "Addr"){
		return fn(cpt)
	}
	if(flag){
		exec(cpt, env, function(ncpt){
			convert(ncpt, type, env, 0, fn);
		});
		return;		
	}
	if(otype == type || !type){
		return fn(cpt);
	}	
	log(currfunc)
	for(var i in env.stack){
		var x = env.stack[i];
		log(x._func)
	}
	die(otype +" is not "+type, cpt);		
}


function getfinal(dic, key, config, fn){
	if(config.notaddr){
		return fn(dic[key]);		
	}
	fn(newcpt([dic, key], "Addr"));
}
function getfinalnew(dic, key, config, fn){
	if(!config.notnew){
		if(config.notaddr){
			var newc = newcpt({}, "Dic", dic, key);
      newc.execd = 1;
			fn(newc);
		}else{
			dic[key] = undefined;
			fn(newcpt([dic, key], "Addr"));
		}
//		cacheadd(dic, key);
	}else{
		return fn();
	}
}
function getsub(dic, keys, config, fn){
	if(keys.length == 1){
		get(dic, keys[0], config, fn);
		return;
	}
	var key0 = keys.shift();
	get(dic, key0, {local:1, notaddr:1}, function(sdic){
		getsub(sdic, keys, config, fn);
	});
}
//leaf local notnew
function get(dic, key, config, fn){
	if(gettype(dic) != "Dic"){
		logcpt(dic)
		die("notdic")
	}
	if(!config) config = {};
	if(key == undefined){
		key = hashlen(dic).toString();
	}
	key = key.toString();
	if(key.match("/")){
		//absolute path
		var keys = key.split("/");
		getsub(dic, keys, config, fn);
		return;
	}
	if(Object.getOwnPropertyDescriptor(dic, key)){
		return getfinal(dic, key, config, fn);
	}
	utils.ifsync(db, function(fnsub){
		currfile = dic.__.path+"/"+key;
		db.get(dic.__.path+"/"+key, function(str){
			if(str){
				progl2cpt(str, dic, function(cpt){
					utils.ifsync(typeof cpt == "object", function(fnsub2){
						var c = cpt.__;
						c.dic = dic;
						c.name = key;
						c.path = dic.__.path + "/" + key;
						c.fixed = 1;
						if(c.native){
							c.native = its[key];
							cpt[0].__.native = key;
						}
            if(gettype(cpt) == "Function")
						  cpt[0].__.name = key;                          
						if(dic.__.isroot) return fnsub2()
						get(dic.__.dic, key, {notaddr: 1, notnew:1}, function(cptpre){
							if(cptpre == undefined) return fnsub2()
							cpt.__.parent = cptpre;
							if(typeof cptpre != "object") return fnsub2()
							utils.append1(cpt, cptpre);
							fnsub2()
						});
					}, function(){
						dic[key] = cpt;
						fnsub(1);
					});
				});
			}else{
				fnsub();
			}
		});
	}, function(r){
		if(r) return getfinal(dic, key, config, fn);
		if(config.local) return getfinalnew(dic, key, config, fn);
		utils.eachsync(Object.values(dic.__.rels), function(link, fnsub){
			get(link, key, {notnew:1, notaddr: config.notaddr, notparent: 1}, fnsub);
		}, function(res){
			if(res) return fn(res);
			utils.ifsync(dic.__.dic, function(fnsub){
        if(config.notparent) return fnsub();
				get(dic.__.dic, key, {notnew:1, notaddr:config.notaddr}, fnsub);
			}, function(res){
				if(res) return fn(res);
				return getfinalnew(dic, key, config, fn);
			});
		});
	});
}
function render(str, env, fn){
	if(str == "") return fn("");
	newenv(env.initdic, undefined, function(nenv){
		for(var k in env.$){
			nenv.$["_"+k] = env.$[k];
		}

		_eval(str, nenv, function(rtn){
			fn(rtn);
		});
	});
	
}
function execblock(cpt, env, fn){
	if(gettype(cpt) != "Block"){
		die("not Block", cpt);
	}
	var last;
	utils.eachsync(Object.keys(cpt), function(k, fnsub){
		var c = cpt[k];
		exec(c, env, function(rtn){
			last = rtn;
			var rtype = gettype(rtn);
			if(rtype == "Return" || rtype == "Ctrl"){
				return fnsub(rtn);
			}else{
				return fnsub();
			}
		})
	}, function(rtn){
		if(rtn)
			fn(rtn);
		else
			fn(last);
	})	
}
function execarray(cpt, env, fn){
	if(gettype(cpt) != "Array"){
		die("not Array", cpt);
	}
  if(cpt.__.execd) return fn(cpt)
	var ncpt = newcpt([], "Array", env.$._dic);
	utils.eachsync(Object.keys(cpt), function(k, fnsub){
		var c = cpt[k];
		exec(c, env, function(rtn){
			ncpt[k] = rtn;
			fnsub();
		})
	}, function(){
    ncpt.__.execd = 1;
		fn(ncpt);
	})	
}
function execdic(cpt, env, fn){
	if(gettype(cpt) != "Dic"){
		die("not Dic", cpt);
	}
  if(cpt.__.execd) return fn(cpt)  
	var ncpt = newcpt({}, "Dic", env.$._dic);
	utils.eachsync(Object.keys(cpt), function(k, fnsub){
		var c = cpt[k];
		exec(c, env, function(rtn){
			ncpt[k] = rtn;
			fnsub();
		})
	}, function(){
    ncpt.__.execd = 1;    
		fn(ncpt);
	})	
}
//Lexical scope only
function exec(cpt, env, fn){

	var type = gettype(cpt);
	switch(type){
	case "Block":
		if(cpt.__.noexec) return fn(cpt);
		execblock(cpt, env, function(rtn){
			fn(rtn)
		});			
		break;
	case "Call":
		if(cpt.__.noexec) return fn(cpt);
		
		execcall(cpt, env, function(rtn){
			fn(rtn)
		});
		break;
	case "Array":
		if(cpt.__.noexec) return fn(cpt);
		execarray(cpt, env, function(rtn){
			fn(rtn)
		});		
		break;
    
	case "Dic":
	case "Class":    
		if(cpt.__.noexec) return fn(cpt);
		execdic(cpt, env, function(rtn){
			fn(rtn)
		});		
		break;

	case "Addr":
		if(cpt.__.noexec) return fn(cpt);
		if(cpt[3]) return fn(cpt);
		addrpreload(env, cpt);
		fn(cpt);
		break;
	default:
		fn(cpt);
		return;
	}
}

function newenv(dic, lang, fn){
	get(dic, lang, {local:1 , notaddr: 1}, function(ldic){
		if(!ldic) ldic = _do;
		var env = newcpt({
			$: newcpt({}, "Dic"),
			stack: newcpt([], "Array"),
			initdic: ldic
		}, "Dic", ldic);
    env.__.execd = 1
    env.$.__.execd = 1;
		env.$._dic = ldic;
		env.$.$ = env.$;
		get(ldic, "main", {notaddr: 1, notnew: 1}, function(cpt){
			env.main = cpt;
			fn(env);
		});
	});
}
/*
function init(fn){
	if(_do) fn()
	//load boot and native functions
	get(rootdic, "_do", {local:1, notaddr:1}, function(dic){
		_do = dic;
		utils.eachsync(Object.keys(its), function(k, fnsub){
			get(dic, k, {local:1, notaddr:1, impl:1}, function(func){
				func.__.native = its[k]
				fnsub()
			});
		}, function(){
			fn(dic)
		})
	});
}
*/
function _eval(str, env, fn){
	progl2cpt("{"+str+"}", env.$._dic, function(cpt){
		execblock(cpt, env, function(rtn){
			fn(rtn);
		});
	});
}

function run(str, lang, argv, fn){
	if(!fn){
		fn = lang;
		lang = undefined;
	}
	get(rootdic, "_do", {local:1, notaddr:1}, function(dic){
		_do = dic;
		var argvcpt = newcpt(argv, "Array", _do, "argv");
		argvcpt.__.fixed = 1;
		newenv(_do, lang, function(env){
			progl2cpt("{"+str+"\n}", env.__.dic, function(maincpt){
				var newcall = newcpt([env.main, newcpt([maincpt], "Array", env.__.dic)], "Call", env.__.dic);			
				exec(newcall, env, function(rtn){
					fn(rtn);
				})
			})
		})
	})
}

module.exports = {
	run: run
}
