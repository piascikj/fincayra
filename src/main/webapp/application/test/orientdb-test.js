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
		title : "orientDB-Test"
	});


	var params = $getPageParams();

	//This is where we put some things
	var content = $("#content");
	var p = function(str) {
		return content.append("<pre>" + str + "</pre>");
	};

	var h2 = function(str) {
		return content.append("<h2>" + str + "</h2>");
	};

	//TODO conect to the master db
	var url = "remote:" + $om().getMaster() + "/" + $om().dbName;
	$log().info("Not the master, connecting to {}", url);
	db = com.orientechnologies.orient.core.db.document.ODatabaseDocumentPool.global().acquire(url,"admin", "admin");
	
	$j(new User($getSession().user).findById(db));

})();
