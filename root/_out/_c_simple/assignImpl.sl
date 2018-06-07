`
if(x->type != r->type){
  clear(x);
	x->type = r->type;
}
switch(r->type){
  case _UNDEFINED:	
  break;
  case _INT:
  l->Int = r->Int;
  l->Number = r->Number;	  
  break;
  case _NUMBER:
  l->Int = r->Number;  
  l->Number = r->Number;	
  break;
}
return r`