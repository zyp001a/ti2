`if(_l->type == _r->type){
  switch(_l->type){
    case _UNDEFINED:
    return Int(0);
    
    case _INT:
    return Int(gint(_l) < gint(_r));    
  
    case _NUMBER:
    return Int(gnumber(_l) < gnumber(_r));

    case _STRING:
    return Int(strcmp(gstring(_l), gstring(_r)) < 0 ?1:0);
  }
}else if(_l->type == _INT && _r->type == _NUMBER){
  return Int(gint(_l) < gnumber(_r));
}else if(_l->type == _NUMBER && _r->type == _INT){
  return Int(gint(_r) < gnumber(_l));
}else{
  return Undefined();
}`