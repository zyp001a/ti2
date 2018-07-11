`switch(~=$_0[0]~){
~each($k, $v, $_1[1], {~
  case "~=k~":
	~=indent(gen($v), 1)~
	break;
~})~
}`