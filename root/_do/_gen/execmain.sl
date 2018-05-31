=>{
 global.indent = "  ";
 global.brch = idglobal("_out");
 global.postfix = ".sl";
 global.varprefix = ""; 
 $x = noexec(main)
 $str = gen(x);
 print(str)
 writefile(argv[0]+global.postfix, str)
}