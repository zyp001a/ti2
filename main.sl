$cmd = argv[1]
$file = argv[2]
$parse = lexyacc(@{
 macro: [
 ],
 rules: [
 ]
}, @{
 operators: []
 bnf: []
});
$ast = parse(readfile(file));
cmd == "run"?{
}:cmd == "js"?{
}:{
 print("Wrong argv")
}