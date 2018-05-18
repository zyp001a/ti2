=>{
 @`
 var l = $.length;
 if(l<=1) die("wrong if args", $);
 if(l%2 == 1) elsess = $.pop();
 utils.nsysnc($.length/2, function(i, fnsub){
  var cond = l[i*2];
	var ss = l[i*2+1];
	exec(cond, env, function(rcond){
	 if(rcond) exec(ss, env, function(rtn){
	  fnsub([rtn]);
	 });
	 else fnsub();
	})
 }, function(rtnx){
  if(rtnx) fn(rtnx[0]);
	else exec(elsess, env, fn);
 })
 `
}