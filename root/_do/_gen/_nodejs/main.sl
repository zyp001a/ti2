=>{
 global.indent = "  ";
 global.brch = idglobal("_out/_nodejs");
 global.postfix = ".js";
 global.varprefix = "_"; 
 $x = noexec(mainblock)
 $str =  gen(x);
 $str = gendeps() + $str;
 print(str)
 writefile(argv[0]+global.postfix, str)
}