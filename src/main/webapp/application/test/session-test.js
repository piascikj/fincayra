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
	$('#content').append("Session Data");

	$getSessionCache().keySet().toArray().each(function(val) {
		$('#content').append("<li>{}={}</li>".tokenize(val, JSON.stringify($getSessionCache().get(val))));
	});

	var sid = $getCookie(SessionManager.sessionAttr);
	var session = $getSessionCache().get(sid.toString());
	$('#content').append("<p>{}={}</p>".tokenize(sid,JSON.stringify(session)));
})();
