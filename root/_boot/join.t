=>(x, sep:String){
 $str = string(x.0)
 for($i=1; i<len(x); i+=1; {
  str += sep + x.(string(i))
 })
 ~str
}