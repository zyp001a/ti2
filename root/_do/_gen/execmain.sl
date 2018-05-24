=>{
 global.indent = "  ";
 global.brch = idglobal("_out");
 $x = noexec(main)
 $str = gen(x);
 print(str)
 writefile(argv.0+postfix, str)
}