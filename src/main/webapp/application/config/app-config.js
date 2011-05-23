(function() {
		
	$config({

		preInitDb : function() {
			$l("app-root.js");
			$l("notebooks.js");
		},

		onRequest : function(req) {
			req.Templates = new DefaultTemplates(req);
		},
		
		name:"Fincayra"
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
