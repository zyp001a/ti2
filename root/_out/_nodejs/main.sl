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
~=sgen("predefined", [])~
~=genlines(deps)~
process.argv.shift();
var _argv = process.argv;
~=$_0~
`