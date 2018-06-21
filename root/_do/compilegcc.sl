=>(ob:String, files: Array, includes: Array, libs: Array){
  $l = "";
  $s = "";
  for($i=0; i<len(files); i+=1, {
    system("gcc -c" + l +" -o " + files[i] +".o " + files[i]);
    s += " "+files+".o"
  })
  ~system("gcc -o " + ob +s)
}