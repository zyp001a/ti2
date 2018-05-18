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
var _boot;
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
	get: function(x, k){
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
	execMain: function(main){
		var env = this.env;
		var fn = this.fn;		
		execblock(main, env, fn);		
//		var newcall = newcpt([main, argv], "Call");
//		exec(newcall, this.env, this.fn);
	},
	execCall: function(cpt){
		var env = this.env;
		var fn = this.fn;
		execcall(cpt, env, fn);
	},
	execBlock: function(cpt){
		var env = this.env;
		var fn = this.fn;
		execblock(cpt, env, fn);
	},
	execCpt: function(cpt){
		this.fn(cpt);
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
			var argdefs = func[1][0] || [];//{key, type}
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
					var carg = xarg?xarg[0]:argp;

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
			c.autoname = 1;
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
			if(gettype(ee) == "Function" && !ee.__.autoname)//is named function
				return fn(newcpt([brch,e],"Addr"));
			return fn(newcpt([0,e],"Addr"));
		}else if(Object.getOwnPropertyDescriptor(brch.__.brch, e)){
			var ee = brch.__.brch[e];			
			if(gettype(ee) == "Function" && !ee.__.autoname)//is named function
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
		var func = newcpt([,e[1]], "Function", brch, e[3]);
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
					if(typeof cpt == "object"){
						var c = cpt.__;
						c.brch = brch;
						c.name = key;
						c.path = brch.__.name + "/" + key;
						c.autoname = false;						
					}
//					if(brch.__.
					brch[key] = cpt;			
					fnsub(cpt);
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
	newenv(function(lbrch, nenv){
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
	get(rootbrch, lang, {local:1, notaddr: 1}, function(lbrch){
		lbrch.__.rels["_boot"] = _boot;
		
		var env = newcpt({
			$: {},
			stack: [],
			brch: lbrch
		}, "Cpt");
		env.$._brch = lbrch;
		env.$.$ = env.$;
		utils.eachsync([
			"execMain",
			"execCall",
			"execCpt",
			"execBlock",
		], function(k, fnsub){
			get(lbrch, k, {notaddr: 1, notnew: 1}, function(cpt){
				if(!cpt){ die(k + " not defined"); }
				env[k] = cpt;
				fnsub();
			});
		}, function(){
			fn(lbrch, env);
		});
	});
}
function init(fn){
	if(_boot) fn()
	//load boot and native functions
	get(rootbrch, "_boot", {local:1, notaddr:1}, function(brch){
		_boot = brch;
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
function run(str, lang, fn){
	if(!fn){
		fn = lang;
		lang = undefined;
	}
	init(function(brch){
		newenv(lang, function(lbrch, env){
			progl2cpt("{"+str+"\n}",lbrch, function(maincpt){
				var argvcpt = newcpt(process.argv, "Cpt",lbrch, "argv");
				var newcall = newcpt([env.execMain, [maincpt]], "Call");
				execcall(newcall, env, function(rtn){
					fn(rtn);
				})
			})
		})

	});
}

module.exports = {
	run: run
}
