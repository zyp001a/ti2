`~
system("cp "+env[0]+ "/../misc"+"/sl.js .")
system("node "+env[0]+ "/../misc"+"/progl-grammar.js proglparser.js")
global.eximports["proglparser"] = 1
~
proglparser.parse(~=$_0[0]~)`