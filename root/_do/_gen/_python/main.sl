=>{
 global.indent = "  ";
 global.brch = idglobal("_out/_python36");
 global.postfix = ".py";
 global.varprefix = "_";
 global.imports = <> 
 global.eximports = <>
 $x = noexec(mainblock)
 $mainstr = gen(x, 1);
 $str = sgen("main", [mainstr]); 
 writefile(argv[0]+global.postfix, str)
 system("python "+argv[0]+global.postfix+cmdarg())
}