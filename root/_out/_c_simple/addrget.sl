`~$b="addrget";
if(!haskey(deps, b), {
   $c = id(b);
	 $c = noexec($c);
   deps[b] = gen($c);
  })~
~=global.varprefix+b~(~=$_0[0]~, ~=$_0[1]~)`