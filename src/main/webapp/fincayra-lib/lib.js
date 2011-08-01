
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

function AuthRequiredException(msg) {
	this.message = "You must sign in to see this page.";
	this.extend(new Error(msg || this.message));
	this.statusCode = 401;
}

function ForbiddenException(msg) {
	this.message = "This request is forbidden";
	this.extend(new Error(msg || this.message));
	this.statusCode = 403;
}

function $init() {
	clearSchedule();
	$app().mergeEngine.init();
};

function $destroy() {
	$log().info("Fincayra is shutting down!");
	if ($om().destroy != undefined) $om().destroy();
	if ($sm().destroy != undefined) $sm().destroy();
	clearSchedule();
};

//for deep extend
function $extend(object, oSuper) { 
	for (sProperty in oSuper) {
		if (typeof object[sProperty] === "object" && object[sProperty] !== null) {
			object[sProperty] = $extend(object[sProperty],oSuper[sProperty]);
		} else {
			object[sProperty] = oSuper[sProperty]; 
		}
	}
	
	return object;
};

/*
 * Function: $getInstance
 * 
 * Get an object instance by name
 * 
 * Parameters:
 * 		type - A string with the name of the type to instantiate
 * 
 * Returns:
 * 
 * An object instance 
 */
function $getInstance(type, params) {
	return eval("new " + type + "(params);");
};

function $setProperty(key, value) {
	java.lang.System.setProperty(key, value);
};

function $getProperty(key) {
	return java.lang.System.getProperty(key);
};

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
	return $app().mergeEngine.topScope; 
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
		ALL : "ALL",
		DEBUG : "DEBUG",
		ERROR : "ERROR",
		FATAL : "FATAL",
		INFO : "INFO",
		OFF : "OFF",
		TRACE : "TRACE",
		TRACE_INT : "TRACE_INT",
		WARN : "WARN"
}

$log.JLevel =  {
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
function $setLogLevel(config) {
	var logger;
	if (!config.logger) {
		logger = org.apache.log4j.Logger.getRootLogger();
	} else {
		logger = org.apache.log4j.Logger.getLogger(config.logger);
	}
	logger.setLevel($log.JLevel[config.level]);
};

/*
	Function: $getLogLevel
	
		get the log level
	
	Parameters:
	
		name - The name of the logger or if left undefined, the root log level is returned
*/
function $getLogLevel(name) {
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
	return encodeURIComponent(text);
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

Array.prototype.removeString = function(val) {
	var ary = this;
	return ary.join("|").replace(val, "").replace("||","|").replace(/^\|/,"").replace(/\|$/,"").split("|");
}

Array.prototype.replaceString = function(cur, repl) {
	var ary = this;
	return ary.join("|").replace(cur, repl).split("|");
}

Array.prototype.stringExists = function(val) {
	return this.join("|").indexOf(val) > -1;
}


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

Function.prototype.extend = function( parentClassOrObject ){ 
	if ( parentClassOrObject.constructor == Function ) 
	{ 
		//Normal Inheritance 
		this.prototype = new parentClassOrObject;
		this.prototype.constructor = this;
		this.prototype.parent = parentClassOrObject.prototype;
	} 
	else 
	{ 
		//Pure Virtual Inheritance 
		this.prototype = parentClassOrObject;
		this.prototype.constructor = this;
		this.prototype.parent = parentClassOrObject;
	} 
	return this;
}

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
			if (args[i] == undefined) args[i] = "undefined";
			result = result.replace(/\{\}/, args[i]);
		} 	
	}
	
	return result;
};

/*
	Func: isLike
	
	Compare this string to string passed in.
	
	Parameters:

	str - The string to check existence of
	
	Returns:
	
	true if the param string exists in this string ignoring case
*/
String.prototype.isLike = function(str) {
	myRE = new RegExp(str, "i");
	return this.match(myRE) != null;
}

