

function NoteBook(clone) {
	this.createDate = new Date();
	this.extend(new Storable(clone));
};

new NoteBook().define({
	name:{
		index:true,
		pattern:/^([a-zA-Z0-9 .'-_&\/,!@#\$\?%])+$/,
		error:"Must be letters, numbers, spaces and .'-_&/,!@#$?%"
	},
	
	owner:{
		rel: Relationship.hasA,
		required: true,
		type: User
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
		var self = this.findById(db);
		var noteBook = self.noteBook.findById(db);
		if (noteBook.topics && noteBook.topics.length > 0) {
			noteBook.topics = [];
			var topics = self.findByProperty("noteBook");
			topics.each(function(topic) {
				if (!self.equals(topic)) noteBook.topics.push(topic.uuid);
			});
			noteBook.save(db);
		}
	};
	
	this.onSave = function(db) {
		var self = this;		
		var noteBook = new NoteBook(self.noteBook).findById(db);
		if (noteBook.topics && noteBook.topics.length > 0) {
			var topics = self.findByProperty("noteBook");
			var ok = false;
			topics.each(function(topic) {
				if (topic.equals(self)) ok = true;
			});
			if (!ok) noteBook.topics.push(self.uuid);
			noteBook.save(db);
		}
	
	};
}

new Topic().define({
	name:{
		index:true,
		pattern:/^([a-zA-Z0-9 .'-_&\/,!@#\$\?%])+$/,
		error:"Must be letters, numbers, spaces and .'-_&/,!@#$?%"
	},
	
	noteBook:{
		rel: Relationship.hasA,
		required: true,
		type: NoteBook
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
		var self = this.findById(db);
		var topic = self.topic.findById(db);
		if (topic.entries && topic.entries.length > 0) {
			topic.entries = [];
			var entries = self.findByProperty("topic");
			entries.each(function(entry) {
				if (!self.equals(entry)) topic.entries.push(entry.uuid);
			});
			topic.save(db);
		}
	};
	
	this.onSave = function(db) {
		var self = this;		
		var topic = new Topic(self.topic).findById(db);
		if (topic.entries && topic.entries.length > 0) {
			var entries = self.findByProperty("topic");
			var ok = false;
			entries.each(function(entry) {
				if (entry.equals(self)) ok = true;
			});
			if (!ok) topic.entries.push(self.uuid);
			topic.save(db);
		}
	
	};
}

new Entry().define({
	text:{
		index: true
	},
	
	topic:{
		rel: Relationship.hasA,
		required: true,
		type: Topic
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
		index: true
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
	lastTopicId : {}
});
