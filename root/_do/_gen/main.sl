=>{
 global.indent = "  ";
 global.brch = idglobal("_out");
 global.postfix = ".sl";
 global.varprefix = ""; 
 $x = noexec(mainblock)
 $mainstr = gen(x);
 $str = sgen("main", [mainstr]);
 writefile(argv[0]+global.postfix, str)
}