String.prototype.truncate = function(len, suffix, replaceCR) {
	var text = this.toString();
	if (replaceCR) {
		text = text.replace(/\n/g, replaceCR)
	}
	if (text != null && text != undefined && text.length > len) {
		text = text.substring(0, len-suffix.length);
		text = text.replace(/^(.*) \w*$/, "$1") + suffix;
	}
	
	return text;
};

function sync(f) {
	return new Packages.org.mozilla.javascript.Synchronizer(f);
}

//SetTimeout and SetInterval implementation
var setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    clearSchedule;

(function () {
    var timer = new java.util.Timer();
    var counter = 1; 
    var ids = {};

    setTimeout = function (fn,delay) {
        var id = counter++;
        ids[id] = new JavaAdapter(java.util.TimerTask,{run: fn});
        timer.schedule(ids[id],delay);
        return id;
    }

    clearTimeout = function (id) {
		$log().info("Removing timer:{}", id);
        ids[id].cancel();
        timer.purge();
        delete ids[id];
    }

    setInterval = function (fn,delay) {
        var id = counter++; 
        ids[id] = new JavaAdapter(java.util.TimerTask,{run: fn});
        timer.schedule(ids[id],delay,delay);
        return id;
    }

    clearInterval = clearTimeout;

	clearSchedule = function() {
		for (id in ids) {
			if (ids.hasOwnProperty(id)) {
				clearTimeout(id);
			}
		}
	}
})();

/*
	class: Request
	
	Encapsulates all functions available at the request scope
	
	Parameters:
	
	scope - The request scope
*/
function Request(scope) { 
	this.sessionMgr = new SessionManager(scope);
	this.scope = scope;
	this.scope.isAPI = false;
	this.request = this;
	//TODO, need a better way to handle copying these functions to scope
}

/*
	Func: $isAPI
	
	Set API flag so errors will go out as JSON
	
	Parameters: api - true if you want it on, false if off, don't pass to just get the current setting
*/
Request.prototype.$isAPI = function(api) {
	if (api != undefined) {
		this.isAPI = api;
		//this.scope.isAPI = api;
	}
	return this.isAPI;
}

/*
	Func: $requestScope
	
	Get the request scope
*/
Request.prototype.$requestScope = function() {
	return this.scope;
}
/*
	func: $getRequest
	
	Get the HttpServletRequest
	
	Returns: 
	
	HttpServletRequest
*/
Request.prototype.$getRequest = function() {
	return this.scope.context.request;
};

/*
	Func: $getPageDir
	
	Get the path to the pageDir
*/
Request.prototype.$getPageDir = function() {
	return this.scope.context.mergeEngine.pageDir + "/";
};

/*
	Function: $load
	
	$l in it's shorthand form, this method loads and executes JavaScript files
   
	Parameters:
	
	file - The file to be loaded
 */
Request.prototype.$l = Request.prototype.$load = function(file) {
	var name = $app().mergeEngine.pageDir + "/server-js/" + file;
	this.scope.context.loadString(this.scope, FileCache.get(name), name); 
};

/*
	Function: $
	
	Just like <JQuery at http://api.jquery.com/category/manipulation/>!  Find an element or elements in the current document by selector. 
	Runs the <jsoup Element.select at http://jsoup.org/apidocs/org/jsoup/nodes/Element.html#select> method on the element in the current context.  If html is passed in it will be parsed into a jsoup element.
	
	Parameters:
	
	str - The selector or html to be parsed into a jsoup element
 */
Request.prototype.$ = function(str) { 
	if (str.match(/<.*/)) {
		//If body has one child, return it, otherwise wrap content in div and return it
		var body = org.jsoup.Jsoup.parseBodyFragment(str).body();
		var children = body.children();
		if (children.size() == 1) {
			return children.first();
		}
		return org.jsoup.Jsoup.parseBodyFragment("<div>" + str + "</div>").body().children().first();
	}
	
	if (this.scope.context.getElement()) {
		var elements = this.scope.context.getElement().select(str).toArray();
		if (elements.length > 1) {
			return elements;
		}
		return elements[0];
	}
};

