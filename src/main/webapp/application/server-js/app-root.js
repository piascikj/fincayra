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

/*This runs in the top level scope.  Everything set here is global, so
 * this is a great place to create some singletons, libraries, reference services and domain objects.
 */

//Set the app name
//$app().name="Fincayra";


//--------------------------------------------------------------------------------------------
//Hide dev if not reloading root scope dyanmically
/*
if (!$app().reloadRootScope) {
	$hide(["dev"]);
}
*/

//Create the encryptor
var encryptor = new org.jasypt.util.password.StrongPasswordEncryptor();

//Create a couple roles
var Role = {
	admin : 'admin',
	user : 'user'
};

function AuthRequiredException(msg) {
	this.message = "You must sign in to see this page.";
	this.extend(new Exception(msg));
}
		
//Define some model objects
function User(clone) {
	
	this.extend(new Storable(clone));
	
	this.active = true;
	
	this.createDate = new Date();
	
	//This runs prior to Sortable.save
	this.onSave = function() {
		//If the user has an id, it has previously been saved
		//If user.reset is true we have modified the password
		if (!this.id || this.reset) {
			this.password = encryptor.encryptPassword(this.password);
		}
	};

	this.authenticate = function(inputPassword) {
		return (encryptor.checkPassword(inputPassword, this.password) && this.active);
	};
	
	this.getResetString = function() {
		//Set the reset string and timestamp
		this.resetTimeStamp = new Date().getTime();
		
		this.resetString = encryptor.encryptPassword(this.email);
		
		return this.resetString;
	};
	
	this.resetOK = function(resetString) {
		var now = new Date();
		var resetTime = new Date(this.resetTimeStamp);
		var minutes = 10;
		var allowedTime = new Number(1000 * 60 * minutes);
		var limit = new Number(resetTime.getTime() + allowedTime);
		//does resetStrings match and are we under the allowedTime
		return (encryptor.checkPassword(this.email, resetString) && (now.getTime() < limit));
	};		
}; 

new User().define({
	name:{
		pattern:/^([a-zA-Z .'-_]){1,40}$/,
		error:"Name is a required field and can't be over 40 characters in length and may contain letters, numbers, spaces and .'-_"
	},
	
	email:{
		required: true,
		pattern:/^([a-zA-Z0-9_.-])+@([a-zA-Z0-9_.-])+\.([a-zA-Z])+([a-zA-Z])+/,
		error:"Email address is not valid",
		unique:true//this will ensure another object with the same value is not created, unique:false is default
	}, 
	
	nickname:{
		unique:true,
		pattern:/^([a-zA-Z0-9_.-])+$/,
		error:"Must be letters, numbers or _ . -"},
	
	role:{},
	
	resetTimeStamp:{type:Type.Long},
	
	resetString:{unique:true},
	
	password:{
		pattern:/^.*(?=.{6,}).*$/,
		error:"Password must be at least 6 characters long."
	},
	
	active:{type:Type.Boolean},
	
	createDate:{
		required:true,
		type:Type.Date
	}
});


function NoteBook(clone) {
	this.extend(new Storable(clone));
	this.createDate = new Date();
}; 
	
new NoteBook().define({
	name:{
		unique:true,
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
		unique:true,
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
	text:{},
	
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
	text:{},
	
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
//We should now create an admin

