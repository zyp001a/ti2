`
function dic(val, rels){
	Object.defineProperty(val, '__', {
		enumerable: false,
		configurable: false
	});
	var c = val.__ = {};
	c.type = "Dic";
	c.rels = rels || [];
	return val;  
}
`