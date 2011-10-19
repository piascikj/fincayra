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
	var packages = new JavaImporter(com.mongodb);
	var things = [];
	with (packages) {
		var start = new Date();
		var m = new Mongo( "localhost" );	
		var db = m.getDB( "mydb" );
		coll = db.getCollection("things");
		var cur = coll.find();
		while(cur.hasNext()) {
			things.push(cur.next());
		}
		var end = new Date();
		
		$j({things:things, duration:end.getTime()-start.getTime(), id:new String(things[0].get("_id"))});
	}
})();

