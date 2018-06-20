`~
$l = sgen("lex", [$_1[1]])
$y = sgen("yacc", [$_1[2], $_1[1]])
writefileifchange(argv[0]+"."+$_1[0]+".l", $l)?{
 system("echo 1"))
}:
writefileifchange(argv[0]+"."+$_1[0]+".y", $y)?{
 system("echo 2"))
}:
~
Func(~=$n~parse)`