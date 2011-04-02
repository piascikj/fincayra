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
	Templates.simple( {
		title : "Sorry"
	});
	var params = $getPageParams();
	var el = $('#content');
	if (el == undefined || el == null) el = $("body");
	
	el.append("<h2>An error occured while processing your request.</h2>");
	
	var error = params.error;
	if (error != undefined) {
		if (error.uiMessage != undefined) {
			el.append("<p>{}</p>".tokenize(error.uiMessage));
		} else if (error.message != undefined) {
			el.append("<pre>{}</pre>".tokenize(error.message));
		}
	} else {
		el.append("<pre>{}</pre>".tokenize(JSON.stringify(params,null,"   ")));
	}
})();