/*
	func: $remove
	
	Remove an element from the dom and return it
	
	Parameters:
	
	el - The element to remove
	
	Returns:
	
	A clone of the removed element
*/
Request.prototype.$remove = function(el) {
	var clone = el.clone();
	el.remove();
	return clone;
};

/*
	Func: $redirect

	Sends a temporary redirect response to the client using the specified redirect location URL.
	
	Parameters:
	
	loc - the redirect location URL
		
	Throws:

		java.io.IOException - If an input or output exception occurs
		java.lang.IllegalStateException - If the response was committed or if a partial URL is given and cannot be converted into a valid URL
*/
Request.prototype.$redirect = function(loc) {
	this.scope.context.request.setAttribute("fincayra.redirect", new java.lang.String(loc));
};

/*
	Func: $getPageParams
	Get the page parameters as an object.  Each key in the object is a parameter passed in on the request.
	
	Parameters:
	checkjson - if true and the http method is POST or PUT, returns the json body as an object
	 
	Returns:
	The object containing the parameter keys and values
*/
Request.prototype.$getPageParams = function(checkJson) {

	if (this.params == undefined) {
		var obj = {};
		var names = this.scope.context.getRequest().getParameterNames();
		var name;
		if (names.hasMoreElements()) {
			while(names.hasMoreElements()) {
				name = new String(names.nextElement());
				obj[name] = new String(this.scope.context.getRequest().getParameter(name));
			}
		} else if (checkJson && (this.$getMethod() == Methods.POST || this.$getMethod() == Methods.PUT)) {
			var req = this.$getRequestBody();
			$log().debug("$getPageParams requestBody={}", req);
			if (req != "") obj = JSON.parse(req,function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
						var dt = new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4], +a[5], +a[6]));
                        return dt;
                    }
                }
                return value;
            });
		}
		
		this.params = obj;
	}
	
	return this.params;
};

/*
	Func: $setPageParams
	set page paramters for this request

	Parameters:
	params - A javascript object of params to set
*/
Request.prototype.$setPageParams = function(params) {
	if (!this.params) this.$getPageParams(true);
	this.params.extend(params);
};

/*
	Func: $getRequestBody
	Get the request body as a string
	
	Returns:
	The request body as a string
*/
Request.prototype.$getRequestBody = function() {
	return new String(org.apache.commons.io.IOUtils.toString(this.scope.context.getRequest().getReader()));
}

/*
	Func: $getMethod
	Get the HTTP method used on this request
	
	Returns:
	The HTTP method used on this request. See <Methods>.
*/
Request.prototype.$getMethod = function() {
	return new String(this.scope.context.getRequest().getMethod());
};

/*
	Func: $isPOST
	Check if this is a POST request
	
	Returns:
	true if request is <Methods>.POST
*/
Request.prototype.$isPOST = function() {
	return this.$getMethod() == Methods.POST;
};

/*
	Func: $isGET
	Check if this is a GET request
	
	Returns:
	true if request is <Methods>.GET
*/
Request.prototype.$isGET = function() {
	return this.$getMethod() == Methods.GET;
};

/*
	Func: $isPUT
	Check if this is a PUT request
	
	Returns:
	true if request is <Methods>.PUT
*/
Request.prototype.$isPUT = function() {
	return this.$getMethod() == Methods.PUT;
};

/*
	Func: $isDELETE
	Check if this is a DELETE request
	
	Returns:
	true if request is <Methods>.DELETE
*/
Request.prototype.$isDELETE = function() {
	return this.$getMethod() == Methods.DELETE;
};


/*
	Func: $setStatus
	Set the HTTP status code of the reponse

	Parameters:
		code - int
*/
Request.prototype.$setStatus = function(code) {
	this.scope.context.response.setStatus(code);
};

