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
	var user = null;
	var form = $("#reset_form_box");
	var method = $getMethod();
	Templates.simple({
		requireSSL : true,	
		title : "Forgot",
		
		//runs before the simple template is loaded into the document
		before : function() {
			$("#appName").html($app().name);
			if (method == Methods.POST) {
				//Get the user from the params
				user = new User($getPageParams());
				//lookup the user
				var users = [];
				try {
					users = user.findByProperty("email");
				} catch (e){
					//TODO need to work on messaging
					form.prepend("<h3>" + e.name + "</h3>");
				}

				if (users.length > 0) {
					user = users[0];
					user.getResetString();
					user = user.save();
					//Send them an email
					$sendMail("/user/reset.js",{user:user});
					
				}
				
			}
		}
	});
	
	if (method == Methods.POST) {
		$debug("PARENT: " + form.parent().html());
		
		Simple.feedback("<p>An account recovery email has been sent to " + user.email + ".  Follow the instructions in the email to recover your account.</p>", "info");
		$("#content").html("");
	}
	

})();
