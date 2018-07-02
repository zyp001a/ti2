`~
$flag = 0;
$a = [];
for($i=0;i<len($_0[1]);i+=1, {
 a[i] = gen(_0[1][i])
})
if(type($_0[0]) == "Addr", {
 $b = $_0[0][1];
 $x = get(global.brch, b);
 x?{~~=x(a, _0[1])~~}:{
  if(!haskey(deps, $b), {
   $c = id($b);
	 $c = noexec($c);
   deps[$b] = gen($c);
  })
 ~await ~=global.varprefix+$b~(~=join(a,', ')~)~}~
~}, {print(type(_0[0]))~await ~=gen($_0[0])~(~=join(a,', ')~)~})~`