`~$a = $_0[1][0];~
C* ~=global.varprefix+name($_0)~(C** __args){
~for($i=0;i<len(a);i+=1, {
 $v = a[i];
 $s = "  C *"+v[0]+" = __args["+i+"];\n";
 ~~=s~~
})~
~=gen($_0[0])~}`