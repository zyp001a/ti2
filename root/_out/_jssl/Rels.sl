`{
~each($k, $v, $_0, {
	$i = getid(v)
	log(i)
  if(!haskey(deps, $i), {
  	deps[i] = "var " + global.varprefix + i + " = "+gen(v)
	})
  $x = global.indent+'"'+k + '":' + global.varprefix + i
~
~=x~,
~})~}`