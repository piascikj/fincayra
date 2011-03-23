//TODO only allow admins!!!

$api({
	setLogLevel : function() {
		var params = $getPageParams();
		$setLogLevel({level:$log.Level[params.level]});
		$j(params);
	},
	
	csrSession : function() {
		var params = $getPageParams();
		var csr = csrSession();
		csrSession(!csr);
		$j({csrSession:csrSession()});
	},
	
	beUser : function() {
		if (csrSession() || adminSession()) {
			var params = $getPageParams();
			var user = new User({email:params.email});
			user.findByProperty("email").each(function(val) {
				user = val;
				if (user.role != Role.admin) {
					$getAuthSession().user = user;
				}
			});
			safeJ(user);
		} else {
			throw new Error(constants.errors.auth);
		}
	}
});
