

function NoteBook(clone) {
	this.createDate = new Date();
	this.isSearch = false;
	this.extend(new Storable(clone));
	
	this.onRemove = function(db) {
		$log().debug("Removing NoteBook:{}", this.json());
		var self = this;
		var owner = self.owner;
		if (owner.noteBooks && owner.noteBooks.length > 0) {
			owner.noteBooks = owner.noteBooks.removeString(self.uuid);
			owner.save(db);
		}
		
		var topics = new Topic({noteBook:self}).findByProperty("noteBook");
		topics.each(function(topic) {
			topic.remove(db);
		});
	};
		
	this.onSave = function(db) {
		var self = this;		
		var owner = new User(self.owner).findById(db);
		
		if (owner.noteBooks == undefined) {
			owner.noteBooks = [];
		}
		
		if (owner.noteBooks.join("|").indexOf(self.uuid) < 0) {
			owner.noteBooks.push(self.uuid);
			owner.save(db);
		}
	
	};	
};

new NoteBook().define({
	name:{
		index:true,
		pattern:/^([a-zA-Z0-9 .'-_&\/,!@#\$\?%])+$/,
		error:"Must be letters, numbers, spaces and .'-_&/,!@#$?%",
		search:{}
	},
	
	owner:{
		rel: Relationship.hasA,
		required: true,
		type: User,
		search:{}
	},
	
	createDate:{
		required: true,
		type: Type.Date
	},
	
	topics:{
		rel: Relationship.ownsMany
	},
	
	isSearch:{
		type:Type.Boolean
	}
});

function Topic(clone) {
	this.createDate = new Date();
	this.extend(new Storable(clone));
	this.onRemove = function(db) {
		var self = this;
		var noteBook = self.noteBook;
		if (noteBook.topics && noteBook.topics.length > 0) {
			noteBook.topics = noteBook.topics.removeString(self.uuid);
			noteBook.save(db);
		}
		
		var entries = new Entry({topic:self}).findByProperty("topic");
		entries.each(function(entry) {
			entry.remove(db);
		});
	};
	
	this.onSave = function(db) {
		var self = this;		
		var noteBook = new NoteBook(self.noteBook).findById(db);
		if (noteBook.topics && noteBook.topics.length > 0 && noteBook.topics.join("|").indexOf(self.uuid) < 0) {
			noteBook.topics.push(self.uuid);
			noteBook.save(db);
		}
	
	};
}

new Topic().define({
	name:{
		index:true,
		pattern:/^([a-zA-Z0-9 .'-_&\/,!@#\$\?%])+$/,
		error:"Must be letters, numbers, spaces and .'-_&/,!@#$?%",
		search:{}
	},
	
	noteBook:{
		rel: Relationship.hasA,
		required: true,
		type: NoteBook,
		search:{}
	},
	
	createDate:{
		required:true,
		type:Type.Date
	},

	entries:{
		rel: Relationship.ownsMany
	}
});

function Entry(clone) {
	this.createDate = new Date();
	this.extend(new Storable(clone));
	this.onRemove = function(db) {
		var self = this;
		var topic = self.topic;
		if (topic.entries && topic.entries.length > 0) {
			topic.entries = topic.entries.removeString(self.uuid);
			topic.save(db);
		}
	};
	
	this.onSave = function(db) {
		var self = this;		
		var topic = new Topic(self.topic).findById(db);
		if (topic.entries && topic.entries.length > 0 && topic.entries.join("|").indexOf(self.uuid) < 0) {
			topic.entries.push(self.uuid);
			topic.save(db);
		}
	};
}

new Entry().define({
	text:{
		search:{
			store:false,
			index:Index.ANALYZED,
			termVector:TermVector.YES
		}
	},
	
	topic:{
		rel: Relationship.hasA,
		required: true,
		type: Topic,
		search:{}
	},
	
	createDate:{
		required:true,
		type:Type.Date
	}
});

function Task(clone) {
	this.createDate = new Date();
	this.extend(new Storable(clone));
}

new Task().define({
	text:{
		search: {
			store:false,
			index:Index.ANALYZED,
			termVector:TermVector.YES
		}
	},
	
	entry:{
		rel: Relationship.hasA,
		required: true,
		type: Entry
	},
	
	createDate:{
		required:true,
		type:Type.Date
	},
	
	dueDate:{
		type:Type.Date
	},
	
	createdBy:{
		rel: Relationship.hasA,
		type:User,
		required:true
	},
	
	assignedTo:{
		rel: Relationship.hasA,
		type:User,
	}
});


//Extend user
new User().define({
	lastTopicId : {},
	noteBooks : {rel: Relationship.ownsMany}

});
