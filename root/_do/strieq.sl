=>(~Int x:String, i: Int, y:String){
 $k=0;
 $m = max(len(x), i+len(y))
 for($j = i; j<len(x); j+=1, {
  if(x[j] != y[k], ~0);
	k+=1
  if(k == len(y), ~j+1)	
 })
 if(k != len(y), ~0)
 ~j
}