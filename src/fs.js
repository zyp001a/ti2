var fs = require("fs");
module.exports = {
	open: fs.openSync,
	close: fs.closeSync,
	write: fs.writeSync,
	read: fs.readSync,
	stat: fs.statSync,
	access: fs.accessSync,
}
