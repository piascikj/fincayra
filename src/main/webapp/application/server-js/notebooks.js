

function NoteBook(clone) {
	this.createDate = new Date();
	this.extend(new Storable(clone));
	
	this.onRemove = function(db) {
		$log().debug("Removing NoteBook:{}", this.json());
		var self = this;

		var topics = new Topic({noteBook:self}).findByProperty("noteBook");
		topics.each(function(topic) {
			topic.remove(db);
		});

		var owner = self.owner;
		if (owner.noteBooks && owner.noteBooks.length > 0) {
			owner.noteBooks = owner.noteBooks.removeString(self.uuid);
			owner.save(db);
		}
		
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
		error:"Name can only contain letters, numbers, spaces and .'-_&/,!@#$?%",
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
	}
});

function Topic(clone) {
	this.createDate = new Date();
	this.extend(new Storable(clone));
	this.onRemove = function(db) {
		var self = this;
		
		var entries = new Entry({topic:self}).findByProperty("topic");
		entries.each(function(entry) {
			entry.remove(db);
		});
		
		var noteBook = self.noteBook;
		if (noteBook.topics && noteBook.topics.length > 0 && noteBook.topics.stringExists(self.uuid)) {
			noteBook.topics = noteBook.topics.removeString(self.uuid);
			noteBook.save(db);
		}
		

	};
	
	this.onSave = function(db) {
		var self = this;		
		var noteBook = new NoteBook(self.noteBook).findById(db);
		if (noteBook.topics == undefined) {
			noteBook.topics = [];
		}
		
		if (noteBook.topics.join("|").indexOf(self.uuid) < 0) {
			noteBook.topics.push(self.uuid);
			noteBook.save(db);
		}
	
	};
}

new Topic().define({
	name:{
		index:true,
		pattern:/^([a-zA-Z0-9 .'-_&\/,!@#\$\?%])+$/,
		error:"Name can only contain letters, numbers, spaces and .'-_&/,!@#$?%",
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
		if (topic.entries && topic.entries.length > 0 && topic.entries.stringExists(self.uuid)) {
			topic.entries = topic.entries.removeString(self.uuid);
			topic.save(db);
		}
	};
	
	this.onSave = function(db) {
		var self = this;		
		var topic = new Topic(self.topic).findById(db);

		if (topic.entries == undefined) {
			topic.entries = [];
		}
		
		if (topic.entries.join("|").indexOf(self.uuid) < 0) {
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


User.prototype.fixNoteBooks = function() {
	var noteBooks = new NoteBook({owner:this}).findByProperty("owner");
	var noSort = [];
	var sort = this.noteBooks;
	var newSort = [];
	
	noteBooks.each(function(noteBook) {
		noSort.push(noteBook.uuid);
	});
	
	sort.each(function(uuid) {
		if (noSort.stringExists(uuid)) newSort.push(uuid);
	});
	this.noteBooks = newSort;
};
	
	
	