/*
	Func: $getCurrentDir
	Get the current directory path assuming the application.pageDir is root.
	
	Returns:
	The current directory path assuming the application.pageDir is root.
*/
Request.prototype.$getCurrentDir = function() {
	return new String(this.scope.context.getCurrentPage().substring(0,this.scope.context.getCurrentPage().lastIndexOf("/")));
};

/*
	Func: $getCurrentPage
	Get the current page path assuming the application.pageDir is root.
	
	Returns:
	The current page path assuming the application.pageDir is root.
*/
Request.prototype.$getCurrentPage = function() {
	return new String(this.scope.context.getCurrentPage());
};

/*
	Func: $setCurrentPage
	set the current page
*/
Request.prototype.$setCurrentPage = function(page) {
	return new String(this.scope.context.setCurrentPage(page));
};

/*
	Func: $getRequestURL
	Get the requested URL
	
	Returns: 
	The requested URL - String
*/
Request.prototype.$getRequestURL = function() {
	var url = this.scope.context.request.requestURL;
	var queryString = this.scope.context.request.queryString;
	if (queryString != null) {
		url+='?';
		url+=queryString;
	}
	return new String(url);
};

/*
	Func: $getRequestURI
	Get the requested URI
	
	Returns: 
	The requested URI - String
*/
Request.prototype.$getRequestURI = function() {
	return new String(this.scope.context.getRequest().requestURI);
};

/*
	Func: $getRequestId
	Get the request Id, guaranteed to be unique to this instance of fincayra
	
	Returns: 
	requestId - Number
*/
Request.prototype.$getRequestId = function() {
	return new Number(this.scope.context.request.hashCode());
};

/*
	Func: $getCurrentPageUri
	Get the current page with .js removed
	
	Returns: 
	The current page with .js removed
*/
Request.prototype.$getCurrentPageUri = function() {
	return this.$getCurrentPage().replace(/\.js$/g,"");
};

/*
	Func: $getPagePath
	Get the path of the currentPage with pageDir as root
	
	Returns:
	The path of the currentPage with pageDir as root
*/
Request.prototype.$getPagePath = function(jsPage) {
	if (jsPage.substring(0,1) != "/") {
		return this.$getCurrentDir() + "/" + jsPage;
	} 
	return jsPage;
};

/*
	Func: $getRealPath
	Get the full file system path to the current page or path param
	
	Returns:
	The full file system path to the current page or path param
*/
Request.prototype.$getRealPath = function(path) {
	if (path != undefined) {
		return this.scope.context.request.getServletContext().getRealPath(path)
	}
	return $app().mergeEngine.pageDir + this.$getCurrentPage();
};

/*
	Func: $getExtraPath
	Get the rest of the path after the path of the current page
	
	Returns:
	The rest of the path after the path of the current page
*/
Request.prototype.$getExtraPath = function() {
	var uri = this.scope.context.getRequest().getRequestURI();
	var begin = uri.indexOf(this.$getCurrentPageUri()) + this.$getCurrentPageUri().length + 1;
	var result=(begin < uri.length())?new String(uri.substring(begin)):"";
	return result;
};

/*
	Func: $getPageSource
	Get the current page source as a string - great for the examples site
	
	Returns:
	The page source.
*/
Request.prototype.$getPageSource = function() {
	 var file = new java.io.File(this.$getRealPath());
	 return org.apache.commons.io.FileUtils.readFileToString(file);
};

