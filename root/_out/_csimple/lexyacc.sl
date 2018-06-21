`~
$l = sgen("lex", [$_1[1]])
$y = sgen("yacc", [$_1[2], $_1[1]])
$n = $_1[0];
writefileifchange(argv[0]+"."+$n+".l", $l)?{
 system("echo 1"))
}:
writefileifchange(argv[0]+"."+$n+".y", $y)?{
 system("echo 2"))
}:
$
global.funcs[$n+parse] = ""
~
Function(~=$n~parse)`