=>{
 global.indent = "  ";
 global.brch = idglobal("_out/_c_simple");
 global.postfix = ".c";
 global.varprefix = "_";
 global.imports = <>
 $x = noexec(mainblock);
 $mainstr = gen(x);
 $str = sgen("main", [mainstr]);
 writefile(argv[0]+global.postfix, str);
 system("gcc "+argv[0]+global.postfix)
 system("./a.out") 
}