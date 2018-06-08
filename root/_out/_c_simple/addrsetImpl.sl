`BST *d = gdic(_x);
int vv;
if(_x->length){
  setbst(d, gstring(_k), _v);
  if(!d->v)
    _x->length ++;
}else{
  d = setbst(d, gstring(_k), _v);
  _x->val = (void*)d;
  _x->length ++;  
}
return _v`