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
(function() {
	var auth = false;
	var params = $getPageParams();
	var session = $getSession();

	Templates.simple({
		requireSSL : true,	
		title : "Login",
		
		//runs before the simple template is loaded into the document
		before : function() {
			$("#forgot").attr("href", $app().url + "forgot");
			
			if (session.singlePageAuth) {
				$('#email').attr("hidden", "true").after('<span class="static-value">{}</span>'.tokenize(session.user.email));
				$('#password').attr("autocomplete", "off");
				$("#form_box p.title").html('Please verify your password');
			} else {
				$("#form_box p.title").append("<strong>" + $app().name + "</strong>");
			}	
			
			if ($getMethod() == Methods.POST) {
				//Get the user from the params
				var user = session.singlePageAuth?session.user:new User(params);
				var password = params.password;
				//lookup the user
				var users = [];
				try {
					users = user.findByProperty("email");
					$log().debug("Found " + users.length + " users");
				} catch (e){
					e.printStackTrace();
					//TODO need to work on messaging
					$("#form_box").prepend("<h3>" + e.name + "</h3>");
				}
				if (users.length > 0) {
					user = users[0];
					auth = user.authenticate(password);
				}
				
				//Is this an auth for a single page or for the app
				if (auth && !session.singlePageAuth) {
					$getAuthSession().user = user;
					if (params.persistent == "y") setPersistentKey(user);
					//Keep session alive for 1hr
					$setMaxInactiveInterval(60 * 45);
				} else {
					$("#form_box").prepend("<p>Cannot sign in with the email and password combination entered.  <br/>Please try again or Sign up for a new account.</p>");
				}
				
			}
		}
	});
	
	if (auth) {
		
		//If we just logged in and the request was for a different page, then redirect
		if(session.destination) {
			var dest = session.destination;
			session.destination = false;
			$redirect(dest);
		} else {
			//redirect to default page
			forwardToDefault();
		}
	} else if (session.user && !session.singlePageAuth) {
		//redirect to home if already logged in
		$redirect($app().url);
	}
})();
