`~
global.imports.stdio = 1
global.imports.stdlib = 1
~
int i;
switch(_x->type){
  case _UNDEFINED:
	return String("", 0);
  
  case _INT:
  i = sprintf(buffer, "%d", gint(_x));
  return String(buffer, i);
  
  case _NUMBER:
  i = sprintf(buffer, "%f", gnumber(_x));
  return String(buffer, 0);
  
  case _STRING:
  return _x;
  
  case _ARRAY:
  return String("ARRAY", 5);;
}`