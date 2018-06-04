=>(x:String){
 $y = ""
 for($i=0;i<strlen(x);i+=1,{
   x[i] == "\n"? y+="\\n"
   :x[i] == "\t" ? y+="\\t"
   :x[i] == "\r" ? y+="\\r"
 	 :y+=x[i]
 })
 ~y
}