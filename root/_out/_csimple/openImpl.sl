`~global.imports.fcntl=1~
char *mode = gstring(_mode);
int m = O_RDONLY;
int l = strlen(mode);
if(l == 1){
  if(mode[0] == 'r')
    m = O_RDONLY;
  else if(mode[0] == 'w')
    m = O_CREAT | O_WRONLY | O_TRUNC;
  else if(mode[0] == 'a')
    m = O_WRONLY | O_APPEND;  
}else if(l>1){
  if(mode[0] == 'r' && mode[1] == 'w')
    m = O_RDWR;
}
return Int(open(gstring(_file), m))`