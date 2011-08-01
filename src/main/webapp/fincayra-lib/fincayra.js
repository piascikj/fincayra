//This is loaded once on startup
this.fincayra = {};
//Load our libraries
load("lib.js");
load("Queue.js");
load("date.js");
load("json2.js");
load("db/uuid.js");

$log().debug("User home:{}",$getProperty("user.home"));

//Hide the config folder
$hide(["config"]);

fincayra.config = {
	preInit:function(){},
	postInit:function(){},
	preInitDb:function(){},
	onRequest:function(){},
	dev:true,//Set root log level and file cache to $log.Level.DEBUG and false 
	rootLogLevel: $log.Level.DEBUG,//Set the root log level.  Overides dev settings
	fileCache:false,//Cache html and javascript on the server for faster serving.  Overides dev settings
	beforeAPI:function(){return true;}, //Runs Prior to API calls
	afterAPI:function(){return true;}, //Runs After API calls
	url:"http://localhost:8080/",
	secureUrl:"https://localhost:4443/",
	name:"Fincayra",
	errorPage:"/error",
	store:"db/orientDB-store.js",
	storeConfig:{
		exportDir:"{}/tmp".tokenize($getProperty("user.home"))
	},
	search:"search/lucene-search.js",
	mail:"mail/postmark-mail.js",//TODO default should be mail/google-mail.js
	mailConfig: {
		//postmark-mail values
		apiKey:"POSTMARK_API_TEST", //You must register your own at http://postmarkapp.com
		senderSignature:"", //You must register your own at http://postmarkapp.com
		
		//smtp values
		/*host:"smtp.gmail.com",
		port:587,
		userName:"someUser",
		password:"somePassword",
		fromEmail:"jesse@piascik.net",
		templateDir:"mail",
		auth:true,
		starttls:true,
		timeout:25000,*/
		
		//generic values
		templateDir:"mail"
		
	},
	indexOnStartUp:true,
	expose:["css","images","js"],
	mailSender: {
		host:"smtp.gmail.com",
		port:587,
		userName:"someUser",
		password:"somePassword",
		fromEmail:"jesse@piascik.net",
		templateDir:"mail",
		auth:true,
		starttls:true,
		timeout:25000
	}
}

function $config(config) {
	if (config != undefined) {
		fincayra.config = $extend(fincayra.config, config);
	}
	
	return fincayra.config;
}

(function() {
	//Include the application config overides
	load("../application/config/app-config.js");

	$log().debug("Using Config:{}", JSON.stringify($config(), function(key, val) { return key == "password" ? "*****":val;}, "   "));

	$setLogLevel({level:$config().rootLogLevel});


	//Set some system properties that are needed for xml config files
	$setProperty("fincayra.home", $app().getRootDir());
	$log().info("fincayra.home={}", $app().getRootDir());

	//Run the pre init callback
	$log().info("Running config.preInit");
	$config().preInit();

	//Set the FileCache
	FileCache.enable($config().fileCache);

	//Configure the main app
	$app().setUrl($config().url);
	$app().setSecureUrl($config().secureUrl);
	$app().setName($config().name);

	//New MailManager impl
	load("mail/mail.js");
	load($config().mail);
	$mm().init($config().mailConfig);
	
	
	load("db/store.js");

	//Set the $load function to load from the server-js dir for application convenience
	(function() { var _l = $l; $l = $load = function(file) { _l("../application/server-js/" + file);};})();

	//Expose some paths to the client (default is ["css","images","js"])
	$expose($config().expose);

	//Load the store implementation
	$log().info("Loading the store implimentation config.store.");
	load($config().store);

	//Run the database preInit function
	$log().info("Running config.preInitDb");
	$config().preInitDb();

	//Now we register the storables in the persistenceManager
	$log().info("Initializing the store implimentation.");
	$om().initDb();
	$log().info(JSON.stringify($om().classDefs, null, "   "));

	//Now we initialize search
	load($config().search);
	$log().info("$om().searchables={}", JSON.stringify($om().searchables, null, "   "));

	//Run the post init callback
	$log().info("Running config.postInit");
	$config().postInit();
})();
