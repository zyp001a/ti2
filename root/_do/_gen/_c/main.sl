=>{
 global.indent = "  ";
 global.brch = idglobal("_out/_c");
 global.postfix = ".c";
 global.varprefix = "_";
 global.imports = <>
 $x = noexec(mainblock);
 $mainstr = gen(x);
 $str = sgen("main", [mainstr]);
 print(str);
 writefile(argv[0]+global.postfix, str);
}