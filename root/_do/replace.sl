=>(~String x:String, c: String, r:String){
 $start =0
 $rtn = "";
 while($start < strlen(x), {
  $tmp = strieq(x, start, c)
	tmp?{
   rtn += r;
	 start = tmp
	}:{
	 rtn+=x[start]
	 start+=1
	}
 })
 ~rtn
}