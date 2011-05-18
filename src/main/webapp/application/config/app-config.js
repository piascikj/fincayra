(function() {
		
	var userConfig = $getProperty("user.home") + "/.fincayra/app-config.js";
	if ((new java.io.File(userConfig)).exists()) {
		$l(userConfig);
		var config = $config();
		config.preInitDb = function() {
			$l("app-root.js");
		};
		$config(config);
		return;
	}
	
	var config = {
		name:"Fincayra2"
	};

	if ($getProperty("fincayra.beanstalk") != null) {
		config.url="http://fincayra.elasticbeanstalk.com/";
		config.secureUrl="http://fincayra.elasticbeanstalk.com/";	
	}

	$config(config);
})();
