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


//--------------------------------------------------------------------------------------------
//Hide dev if not reloading root scope dyanmically

if (!$config().dev) {
	$hide(["dev"]);
}


//Create the encryptor
var encryptor = new org.jasypt.util.password.StrongPasswordEncryptor();

//Create a couple roles
var Role = {
	admin : 'admin',
	user : 'user'
};

//Define some model objects
function User(clone) {
	
	this.active = true;
	
	this.createDate = new Date();
	
	this.noteBooks = [];

	this.extend(new Storable(clone));
	
	//This runs prior to Sortable.save
	this.onSave = function() {
		//If the user has an id, it has previously been saved
		//If user.reset is true we have modified the password
		if (!this.id || this.reset) {
			this.password = encryptor.encryptPassword(this.password);
		}
	};
	
	this.onValidate = onValidate = function() {
		if (!this.mailTo) {
			this.mailTo = this.email;
		}
	}

}; 


User.prototype.getResetString = function() {
	//Set the reset string and timestamp
	this.resetTimeStamp = new Date().getTime();
	
	this.resetString = encryptor.encryptPassword(this.email);
	
	return this.resetString;
};

User.prototype.resetOK = function(resetString) {
	var now = new Date();
	var resetTime = new Date(this.resetTimeStamp);
	var allowedTime = $config().resetPasswordTokenTimeout;
	var limit = new Number(resetTime.getTime() + allowedTime);
	//does resetStrings match and are we under the allowedTime
	return (encryptor.checkPassword(this.email, resetString) && (now.getTime() < limit));
};		

User.prototype.authenticate = function(inputPassword) {
	return (encryptor.checkPassword(inputPassword, this.password) && this.active);
};

User.prototype.toJSON = function(key) {
	if (key == "owner" || key == "user") {
		var obj = {};
		obj.extend(this);
		return obj.extend({
			password:undefined,
			role:undefined,
			persistentKey:undefined
		});
	} 
	
	return this;
};


new User().define({
	name:{
		pattern:/^([a-zA-Z .'-_]){1,40}$/,
		error:"Name is a required field and can't be over 40 characters in length and may contain letters, numbers, spaces and .'-_",
		search:{}
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
	},
	
	persistentKey: {
		index:true,
		unique:true
	},
	
	lastTopicId : {
		required: false
	},
	
	mailTo : {
		required: true,
		pattern:/^([a-zA-Z0-9_.-])+@([a-zA-Z0-9_.-])+\.([a-zA-Z])+([a-zA-Z])+/,
		error:"Email address is not valid",
		unique:true//this will ensure another object with the same value is not created, unique:false is default
	}, 
	
	noteBooks : {rel: Relationship.ownsMany}	
});

//We should now create an admin

Request.prototype.setPersistentKey = function(user) {
	user.persistentKey = uuid();
	this.$setCookie("persistent", user.persistentKey,$config().persistentLoginDuration);
	user.save();
}

Request.prototype.removePersistentKey = function() {
	$log().debug("Removing the persistentKey");
	if (this.$getSession().user) {
		var user = this.$getSession().user.findById();
		user.persistentKey = uuid();
		user.save();
	}
	this.$setCookie("persistent", null, 0);
};

Request.prototype.checkPersistentKey = function() {
	if (this.$getSession().user == undefined) {
		$log().debug("Checking persistentKey!!!!!!!!!!!!!!!!");
		var persistentKey = this.$getCookie("persistent");
		if (persistentKey) {
			var users = new User({persistentKey:persistentKey}).findByProperty("persistentKey");
			if (users.length == 1) {
				this.$getAuthSession().user = users[0];
				this.forwardToDefault();
			}
		}
	}
}

Request.prototype.forwardToDefault = function() {
	this.$redirect($app().url + "notebooks/");
}

//This function will redirect to login if user is not authenticated
//Upon authentication you will be recirected to your detination
Request.prototype.requireAuth = function() {
	//Check if the user is set to stay logged in
	this.checkPersistentKey();

	if(!this.$getSession().user) {
		if (this.$isAPI()) {
			throw new AuthRequiredException();
		} else {
			$log().debug("No user logged in!");
			//set the destination so we can take them there after login
			this.$getSession().destination = this.$getRequestURL();
			var redirectTo = $app().secureUrl + "login";
			this.$redirect(redirectTo);
		}
	}
};

Request.prototype.requirePageAuth = function() {
	var s = this.$getSession();
	$log().debug("requirePageAuth session:{}".tokenize(JSON.stringify(s)));
	if (!s.singlePageAuthTO  || s.singlePageAuthTO < new Date()) {
		s.singlePageAuth = true;
		s.destination = this.$getRequestURL();
		var redirectTo = $app().secureUrl + "login";
		$log().debug("requirePageAuth redirecting to:{}".tokenize(redirectTo));
		this.$redirect(redirectTo);
	} else {
		s.singlePageAuth = false;
	}
}

function DefaultTemplates(req) {
	this.req = req;
};
		
DefaultTemplates.prototype.basic = function(config) {
	if(config && $type(config) == "Object") {
		//Check if ssl is required
		if(config.requireSSL) {
			this.req.$requireSSL();
		}
		 
		//Check if auth is required and redirect
		if (config.requireAuth) {
			this.req.requireAuth();
		}
		
		//run the before, pre-extend
		if(config.before) config.before();
		
		//If widget is passed, don't use template
		if(!this.req.$getPageParams().widget) {
			//Grab the body of the page that is using this template
			var body = this.req.$("body"); 
			var head = this.req.$("head");
			
			this.req.$e(config.page); //Here we extend the templates html by placing it in the dom
			
			//config.title
			if (config.title) this.req.$("title").html($config().name + " - " + config.title); //We set the title
			
			if (body) this.req.$(config.contentSelector).html(body.html()); //set the content of the template to the requested page
			if (head) this.req.$("head").append(head.html());
		}
			
	}
};

DefaultTemplates.prototype.simple = function(config) {
	try {
		config.page = "/templates/simple.html";
		config.contentSelector = "#content";
		this.basic(config);
	} catch (e) {
		$debug(e);
		throw e;
	} finally {
		if ($app().reloadRootScope) {
			//TODO we need to make this a side tab initiated thing
			//$source();
			//$debug(context.element.html());
		}
	}
};
		
DefaultTemplates.prototype.content = function(config) {
	try {
		config.page = "/templates/content.html";
		config.contentSelector = "#content";
		this.basic(config);
	} catch (e) {
		$debug(e);
		throw e;
	} finally {
		if ($app().reloadRootScope) {
			//TODO we need to make this a side tab initiated thing
			//$source();
			//$debug(context.element.html());
		}
	}
};

DefaultTemplates.prototype.mail = function(config) {
	var user = this.req.$getSession().user;
	if (user) {
		if (config.before) config.before();
		
		//Grab the body of the page that is using this template
		var body = this.req.$("body"); 
		
		this.req.$e("/mail/templates/simple.html"); //Here we extend the templates html by placing it in the dom
		
		if (body) this.req.$("body").append(body.html()); //set the content of the template to the requested page
	}	
}
