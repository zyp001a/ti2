=>{
 global.indent = "  ";
 global.brch = idglobal("_out");
 global.postfix = ".sl";
 global.varprefix = ""; 
 $x = noexec(mainblock)
 $str = sgen("main", [x]);
 print(str)
 writefile(argv[0]+global.postfix, str)
}