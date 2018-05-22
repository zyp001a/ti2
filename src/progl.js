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
	env.$ = $new || [];
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
		this.fn(newcpt([x, k], "Addr"));
	},
	len: function(arr){
		this.fn(hashlen(arr));
	},
	strlen: function(str){
		this.fn(str.length);
	},
	call: function(){
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
//		var newcall = newcpt([main, argv], "Call");
//		exec(newcall, this.env, this.fn);
	},
	uncall: function(x){
		if(typeof x != "object") this.fn(x);
		var type = x.__.type;
		x.__.type = "Cpt";
		var ncpt = newcpt([x, type], "Cpt");
		this.fn(ncpt);
	},
	ununcall: function(x){
		if(typeof x != "object") this.fn(x);
		x[0].__.type = x[1];
		this.fn(x);		
	},
	id: function(s){
		var fn = this.fn;
		get(this.env.$._brch, s, {local:1}, function(addr){
			fn(addr);
		})		
	},
	idglobal: function(s){
		var fn = this.fn;
		get(rootbrch, s, {local:1, notaddr:1}, function(cpt){
			fn(cpt);
		})
	},
	get: function(ns, s, conf){
		if(!conf) conf = {};
		var fn = this.fn;
		get(ns, s, conf, function(x){
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
	eq: function(l, r){
		this.fn(l==r);
	},
	lt: function(l, r){
		this.fn(l<r);
	},
	assign: function(r, l){
		addrset(this.env, l, r);
		this.fn(r);
	},
	return: function(rtn){
		this.fn(newcpt([rtn], "Return"));
	},
	for: function(stt, end, inc, bl){
		var env = this.env;
		var fn = this.fn;
		exec(stt, env, function(sttr){
			endrec(env, end, inc, bl, fn);
		});
	},
	if: function(){
	},
	break: function(){
	},
	continue: function(){
	},
	string: function(x){
		if(x == undefined) return this.fn("");
		if(typeof x == "object") return this.fn(utils.stringify(x));
		return this.fn(x.toString());
	}
}
function endrec(env, end, inc, bl, fn){
	exec(end, env, function(endr){
		if(!endr){
			fn();
			return;
		}
		exec(bl, env, function(blr){
			//INT TODO
			exec(inc, env, function(incr){
				endrec(env, end, inc, bl, fn);
			});
		});
	});	
}
function execcall(cpt, env, fn){
  exec(cpt[0], env, function(funcp){
		convert(funcp, "Function", env, function(func){
//			log(func.__.name);					
			//generate call stack [args/local, ]
			var argdefall = func[1] || [];
			var argdefs = argdefall[0] || [];//{key, type}
			var rtndef = argdefall[1];
			var args = cpt[1];
			var $args = {};
			var argtmp = [];
			$args.$=$args;
			utils.eachsync(Object.keys(args), function(i, fnsub){
				var argdef = argdefs[i] || [];
				var argp = args[i];
				//if callable, keep arguments uncalled
				utils.ifsync(argdef[1] != "Callable", function(fnsub2){
					exec(argp, env, function(arg){
						convert(arg, argdef[1], env, function(xarg){							
							fnsub2([xarg])
						})
					})
				}, function(xarg){
					var carg;
					if(xarg){
						carg = xarg[0]
					}else{
						if(gettype(argp) == "Addr"){
							carg = addrget(env, argp);
						}else{
							carg = argp;
						}
					}

					$args[i] = carg;
					argtmp[i] = carg;
					if(argdef[0])
						$args[argdef[0]] = carg;
					fnsub();						
				});
			}, function(){
				if(func.__.native){
					func.__.native.apply({fn: fn, env: env}, argtmp);
					return;
				}
				$args._brch = func[0].__.brch;
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
						if(gettype(rtn[0]) == "Addr" && typeof rtn[0][0] != 'object'){
							//stack
							rtn = addrget(env, rtn[0]);
						}else{
							rtn = rtn[0];
						}
					}
					//else if(rtype == "Ctrl"){//break continue, do within special funcs
					//						}
					//check rtn type TODO
					pop(env);
					fn(rtn);
				});
			});
		});
	});					
}
function newcpt(val, type, brch, name){
	if(typeof val != "object") return val;
	var c = val.__ = {length: 0};
	Object.defineProperty(val, '__', {
		enumerable: false,
		configurable: false
	});
	c.type = type || "Cpt";
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
	
	c.brch = brch;
	c.name = name;
	return val;
}
function addrget(env, addr){
	if(typeof addr[0] == "object")
		return addr[0][addr[1]];
	else if(addr[0]){
		return env.$._parent[addr[1]];//this
	}else
		return env.$[addr[1]];
}
function addrset(env, addr, val){
	if(typeof addr[0] == "object"){
		addr[0][addr[1]] = val;
		if(addr[1].match(/^\d+$/)){
			var i = parseInt(addr[1]);
			if(i >= hashlen(addr[0])){
				addr[0].__.length = i+1;
			}
		}
		return val;
	}else if(addr[0])
		return env.$._parent[addr[1]] = val;//this
	else
		return env.$[addr[1]] = val;
}
var rootbrch = newcpt({}, "Brch");
rootbrch.__.path = "";
rootbrch.__.level = 0;
rootbrch.__.isroot = 1;
function progl2cpt(str, brch, fn){
	var ast = parser.parse(str);
	ast2cpt(ast, brch, function(cpt){
		fn(cpt);
	});
}
function logcpt(cpt){
	console.log("Cpt:");
	if(typeof cpt != "object") console.log(cpt);
	else console.log(cpt), console.log(cpt.__)
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
				return fn(newcpt([brch,e],"Addr"));
			return fn(newcpt([0,e],"Addr"));
		}else if(Object.getOwnPropertyDescriptor(brch.__.brch, e)){
			var ee = brch.__.brch[e];			
			if(ee && ee.__ && ee.__.fixed)//is named function
				return fn(newcpt([brch.__.brch,e],"Addr"));			
			return fn(newcpt([1,e],"Addr"));			
		}else{
			get(brch, e, {notnew: 1}, function(addr){
				if(addr)
					fn(addr);
				else{
					brch[e] = undefined//set lexical scope					
					fn(newcpt([0,e],"Addr"));	
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
		brch[e] = undefined;//set lexical scope
		fn(newcpt([0, e], "Addr"));//addr stack
		break;	
	case "addr"://absolute get
		ast2cpt(e[0], brch, function(cpt){
			ast2cpt(e[1], brch, function(key){
				fn(newcpt([cpt, key],"Addr"));
			});
		})
		break;
	case "tpl":
		var newbrch = newcpt({}, "Brch", brch);
		var toeval = tpl.parse(e);
		var tpl0 = newcpt([toeval], "Cpt", newbrch);		
		log(toeval);
		var tplfunc = newcpt([tpl0, [[]]], "Function", brch);
		tplfunc.__.tpl = 1;		
		fn(tplfunc);
		break;		
	case "function":
		var newbrch = newcpt({}, "Brch", brch, e[3]?"_"+e[3]:undefined);
		var func = newcpt([], "Function", brch, e[3]);
		if(e[3])
			func.__.fixed = 1;
		if(e[1]) func[1] = e[1];
		ast2cpt(e[0], newbrch, function(ee){
			var t = gettype(ee);
			if(t != "Call" && t!="Block") die(e);
			func[0] = ee;
			fn(func);
		});
		break;
	case "class":
		var newbrch = newcpt({}, "Brch", brch, e[2]?"_"+e[2]:undefined);
		block2arr(e[0], newbrch, function(ee){
		})
		ast2cpt(['block',e[0]], newbrch, function(block){
			var cls = newcpt([block], "Class", brch, e[3]);
			setrels(cls, e[1], function(){
				fn(cls)
			});
		});	
		break;
	case "new":
		var newbrch = newcpt({}, "Brch", brch);		
		ast2cpt(['block', e], newbrch, function(block){
			fn(newcpt([block], "New"));
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
				return fn(newcpt([func, args], "Call"));
			});
		});
		break;
	case "cpt":
		block2arr(e, brch, function(cpt){
			newcpt(cpt, "Cpt", brch);
			setrels(cpt, ast[2], function(){
				fn(cpt);
			})
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
function cpt2progl(val, fn){
	
}
var intypes = {
	"Undefined":1,
	"Number": 1,
	"String": 1,
	
	"Cpt": 1,
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
function gettype(cpt, internal){
	switch(typeof cpt){
	case "undefined":
		return "Undefined"
	case "number":
		return "Number"
	case "string":
		return "String"
	case "object":
		return cpt.__.type;
	default:
		die("wrong cpt type", cpt);
	}
}

function convert(cpt, type, env, fn){
	var otype = gettype(cpt);
	if(otype == type) return fn(cpt);	
	if(otype == "Addr"){
		return convert(addrget(env, cpt), type, env, fn);		
	}
	if(!type) return fn(cpt);		
	die(otype +" is not "+type, cpt);
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
			var newc = newcpt({}, "Cpt", brch, key);
			fn(newc);
		}else{
			brch[key] = undefined;
			fn(newcpt([brch, key], "Addr"));
		}
		cacheadd(brch, key);
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
	if(!config) config = {};
	if(key == undefined){
		key = hashlen(brch).toString();
	}
	if(key.match("/")){
		//absolute path
		var keys = key.split("/");
		getsub(rootbrch, keys, config, fn);
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
						c.path = brch.__.name + "/" + key;
						c.fixed = 1;						
						if(brch.__.isroot) return fnsub2()
						get(brch.__.brch, key, {notaddr: 1, notnew:1}, function(cptpre){
							if(!cptpre) return fnsub2()
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
			get(link, key, config, fnsub);
		}, function(res){
			if(res) return fn(res);
			utils.ifsync(brch.__.brch, function(fnsub){
				get(brch.__.brch, key, config, fnsub);
			}, function(res){
				if(res) return fn(res);
				return getfinalnew(brch, key, config, fn);
			});
		});
	});
}
function render(str, env, fn){
	newenv(function(nenv){
		for(var k in env.$){
			nenv.$["_"+k] = env.$[k];
		}
		_eval(str, nenv, function(rtn){
			log(rtn)
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
//Lexical scope only
function exec(cpt, env, fn){
	var type = gettype(cpt);
	switch(type){
	case "Block":
		execblock(cpt, env, function(rtn){
			fn(rtn)
		});			
		break;
	case "Call":
		execcall(cpt, env, function(rtn){
			fn(rtn)
		});
		break;
	default:
		fn(cpt);
		return;
	}
}

function newenv(lang, fn){
	if(!fn){ fn = lang; lang = undefined}
	get(_do, lang, {local:1, notaddr: 1}, function(lbrch){
		if(!lbrch) lbrch = _do;
		var env = newcpt({
			$: {},
			stack: [],
		}, "Env", lbrch);
		env.$._brch = lbrch;
		env.$.$ = env.$;
		get(lbrch, "execMain", {notaddr: 1, notnew: 1}, function(cpt){
			env.execMain = cpt;
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
		var argvcpt = newcpt(argv, "Cpt", _do, "argv");
		argvcpt.__.fixed = 1		
		newenv(lang, function(env){
			progl2cpt("{"+str+"\n}", env.__.brch, function(maincpt){				
				var newcall = newcpt([env.execMain, [maincpt]], "Call");
				exec(newcall, env, function(rtn){
					fn(rtn);
				})
			})
		})

	});
}

module.exports = {
	run: run
}