/*
	Func: $source
	This is the source widget for example pages
	
	Just add a call to the end of your page, and see what happens
	
*/
Request.prototype.$source = function() {
	$log().debug("--------In $source()---------");
	var body = this.$("body");
	
	var html = body.html();

	var wrap = this.$("<div id='src_link'><a href='#'>Toggle Source</a></div><div style='display:none' id='source_head' class='container'><a href='#source_code'>Jump to source!</a>" +
				"<h4>(IDEA:  it would be great to show all //TODOs here!)</h4><hr/></div>" +
				"<div id='source_body'></div>" +
				"<div id='source' class='container' style='display:none;clear:both;'><a name='source_code'><hr/><h3>The source...</h3><pre>" +
				org.apache.commons.lang.StringEscapeUtils.escapeHtml(this.$getPageSource()) + "</pre></div>");
	
	body.html(wrap.html());
	body.prepend("<!-- This was prepended in $source function -->");
	
	this.$("#source_body").html(html);
	
	var srcHead = this.$("#source_head");
	srcHead.append('<script>$(document).ready(function() {$("#src_link").click(function(){$("#source_head").toggle();$("#source").toggle();})});</script');
	var p = function(str) {
			srcHead.append("<p>" + str + "</p>");
	};
	
	p("requestURL:" + this.scope.context.request.requestURL);
	p("contextPath:" + this.scope.context.request.contextPath);
	p("serverName:" + this.scope.context.request.serverName);
	p("serverPort:" + this.scope.context.request.serverPort);
	p("currentPage:" + this.$getCurrentPage());
	p("currentPageUri:" + this.$getCurrentPageUri());
	
};

/*
	Function: $execute
	$e in it's shorthand form, this method loads the page into the document object and runs the page javascript
	
	Examples:
	These all do the same thing
	>$e("/recover.js");
	>$e("/recover.html");
	>$e("/recover");
	
	Parameters:
	page - Path to the page that will be executed with application.pageDir as root.
  
 */
Request.prototype.$e = Request.prototype.$execute = function(page, c) {
	var mainContext = this.scope.context;
	if (c) this.scope.context = c; 
	
	page = page.replace(/\.html$/g,".js");
	
	if (page.indexOf(".html") < 0 && page.indexOf(".js") < 0) page += ".js";
	
	var jsPage = this.scope.context.mergeEngine.pageDir + this.$getPagePath(page);

	this.$executePage(jsPage);
	
	if (c) this.scope.context = mainContext;

};

Request.prototype.$executePage = function(jsPage) {
	var pageHtml = jsPage.replace(/\.js$/g, ".html");

	$log().debug("jsPage = {}", jsPage);
	
	//************************************************************
	//If there is an HTML file for this page, parse it with jsoup
	//************************************************************
	if (FileCache.exists(pageHtml)) {
		$log().debug("pageHtml = {}", pageHtml);
		var doc = null;
		try {
			doc = org.jsoup.Jsoup.parse(FileCache.get(pageHtml), "UTF-8");
		} catch (e) {
			$log().error("Unable to parse htmlfile:{}", pageHtml);
			throw(e);
		}
		// make the document object available to script
		if (this.scope.context.response != null) this.scope.context.response.setContentType("text/html");
		this.scope.context.setElement(doc);
	}

	try {
		this.scope.context.loadString(this.scope, FileCache.get(jsPage), jsPage);
	} catch (e if e.javaException instanceof java.io.FileNotFoundException) {
		$log().debug("Unable to find file: {}", jsPage);
	} catch (e) {
		if (!(e instanceof AuthRequiredException)) {
			$log().error("Caught exception while trying to load JavaScript file: {}", jsPage);
			e.printStackTrace();
		}
		throw e;
	}
}

/*
	Function: $forward

	$f in it's shorthand form, this method forwards the request to the specified page

	Parameters:
	page - The page to be forwarded to with application.pageDir as root

	Examples:
	These all do the same thing
	>$f("/recover.js");
	>$f("/recover.html");
	>$f("/recover");
*/
Request.prototype.$f = Request.prototype.$forward = function(page) {
	this.scope.context.element = null;
	this.$e(page);
};

/* 
	Function: $include
	$i in it's shorthand form, use this method to get the generated content from a page and add it's head element to the current page
	
	Parameters:
 	page - the path tho the page with application.pageDir as root, or relative path from current page
	
	Returns:
	The document element (body) fo the page to be included
 */
Request.prototype.$i = Request.prototype.$include = function(page) {
	//we need a new context so we don't overwrite our current values
	var c = this.scope.context.clone();
	c.setRhinoContext(this.scope.context.getRhinoContext());
	this.$e(page,c);
	var el = c.getElement();
	return el;
};


