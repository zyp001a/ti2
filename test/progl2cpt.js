var parser = require("../src/progl-parser")
function test(str){
	console.log(str);
	var ast = parser.parse(str);
	console.log(ast);
}
test("1");
test("\"abc\"");
test("_");
test("`console.log(1)`");
test("a");
test("@a");
test("&a");
test("a.b");
test("'a'.length");
test("('a'+'b').length");
test("{'c':1, x:2, 2, 1+1}");
test("=> a {}");
test("=> b (a) {}");
test("a()");
test("a(1,2,b+1,c:1)");
test("['c':1, x:2, 2, 1+1] [a]");
