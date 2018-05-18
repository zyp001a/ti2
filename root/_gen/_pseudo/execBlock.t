`
		utils.eachsync(Object.keys(cpt), function(k, fnsub){
			var c = cpt[k];
			exec(c, env, function(rtn){

			})
		}, function(rtn){
			fn(rtn);
			
		})
`