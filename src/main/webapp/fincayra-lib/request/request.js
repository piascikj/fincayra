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
//Get a reference to the request scope
var scope = this, req;

try {
	req = new Request(scope);

	//Put all request functions in scope
	for (prop in req) {scope[prop] = req[prop];}

	//Run the onRequest callback
	$config().onRequest(scope);
	
	//Here we execute the requested page
	$log().debug("Loading requested page: {}", $getCurrentPage());
	var currentPage = $getCurrentPage();
	$log().debug("RequestURI:{}",$getRequestURI());
	if ($getRequestURI().match(/^\/api/)) {
		$setCurrentPage("/api.js");
		$executePage($app().mergeEngine.jsDir + "/pages/api.js");
	} else if (currentPage != null) {
		$e(currentPage);
	} else {
		$redirect($getErrorPage());
	}

} catch(e) {
	$log().error("Caught an exception while running global request file");
	e.printStackTrace();
	$setPageParams({error:e});
	$log().debug("isAPI:{}", scope.isAPI);
	if (scope.isAPI == true) {
		$setStatus(400);
		$j({error:e});
	} else {
		$f($getErrorPage());
	}
} finally {
	
}
