(function() {
		
	var config = {
		preInit: function() {
			$setLogLevel({level:$log.Level.INFO});
			FileCache.enable(false);
		},
		name:"Fincayra2"
	};

	if ($getProperty("fincayra.beanstalk") != null) {
		config.url="http://fincayra.elasticbeanstalk.com/";
		config.secureUrl="http://fincayra.elasticbeanstalk.com/";	
	}

	$config(config);
})();


//To load a file outside the scope of the application, do this
//load("/home/jpiasci/fincayra-config.js");
