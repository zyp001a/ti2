=>{
 global.indent = "  ";
 global.brch = idglobal("_out/_csimple");
 global.postfix = ".c";
 global.varprefix = "_";
 global.imports = <>
 $x = noexec(mainblock);
 $mainstr = gen(x, 1);
 $str = sgen("main", [mainstr]);
 writefile(argv[0]+global.postfix, str);
 system("gcc "+argv[0]+global.postfix)
 system("./a.out "+cmdarg()) 
}