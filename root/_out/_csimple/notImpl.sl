`
switch(_l->type){
  case _UNDEFINED:
    return Int(1);
    
  case _INT:
    return Int(gint(_l) != 0);    
  
  case _NUMBER:
    return Int(gnumber(_l) != 0);
}
return Int(0);
`