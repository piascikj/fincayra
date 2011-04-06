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
var msgEl = $("#message");

Templates.mail({
	before : function(data) {
		var name = data.user.name;
		$("#userName").html(name);
		$("#appName").html($app().name);

		var resetString = $encode(data.user.resetString);

		msgEl.append("<br/>" + $href({page:"recover?resetString=" + resetString, ssl:true}));
	},
	
	text : $('#greeting').text()  + "\n" + msgEl.text(),
	
	subject : $app().name + " account recovery"
});