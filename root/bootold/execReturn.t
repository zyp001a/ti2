@`
		exec(cpt[0], env, function(rtn){			
			cpt[1] = rtn;
			fn(cpt);
		})

`