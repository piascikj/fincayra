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

function Simple () {
	
	var nav = $("#navigation");
	var signNav = $("#sign_nav");

	
	if (!$getSession().user || $getSession().user == null) {
		signNav.append($href({page:"register", text:"Register", ssl:true}));
		signNav.append($href({page:"login", text:"Sign In", ssl:true}));
	} else {
		var user = getSessionUser();
		$setMaxInactiveInterval(60 * 45);
		
		var pageVars = {
			user : user
		};
		
		signNav.append("<span style='padding-right:10px'>" + user.email + "</span>");
		signNav.append($href({page:"account",text:"Account"}));
		signNav.append($href({page:"logout",text:"Sign Out"}));

		$appendScript('head',"$.extend(true,fincayra,{});".tokenize(JSON.stringify(pageVars)));

	}

	//this should go away when in prod
	if ($config().dev) nav.append($href({page:"dev/utils", text:"Utils"}));
	//nav.append($href({page:"notebooks/", text:"NoteBooks"}));
	
	var logoLink = $("#logo_link");
	//logoLink.html($config().name);
	logoLink.attr("href", $app().url);
	$("head").prepend('<link rel="shortcut icon" href="' + $app().url + 'images/favicon.ico">');
};

Simple.feedback = function(msg, type) {
	var feedback = $("#feedback");
	feedback.append(msg);
	var classes = feedback.attr("class");
	feedback.attr("class", classes + " " + type);
	feedback.attr("style", "display: block;");	
};

$debug("Creating new simple...");
new Simple();
$debug("Done Creating new simple...");
