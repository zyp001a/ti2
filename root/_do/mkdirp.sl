=>(d:String){
  $a = split(d, "/");
	$s = "";
  for($i=0; i<len(a); i++, {
	  s += a[i]
		$e = exist(s)
    s += "/";		
		!e?mkdir(s)
		:e == File?~0
		:e == Dir?continue()
		:e == Symboliclink?~0:		
	})
	~1
}