/*   Copyright 2010 Jesse Piascik
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
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
	version:"0",
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
	maxInactiveInterval: 60 * 30, //Seconds to keep session active in between access
	name:"Fincayra",
	errorPage:"/error",
	sessionCacheName:"fincayra-session",
	store:{
		//mongoDB config
		//impl:"db/mongoDB-store.js",
		//location:"localhost"
		impl:"db/orientDB-store.js",
		exportDir:"{}/tmp".tokenize($getProperty("user.home"))
	},
	cache: {
<<<<<<< HEAD
		configFile:$app().getRootDir() + "/fincayra-lib/cache/distributed-udp.xml"
=======
		//configFile:$app().getRootDir() + "/fincayra-lib/cache/distributed-udp.xml",
		//clustered:true
		clustered:false
>>>>>>> 05faf9b... DB connection in cluster
	},
	search:"search/lucene-search.js",
	mail: {
		impl: "mail/postmark-mail.js",//TODO default should be mail/google-mail.js
		//postmark-mail values
		apiKey:"POSTMARK_API_TEST", //You must register your own at http://postmarkapp.com
		senderSignature:"", //You must register your own at http://postmarkapp.com
		
		//smtp values
		/*
		host:"smtp.gmail.com",
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
	load($config().mail.impl);
	$mm().init($config().mail);
	
	//Load the cache lib
	load("cache/cache.js");
	
	//Create the Session cache
	$getSessionCache();
	
	//Load the object store lib
	load("db/store.js");

	//Set the $load function to load from the server-js dir for application convenience
	(function() { var _l = $l; $l = $load = function(file) { _l("../application/server-js/" + file);};})();

	//Expose some paths to the client (default is ["css","images","js"])
	$expose($config().expose);

	//Load the store implementation
	$log().info("Loading the store implimentation config.store.");
	load($config().store.impl);

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
