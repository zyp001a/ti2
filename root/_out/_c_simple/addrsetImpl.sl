`BST *d = gdic(x);
if(x->length){
  setbst(d, gstring(k), v);
}else{
  d = setbst(d, gstring(k), v);
  x->val = (void*)d;
}
return v`