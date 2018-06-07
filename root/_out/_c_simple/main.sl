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
char buffer[256];
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

struct _C
{
  void* val;
  int length;
  char type;
};
typedef struct _C C;

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
C** makearg(int l, ...){
  C **x = (C**)malloc(l*sizeof(C**));
  int i;
  va_list args;
  va_start (args, l);
  for (i = 0; i < l; i++) {
    x[i] = va_arg(args, C*);
  }
  va_end (args);
  return x;
}
~=genlines(deps)~
int main(int argc, char **argv){
~=indent($_0, 1)
~
  return 0;
}`