/*
	Function: $json
 
	$j in it's shorthand form, use this method to send an object as the HTTP response in JSON format
	
	Parameters:
 	obj - the object to send in the HTTP response (required)
 	replacer - A replacer function see <JSON2.js http://www.json.org/js.html> or undefined
 	contentType - A string representation of the response content-type header you wish to set or undefined
 */
Request.prototype.$j = Request.prototype.$json = function(obj, replacer, contentType) {
	var cType = contentType || "application/json";
	this.scope.context.response.setContentType(cType);
	if (replacer) {
		this.scope.context.setJson(JSON.stringify(obj, replacer));		
	} else {
		this.scope.context.setJson(JSON.stringify(obj));		
	}
};

/*
 * Function: $doc
 * 
 * $d in it's shorthand form, use this method to set an Element as the HTTP response document
 * 
 * Parameters:
 * 		el - the element to use as HTTP response document
 */
Request.prototype.$d = Request.prototype.$doc = function(el) {
	this.scope.context.setElement(el);
};

/*
 * Function: $headJS
 * 
 * Includes a js file in the head element
 * 
 * Parameters:
 * 		path - The path to the js file relative to pageDir
 */
Request.prototype.$headJS = function(path) {
	this.$("head").append('<script type="text/javascript" src="' + $app().url + path + '"/>');
};

/*
 * Function: $headCSS
 *
 * Includes a css file in the head element
 *
 * Parameters:
 * 		path - The path to the css file relative to pageDir
 */
Request.prototype.$headCSS = function(path) {
	this.$("head").append('<link rel="stylesheet" type="text/css" href="' + $app().url + path + '"/>');
};

/*
	Func: $api
	
	Set up a simple api page that uses the url as a key to the method called.
	
	Example:
	Say the path to the page is /api/user.  You will then have a user.js file.
	If you want an add method you would call /api/user/add from the client, and in the user.js file you would have...
	>$api({
	>	add: function() {
	>		//add a user here
	>		var user = new User($getPageParams(true));
	>		//Do some validation
	>		user.save();
	>	}
	>});
	
	Parameters:
		actions - an object containing a mapping of action names to functions. [defaultAction] function will fire if no match is found.
*/
Request.prototype.$api = function(actions) {
	this.$isAPI(true);
	var action = this.$getExtraPath().split("/")[0];
	if (actions[action] != undefined) {
		actions[action]();
	} else if (actions.defaultAction != undefined) {
		actions.defaultAction();
	} else {
		var e = new Error("Action not found in api.");
		e.statusCode = 404;
		throw e;
	}
};

/*
	Func: $apiAction

	Parameters:
		
		A Number representing the piece of path to get. 0 or undefined returns the action
		
	Returns:
		
		The api action called
*/
Request.prototype.$apiAction = function(piece) {
	return this.$getExtraPath().split("/")[piece || 0];
};

/*
	Func: $requireSSL

		Redirects to the ssl url of the requested page
*/
Request.prototype.$requireSSL = function() {
	var ssl = new String($app().secureUrl);
	if(this.scope.context.request.requestURL.indexOf(ssl) < 0) {
		 if (ssl.match(/^.*\/$/) && this.$getCurrentPageUri().match(/^\/.*/)) {
			ssl = ssl.replace(/\/$/g,"");
		 }
		 var redirectTo = ssl + this.$getCurrentPageUri();
		 
		 $log().debug("Redirecting to: {}", redirectTo);
		 this.$redirect(redirectTo);
		 
	}
};

/*
	Function: $setVal
	
		Set the value of a form element

	Parameters:

		object - The object that holds the data
		name - The name of the attribute, also the id of the form field
*/
Request.prototype.$setVal = function(object, name) {
	if (object[name] != null && object[name] != undefined) {
		var el = this.$("#" + name);
		if (el.tag().equals(org.jsoup.parser.Tag.valueOf("select"))) {
			el.select("option").toArray().each(function(opt) {
				if (opt.val().toString() == object[name].toString()) {
					opt.attr("selected","selected");
				} else {
					opt.removeAttr("selected");
				}
			});
		} else {
			el.val(object[name]);
		}
	}
};

