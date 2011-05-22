//This is loaded once on startup
this.fincayra = {};
//Load our libraries
load("lib.js");
load("owl-util.js");
load("date.js");
load("json2.js");
load("db/uuid.js");

$log().debug("User home:{}",$getProperty("user.home"));

//Hide the config folder
$hide(["config"]);

function extend(object, oSuper) { 
	for (sProperty in oSuper) {
		if (typeof object[sProperty] == "object") {
			extend(object[sProperty],oSuper[sProperty]);
		} else {
			object[sProperty] = oSuper[sProperty]; 
		}
	}
	
	return object;
};

fincayra.config = {
	preInit:function(){},
	postInit:function(){},
	preInitDb:function(){},
	onRequest:function(){},
	dev:true,
	fileCache:false,
	allowAPIAccess:function(){return true;},
	url:"http://localhost:8080/",
	secureUrl:"https://localhost:4443/",
	name:"Fincayra",
	errorPage:"/error",
	store:"db/orientDB-store.js",
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
		fincayra.config = extend(fincayra.config,config);
	}
	
	return fincayra.config;
}

//Include the application config overides
load("../application/config/app-config.js");

$log().debug("Using Config:{}", JSON.stringify($config(), function(key, val) { return key == "password" ? "*****":val;}, "   "));


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

var mailSender = new org.springframework.mail.javamail.JavaMailSenderImpl();
mailSender.setHost($config().mailSender.host);
mailSender.setPort($config().mailSender.port);
mailSender.setUsername($config().mailSender.userName);
mailSender.setPassword($config().mailSender.password);
var props = new java.util.Properties();
props.setProperty("mail.smtp.auth", $config().mailSender.auth);
props.setProperty("mail.smtp.starttls.enable", $config().mailSender.starttls);
props.setProperty("mail.smtp.timeout", $config().mailSender.timeout);
mailSender.setJavaMailProperties(props);

var mailManager = new  org.innobuilt.fincayra.mail.MailManager();
mailManager.setMailSender(mailSender);

$app().setMailManager(mailManager);
$hide([$config().mailSender.templateDir]);

$log().info("Initializing MailManager");
$app().getMailManager().init();
$log().info("Done Initializing MailManager");

if ($config().dev) $setLogLevel({level:$log.Level.DEBUG});

load("db/store.js");

//Set the $load function to load from the server-js dir for application convenience
(function() { var _l = $l; $l = $load = function(file) { _l("../application/server-js/" + file);};})();

//Expose some paths to the client (default is ["css","images","js"])
$expose($config().expose);

load($config().store);

$config().preInitDb();

//Now we register the storables in the persistenceManager
$om().initDb();
$log().debug(JSON.stringify($om().classDefs, null, "   "));

//Run the post init callback
$log().info("Running config.postInit");
$config().postInit();

