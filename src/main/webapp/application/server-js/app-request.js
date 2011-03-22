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

//This function will redirect to login if user is not authenticated
//Upon authentication you will be recirected to your detination
var requireAuth = function() {
	if(!$getSession().user) {
				//set the destination so we can take them there after login
				$getSession().destination = $getRequestURL();
				var redirectTo = $app().secureUrl + "login";
				$redirect(redirectTo);
	}
};

//This object holds all the page templates for the app
//You may extend it by
var Templates = {
	
	basic : function(config) {
		if(config && $type(config) == "Object") {
			//Check if ssl is required
			if(config.requireSSL) {
				$requireSSL();
			}
			 
			//Check if auth is required and redirect
			if (config.requireAuth) {
				requireAuth();
			}
			
			//run the before, pre-extend
			if(config.before) config.before();
			
			//If widget is passed, don't use template
			if(!$getPageParams().widget) {
				//Grab the body of the page that is using this template
				var body = $("body"); 
				var head = $("head");
				
				$e(config.page); //Here we extend the templates html by placing it in the dom
				
				//config.title
				if (config.title) $("title").html($app().name + " - " + config.title); //We set the title
				
				if (body) $(config.contentSelector).html(body.html()); //set the content of the template to the requested page
				if (head) $("head").append(head.html());
			}
				
		}
	},
	
	/*
	Templates.simple({
		title : "Sign-in",
		contentSelector : "#content",
		requireSSL : true,
		requireAuth : true,
		before : function() {},
		after : function() {},
	});
	*/
	simple : function(config) {
		try {
			config.page = "/templates/simple.html";
			config.contentSelector = "#content";
			this.basic(config);
		} catch (e) {
			$debug(e);
			throw e;
		} finally {
			if ($app().reloadRootScope) {
				//TODO we need to make this a side tab initiated thing
				//$source();
				//$debug(context.element.html());
			}
		}
	},
	
	mail : function(config) {
		var data = context.messageData;
		if (data.user) {

			if (config.before) config.before(data);
			
			//Grab the body of the page that is using this template
			var body = $("body"); 
			
			$e("/templates/simple.html"); //Here we extend the templates html by placing it in the dom
			
			if (body) $("body").append(body.html()); //set the content of the template to the requested page
			
			//Now that we've modified the markup, lets set up the message
			helper = context.getMessageHelper();
			
			helper.setTo(data.user.email);
			
			if (config.subject) {
				helper.setSubject(config.subject);
			} else {
				helper.setSubject($app().name);
			}
			
			var d = context.element;
			if (config.text) {
				helper.setText(config.text, d.html());
			} else {
				helper.setText(d.html(), true);
			}
		}	
	}
};



	