/*
	Func: $appendScript
	
		Appends a script element to the matched element
	
	Parameters:

		selector - The selector to match in the current document
		js - The javascript string to put in the script element
*/
Request.prototype.$appendScript = function(selector,js) {
	el = this.scope.$(selector);
	return el.append('<script language="JavaScript">{}</script>'.tokenize(js));
};

/*
	Func: $setVals

		Set the values of a form element
	
	Parameters:

		object - The object that holds the data
		names - an array of attribute names (also the id of the form field)
*/	
Request.prototype.$setVals = function(object, names) {
	var self = this;
	names.each(function(name) {
		self.$setVal(object, name);
	});
};

/*
Func: $setCookie

	Set a cookie
	
Paramters:

	name - (String) The name of the cookie or an object of the format
		
		(start code)
		{
			name: "cookieName", // required
			value: "cookieValue", // required
			comment: "description", //optional
			domain: "www.mydomain.com", //optional This cookie should be presented only to hosts satisfying this domain name pattern.
			maxAge: 2592000, //optional max age in milliseconds
			path: "", //optional This cookie should be presented only with requests beginning with this URL.
			secure: true //optional Indicates to the user agent that the cookie should only be sent using a secure protocol. (https)
		}
		(end)
		
	value - (String) The value of the cookie
	maxAge - (Number) The max age of the cookie in milliseconds
	
*/
Request.prototype.$setCookie = function(name, value, maxAge) {
	var cookie;
	if (name instanceof Object) {
		var parms = name;
		cookie = new javax.servlet.http.Cookie(parms.name, parms.value);
		if (parms.comment) cookie.comment = parms.comment;
		if (parms.domain) cookie.domain = parms.domain;
		if (parms.maxAge) cookie.maxAge = parms.maxAge;
		if (parms.path) cookie.path = pams.path;
		if (parms.secure) cookie.secure = parms.secure;
	} else {
		cookie = new javax.servlet.http.Cookie(name, value);
		if (maxAge) cookie.maxAge = maxAge;
	}
	
	this.scope.context.response.addCookie(cookie);
};

/*
Func: $removeCookie

	Remove a cookie

Parameters:
	
	name - the name of the cookie to remove.
	
*/
Request.prototype.$removeCookie = function(name) {
	this.$setCookie(name, null, 0);
}

/*
Func: $getCookie
	
	Get a cookie value
	
Paramters:
	
	name - The cookie name
	
Returns:

	The cookie value
*/
Request.prototype.$getCookie = function(name) {
    var cookies = this.scope.context.request.getCookies();
    var val;
    if (cookies != null) {
        cookies.each(function(cookie) {
            if (name == new String(cookie.name)) {
				$log().debug("Found cookie {}:{}", cookie.name, cookie.value);
                val = new String(cookie.value);
            }
        });
    }
    return val;	
}

/*
Func: $setSessionClass

	Set the class to use for session

Parameters: 

	clazz - A reference to the class	

Default: 

	FincayraSession
 */
Request.prototype.$setSessionClass = function(clazz) {
	return this.sessionMgr.setSessionClass(clazz);
};

/*
Func: $setMaxInactiveInterval
Set the max interval between session access in seconds

Parameters: 
seconds - The number of seconds to keep session alive between calls
 */
Request.prototype.$setMaxInactiveInterval = function(seconds) {
	this.sessionMgr.setMaxInactiveInterval(seconds);
};

/*
	func: $getHttpSession
	
	Returns:
	The javax.servlet.HttpSession
 */
Request.prototype.$getHttpSession = function() {
	return this.sessionMgr.getHttpSession();
};

/*
	Function: $getSession
	
	Returns:
	The fincayra session
 */
Request.prototype.$getSession = function() {
	return this.sessionMgr.getSession();
};

