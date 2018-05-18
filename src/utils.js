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
function mkdirpSync (p, opts, made) {
  if (!opts || typeof opts !== 'object') {
    opts = { mode: opts };
  }
  var mode = opts.mode;
  var xfs = opts.fs || fs;
  if (mode === undefined) {
    mode = 0777 & (~process.umask());
  }
  if (!made) made = null;
  p = path.resolve(p);
  try {
    xfs.mkdirSync(p, mode);
    made = made || p;
  }
  catch (err0) {
    switch (err0.code) {
    case 'ENOENT' :
      made = mkdirpSync(path.dirname(p), opts, made);
      mkdirpSync(p, opts, made);
      break;
      // In the case of any other error, just see if there's a dir
      // there already.  If so, then hooray!  If not, then something
      // is borked.
    default:
      var stat;
      try {
        stat = xfs.statSync(p);
      }
      catch (err1) {
        throw err0;
      }
      if (!stat.isDirectory()) throw err0;
      break;
    }
  }
  return made;
}
//each([0,1,2],function(el,cb){}, function(err){})
function eachsync(arr, fneach, fn){
	eachSub(arr, fneach, fn, 0);
}
function nsync(n, fneach, fn){
	var arr = [];
	for(var i =0; i<n; i++){
		arr.push(i);
	}
	eachSub(arr, fneach, fn, 0);
}
function eachSub(arr, fneach, fn, nexti){
	if(nexti == arr.length){
		fn();
		return;
	}
	fneach(arr[nexti], function(res){
		nexti++;
		if(res == undefined)
			eachSub(arr, fneach, fn, nexti);
		else
			fn(res);
	});
}
function ifsync(expr, func, fn){
	if(expr) func(fn);
	else fn();
}
function freqadd(freq1, freq2){
	for(var key in freq2){
		if(key in freq1){
			freq1[key] += freq2[key];
		}else{
			freq1[key] = freq2[key];			
		}
	}
	return freq1;
}
function freqsort(freq){
	var newfreq = {};
	var arr = [];
	for(var key in freq){
		arr.push([key, freq[key]]);
	}
	arr = arr.sort(function(a,b){return a[1]-b[1]});
	for(var i in arr){
		var e = arr[i];
		newfreq[e[0]]= e[1];
	}
	return newfreq;
}
function date(date, fmt){
	//author: meizz
	if(!date) date= new Date();
	if(!fmt) fmt = "yyyyMMdd";
  var o = {
    "M+": date.getMonth() + 1, //月份 
    "d+": date.getDate(), //日                                  
    "h+": date.getHours(), //小时                                            
    "m+": date.getMinutes(), //分                                           
    "s+": date.getSeconds(), //秒                                            
    "q+": Math.floor((date.getMonth() + 3) / 3), //季度                       
    "S": date.getMilliseconds() //毫秒                                     
  };
  if (/(y+)/.test(fmt))
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt))
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;

}
function copy1(obj){
	var newobj = {};
	for(var k in obj){
		newobj[k] = obj[k]
	}
	return newobj;
}
function ucfirst(str){
  str += '';
  var f = str.charAt(0).toUpperCase();
  return f + str.substr(1);
}
function strlen(str){
  var m = encodeURIComponent(str).match(/%[89ABab]/g);
  return str.length + (m ? m.length : 0);
}
//https://registry.npmjs.org/json-stringify-safe
module.exports.stringify = stringify;
function stringify(obj, replacer, spaces, cycleReplacer) {
  return JSON.stringify(obj, serializer(replacer, cycleReplacer), spaces)
}
function serializer(replacer, cycleReplacer) {
  var stack = [], keys = []

  if (cycleReplacer == null) cycleReplacer = function(key, value) {
		if(value.__)
			return "~"+value.__.path;
		return "~";
    if (stack[0] === value) return "[Circular ~]"
    return "[Circular ~." + keys.slice(0, stack.indexOf(value)).join(".") + "]"
  }
  return function(key, value) {
    if (stack.length > 0) {
      var thisPos = stack.indexOf(this)
      ~thisPos ? stack.splice(thisPos + 1) : stack.push(this)
      ~thisPos ? keys.splice(thisPos, Infinity, key) : keys.push(key)
      if (~stack.indexOf(value)) value = cycleReplacer.call(this, key, value)
    }
    else stack.push(value)
    return replacer == null ? value : replacer.call(this, key, value)
  }
}


module.exports = {
	mkdirp: mkdirpSync,
	eachsync: eachsync,
	ifsync: ifsync,
	nsync: nsync,
	freqadd: freqadd,
	freqsort: freqsort,
	die: die,
	log: log,
	date: date,
	copy1: copy1,
	ucfirst: ucfirst,
	strlen: strlen,
	stringify: stringify
}
