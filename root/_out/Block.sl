`~
$b = getp($_0, 'dic');
$d = "";
$ind = getp(b, "indent");
$nat = getp($_0, "native")
nat?{
 $x = get(global.brch, nat + "Impl");

 x?{~~=indent(x(), ind)~;
 ~}:
}:{
$x = get(global.brch, "def");
$a = []
if($_1, {
 each($k, $v, b, {
  isint(k)?continue():
  v[0] != "local"?continue():
  $def = x(global.varprefix+k, v[1])
~~=indent(def, ind)~;
~ 
 })
})
for($i=0;i<len($_0);i+=1, {
 $e = _0[i];
~~=indent(gen(e), ind)~;
~})}~`