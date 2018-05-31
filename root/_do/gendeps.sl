=>(){
 $str = "";
 each($x, $y, deps, {
  str += $y + "\n";
 })
 ~str
}