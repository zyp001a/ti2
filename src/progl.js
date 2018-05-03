var utils = require("./utils");
var die = utils.die;
var log = utils.log;
var parser = require("./progl-parser");
var db = require("./db");
var stack = [];
var regs = [];
function pop(){
	regs = stack.pop();
}
function push(){
	stack.push(regs);
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
		}else{
			brch[name] = val;			
		}
		if(brch.__.path)
			c.path = brch.__.path + "/" + name;
		else
			c.path = name;
	}
	c.brch = brch;
	c.name = name;
	return val;
}
function ref(addr){
	return addr[0][addr[1]];
}
var rootbrch = newcpt([], "Brch");
rootbrch.__.path = "";
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
	case "id":
		get(brch, e, {}, function(addr){
			fn(addr);
		});
		break
	case "local":
		get(brch, e, {local: 1}, function(addr){
			fn(addr);
		});
		break		
	case "addr":
		ast2cpt(e[0], brch, function(cpt){
			ast2cpt(e[1], brch, function(key){
				fn(newcpt([cpt, key],"Addr"));
			});
		})
		break;
	case "function":
		var newbrch = newcpt([], "Brch", brch);
		ast2cpt(['block',e[0]], newbrch, function(block){
			fn(newcpt([block, e[1], e[2]], "Function"));
		});
		break;
	case "block":
		block2arr(e, brch, function(ee){
			fn(newcpt(ee, "Block", brch))
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
			var rels = cpt.__.rels;
			utils.eachsync(e[1], function(k, fnsub){
				get(brch, k, {}, function(addr){
					var rel = ref(addr);
					if(typeof rel != "object")
						die("wrong rel " + rel);
					rels[rel.__.path] = rel;
					fnsub();					
				});
			}, function(){
				fn(cpt);
			})
		});
		break;
	case "brch":
		block2arr(e[0], brch, function(cpt){
			newcpt(cpt, "Brch", brch);	
			var rels = cpt.__.rels;
			utils.eachsync(e[1], function(k, fnsub){
				get(brch, k, {brch:1}, function(brch){
					rels[brch.__.path] = brch;
					fnsub();					
				});
			}, function(){
				fn(cpt);
			})
		});
		break;		
	default:
		die("wrong ast", ast);
	}
}
function cpt2progl(val, fn){
	
}
//Lexical scope only
function exec(cpt, fn){
	if(typeof cpt != "object") return fn(cpt);
	var c = cpt.__;
	switch(c.type){
	case "Block":
		utils.eachsync(Object.keys(cpt), function(k, fnsub){
			var c = cpt[k];
			exec(c, function(rtn){
				//ifreturn TODO
				fnsub();
			})
		}, function(){
			fn();
		});
		break;		
	case "Native":
		with({$: regs}){
			eval(cpt[0])
		}
		break;		
	case "Call":
		push();
		exec(cpt[0], function(funcp){
			convert(funcp, "Function", function(func){
				//generate call stack [args/local, ]
				var argdefs = func[1];//{key: [type, default]}
				var joined = {};
				for(var k in argdefs){
					joined[k] = 1;
				}
				for(var k in cpt[1]){
					joined[k] = 1;
				}
				utils.eachsync(Object.keys(joined), function(k, fnsub){
					var argdef = argdefs[k] || [];
					var argp;
					if(k in cpt[1]){
						argp = cpt[1][k];
					}else{
						argp = argdef[1];
					}
					exec(argp, function(arg){
						convert(arg, argdef[0], function(carg){
							regs[k] = carg;
							fnsub();
						});						
					});				
				}, function(){
					exec(func[0], function(rtn){
						pop();
						fn(rtn);
					});
				});
			});
		});
		break;
	default:
		return fn(cpt);
	}
}
var intypes = {
	"Undefined":1,
	"Number": 1,
	"String": 1,
	"Native": 1,
	"Brch": 1,
	"Addr": 1,
	"Block": 1,
	"Function": 1,
	"Call": 1,
	"Cpt": 1
}
function gettype(cpt){
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
	if(!type) return fn(cpt);
	if(!(type in intypes)){
		//TODO user defined types
		return fn(cpt);
	}
	var otype = gettype(cpt);
	if(otype == type) return fn(cpt);
	if(otype == "Addr"){
		return convert(ref(cpt), type, fn);		
	}
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
		if(config.brch){
			var newbrch = newcpt([], "Brch", brch, key);
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

function run(str, fn){
	get(rootbrch, "boot", {local:1, brch:1}, function(brch){
		get(rootbrch, "nodejs", {local:1, brch: 1}, function(lbrch){
			brch.__.rels["nodejs"] = lbrch;
			progl2cpt("{"+str+"}", brch, function(cpt){
				exec(cpt, function(rtn){
					fn();
				})
			});
		});
	});
}
module.exports = {
	run: run
}
