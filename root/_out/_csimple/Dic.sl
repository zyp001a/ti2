`~$l = diclen($_0);
$a = "";
each($k, $v, $_0, {
  a += ", String(\"" + k + "\", "+ strlen(k) +"), "
  a += gen(v)
})
~
Dic(makedic(~=l+a~), ~=l~)`