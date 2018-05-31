var utils = require("./utils");
var die = utils.die;
var log = utils.log;
var parser = require("./progl-parser");
var tpl = require("./tpl-parser");
var db = require("./db");
var fs = require("./fs");
function pop(env){
	env.$ = env.stack.pop();
}
function push(env, $new){
	env.stack.push(env.$);
	env.$ = $new || newcpt({}, "Brch");
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
function cacheadd(brch, key){
	var p = brch.__.path;
	if(!(p in cache)){
		cache[p] = {};
	}
	cache[p][key]	= brch[key];
}
var _do;
var its = {
	stat: function(fname){
		this.fn(fs.state(fname));
	},
	write: function(fd, x){
		this.fn(fs.write(fd, x));
	},
	read: function(fd, buffer, offset, length, position){
		this.fn();
	},
	open: function(fname, mod){
		this.fn(fs.open(fname, mod));
	},
	close: function(fd){
		this.fn(fs.close(fd));
	},
	addrget: function(x, k){
		if(x==undefined) die("empty: ", k)
		this.fn(newcpt([x, k.toString()], "Addr"));
	},
	log: function(c, l){
		logcpt(c)
		this.fn()
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
	free: function(addr){
		addrdel(this.env, addr);
		this.fn();
	},
	call: function(f, argv){
		var x = newcpt([f, argv], "Call");
		execcall(x, this.env, this.fn);
	},
	render: function(tpl, envf, envt){
		this.fn(render(tpl, envf, envt))
	},
	require: function(){
	},
	execmain: function(main){
		var env = this.env;
		var fn = this.fn;		
		execblock(main, env, fn);
	},
	getp: function(cpt, k){
		this.fn(cpt.__[k])
	},
	noexec: function(cpt){
		var x = noexec(copy(cpt));
		this.fn(x);
	},
	id: function(s){
		var fn = this.fn;
		get(this.env.$._brch, s, {}, function(addr){
			fn(addr);
		})		
	},
	idglobal: function(s){
		var fn = this.fn;
		get(rootbrch, s, {local:1, notaddr:1}, function(cpt){
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
	exec: function(){
		
	},
	eval: function(){
	},
	plus: function(l, r){
		this.fn(l+r);
	},
	times: function(l, r){
		this.fn(l*r);		
	},
	eq: function(l, r){
		this.fn(l==r);
	},
	ne: function(l, r){
		this.fn(l!=r);
	},
	lt: function(l, r){
		this.fn(l<r);
	},
	le: function(l, r){
		this.fn(l<=r);		
	},
	gt: function(l, r){
		this.fn(l>r);				
	},
	ge: function(l, r){
		this.fn(l>=r);		
	},
	assign: function(r, l){
		addrset(this.env, l, r);
		this.fn(r);
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
	for: function(stt, end, inc, bl){
		var env = this.env;
		var fn = this.fn;
		exec(stt, env, function(sttr){
			endrec(env, end, inc, bl).then(fn);
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
	}
}
function copy(cpt){
	var t = gettype(cpt);
//	if(cpt && cpt.__ && cpt.__.fixed) return cpt;
	
	var ncpt = utils.isarr(cpt)?[]:{};
	switch(t){
	case "String":
	case "Undefined":
	case "Number":
	case "Env":
	case "Brch":			
		return cpt;
	case "Addr":
		ncpt[0] = cpt[0];
		ncpt[1] = cpt[1];
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
		break;
	default:
		die(t)
	}
	return cpt;
}
async function endrec(env, end, inc, bl){
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
var currfunc;
function execcall(cpt, env, fn){
	currfunc = cpt[0][1];
	
	convert(cpt[0], "Function", env, 1, function(func){
		//generate call stack [args/local, ]
		var argdefall = func[1] || [];
		var argdefs = argdefall[0] || [];//{key, type}
		var rtndef = argdefall[1];
		var args = cpt[1];
		
		var $args = newcpt({}, "Brch");
		var argtmp = [];
		$args.$=$args;
		utils.eachsync(Object.keys(args), function(i, fnsub){
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
			$args._brch = func[0].__.brch;
			$args._func = func;
			if($args._brch.__.level == env.$._brch.__.level + 1){
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
				pop(env);
				fn(rtn);
			});
		});
	});
}
function newcpt(val, type, brch, name){
	if(typeof val != "object") return val;
	var c = val.__ = {length: val.length || 0};
	Object.defineProperty(val, '__', {
		enumerable: false,
		configurable: false
	});
	c.type = type || "Brch";
	c.rels = {};
	if(brch){
		if(!name){
			name = hashlen(brch).toString();
			hashpush(brch, val);
		}else{
			brch[name] = val;			
		}
		if(brch.__.path)
			c.path = brch.__.path + "/" + name;
		else
			c.path = name;
		c.level = brch.__.level + 1;//for closure			
	}
	c.indent = 0;
	c.brch = brch;
	c.name = name;
	return val;
}
function addrdel(env, addr){
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
	if(addr[2] != undefined){
		if(addr[2])
			return env.$._parent[addr[1]];//this
		else
			return env.$[addr[1]];
		return;
	}
	return addr[0][addr[1]];	
}
function addrset(env, addr, val){
	var h;
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
var rootbrch = newcpt({}, "Brch");
rootbrch.__.path = "";
rootbrch.__.level = 0;
rootbrch.__.isroot = 1;
rootbrch.__.fixed = 1;
function progl2cpt(str, brch, fn){
	var ast = parser.parse(str);
	ast2cpt(ast, brch, function(cpt){
		fn(cpt);
	});
}
function cpt2str(cpt){
	var t = gettype(cpt);
	switch(t){
	case "String":
		return '"'+cpt.toString()+'"';		
	case "Number":
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
	case "Brch":
		console.log(cpt)
		return "Brch:"+cpt.__.path;
	case "Env":
		return "Env"
	case "Function":
		return "Function:"+cpt.__.path;
	default:
		die(t)
	}
	
}
function logcpt(cpt){
	log(cpt2str(cpt));
}
function block2arr(es, brch, fn){
	var arr = [];
	utils.eachsync(Object.keys(es), function(k, fnsub){
		var arg = es[k];
		ast2cpt(arg, brch, function(argcpt){
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
		get(rootbrch, k, {notaddr: 1}, function(rel){
			if(typeof rel != "object")
				die("wrong rel " + rel);
			crels[rel.__.path] = rel;
			fnsub();	
		});
	}, function(){
		fn(cpt);
	})	
}
function ast2cpt(ast, brch, fn){
	var c = ast[0];
	var e = ast[1];
	switch(c){
	case "obj":
		var ee = ast[2];
		fn(newcpt(ee, e));
		break;
	case "id":
		if(Object.getOwnPropertyDescriptor(brch, e)){
			var ee = brch[e];
			if(ee && ee.__ && ee.__.fixed)//is named function
				return fn(newcpt([brch,e], "Addr"));
			return fn(newcpt([brch, e, 0], "Addr"));
		}else if(Object.getOwnPropertyDescriptor(brch.__.brch, e)){
			var ee = brch.__.brch[e];			
			if(ee && ee.__ && ee.__.fixed)//is named function
				return fn(newcpt([brch.__.brch,e], "Addr"));			
			return fn(newcpt([brch.__.brch, e, 1],"Addr"));			
		}else{
			get(brch, e, {notnew: 1}, function(addr){
				if(addr){
					if(gettype(addr) !="Addr"){
						die(gettype(addr))
					}
					fn(addr);
				}else{					
					brch[e] = newcpt(["local"], "Array");//set lexical scope					
					fn(newcpt([brch, e, 0],"Addr"));
				}
			});
		}
		break;
	case "global":
		get(rootbrch, e, {local: 1}, function(addr){
			fn(addr);
		});		
		break;
	case "reg":
		if(!brch[e])
			brch[e] = newcpt(["local"], "Array");//set lexical scope
		fn(newcpt([brch, e, 0], "Addr"));//addr stack
		break;	
	case "tpl":
		var newbrch = newcpt({}, "Brch", brch);
		var toeval = tpl.parse(e);
		var tpl0 = newcpt([toeval], "Tpl", newbrch);		
//		log(toeval);
		var tplfunc = newcpt([tpl0, [[]]], "Function", brch);
		tplfunc.__.tpl = 1;		
		fn(tplfunc);
		break;		
	case "function":
		var newbrch = newcpt({}, "Brch", brch, e[3]?"_"+e[3]:undefined);
		newbrch.__.indent = brch.__.indent + 1;
		var func = newcpt([], "Function", brch, e[3]);
//		newbrch.this = func;
		if(e[3])
			func.__.fixed = 1;
		if(e[1]){
			func[1] = newcpt(e[1], "Argdef");
			var x = func[1][0];
			newcpt(x, "Array");
			for(var i in x){
				newbrch[x[i][0]] = newcpt(["argdef", x[i][1]], "Array")
				newcpt(x[i], "Array");
			}
		}
		ast2cpt(e[0], newbrch, function(ee){
			var t = gettype(ee);
			if(t != "Call" && t!="Block") die(e);
			func[0] = ee;
			setrels(func, ast[2], function(){
				fn(func);
			})			
		});
		break;
	case "block":
		block2arr(e, brch, function(ee){
			fn(newcpt(ee, "Block", brch));
		});
		break;
	case "call":
		ast2cpt(e[0], brch, function(func){
			block2arr(e[1], brch, function(args){
				newcpt(args, "Array", brch);
				return fn(newcpt([func, args], "Call"));
			});
		});
		break;
	case "arr":
		block2arr(e, brch, function(cpt){
			newcpt(cpt, "Array", brch);
			fn(cpt);
		});
		break;
	case "brch":
		var cpt = newcpt({}, "Brch", brch);
		setrels(cpt, e, function(){
			fn(cpt);			
		})
		break;
	default:
		die("wrong ast", ast);
	}
}
var intypes = {
	"Undefined":1,
	"Number": 1,
	"String": 1,
	
	"Brch": 1,
	
	"Block": 1,	
	"Function": 1,
	"Env": 1,
	
	"Class": 1,	
	
	"Addr": 1,
	
	"Call": 1,
	"Return": 1,
	"Ctrl": 1	
}
function gettype(cpt){
	switch(typeof cpt){
	case "boolean":
		return "Number";
	case "undefined":
		return "Undefined"
	case "number":
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
function convert(cpt, type, env, flag, fn){
	var otype = gettype(cpt);
	if(cpt && cpt.__ && cpt.__.noexec) return fn(cpt)
	if(otype == "Addr" && type != "Addr"){
		convert(addrget(env, cpt), type, env, 0, fn);
		return;
	}	
	if(type == "Callable"){
		if(typeof cpt == "object" && typeof(cpt.__.brch) == "object")
			cpt.__.indent = cpt.__.brch.__.indent + 1;
		if(otype == "Addr"){
			exec(cpt, env, fn);
		}else{
			fn(cpt);
		}
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
	die(otype +" is not "+type, cpt, cpt);		
}


function getfinal(brch, key, config, fn){
	if(config.notaddr){
		return fn(brch[key]);		
	}
	fn(newcpt([brch, key], "Addr"));
}
function getfinalnew(brch, key, config, fn){
	if(!config.notnew){
		if(config.notaddr){
			var newc = newcpt({}, "Brch", brch, key);
			fn(newc);
		}else{
			brch[key] = undefined;
			fn(newcpt([brch, key], "Addr"));
		}
//		cacheadd(brch, key);
	}else{
		return fn();
	}
}
function getsub(brch, keys, config, fn){
	if(keys.length == 1){
		get(brch, keys[0], config, fn);
		return;
	}
	var key0 = keys.shift();
	get(brch, key0, {local:1, notaddr:1}, function(sbrch){
		getsub(sbrch, keys, config, fn);
	});
}
//leaf local notnew
function get(brch, key, config, fn){
	if(gettype(brch) != "Brch"){
		logcpt(brch)
		die("notbrch")
	}
	if(!config) config = {};
	if(key == undefined){
		key = hashlen(brch).toString();
	}
	key = key.toString();
	if(key.match("/")){
		//absolute path
		var keys = key.split("/");
		getsub(brch, keys, config, fn);
		return;
	}
	if(Object.getOwnPropertyDescriptor(brch, key)){
		return getfinal(brch, key, config, fn);
	}
	utils.ifsync(db, function(fnsub){
		db.get(brch.__.path+"/"+key, function(str){
			if(str){
				progl2cpt(str, brch, function(cpt){
					utils.ifsync(typeof cpt == "object", function(fnsub2){
						var c = cpt.__;
						c.brch = brch;
						c.name = key;
						c.path = brch.__.path + "/" + key;
						c.fixed = 1;
						if(brch.__.isroot) return fnsub2()
						get(brch.__.brch, key, {notaddr: 1, notnew:1}, function(cptpre){
							if(cptpre == undefined) return fnsub2()
							cpt.__.parent = cptpre;
							if(typeof cptpre != "object") return fnsub2()
							utils.append1(cpt, cptpre);
							fnsub2()
						});
					}, function(){
						brch[key] = cpt;
						fnsub(cpt);
					});
				});
			}else{
				fnsub();
			}
		});
	}, function(cpt){
		if(cpt) return getfinal(brch, key, config, fn);
		if(config.local) return getfinalnew(brch, key, config, fn);
		utils.eachsync(Object.values(brch.__.rels), function(link, fnsub){
			get(link, key, {notnew:1, notaddr: config.notaddr}, fnsub);
		}, function(res){
			if(res) return fn(res);
			utils.ifsync(brch.__.brch, function(fnsub){
				get(brch.__.brch, key, {notnew:1, notaddr:config.notaddr}, fnsub);
			}, function(res){
				if(res) return fn(res);
				return getfinalnew(brch, key, config, fn);
			});
		});
	});
}
function render(str, env, fn){
	
	newenv(env.initbrch, undefined, function(nenv){
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
		die("not Block", cpt);
	}
	var ncpt = newcpt([], "Array", env.$._brch);
	utils.eachsync(Object.keys(cpt), function(k, fnsub){
		var c = cpt[k];
		exec(c, env, function(rtn){
			ncpt[k] = rtn;
			fnsub();
		})
	}, function(){
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
		/*
	case "Addr":
		if(cpt.__.noexec) return fn(cpt);
		var rtn = addrget(env, cpt);
		fn(rtn);
		break;
*/
	default:
		fn(cpt);
		return;
	}
}

function newenv(brch, lang, fn){
	get(brch, lang, {local:1, notaddr: 1}, function(lbrch){
		if(!lbrch) lbrch = _do;
		var env = newcpt({
			$: newcpt({}, "Brch"),
			stack: newcpt([], "Array"),
			initbrch: lbrch
		}, "Env", lbrch);
		env.$._brch = lbrch;
		env.$.$ = env.$;
		get(lbrch, "execmain", {notaddr: 1, notnew: 1}, function(cpt){
			env.execmain = cpt;
			fn(env);
		});
	});
}
function init(fn){
	if(_do) fn()
	//load boot and native functions
	get(rootbrch, "_do", {local:1, notaddr:1}, function(brch){
		_do = brch;
		utils.eachsync(Object.keys(its), function(k, fnsub){
			get(brch, k, {local:1, notaddr:1}, function(func){
				func.__.native = its[k]
				fnsub()
			});
		}, function(){
			fn(brch)
		})
	});
}
function _eval(str, env, fn){
	progl2cpt("{"+str+"}", env.$._brch, function(cpt){
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
	init(function(brch){
		var argvcpt = newcpt(argv, "Array", _do, "argv");
		argvcpt.__.fixed = 1;
		newenv(_do, lang, function(env){
			progl2cpt("{"+str+"\n}", env.__.brch, function(maincpt){				
				var newcall = newcpt([env.execmain, newcpt([maincpt], "Array", env.__.brch)], "Call");
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
