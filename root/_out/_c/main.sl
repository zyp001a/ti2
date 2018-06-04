`~each($k, $v, global.imports, {~
#include <~=k~.h>
~})~
typedef struct 
{
  char* e;
  int l;
} Str;
typedef struct 
{
  int Int;
  Str String;
} C;
int _strlen(Str x){
 return x.l
}
int _write(int fd, Str str){
 write(fd, str.e, str.l)
}
~=genlines(deps)~
void main(int argc, char *argv[]){
~=indent($_0, 1)
~
}`