`~
$a = $_0[0];
$x = "";
for($i=0;i<len(a);i+=1, {
 $v = a[i];
 (i != 0)? x += ", ":
 $vv = global.prefix + v[0]
 !haskey(v, 1)?{x+=vv}:{x+=vv+":"+v[1]};
})
~~=x~`