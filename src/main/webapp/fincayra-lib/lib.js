
/*
 Enum: Methods
 The Http Mthods
 
 POST - "POST"
 GET - "GET"
 PUT - "PUT"
 DELETE - "DELETE"
 */
Methods = {
	POST: "POST",
	GET: "GET",
	PUT: "PUT",
	DELETE: "DELETE"
}

function $init() {
	$app().mergeEngine.init(true);
};

function $setProperty(key, value) {
	java.lang.System.setProperty(key, value);
}

function $getProperty(key) {
	return java.lang.System.getProperty(key);
}

/*
 * Function: $app
 * Returns:
 * A reference to the fincayra application
 */
function $app() { return org.innobuilt.fincayra.FincayraApplication.get(); };

/*
	Func:$rootScope
	get the root scope
*/
function $rootScope() {
	return rootScope; 
}

/*
  Func: $getJsDir
  Get the path to the jsDir
*/
function $getJsDir() {
	return $app().mergeEngine.jsDir + "/";
}

/*
	Func: $getPageDir
	Get the path to the pageDir
*/
function $getPageDir() {
	return $app().mergeEngine.pageDir + "/";
}

/*
  Function: $watch 
  Watch a file for reload of root scope if application.reloadRootScope=true
  
  Parameters:
  file - The name of the file or folder to watch with path referenced to jsDir
  
  Example:
  If jsDir is 'fincayra-lib' and file is 'request.js', then 'fincayra-lib/request.js' will be watched
*/
function $watch(file) {
	file = file.replace(/^\//g,"");
	$app().watch($getJsDir() + file);
}

/*
	Function: $load
		$l in it's shorthand form, this function loads and executes JavaScript files from the jsDir and adds them to the watch list
 
	Parameters:
		file - The file to be loaded with path referenced to jsDir
 */
var $l = $load = function(file) { 
	load(file); 
	$watch(file);
};


/*
  Function: $log
	
	Returns the logger
 
	The logging implementation is slf4j
	Avoid string concatination by using like this 
  > $log().debug("Hello {}", "World");
 */
var $log = function() {	
	return logger(); 
};

/*
	Enum: $log.Level
		The log levels
	
	* ALL
	* DEBUG
	* ERROR
	* FATAL
	* INFO
	* OFF
	* TRACE
	* TRACE_INT
	* WARN
*/
$log.Level = {
		ALL : org.apache.log4j.Level.ALL,
		DEBUG : org.apache.log4j.Level.DEBUG,
		ERROR : org.apache.log4j.Level.ERROR,
		FATAL : org.apache.log4j.Level.FATAL,
		INFO : org.apache.log4j.Level.INFO,
		OFF : org.apache.log4j.Level.OFF,
		TRACE : org.apache.log4j.Level.TRACE,
		TRACE_INT : org.apache.log4j.Level.TRACE_INT,
		WARN : org.apache.log4j.Level.WARN
}

/*
	Function: $setLogLevel
		Set the log level
	
	Parameters:
		
		config - An object containing the logger (String) and level $log.Level.  If the logger is left undefined, the root logger is used.
		
	Examples:
		Set the org.fincayra logger to INFO
		>$setLogLevel({logger:"org.fincayra",level:$log.Level.INFO});
		Set the root logger to ERROR
		>$setLogLevel({level:$log.Level.ERROR});
*/
var $setLogLevel = function(config) {
	var logger;
	if (!config.logger) {
		logger = org.apache.log4j.Logger.getRootLogger();
	} else {
		logger = org.apache.log4j.Logger.getLogger(config.logger);
	}
	logger.setLevel(config.level);
};

/*
	Function: $getLogLevel
	
		get the log level
	
	Parameters:
	
		name - The name of the logger or if left undefined, the root log level is returned
*/
var $getLogLevel = function(name) {
	var logger;
	if (name == undefined) {
		logger = org.apache.log4j.Logger.getRootLogger();
	} else {
		logger = org.apache.log4j.Logger.getLogger(name);
	}
	
	return logger.getLevel().toString();
};

/*
 * some logging shortcuts
 * TODO These should all be removed in favor of calling $log().debug etc.
 */
var $debug = function(obj) { $log().debug(obj); };
var $info = function(obj) { $log().info(obj); };
var $error = function(obj) { $log().error(obj); };

var $eString = function(e) {
	if (e.javaException) {
		var je = e.javaException;
		if ($log().isDebugEnabled()) {
			var st = je.getStackTrace();
			var trace = ""
			for (var i = 0; i != st.length; ++i) {
				$log().debug(st[i].toString());
			}
		}
		return new String(je.getClass().getName() + " Message:" + je.getMessage());
	} else {
		return JSON.stringify(e, null, "   ");
	} 

}

/*
	Func: $type
	
		Get the object type as a string
 
	Paramters:
 
		obj - The object to check the type of
 
	Returns:
	
		The object type name
 */
var $type = function(obj) { 
	   if (obj.constructor) {
		   var c = obj.constructor.toString().indexOf("Function")>0?obj:obj.constructor;
		   var funcNameRegex = /function (.{1,})\(/;
		   //$debug("CHECKING TYPE OF:" + c.toString());
		   var results = (funcNameRegex).exec(c.toString());
		   //$debug("TYPE RESULTS:" + JSON.stringify(results));
		   if (results && results.length > 1) {
			   return results[1];
		   }
	   }
	   
	   if (obj.getClass()) {
		   return obj.getClass().getName();
	   }
	   return "";
};
	
/*
	Func: $hide
	
		Hide a path from http clients
	
	Parameters:
		
		path - The path to hide
*/
var $hide = function(paths) {
	paths.each(function(path) {
		$app().hidePath(path);
	});
};

/*
	Func: $expose
	
	Because the root path of a fincayra application is the application directory and only .js and .html files will be served through the engine, you will have to call this method to expose static, non-html content such as image, javascript and css files. 
	
	You should make a call to this function in your server-js/app-root.js file.
	
	Paramters:
	
	paths - An array of paths to expose in the application directory as root paths in the application
	
	Example:
	
	[fincayra-install-dir]/webapps/root/application contains -
	>+css
	>+dev
	>+images
	>+js
	>+mail
	>+server-js
	>+templates
	>+test
	>index.html
	>index.js
	
	*You run*
	>$expose(["css","js","images"]);
	*This will expose*
	
	* http://my.app.com/css
	* http://my.app.com/js
	* http://my.app.com/images
*/
var $expose = function(paths) {
	paths.each(function(path) {
		$app().exposePath(path);
	});
};

/*
  Func: $getErrorPage
  
	Get the error page that will handle exceptions
*/
var $getErrorPage = function() {
	return fincayra.config.errorPage;
};

/*
  Func: $href
	
	Returns an anchor element as text that can be appended to another element
  
  Parameters:
  
	parms - an object of the format
 
	>{text:'the Link text', url: 'http://the.url'}
  
	If text is undefined, the url will be used as the text.
 */
var $href = function(parms) {
	var text = parms.text;
	var url = $app().url;
	if(parms.ssl) url = $app().secureUrl;
	url += parms.page;
	if(!parms.text) text = url;
	return "<a href='" + url + "'>" + text + "</a>";
};

/*
	Function: $sendMail

		Execute a mail template and ultimately send it

	Parameters:
		
		path - The path to the mail template js file relative to mailManager.templateDir
		data - Am object to be accessible in the template as context.messageData
*/
var $sendMail = function(path, data) {
	$app().getMailManager().processTemplate(path, data);
};

/*
	Func: $connect
		
		Connect using <Jsoup.connect http://jsoup.org/apidocs/org/jsoup/Jsoup.html#connect(java.lang.String)>
	
	Parameters:
	
		url - the url string to connect to
*/
var $connect = function(url) {
	return org.jsoup.Jsoup.connect(url);
};


/*
	Func: $mapToJS
		
		Convert a java.util.Map to a JavaScript Object
	
	Paramters:
	
		map - the map to convert
*/
var $mapToJS = function(map) {
	var obj={},keys = map.keySet().toArray();
	keys.each(function(key) {
		obj[key] = map.get(key);
	});
	return obj;
}

/*
	Function: $encode
 
		Encodes text for urls
 
	Parameters:
		
		text - The text to encode

	Returns:
		
		The encoded text
 */
var $encode = function(text) {
	return java.net.URLEncoder.encode(text, "UTF-8");
};

/*
	class: FileCache
	
		A singleton Cache for js and html files to enhance performance
*/
var FileCache = {
	enabled : true,
	files : {},
	contents : {},
	
	/*
		func: exists
		
			Check if a file exists by path
		
		Parameters:
		
			path - path to a file
	*/
	exists : function(path) {
		if (this.files[path] == undefined) {
			this.files[path] = new java.io.File(path);
		}

		return this.files[path].exists();
	},
	
	/*
		Function: get
			Get a file from the cache by path
	 
		Parameters:
		
			path - The path to the file
	 
		Returns:
		
			The file contents as a string
	 */
	 get : function(path) {
		if (!this.enabled) return org.apache.commons.io.FileUtils.readFileToString(new java.io.File(path), "UTF-8");
		if (this.exists(path) && this.contents[path] == undefined) {
			$log().debug("Caching file:{}", path);
			var contents = org.apache.commons.io.FileUtils.readFileToString(this.files[path],"UTF-8");
			
			this.contents[path] = contents;
		}
		return this.contents[path];
	 },
	 
	 /*
		func: clear
		
			Clear a file from the cache
		
		Parameters:
		
			path - the path to the file or if no path is passed clear the whole cache
	*/
	 clear : function(path) {
		if (path != undefined) {
			this.files[path] = undefined;
		} else {
			this.files = {};
		}
	 },
	 
	 /*
		func: list
		
		List all the files in the cache
		
		Returns:
		
		An array of file paths
	*/
	 list :function() {
	    var keys = [];
		for(var key in this.files){
			keys.push(key);
		}
		return keys;
	 },
	 
	 /*
		func: enable
		
		Enable or disable file caching
		
		Parameters:
		
			e - true to enable, false to disable
	*/
	 enable : function(e) {
		if (e === true || e === false) {
			this.enabled = e;
		}
		
		return this.enabled;
	 }
	 
	 
	 
	 
};

/*
	class: Error
	
	func: printStackTrace
	
	Print a stack trace of an Error or Java Exception
*/
Error.prototype.printStackTrace = function() {
	if (this.javaException != undefined) {
		this.javaException.printStackTrace();
	} else if (this.rhinoException != undefined) {
		java.lang.System.out.println(this.name);
		this.rhinoException.printStackTrace();
	} else {
		java.lang.System.out.println(this.message);
	}
}

/*
	Class: Array

	Func: each
	
	Loop each element in an array and run the callback

	Parameters:

	callback - A function to call that will be executed for each element of the array.
	The callback will be passed the element as a parameter.
	end - The number of items to iterate over or if left undefined, iterate over the entire Array.
 */
Array.prototype.each = function(callback,end) {
	for(var i = 0; i < this.length; i++) {
		if (end != undefined && i > end-1) break; 
		callback(this[i],i);
	}
};

/*
  Class: Object
  
  Func: extend
  
  Extend an object
  
  Parameters:
  
  oSuper - The object to extend
  
  Example:
 
 > function ClassA () {  
 > }  
 >
 > function ClassB() {  
 > 		this.extends(new ClassA());  
 > }
 > 
 */
Object.prototype.extend = function(oSuper) { 
	for (sProperty in oSuper) {
		this[sProperty] = oSuper[sProperty]; 
	}

	return this;
};

/*
	class: String
	
	Func: tokenize

	Tokenize instances of {} in a string by passing their replacements as parameters
	
	Parameters:

	str1,str2,str3,...
	
	Example:

>"The {} {} bit the {}".tokenize("big","rat","postman");
Will return
>"The big rat bit the postman"
*/
String.prototype.tokenize = function() {
	var args = arguments;
	var result = this;
	
	if (args.length > 0) {
		for(var i=0; i<args.length; i++) {
			result = result.replace(/\{\}/, args[i]);
		} 	
	}
	
	return result;
};

/*
	Func: isLike
	
	Compare this string to string passed in.
	
	Params:

	str - The string to check existence of
	
	Returns:
	
	true if the param string exists in this string ignoring case
*/
String.prototype.isLike = function(str) {
	myRE = new RegExp(str, "i");
	return this.match(myRE) != null;
}

