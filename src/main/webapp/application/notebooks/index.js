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
	var user = $getSession().user;
	var error = null;

	//Extend the Simple template - it only needs a title
	Templates.simple({
		requireAuth : true,
		title : "NoteBooks",
		
		before : function() {}
	});
	
	var pageVars = {
		dev : $config().dev,
		getNoteBooks : "/api/NoteBook?qry=owner.uuid = '{}'".tokenize(user.uuid),
		saveNoteBook : "/api/NoteBook",
		deleteNoteBook : "/api/NoteBook/{}",
		getTopics : "/api/Topic?qry=noteBook.uuid = '{}' order by name",
		saveTopic : "/api/Topic",
		deleteTopic : "/api/Topic/{}",
		getLastTopic : "/notebooks/api/topic/getLastTopic",
		setLastTopic : "/notebooks/api/topic/setLastTopic/{}",
		getEntries : "/api/Entry?qry=topic.uuid = '{}' order by createDate desc",
		saveEntry : "/api/Entry",
		deleteEntry : "/api/Entry/{}",
		noteBooks : {},
		topics : {},
		autoSaveIncrement : 1000*20 //save once every twenty seconds
	};
	
	new NoteBook({owner:{id:user.id}}).findByProperty("owner").each(function(val) {pageVars.noteBooks[val.uuid]=val});
	
	$appendScript('head',"$.extend(true,fincayra,{});".tokenize(JSON.stringify(pageVars)));

})();
