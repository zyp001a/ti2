`~$a = autoname();
$l = sgen("lex", [$_1[0]])
$y = sgen("yacc", [$_1[1], $_1[0]])
writefile($a+".l", $l);
writefile($a+".y", $y);
system("echo 1");
~
Func(p~=$a~parse)`