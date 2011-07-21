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

	//Extend the Simple template - it only needs a title
	Templates.simple({
		requireSSL : true,	
		title : "Register",
		
		before : function() {

			$("#form_box p.title").append("<strong>" + $app().name + "</strong>");

			//If it's post we know someone submitted something
			if ($getMethod() == Methods.POST) {
				

				user.mailTo = user.email;
				//This is used to prefill form fields if we find a bad value

				var fillForm = function() {
					$("#name").val(user.name);
					$("#nickname").val(user.nickname);
					$("#email").val(user.email);
				};
				
				//Validate the user object
				var result = user.validate();
				if (!user.password.equals(user.retype_password)) {
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
					fillForm();
				} else {
					user.role = Role.user;
					try {
						//Save the new user
						user = user.save();
						//Send them an email
						$log().debug("sending reg email to {}",user.email);
						
						$sendMail({
							Subject : "Welcome to " + $config().name + "!",
							To : user.mailTo,
							Tag : $config().name
						}, "/user/regConfirm.js");

					} catch(e) {
						e.printStackTrace();
						if(e.javaException) {
							error = "CAUGHT JAVA EXCEPTION" + e.javaException.message;
						} else if (e.field) {
							error = "There is already someone registered with the " + e.field + ", " + params[e.field] +
									".  Please register with a different " + e.field + ".";
						} else {
							error = "CAUGHT RHINO EXCEPTION" + e.name;
						}
						fillForm();
					}
				}
				
				
			}
		}
	});

	var content = $("#content");
	if (user && user.id) {
		content.html("<h2>Thanks!</h2><p>for registering  with Fincayra</p>");
	} else if (error != null) {
		Simple.feedback(error, "error");
	}
	 
})();
