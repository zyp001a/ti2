`~global.imports.fcntl=1~
C* x;
int fd = open(gstring(_f), O_RDONLY);
int size = lseek(fd, 0, SEEK_END);
lseek (fd, (off_t)0, SEEK_SET);
char *buffer = (char *)malloc((size+1)*sizeof(char));
int bytes_read = read(fd, buffer, size); 
buffer[size] = '\0';
x = String(NULL, size);
x->val = (void *)buffer;
return x;
`