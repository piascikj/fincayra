

function NoteBook(clone) {
	this.extend(new Storable(clone));
	this.createDate = new Date();
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
	}
});

function Topic(clone) {
	this.extend(new Storable(clone));
	this.createDate = new Date();
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
	this.extend(new Storable(clone));
	this.createDate = new Date();
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
	this.extend(new Storable(clone));
	this.createDate = new Date();
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
