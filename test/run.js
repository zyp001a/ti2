var progl = require("../src/progl");
progl.run("print(1);", function(rtn){
	console.log("rtn:");
	console.log(rtn);
})
