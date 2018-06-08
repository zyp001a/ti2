`if(_x->type == _DIC){
  return getbst(gdic(_x), gstring(_k));
}else if(_x->type == _ARRAY){
  return garray(_x)[gint(_k)];
}
`