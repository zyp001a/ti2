`~
global.imports.string = 1;
global.imports.stdlib = 1;
global.imports.stdarg = 1;
each($k, $v, global.imports, {~
#include <~=k~.h>
~})~
#define _UNDEFINED 0
#define _INT 1
#define _NUMBER 2
#define _STRING 3
#define _ARRAY 4
#define _DIC 5
#define _FUNCTION 6

#define _CALL 11
#define _BLOCK 12
#define _ADDR 13
#define gfunction(x) x->func

char buffer[2048];
char *strdup(const char *s) {
  if (s == NULL) { // Optional test, s should point to a string
    return NULL;  
  }
  size_t siz = strlen(s) + 1;
  char *y = malloc(siz);
  if (y != NULL) {
    memcpy(y, s, siz);
  }
  return y;
}

typedef struct _C
{
  void* val;
  int length;
  char type;

  struct _C* (*func)(struct _C **);

  char *name;
  char *path;  
} C;

typedef struct _BST{
  struct _C *val;
  struct _BST *left, *right;
} BST;

void clear(C* x){
}
int gint(C *x);
C* copy(C* f){
  C *t = (C *)malloc(sizeof(C));
  t->type = f->type;
  t->length = f->length;
  switch(f->type){
    case _INT:
      t->val = malloc(sizeof(int));
      memcpy(t->val, f->val, sizeof(int));
      break;      
    case _NUMBER:
      t->val = malloc(sizeof(double));
      memcpy(t->val, f->val, sizeof(double));
      break;
    case _STRING:
      t->val = malloc((t->length+1)*sizeof(char));
      memcpy(t->val, f->val, (t->length+1)*sizeof(char));
      break;
    case _ARRAY:
    case _DIC:
      t->val = f->val;
      break;
  }
  return t;
}

C* Undefined(){
  C *t = (C *)malloc(sizeof(C));
  t->type = _UNDEFINED;
  return t;
}
C* Int(int a){
  C *t = (C *)malloc(sizeof(C));
  t->val = malloc(sizeof(int));
  *(int*)(t->val) = a;
  t->type = _INT;
  return t;
}
int gint(C *x){
  if(x->type == _INT)
    return *((int *)(x->val));
  if(x->type == _NUMBER)
    return (int)(*((double *)(x->val)));
  printf("wrong type for gint\n");
}
C* Number(double a){
  C *t = (C *)malloc(sizeof(C));
  t->val = malloc(sizeof(double));  
  *(double*)(t->val) = a;
  t->type = _NUMBER;
  return t;
}
double gnumber(C *x){
  return *((double *)(x->val));
}
C* String(char* str, int len){
  C *t = (C *)malloc(sizeof(C));
  t->val = (void *)strdup(str);
  t->length = len;
  t->type = _STRING;
  return t;
}
char* gstring(C *x){
  return (char *)(x->val);
}
C* Array(){
  C *t = (C *)malloc(sizeof(C));
  t->length = 0;
  t->type = _ARRAY;
  return t;
}
C** garray(C *x){
  return (C **)(x->val);
}
C * Dic(){
  C *t = (C *)malloc(sizeof(C));
  t->length = 0;
  t->type = _DIC;
  return t;
}
BST* gdic(C *x){
  return (BST *)(x->val);
}
C* Function(){
  C *t = (C *)malloc(sizeof(C));
  t->type = _FUNCTION;
  return t;
}

C** makearr(int l, ...){
  C **x;
  if(l == 0) return x;
  x = (C**)malloc(l*sizeof(C**));
  int i;
  va_list args;
  va_start (args, l);
  for (i = 0; i < l; i++) {
    x[i] = va_arg(args, C*);
  }
  va_end (args);
  return x;
}
BST *newbst(char *key, C* val){
  BST *t =  (BST *)malloc(sizeof(BST));
  t->val = copy(val);
  t->val->name = strdup(key);
  t->left = t->right = NULL;
  return t;
}

void each(C **kp, C** valp, BST *root, C* (*funcp)(C**)){
  C *r;
  if (root != NULL){
    *valp = root->val;
    *kp = String(root->val->name, strlen(root->val->name));
    r = (*funcp)(makearr(0));
    //TODO continue/break
    clear(*kp);
    each(kp, valp, root->left, funcp);
    each(kp, valp, root->right, funcp);
  }
}
BST* setbst(BST* node, char * key, C* val){
  if (node == NULL)
    return newbst(key, val);
  
  int r = strcmp(key, node->val->name);
  if (r > 0)
     node->left  = setbst(node->left, key, val);
  else if (r < 0)
     node->right = setbst(node->right, key, val);   
  return node;
}

C* getbst(BST* node, char * key){
  if (node == NULL) return Undefined();
  int r = strcmp(key, node->val->name);
  if (r > 0)
     return getbst(node->left, key);
  else if (r < 0)
     return getbst(node->right, key);
  return node->val;
}

~=genlines(deps)~
int main(int argc, char **argv){
~=indent($_0, 1)
~
  return 0;
}`