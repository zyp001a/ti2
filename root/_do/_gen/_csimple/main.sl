=>{
 global.indent = "  ";
 global.brch = idglobal("_out/_csimple");
 global.postfix = ".c";
 global.varprefix = "_";
 global.mods = <>  
 global.imports = <>
 global.funcs = <>
 global.files = []
 $x = noexec(mainblock);
 $mainstr = gen(x, 1);
 $str = sgen("main", [mainstr]);
 writefile(argv[0]+global.postfix, str);
 push(global.files, argv[0]+global.postfix);
 compilegcc(argv[0]+"c", global.files, [], []);
 system("./" + argv[0] + "c "+cmdarg()) 
}