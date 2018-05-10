var utils = require("./utils");
var die = utils.die;
var log = utils.log;
var parser = require("./progl-parser");
var db = require("./db");
var stack = [];
var $ = [];
function pop(){
	$ = stack.pop();
}
function push($new){
	stack.push($);
	$ = $new || [];
	if(stack.length > 50) die("stack overflow")
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

function newcpt(val, type, brch, name){
	if(typeof val != "object") return val;
	var c = val.__ = [];
	Object.defineProperty(val, '__', {
		enumerable: false,
		configurable: false
	});
	c.type = type || "Cpt";
	c.rels = {};
	if(brch){
		if(!name){
			name = brch.length.toString();
			brch.push(val);
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
function addrget(addr){
	if(typeof addr[0] == "object")
		return addr[0][addr[1]];
	else if(addr[0])
		return $._parent[addr[1]];//this
	else
		return $[addr[1]];
}
function addrset(addr, val){
	if(typeof addr[0] == "object")
		return addr[0][addr[1]] = val;
	else if(addr[0])
		return $._parent[addr[1]] = val;//this
	else
		return $[addr[1]] = val;
}
var rootbrch = newcpt([], "Brch");
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
function setrels(cpt, rels, brch, fn){
	var crels = cpt.__.rels;
	utils.eachsync(rels, function(k, fnsub){
		get(brch, k, {defined: 1}, function(rel){
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
		fn(newcpt(ast[2], e));
		break;
	case "native":
		fn(newcpt([e], "Native", brch));
		break;
	case "tpl":
		fn(newcpt([e], "Tpl", brch));
		break;
	case "id":
		if(e in brch){
			var ee = brch[e];
			if(gettype(ee) == "Function" && !ee.__.autoname)//is named function
				return fn(newcpt([brch,e],"Addr"));
			return fn(newcpt([0,e],"Addr"));
		}else if(e in brch.__.brch){
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
		break
	case "global":
		get(rootbrch, e, {local: 1}, function(addr){
			fn(addr);
		});		
		break;
	case "reg":
		brch[e] = undefined//set lexical scope
		fn(newcpt([0, e], "Addr"));//addr stack
		break		
	case "addr":
		ast2cpt(e[0], brch, function(cpt){
			ast2cpt(e[1], brch, function(key){
				fn(newcpt([cpt, key],"Addr"));
			});
		})
		break;
	case "function":
		var newbrch = newcpt([], "Brch", brch, e[3]?"_"+e[3]:undefined);
		var func = newcpt([,e[1],e[2]], "Function", brch, e[3]);
		ast2cpt(['block',e[0]], newbrch, function(block){
			func[0] = block;
			fn(func);
		});
		break;
	case "class":
		var newbrch = newcpt([], "Brch", brch, e[2]?"_"+e[2]:undefined);
		ast2cpt(['block',e[0]], newbrch, function(block){
			var cls = newcpt([block], "Class", brch, e[3]);
			setrels(cls, e[1], newbrch, function(){
				fn(cls)
			});
		});	
		break;
	case "new":
		var newbrch = newcpt([], "Brch", brch);		
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
		block2arr(e[0], brch, function(cpt){
			newcpt(cpt, "Cpt", brch);
			setrels(cpt, e[1], brch, function(){
				fn(cpt);
			})
		});
		break;
	case "brch":
		var cpt = newcpt([], "Brch", brch);
		setrels(cpt, e, brch, function(){
			fn(cpt);			
		})
		break;
	case "return":
		ast2cpt(e, brch, function(cpt){
			fn(newcpt([cpt], "Return"));
		});
		break;
	case "assign":
		ast2cpt(e[0], brch, function(left){	
			ast2cpt(e[1], brch, function(right){
				fn(newcpt([left, right], "Assign"));
			});
		});
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
	"Native": 1,
	"Tpl": 1,	
	
	"Hash": 1,
	"Cpt": 1,
	"Brch": 1,
	
	"Block": 1,	
	"Function": 1,
	"Class": 1,	
	
	"Addr": 1,
	
	"Call": 1,
	"Return": 1,
	"Assign": 1	
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
function convert(cpt, type, fn){
	var otype = gettype(cpt);	
	if(otype == "Addr"){
		return convert(addrget(cpt), type, fn);		
	}	
	if(!type) return fn(cpt);
	if(otype == type) return fn(cpt);
	if(type == "Undefined"){
		return fn();
	}
	if(type == "Native"){
		return fn([JSON.stringify(cpt)]);
	}
	var ktype = otype+type;	
	switch(ktype){
	case "NumberString":
		return fn(cpt.toString());
	case "StringNumber":
		return Number(cpt);		
	case "UndefinedNumber":
		return fn(0);		
	case "UndefinedString":
		return fn("");
	default:
		die("cannot convert "+ktype);
	}
}

function getnotnew(brch, key, config, fn){
	if(!config.notnew){
		if(config.defined){
			var newbrch = newcpt([], "Cpt", brch, key);
			fn(newbrch)
		}else{
			brch[key] = undefined;
			fn(newcpt([brch, key], "Addr"));
		}
		cacheadd(brch, key);
	}else{
		return fn();
	}
}
function getsub(brch, key, config, fn){
	if(!key.match("/")){
		get(brch, key, config, fn);
		return;
	}
	var keys = key.split("/");
	var key0 = keys.shift();
	get(brch, key0, {local:1}, function(sbrch){
		getsub(sbrch, keys, config, fn);
	});
}
//leaf local notnew
function get(brch, key, config, fn){
	if(!config) config = {};
	if(key.match("/")){
		//absolute path
		getsub(rootbrch, key, config, fn);
		return;
	}
	if(key in brch){
		return fn(newcpt([brch, key], "Addr"));
	}
	utils.ifsync(db, function(fnsub){
		db.get(brch.__.path+"/"+key, function(str){
			if(str){
				progl2cpt(str, brch, function(cpt){
					if(typeof cpt == "object"){
						cpt.__.brch = brch;
						cpt.__.name = key;
					}
					brch[key] = cpt;			
					fnsub(cpt);
				});
			}else{
				fnsub();
			}
		});
	}, function(cpt){
		if(cpt) return fn(cpt);
		if(config.local) return getnotnew(brch, key, config, fn);
		utils.eachsync(Object.values(brch.__.rels), function(link, fnsub){
			get(link, key, config, fnsub);
		}, function(res){
			if(res) return fn(res);
			utils.ifsync(brch.__.brch, function(fnsub){
				get(brch.__.brch, key, config, fnsub);
			}, function(res){
				if(res) return fn(res);
				return getnotnew(brch, key, config, fn);
			});
		});
	});
}
//Lexical scope only
function exec(cpt, fn){
	var type = gettype(cpt);
	switch(type){
	case "Block":
		var obj = [];
		utils.eachsync(Object.keys(cpt), function(k, fnsub){
			var c = cpt[k];
			exec(c, function(rtn){
				var rtype = gettype(rtn);
				if(rtype == "Return" || rtype == "Int"){
					return fnsub(rtn);
				}else{
					obj[k] = rtn;
					return fnsub();
				}
			})
		}, function(rtn){
			fn(rtn);
		});
		break;		
	case "Native":
		var rtn;
		with($){
			rtn = eval(cpt[0])
		}
		fn(rtn)
		break;		
	case "Call":
		exec(cpt[0], function(funcp){
			convert(funcp, "Function", function(func){
				//generate call stack [args/local, ]
				var argdefs = func[1] || [];//{key, type}
				var args = cpt[1];
				var $args = [];
				utils.eachsync(Object.keys(args), function(i, fnsub){
					var argdef = argdefs[i] || [];
					var argp = args[i];
					exec(argp, function(arg){
						convert(arg, argdef[1], function(carg){
							$args[i] = carg;
							if(argdef[0])
								$args[argdef[0]] = carg;
							fnsub();
						});
					});				
				}, function(){
					//TODO this
					$args._brch = func[0].__.brch;
					if($args._brch.__.level == $._brch.__.level + 1){
						$args._parent = $;
					}else{
						$args._parent = $._parent;
					}
					push($args);
					exec(func[0], function(rtn){
						var rtype = gettype(rtn);
						if(rtype == "Return"){
							if(gettype(rtn[1]) == "Addr" && typeof rtn[1][0] != 'object'){
								//stack
								rtn = addrget(rtn[1]);
							}else{
								rtn = rtn[1];
							}
						}
						//else if(rtype == "Int"){//break continue, do within special funcs
//						}				
						pop();						
						fn(rtn);
					});
				});
			});
		});
		break;
	case "Return":
		exec(cpt[0], function(rtn){
			
			cpt[1] = rtn;
			fn(cpt);
		})
		break;
	case "Assign":
		exec(cpt[0], function(left){
			exec(cpt[1], function(right){			
				addrset(left, right);
				fn(right);
			})
		});
		break;
	default:
		return fn(cpt);
	}
}
function getgen(key, args, fn){
	
}
function tmpl(){
}
function cpt2progl(cpt, fn){
	var type = gettype(cpt);
	switch(type){
	case "Block":
	case "Call":
		cpt2progl(cpt[0], function(func){
			if(gettype(func) == "Tpl"){
				
				getgen("call", [func, args], fn);
			}
		});
		break;		
	case "Return":
		cpt2progl(cpt[0], function(rtn){
			getgen("return", [rtn], fn);
		});
		break;
	case "Assign":
		cpt2progl(cpt[0], function(left){
			cpt2progl(cpt[1], function(right){			
				getgen("assign", [left, right], fn);
			})
		});
		break;
	default:					
		break;
	}
}
function init(str, l, fn){
	get(rootbrch, "_boot", {local:1, defined:1}, function(brch){
		get(rootbrch, l, {local:1, defined: 1}, function(lbrch){
			brch.__.rels[l] = lbrch;
			progl2cpt("{"+str+"}", brch, function(cpt){
				$._brch = brch;
				fn(cpt);
			})
		})
	})
}
function run(str, fn){
	init(str, "_nodejs", function(cpt){
		exec(cpt, function(rtn){
			fn();
		})
	});
}
function gen(str, lang, fn){
	init(str, "_gen/_"+lang, function(cpt){
		cpt2progl(cpt, function(){
			fn()
		});
	})
}
module.exports = {
	run: run
}
