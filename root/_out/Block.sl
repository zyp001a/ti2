`~
$b = getp($_0, 'brch');
$d = "";
$ind = getp(b, "indent");
$x = get(global.brch, "def");
$a = []
each($k, $v, b, {
 isint(k)?continue():
 v[0] != "local"?continue():
 $def = x(k, v[1])
~~=indent(def, ind)~;
~ 
})
for($i=0;i<len($_0);i+=1, {
 $e = _0[i];
~~=indent(gen(e), ind)~;
~})~`