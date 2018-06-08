=>(c){
 $n = getp(c, "name");
 isint(n)?{
  n = replace(getp(c, "path"), "/", "_");  
 }:
 ~n;
}