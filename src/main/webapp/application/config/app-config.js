(function() {
		
	$config({

		preInitDb : function() {
			$l("app-root.js");
		},

		onRequest : function(req) {
			req.Templates = new DefaultTemplates(req);
		},
		
		name:"Fincayra2"
	});

	var userConfig = $getProperty("user.home") + "/.fincayra/app-config.js";
	if ((new java.io.File(userConfig)).exists()) {
		$l(userConfig);
	}

	if ($getProperty("fincayra.beanstalk") != null) {
		$config({
			url : "http://fincayra.elasticbeanstalk.com/",
			secureUrl: "http://fincayra.elasticbeanstalk.com/"
		});
	}

})();
