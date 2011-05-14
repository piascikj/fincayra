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

if ($config().dev) $setLogLevel({level:$log.Level.DEBUG});

load("db/store.js");

//Set the $load function to load from the server-js dir for application convenience
(function() { var _l = $l; $l = $load = function(file) { _l("../application/server-js/" + file);};})();

$l("app-root.js");

//Now we register the storables in the persistenceManager
$om().initDb();
$log().debug(JSON.stringify($om().classDefs, null, "   "));

//Run the post init callback
$log().info("Running config.postInit");
$config().postInit();

/*
	class: Request
	
	Encapsulates all functions available at the request scope
	
	Parameters:
	
	scope - The request scope
*/
function Request(scope) { 
	this.sessionMgr = new SessionManager(scope);
	this.isAPI = false;
	this.scope = scope;
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
			if (req != "") obj = JSON.parse(req);
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
		$log().error("Caught exception while trying to load JavaScript file: {}", jsPage);
		e.printStackTrace();
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
		actions - an object containing a mapping of action names to functions
*/
Request.prototype.$api = function(actions) {
	var action = this.$getExtraPath().split("/")[0];
	if (actions[action] != undefined) {
		this.isAPI = true;
		actions[action]();
	}
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
Request.prototype.$getInstance = function(type, params) {
	return eval("new " + type + "(params);");
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
	func: $getSession
	
	Returns:
	The fincayra session
 */
Request.prototype.$getSession = function() {
	return this.sessionMgr.getSession();
};

/*
 func:$getAuthSession
 To accomidate session fixation this will invalidate the current session and dole out a new one 
 
 Returns:
 A new fincayra session
 */
Request.prototype.$getAuthSession = function() {
	return this.sessionMgr.getAuthSession();
};

/*
	Function: $sendMail

		Execute a mail template and ultimately send it

	Parameters:
		
		path - The path to the mail template js file relative to mailManager.templateDir
		data - Am object to be accessible in the template as context.messageData
*/
Request.prototype.$sendMail = function(path, data) {
	var el = this.scope.context.getElement();
	
	var msg = $app().getMailManager().createMessage(true);
	var helper = msg.getMimeMessageHelper();
	helper.setFrom($config().mailSender.fromEmail);

	this.scope.context.messageHelper = helper;
	this.scope.context.messageData = data;
	
	var template = this.$getPageDir() + $config().mailSender.templateDir + path;
	$log().debug("mailTemplate:{}", template);
	this.$executePage(template);
	
	$app().getMailManager().send(msg);
	
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




