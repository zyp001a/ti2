=>(t, a){
 $x = get(global.brch, t);
 ~x?call(x, a):{
  $y = get(global.brch, "Call");
	call(y, [makecall(t, a)]);
 }
}