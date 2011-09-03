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
var user = getSessionUser();
var lastTopic;
var type = "root";

function getTopicNode(topic) {
	return {			
		data : {
			title: topic.name,
			icon : "ui-icon ui-icon-folder-collapsed"
		},
		attr : {"class":classes},
		metadata : {
			"object" : {id:topic.id, uuid:topic.uuid, name:topic.name},
			type : $type(topic)
		},
		children : (type == "root" && topic.id == lastTopic.id)?getEntries(topic.uuid):[],
		state : (user.lastTopicId == topic.id && type == "root")?"open":"closed"
		
	};
}

function getEntryNode(entry) {
	entry.text = entry.text.replace(/\n.*/g, "").truncate(40,"...","   ");
	return {			
		data : entry.text,
		attr : {"class":classes},
		metadata : {
			"object" : {id:entry.id,uuid:entry.uuid,text:entry.text},
			type : $type(entry)
		}
	};
}

function getNoteBookNode(noteBook) {
	return {
		data : {
			title : noteBook.name,
			icon : "ui-icon ui-icon-note"
		},
		attr : {"class":classes},
		metadata : {
			"object" : {id: noteBook.id, uuid:noteBook.uuid, name:noteBook.name},
			type : $type(noteBook)
		},
		children : (type == "root" && lastTopic.noteBook.id == noteBook.id)?getTopics(noteBook.uuid):[],
		state : (lastTopic && noteBook.id == lastTopic.noteBook.id)?"open":"closed"
	};
}

function getNoteBooks() {
	if (user.lastTopicId) lastTopic = new Topic({id:user.lastTopicId}).findById();
	
	var noteBooks = {}
	var nodes = [];
	
	new NoteBook({owner:user}).findByProperty("owner").each(function(noteBook) {
		noteBooks[noteBook.uuid] = noteBook;
		nodes.push(getNoteBookNode(noteBook));
	});
	
	user = user.findById();
	var sorted = user.noteBooks;
	
	if (sorted && sorted.length > 1) {
		nodes = [];
		sorted.each(function(uuid) {
			var noteBook = noteBooks[uuid];
			if (noteBook == undefined) throw new Error("Not found");
			
			nodes.push(getNoteBookNode(noteBook));				
		});
	}
	return nodes;
}

