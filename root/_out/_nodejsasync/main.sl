`
~each($k, $v, global.imports, {~
var ~=k~ = require("~=k~");
~})~
~each($k, $v, global.packages, {~
var ~=k~ = require("~=k~");
~})~
~each($k, $v, global.eximports, {
 if(type(v) == "Function", call(v, []))
~
var ~=k~ = require("./~=k~");
~})~
~=sgen("predefined", [])~
~=genlines(deps)~
process.argv.shift();
var _argv = process.argv;
async function main(){
~=indent($_0, 1)~
}
main();
`