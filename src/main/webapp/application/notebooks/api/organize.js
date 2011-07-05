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
	
var classes = "";

function getTopicNode(topic) {
	return {			
		data : topic.name,
		attr : {"class":classes},
		metadata : {
			"object" : topic,
			type : $type(topic)
		},
		children : getEntries(topic.uuid)
	};
}

function getEntryNode(entry) {
	entry.text = entry.text.replace(/\n.*/g, "").truncate(40,"...","   ");
	return {			
		data : entry.text,
		attr : {"class":classes},
		metadata : {
			"object" : entry,
			type : $type(entry)
		}
	};
}

function getNoteBookNode(noteBook) {
	return {
		data : noteBook.name,
		attr : {"class":classes},
		metadata : {
			"object" : noteBook,
			type : $type(noteBook)
		},
		children : getTopics(noteBook.uuid)
	};
}

function getTopics(uuid) {
	var user = $getSession().user;
	var topics = {}
	var nodes = [];
	
	new Topic().search("noteBook.owner.uuid = '{}' and noteBook.uuid = '{}'".tokenize(user.uuid,uuid)).each(function(topic) {
		topics[topic.uuid] = topic;
		nodes.push(getTopicNode(topic));
	});
	
	var sorted = new NoteBook({uuid:uuid}).findByUUId().topics;
	
	if (sorted && sorted.length > 0) {
		nodes = [];
		sorted.each(function(uuid) {
			var topic = topics[uuid];
			nodes.push(getTopicNode(topic));				
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
		nodes.push(getEntryNode(entry));
	});
	
	var topic = new Topic({uuid:uuid}).findByUUId();
	var sorted = topic.entries;
	
	if (sorted && sorted.length > 1) {
		nodes = [];
		sorted.each(function(uuid) {
			var entry = entries[uuid];
			if (entry == undefined) throw new Error("{} - {} with entry {} was not found".tokenize(topic.noteBook.name,topic.name, uuid));
			
			nodes.push(getEntryNode(entry));				
		});
	}
	return nodes;
}
	
$api({
	treedata : function() {
		requireAuth();
		
		var user = $getSession().user;
		var tree = {
			data : "NoteBooks",
			state : "open",
			children : [],
			metadata: {
				object : {},
				type : "root"
			}
		};
		
		new NoteBook({owner:user}).findByProperty("owner").each(function(noteBook) {
			tree.children.push(getNoteBookNode(noteBook));
		});
		
		$j(tree);
		
	},
	
	/*
		Func: moveTopic
		Move a topic to a different position or a different notebook
		
		params:
		newParent - The uuid of the NoteBook the topic is moving to
		position - The position the topic should be in.
		uuid - The uuid of the topic to move
	*/
	moveTopic : function() {
		requireAuth();
		var user = $getSession().user;
		var p = $getPageParams(true);
		if (p.newParent == undefined || p.position == undefined || p.uuid == undefined) throw new Error("Invalid params");
		
		var newNoteBook = new NoteBook({uuid:p.newParent}).findByUUId();
		var topic = new Topic({uuid:p.uuid}).findByUUId();
		
		if (newNoteBook == undefined || topic == undefined) throw new Error("Object not found");
		
		var sorted = newNoteBook.topics;
		var placeholder = "PLACEHOLDER";
		
		if (sorted == undefined || sorted.length < 1) {
			var topics = new Topic({noteBook:{id:newNoteBook.id}}).findByProperty("noteBook");
			sorted = [];
			topics.each(function(topic, i) {
				sorted.push(topic.uuid);
			});
		}
		
		if (sorted && sorted.length > 0) {
			//Add the topic to the list
			var joinSorted = sorted.join("|");
			$log().debug("joinSorted:{}", joinSorted);
			joinSorted = joinSorted.replace(topic.uuid, placeholder);
			dirtySorted = joinSorted.split("|");
			dirtySorted.splice(p.position,0,topic.uuid);
			//remove the placeholder
			dirtyJoinSorted = dirtySorted.join("|");
			$log().debug("dirtyJoinSorted:{}", dirtyJoinSorted);
			joinSorted = dirtyJoinSorted.replace(placeholder, "").replace("||","|").replace(/^\|/,"").replace(/\|$/,"");
			$log().debug("joinSorted:{}", joinSorted);
			newNoteBook.topics = joinSorted.split("|");
			newNoteBook.save();
		} 
		
		if (!newNoteBook.equals(topic.noteBook)) {
			//TODO remove the topic from the old NoteBook
			//set the newNoteBook
			topic.noteBook = newNoteBook;
			topic.save();
		}
	},
	
	moveEntry : function() {
		requireAuth();
		var user = $getSession().user;
		var p = $getPageParams(true);
		if (p.oldParent == undefined || p.newParent == undefined || p.position == undefined) throw new Error("Invalid params");
		
		//TODO if moving to a position higher than current, subtract 1
	}
});
})();


