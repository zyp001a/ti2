=>{
 global.indent = "  ";
 global.brch = idg("_out");
 global.postfix = ".sl";
 global.varprefix = "";
 $x = noexec(mainblock)
 $mainstr = gen(x, 1);
 $str = sgen("main", [mainstr]);
 writefile(argv[0]+global.postfix, str)
 system("bin/ti2 run "+argv[0]+global.postfix + cmdarg());
}