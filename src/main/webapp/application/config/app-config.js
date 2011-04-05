(function() {
		
	var config = {
		name:"Fincayra2"
	};

	if ($getProperty("fincayra.beanstalk") != null) {
		config.url="http://fincayra.elasticbeanstalk.com/";
		config.secureUrl="http://fincayra.elasticbeanstalk.com/";	
	}
	
	if ((new java.io.File($getProperty("user.home") + "/.fincayra/app-config.js")).exists()) {
		$l($getProperty("user.home") + "/.fincayra/app-config.js");
	} else {
		$config(config);
	}
})();


//To load a file outside the scope of the application, do this
//load("/home/jpiasci/fincayra-config.js");
