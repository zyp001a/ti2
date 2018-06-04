=>(x:String, c:Number){
 $d=rep(global.indent, c)
 $arr = split(x, "\n")
 for($i =0;i<len(arr);i+=1, {
  arr[i] = d + arr[i]
 })
 $r = join(arr, "\n")
 ~r
}