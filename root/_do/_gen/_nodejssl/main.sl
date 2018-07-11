=>{
 global.indent = "  ";
 global.brch = idg("_out/_nodejssl");
 global.postfix = ".js";
 global.varprefix = "_";
 global.imports = <>
 global.eximports = <>
 global.eximports["proglparser"] = =>{
  system("node "+env[0]+ "/../misc"+"/progl-grammar.js proglparser.js")
 } 
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