`
~each($k, $v, global.imports, {~
var ~=k~ = require("~=k~");
~})~
~each($k, $v, global.packages, {~
var ~=k~ = require("~=k~");
~})~
~each($k, $v, global.eximports, {~
var ~=k~ = require("~=k~");
~})~
~=genlines(deps)~
process.argv.shift();
var _argv = process.argv;
async function main(){
~=indent($_0, 1)~
}
main();
`