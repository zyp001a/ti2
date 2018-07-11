=>{
 global.indent = "  ";
 global.brch = idg("_out/_nodejsasync");
 global.postfix = ".js";
 global.varprefix = "_";
 global.imports = <>
 global.eximports = <> 
 global.packages = <>
 $x = noexec(mainblock)
 $mainstr = gen(x, 1);
 $str = sgen("main", [mainstr]);
 $outf = replace(argv[0], ".sl", global.postfix);
// mkdirp(argv[0])
 writefile($outf, str)
// writefile(, str) 
 system("node "+outf+cmdarg())
}