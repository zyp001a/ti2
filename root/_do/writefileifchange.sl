=>(f: String, c: String){
  $a = cmpstringfile(c, f)  
  a == 0?{
    ~0
  }:{
    writefile(f, c)
    ~1
  }
  
}