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
function getTopics(uuid) {
	var user = $getSession().user;
	var topics = {}
	var nodes = [];
	
	new Topic().search("noteBook.owner.uuid = '{}' and noteBook.uuid = '{}'".tokenize(user.uuid,uuid)).each(function(topic) {
		topics[topic.uuid] = topic;
		nodes.push({			
			data : topic.name,
			metadata : {
				id : topic.id,
				uuid : topic.uuid,
				type : $type(topic)
			},
			children : getEntries(topic.uuid)
		});
	});
	
	var sorted = new NoteBook({uuid:uuid}).findByUUId().topics;
	
	if (sorted && sorted.length > 0) {
		nodes = [];
		sorted.each(function(uuid) {
			var topic = topics[uuid];
			nodes.push({			
				data : topic.name,
				metadata : {
					id : topic.id,
					uuid : topic.uuid,
					type : $type(topic)
				},
				children : getEntries(topic.uuid)
			});				
		});
	}
	return nodes;
}

function getEntries(uuid) {
	var user = $getSession().user;
	var entries = {}
	var nodes = [];
	
	new Entry().search("topic.noteBook.owner.uuid = '{}' and topic.uuid = '{}'".tokenize(user.uuid,uuid)).each(function(entry) {
		entries[entry.uuid] = entry;
		nodes.push({			
			data : entry.text.truncate(20,"...","  "),
			metadata : {
				id : entry.id,
				uuid : entry.uuid,
				type : $type(entry)
			}
		});
	});
	
	var topic = new Topic({uuid:uuid}).findByUUId();
	var sorted = topic.entries;
	
	if (sorted && sorted.length > 1) {
		nodes = [];
		sorted.each(function(uuid) {
			var entry = entries[uuid];
			if (entry == undefined) throw new Error("{} - {} with entry {} was not found".tokenize(topic.noteBook.name,topic.name, uuid));
			
			nodes.push({			
				data : entry.text.truncate(20,"...","  "),
				metadata : {
					id : entry.id,
					uuid : entry.uuid,
					type : $type(entry)
				}
			});				
		});
	}
	return nodes;
}
	
$api({
	defaultAction : function() {
		requireAuth();
		
		var user = $getSession().user;
		var tree = {
			data : "NoteBooks",
			state : "open",
			children : []
		};
		
		new NoteBook({owner:user}).findByProperty("owner").each(function(noteBook) {
			tree.children.push({
				data : noteBook.name,
				metadata : {
					id : noteBook.id,
					uuid : noteBook.uuid,
					type : $type(noteBook)
				},
				children : getTopics(noteBook.uuid)
			});
		});
		
		$j(tree);
		
	},
	
	getTopics : function() {
		requireAuth();
		
		var user = $getSession().user;
		var uuid = $getPageParams().uuid;
		var topics = {}
		var nodes = [];
		
		new Topic().search("noteBook.owner.uuid = '{}' and noteBook.uuid = '{}'".tokenize(user.uuid,uuid)).each(function(topic) {
			topics[topic.uuid] = topic;
			nodes.push({			
				data : topic.name,
				metadata : {
					id : topic.id,
					uuid : topic.uuid,
					type : $type(topic)
				}
			});
		});
		
		var sorted = new NoteBook({uuid:uuid}).findByUUId().topics;
		
		if (sorted && sorted.length > 0) {
			nodes = [];
			sorted.each(function(uuid) {
				var topic = topics[uuid];
				nodes.push({			
					data : topic.name,
					metadata : {
						id : topic.id,
						uuid : topic.uuid,
						type : $type(topic)
					}
				});				
			});
		}
		
		$j(nodes);
		
	}

});
})();