/*
	Function: $getAuthSession
	To accomidate session fixation this will invalidate the current session and dole out a new one 

	Returns:
	A new fincayra session
 */
Request.prototype.$getAuthSession = function() {
	return this.sessionMgr.getAuthSession();
};

/*
	Function: $invalidateSession
	Invalidate the session
 */
Request.prototype.$invalidateSession = function() {
	return this.sessionMgr.invalidateSession();
};

/*
	Function: $sendMail
	
		Execute a mail template and ultimately send it.
		
		If you want data to be accessible to the template use <$setPageParams>
	
	Parameters:

		msg - Am object representing the msg in the following format
		
		>{
		>	"Headers" : [{ "Name" : "CUSTOM-HEADER", "Value" : "value" }],
		>	"From" : "sender@example.com", //This will be set by the MailManager
		>	"To" : "receiver@example.com",
		>	"Cc" : "copied@example.com",
		>	"Bcc": "blank-copied@example.com",
		>	"Subject" : "Test",
		>	"Tag" : "Invitation",
		>	"HtmlBody" : "<b>Hello</b>", //This will be set to the doc result of the template if a path is passed
		>	"TextBody" : "Hello", //This will be set to $getPageParams().TextBody, so set it in the template if you want it
		>	"ReplyTo" : "reply@example.com"
		>}

		path - (optional) The path to the mail template js file relative to mailManager.templateDir

*/
Request.prototype.$sendMail = function(msg, path) {
	//get the current doc so we can create the message and set it back later
	var el = this.scope.context.getElement();
	
	if (path) {
		var template = this.$getPageDir() + $config().mailConfig.templateDir + path;
		$log().debug("mailTemplate:{}", template);
		this.$executePage(template);
		msg.HtmlBody = new String(this.scope.context.getElement().toString());
	}	
	if (this.$getPageParams().TextBody) { msg.TextBody = this.$getPageParams().TextBody;}
	

	$mm().send(msg);
	
	this.$d(el);
	
};

function FincayraSession(){};

FincayraSession.prototype.user = null;

/*
 * 
 * 
 */
function SessionManager(scope) {
	this.scope = scope;
};

SessionManager.prototype.sessionAttr = "fincayra";
SessionManager.prototype.session = null;
SessionManager.prototype.scope = undefined;

/*
 * 
 * 
 */	
SessionManager.prototype.sessionClass = FincayraSession;

/*
 * 
 * 
 */
SessionManager.prototype.setSessionClass = function(clazz) {
	this.sessionClass = clazz;
}

/*
 * 
 * 
 */
SessionManager.prototype.getHttpSession = function() {
	return this.scope.context.getRequest().getSession();
}

SessionManager.prototype.invalidateSession = function() {
	this.session = null;
	this.getHttpSession().invalidate();
}

/*
 * 
 * 
 */
SessionManager.prototype.getSession = function() {
	if (this.session == null) {
		var httpSession = this.getHttpSession();
		this.session = httpSession.getAttribute(this.sessionAttr);
		if (this.session == null) {
			this.session = eval("new " + $type(this.sessionClass) + "();");
			httpSession.setAttribute(this.sessionAttr, this.session);
		}
		$log().debug("SESSION CLASS TYPE:{}", $type(this.sessionClass));
	}
	
	return this.session;
}


SessionManager.prototype.getAuthSession = function() {
	//get the fincayra session
	var session = this.scope.context.getRequest().getSession(false);
	if (session != null) {
		var fSession = session.getAttribute(this.sessionAttr);;
		if (fSession != null) {
			//invalidate the current session
			session.invalidate();
			//set the fincayra session attribute
			this.getHttpSession().setAttribute(this.sessionAttr, fSession);
			this.session = null;
		}
	}

	return this.getSession();
		
}

/*
 * 
 * 
 */
SessionManager.prototype.setMaxInactiveInterval = function(seconds) {
	this.getHttpSession().setMaxInactiveInterval(seconds);
}
