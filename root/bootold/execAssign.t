@`
		exec(cpt[0], env, function(left){
			exec(cpt[1], env, function(right){			
				addrset(env, left, right);
				fn(right);
			})
		});

`