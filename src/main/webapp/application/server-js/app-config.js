function prop(key) {
	return java.lang.System.getProperty(key);
}
config = {
	name:"Fincayra2"
}

if (prop("fincayra.beanstalk") != null) {
	config.url="http://fincayra.elasticbeanstalk.com/";
	config.secureUrl="http://fincayra.elasticbeanstalk.com/";	
}


//To load a file outside the scope of the application, do this
//load("/home/jpiasci/fincayra-config.js");
