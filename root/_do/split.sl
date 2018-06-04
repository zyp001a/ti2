=>(x:String, c: String){
 $arr = []
 $start =0
 $topush = "";
 while($start < strlen(x), {
  $tmp = strieq(x, start, c)
	tmp?{
	 push(arr, topush)
	 topush = "";
	 start = tmp
	}:{
	 topush+=x[start]
	 start+=1
	}
 })
 push(arr, topush) 
 ~arr
}