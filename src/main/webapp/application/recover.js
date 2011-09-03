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
	//populate the user from the params
	var params = $getPageParams();
	var user = new User(params);
	var error = null;
	var success = false;
	var result = null;
	
	//First check if we have a user
	var users = [];
	if (user.resetString) users = user.findByProperty("resetString");
	if (users.length < 1) users = [getSessionUser()];
	if (users.length < 1) $redirect($app().url);
	user = users[0];

	
	//Extend the Simple template - it only needs a title
	Templates.simple({
		requireSSL : true,
		title : "Account Recovery",
		
		before : function() {

			//TODO need to check if reset string is expired???
			$("#form_box p.title").append("<strong>" + user.name + "</strong>");
			$("#resetString").val(user.resetString);
			
			if ($getMethod() == Methods.POST) {
				//If it's post we know someone submitted something
				
				//Validate the user object
				var result = user.validate();

				if (!params.password.equals(params.retype_password)) {
					//Make sure passwords match
					if (result == null) result = {};
					result.retype_password = "Passwords do not match!";
				}
				
				//If there are errors on specific fields, show them
				if (result != null) {
					for(prop in result) { if (result.hasOwnProperty(prop)) {
						//This puts the error with the label
						$("[for=" + prop + "]").append("<span class='error'>" + result[prop] + "</span>");
					}}
				} else if (user.resetOK(params.resetString) || $getSession().user) {
					try {
						user.password = params.password;
						user.reset = true;
						removePersistentKey();
						//Save the user
						user = user.save();
						success = true;
						//Send them an email that informs them that their password has been changed
						$setPageParams({user:user});
						$sendMail({
							Subject : $config().name + " account activity",
							To : user.mailTo,
							Tag : $config().name + " account activity"
						}, "/user/resetConfirm.js");

					} catch(e) {
						if(e.javaException) {
							error = "CAUGHT JAVA EXCEPTION" + e.javaException.message;
						} else if (e.field) {
							error = "There is already someone registered with the " + e.field + ", " + params[e.field] +
									".  Please register with a different " + e.field + ".";
						} else {
							error = "CAUGHT RHINO EXCEPTION" + e.name;
						}
					}
				} else {
						error = "We are unable to reset your password at this time.";
				}
				
				
			}
		}
	});
		
	var content = $("#content");
	if (success && user && user.id) {
		content.html("<h2>Thanks!</h2><p>Your password has been changed.</p>");
	} else if (error != null) {
		Simple.feedback(error, "error");
	}

})();
