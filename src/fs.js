var fs = require("fs");
module.exports = {
	open: fs.openSync,
	close: fs.closeSync,
	write: fs.writeSync,
	read: fs.readSync,
	stat: fs.lstatSync,
	exist: fs.existsSync,
	access: fs.accessSync,
	mkdir: fs.mkdirSync
}
