=>{
 global.indent = "  ";
 global.brch = idglobal("_out/_nodejs");
 global.postfix = ".js";
 global.varprefix = "_";
 global.imports = <> 
 global.eximports = <> 
 $x = noexec(mainblock)
 $mainstr = gen(x, 1);
 $str = sgen("main", [mainstr]); 
 print(str)
 writefile(argv[0]+global.postfix, str)
}