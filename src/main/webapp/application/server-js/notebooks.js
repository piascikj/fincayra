

function NoteBook(clone) {
	this.createDate = new Date();
	this.extend(new Storable(clone));
};

new NoteBook().define({
	name:{
		index:true,
		pattern:/^([a-zA-Z0-9 .'-_])+$/,
		error:"Must be letters, numbers, spaces and _ . -"
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
}

new Topic().define({
	name:{
		index:true,
		pattern:/^([a-zA-Z0-9 .'-_])+$/,
		error:"Must be letters, numbers, spaces and _ . -"
	},
	
	noteBook:{
		rel: Relationship.hasA,
		required: true,
		type: NoteBook
	},
	
	createDate:{
		required:true,
		type:Type.Date
	}
});

function Entry(clone) {
	this.createDate = new Date();
	this.extend(new Storable(clone));
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
