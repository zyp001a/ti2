=>{
 global.indent = "  ";
 global.brch = idglobal("_out/_c");
 global.postfix = ".c";
 global.varprefix = "_"; 
 $x = noexec(mainblock)
 $str =  gen(x);
 $str = gendeps() + $str;
 print(str)
 writefile(argv[0]+global.postfix, str)
}