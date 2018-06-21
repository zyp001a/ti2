`~
$a = $_0[1][0];
$n = name($_0);
~
C* f~=global.varprefix+n~(C** __args, int __len){
~for($i=0;i<len(a);i+=1, {
 $v = a[i];
 $s = "  C * "+global.varprefix+v[0]+" = __args["+i+"];\n";
 ~~=s~~
})~
~=gen($_0[0], 1)~}`