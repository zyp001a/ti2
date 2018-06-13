`~each($k, $v, global.imports, {~
var ~=k~ = require("~=k~");
~})~
process.argv.shift();
var _argv = process.argv;
~=$_0~`