function getTopics(uuid) {
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
	getNodes : function() {
		requireAuth();
		type = $apiAction(1);
		var uuid = $apiAction(2);
		var nodes = [];
		
		switch (type) {
			case "root":
				nodes = getNoteBooks();
				break;
			case "NoteBook":
				nodes = getTopics(uuid);
				break;
			case "Topic":
				nodes = getEntries(uuid);
				break;
		}
		
		$j(nodes);
	},
	/*
		Func: moveNoteBook
		Move a NoteBook to a different position
		
		params:
		position - The position the NoteBook should be in.
		uuid - The uuid of the NoteBook to move
	*/
	moveNoteBook : function() {
		requireAuth();
		var p = $getPageParams(true);
		if (p.position == undefined || p.uuid == undefined) throw new Error("Invalid params");
		
		var noteBook = new NoteBook({uuid:p.uuid}).findByUUId();
		
		if (noteBook == undefined) throw new Error("Object not found");
		
		var sorted = user.noteBooks;
		var placeholder = "PLACEHOLDER";
		
		if (sorted == undefined || sorted.length < 1) {
			var noteBooks = new NoteBook({owner:user}).findByProperty("owner");
			sorted = [];
			noteBooks.each(function(t, i) {
				sorted.push(t.uuid);
			});
		}
		
		if (sorted && sorted.length > 0) {
			//Add the noteBook to the list
			dirtySorted = sorted.replaceString(noteBook.uuid, placeholder);
			$log().debug("dirtySorted:{}", JSON.stringify(dirtySorted));
			dirtySorted.splice(p.position,0,noteBook.uuid);
			$log().debug("dirtySorted after splice:{}", JSON.stringify(dirtySorted));
			//remove the placeholder
			user.noteBooks = dirtySorted.removeString(placeholder);
			$log().debug("noteBooks:{}", JSON.stringify(user.noteBooks));
			user.save();
		} 
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
			topics.each(function(t, i) {
				sorted.push(t.uuid);
			});
		}
		
		if (sorted && sorted.length > 0) {
			//Add the topic to the list
			dirtySorted = sorted.replaceString(topic.uuid, placeholder);
			$log().debug("dirtySorted:{}", JSON.stringify(dirtySorted));
			dirtySorted.splice(p.position,0,topic.uuid);
			$log().debug("dirtySorted after splice:{}", JSON.stringify(dirtySorted));
			//remove the placeholder
			newNoteBook.topics = dirtySorted.removeString(placeholder);
			$log().debug("topics:{}", JSON.stringify(newNoteBook.topics));
			newNoteBook.save();
		} 
		
		if (!newNoteBook.equals(topic.noteBook)) {
			//remove the topic from the old NoteBook
			var oldNoteBook = topic.noteBook;
			if (oldNoteBook.topics && oldNoteBook.topics.length > 0) {
				oldNoteBook.topics = oldNoteBook.topics.removeString(topic.uuid);
				oldNoteBook.save();
			}
			
			//set the newNoteBook
			topic.noteBook = newNoteBook;
			topic.save();
		}
	},
	
	/*
		Func: moveEntry
		Move an entry to a different position or a different topic
		
		params:
		newParent - The uuid of the topic the entry is moving to
		position - The position the entry should be in.
		uuid - The uuid of the entry to move
	*/
	moveEntry : function() {
		requireAuth();
		var p = {
			newParent : undefined,
			position : undefined,
			uuid : undefined,
			positionOffset : true //This should be true if old position is taken into account with position passed in (jsTree) 
		}.extend($getPageParams(true));
		
		if (p.position == undefined || p.uuid == undefined) throw new Error("Invalid params");
		
		var entry = new Entry({uuid:p.uuid}).findByUUId();
		var newTopic = p.newParent?new Topic({uuid:p.newParent}).findByUUId():entry.topic;
		
		if (newTopic == undefined || entry == undefined) throw new Error("Object not found");
		
		var sorted = newTopic.entries;
		var placeholder = "PLACEHOLDER";
		
		if (sorted == undefined || sorted.length < 1) {
			var entries = new Entry({topic:{id:newTopic.id}}).findByProperty("topic");
			sorted = [];
			entries.each(function(t, i) {
				sorted.push(t.uuid);
			});
		}
		
		$log().debug("position:{}", p.position);
		if (sorted && sorted.length > 0) {
			if (p.positionOffset) {
				//Add the entry to the list
				var dirtySorted = sorted.replaceString(entry.uuid, placeholder);
				$log().debug("dirtySorted:{}", JSON.stringify(dirtySorted));
				dirtySorted.splice(p.position,0,entry.uuid);
				$log().debug("dirtySorted after splice:{}", JSON.stringify(dirtySorted));
				//remove the placeholder
				newTopic.entries = dirtySorted.removeString(placeholder);
			} else {
				sorted = sorted.removeString(entry.uuid);
				sorted.splice(p.position,0,entry.uuid);
				newTopic.entries = sorted;
			}
			$log().debug("entries:{}", JSON.stringify(newTopic.entries));
			newTopic.save();
		} 
		
		if (!newTopic.equals(entry.topic)) {
			//remove the entry from the old Topic
			var oldTopic = entry.topic;
			if (oldTopic.entries && oldTopic.entries.length > 0) {
				oldTopic.entries = oldTopic.entries.removeString(entry.uuid);
				oldTopic.save();
			}
			
			//set the newTopic
			entry.topic = newTopic;
			entry.save();
		}
	}
});
})();


