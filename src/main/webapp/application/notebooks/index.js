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
	
	//Extend the Simple template - it only needs a title
	Templates.simple({
		requireAuth : true,
		title : "NoteBooks"
	});
	var user = $getSession().user;
	
	if (user) {
		var params = $getPageParams();
		var error = null;
		var pageVars = {
			dev : $config().dev,
			defaultError : "Something went wrong.",
			mail : "/notebooks/api/mail",
			login : $app().secureUrl + "login",
			treeData : "/notebooks/api/organize/getNodes",
			moveNoteBook : "/notebooks/api/organize/moveNoteBook",
			moveTopic : "/notebooks/api/organize/moveTopic",
			moveEntry : "/notebooks/api/organize/moveEntry",
			getNoteBooks : "/api/NoteBook",
			saveNoteBook : "/api/NoteBook",
			deleteNoteBook : "/api/NoteBook/{}",
			getTopics : "/api/Topic?qry=noteBook.uuid = '{}' order by name",
			getTopic : "/api/Topic/{}",
			saveTopic : "/api/Topic",
			deleteTopic : "/api/Topic/{}",
			getLastTopic : "/notebooks/api/utility/getLastTopic",
			setLastTopic : "/notebooks/api/utility/setLastTopic/{}",
			getEntries : "/notebooks/api/get/entries?topicUUId={}&offset={}&limit={}",
			entryLimit : 2,
			saveEntry : "/api/Entry",
			deleteEntry : "/api/Entry/{}",
			searchEntries : "/api/search/Entry?defaultField=text&qry={}",
			getEntry : "/api/Entry?qry=uuid = '{}'",
			noteBooks : {},
			topics : {},
			entries : {},
			autoSaveIncrement : 1000*60, //save once every minute
			keepAlive : "/api/keepAlive",
			keepAliveIncrement : 1000*60*5 //send keepAlive every 5 minutes
		};
		
		//Load the notebooks to the page so no ajax call is needed to get them
		new NoteBook({owner:{id:user.id}}).findByProperty("owner").each(function(val) {pageVars.noteBooks[val.uuid]=val});
		
		$appendScript('head',"$.extend(true,fincayra,{});".tokenize(JSON.stringify(pageVars)));

	}
})();
