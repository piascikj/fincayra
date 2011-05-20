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

/*
	Enum: Relationship
	The possible relationships for storable properties
	
	hasA - When the object has an association with the property, but the property does not live or die with the object
	hasMany - Same as hasA, but for a collection property
	ownsA - When the object is owns the value of the property.  The property lives and dies with the object.  A compostion.
	ownsMany - Same as ownsA, but for a collection property
*/
var Relationship = {
	hasA:"hasA",
	hasMany:"hasMany",
	ownsA:"ownsA",
	ownsMany:"ownsMany"
};

/*
	Enum: Type
	The mapping for javascript native types
	
	String - String()
	Long - Number()
	Double - Number()
	Decimal - Number()
	Date - Date()
	Boolean - Boolean()
*/
var Type = {
		String:"String",
		Long:"Long",
		Double:"Double",
		Decimal:"Decimal",
		Date:"Date",
		Boolean:"Boolean"
};

/*
	Class: UnableToDeleteObjectError
	This Exception is thrown when an object can't be deleted
	
	Extends: 
	<Exception>
	
	Parameters:
		e - The wrapped error
*/ 
function UnableToDeleteObjectError(e) {
	this.extend(e || {});
	this.name = "UnableToDeleteObjectError";
}
UnableToDeleteObjectError.extend(Error);

/*
	Class: ObjectNotFoundError
	This Exception is thrown when an object can't be found
	
	Extends: 
	<Exception>
	
	Parameters:
		e - The wrapped error
*/ 
function ObjectNotFoundError(e) {
	this.extend(e || {});
	this.name = "ObjectNotFound";
}
ObjectNotFoundError.extend(Error);

/*
	Class: ValidationException
	This Exception is thrown when an object does not pass validation
	
	Extends: 
	<Exception>
	
	Parameters:
		violations - an object representing the validation violations {prop:message,...}
*/ 
function ValidationException(violations) {
	this.violations = violations;
	this.name = "ValidationException";
}
ValidationException.extend(Error);

/*
	Class: SessionUnavailableException
	This Exception is thrown when a persistence session is not available
	
	Extends: 
	<Exception>
	
	Parameters:
		e - The wrapped error
*/ 
function SessionUnavailableException(e) {
	this.extend(e || {});
	this.name = "SessionUnavailableException";
}
SessionUnavailableException.extend(Error);

/*
	Class: NotStorableException
	This Exception is thrown when the PersistenceManager encounters a non-Storable Object
	
	Extends: 
	<Exception>
	
	Parameters:
		e - The wrapped error
*/ 
function NotStorableException(e) {
	this.extend(e || {});
	this.name="NotStorableException";
}
NotStorableException.extend(Error);
/*
	Class: UniqueValueConstraintException
	This Exception is thrown when the PersistenceManager encounters a unique value constraint violation
	
	Extends: 
	<Exception>
	
	Parameters:
		e - The wrapped error	
*/ 
function UniqueValueConstraintException(e) {
	this.extend(e||{});
	this.name="UniqueValueConstraintException";
}
UniqueValueConstraintException.extend(Error);
/*
	Property: field
	The Storable field for which the Exception was thrown
*/
UniqueValueConstraintException.prototype.field = null;

/*
	Class: CascadingException
	This Exception is thrown when the PersistenceManager encounters a nested Storable object when it is trying to save the parent object.
	
	Extends: 
	<Exception>
	
	Parameters:
		e - The wrapped error
*/ 
function CascadingException(e) {
	this.extend(e || {});
	this.name="CascadingException";
}
CascadingException.extend(Error);
/*
	Class: CustomClassException
	This Exception is thrown when the PersistenceManager is expecting a simple type, but encounters a custom class.
	
	Extends: 
	<Exception>
	
	Parameters:
		e - The wrapped error
*/ 
function CustomClassException(e) {
	this.extend(e || {});
	this.name="CustomClassException";
}
CustomClassException.extend(Error);
/*
	Class: RequiredPropertyException
	This Exception is thrown when a required property is not set.
	
	Extends: 
	<Exception>
	
	Parameters:
		e - The wrapped error
*/ 
function RequiredPropertyException(e) {
	this.extend(e || {});
	this.name="RequiredPropertyException";
}
RequiredPropertyException.extend(Error);

function ObjectManager() {}

ObjectManager.prototype.txn = function(transact) {
	//transact will be a function that is executed in a transaction
	//The txn implementation should pass the txnContext to the transact function as a parameter like: trasact(txnContext)
	//The txnContext can be any object and must be passed to Storable.save
}

/*
	Func: nextOffset
	Returns:
	The value to be used for the next offset.  This function should be overidden for the specific store implementation.
*/
ObjectManager.prototype.nextOffset = function() {
}

ObjectManager.prototype.addStorable = function(storable, classDef) {
	//Add a storable stpe to the object manager
}

ObjectManager.prototype.initDb = function() {
	//Initializae the db
}

/*
	Prop: classDefs
	The Storable objects class definitions
*/
ObjectManager.prototype.classDefs = {};

/*
	Prop: constructors
	The Storable constructors.  Used to provide the types to this scope.
*/
ObjectManager.prototype.constructors = "";

/*
	Func: addStorable
	Add a Storable object and it's definition to the list of persistent objects.  
	This should not be called directly.  It happens automatically when storable 
	is extended, and defined.

	Parameters:
		storable - The storable object to add
		classDef - The storable classDef
	
	See <Storable>
*/
ObjectManager.prototype.addStorable = function(storable, classDef) {
	var type = $type(storable);
	this.classDefs[type] = classDef;
};

ObjectManager.prototype.cast = function(obj, type) {
	var js = "new " + type + "();";
	obj = eval(js).extend(obj);
	
	return obj;
}
/*
	Func: hasStorable
	Check if a storable is defined in this ObjectManager.
	
	Parameters:
		storable - The storable to check
*/
ObjectManager.prototype.hasStorable = function(storable) {
	return this.classDefs.hasOwnProperty($type(storable));
};

ObjectManager.prototype.getClassDef = function(type) {
	return this.classDefs[type];
};

ObjectManager.prototype.isStorable = function(obj) {
	return this.classDefs[$type(obj)];
};

//TODO prototype the rest of the ObjectManager methods

//Load the objectManager impl file
//load($config().store);


ObjectManager.instance;

/*
	Function: $om
	Returns the current ObjectManager
*/
function $om() {return ObjectManager.instance;}


/*
	Class: APIAccessException
	This Exception is thrown when the user is not allowed access to the api.
	
	Extends: 
	<Exception>
	
	Parameters:
		e - The wrapped error
*/ 
function APIAccessException(e) {
	this.extend(e || {});
	this.name="CustomClassException";
}
APIAccessException.extend(Error);

/*
	Class: APIAccessHandler
	Extend this class and overide it's methods for allowing or dissallowing access to api functions
*/
function APIAccessHandler() {}

APIAccessHandler.prototype.onPut = function(storables, session) {}
APIAccessHandler.prototype.onPost = function(storables, session) {}
APIAccessHandler.prototype.onGet = function(storables, session) {}
APIAccessHandler.prototype.onDelete = function(storables, session) {}

 
/*
	Class: Storable
	The super class of all persistent objects.  You create a storable by extending the Storable object like this.
	
	(start code)

	function User(clone) {
		this.extend(new Storable(clone));
	} 
	new User().define({
		_api:{
			accessHandler : new APIAccessHandler() //Put your own access handler class here to allow/disallow access on each api call
		},
		
		_model:{
			name:{
				pattern:/^([a-zA-Z .'-_]){1,40}$/,
				error:"Name is a required field and can't be over 40 characters in length and may contain letters, numbers, spaces and .'-_"
			},
			
			email:{
				unique:true,
				pattern:/^([a-zA-Z0-9_.-])+@([a-zA-Z0-9_.-])+\.([a-zA-Z])+([a-zA-Z])+/,
				error:"Email address is not valid"
			}, 
			
			nickname:{
				unique:true,
				pattern:/^([a-zA-Z0-9_.-])+$/,
				error:"Must be letters, numbers and _ . -"},
			
			role:{},
			
			resetTimeStamp:{type:Type.Long},
			
			resetString:{unique:true},
			
			password:{
				pattern:/^.*(?=.{6,}).*$/,
				error:"Password must be at least 6 characters long."
			},
			
			active:{type:Type.Boolean}
		}
	});
		
	(end)

	
		*IMPORTANT* Calling the constructor is a must!!!
	
	Parameters:
		clone - If a raw javascript object is passed, an object of the storable type will be instantiated with the valuse from the raw object.
	
  
 */
function Storable(clone) {
	//make a copy
	if (clone) this.extend(clone);
}

/*
	Func: define
	This is where the application data model is defined.  After the Storable object extends Storable, 
	a call to this.define is made, informing the PersistenceManager of the model.
	
	Parameters:
		classDef - The classDef object has one property for each of the classes properties.
			Each property contains the following attributes.
			
			* rel - The type of relationship.  See <Relationship>.  This is for properties that are complex types only.  If the type is in <Type>, we do not need to specify this.
			* type - The Type of the property value.  Default is String, or you can use a custom type, but see <Type> for other valid values.
				If a custom type is used, just specify the function name.  For example if specifying the type in the previous example use...
				>{type:MyObject}
			* unique - (Optional) true if property is unique for all records of this type. Default is false.  If this is set to true, this property can be used as a lookup key in <findByProperty>
			* index - (Optional) should this field be indexed for faster retrieval and search
			* required - (Optional) true if the property is required.  Default is false.
			* pattern - (Optional) A regualr expression to validate against when <validate> is called
			* error - (Optional) An error message for failed validation
*/
Storable.prototype.define = function(classDef) {
	if (!$om().hasStorable(this)) {
		
		var apiOpt;
		//for backward compatability we will check for the _model attribute, but use the parm if it's not there
		if (classDef.hasOwnProperty("_model")) {
			if (classDef.hasOwnProperty("_api")) apiOpt = classDef._api; 
			classDef = classDef._model;
		}
		
		classDef.uuid = {
			required: true,
			unique: true
		};
		
		for (prop in classDef) {if (classDef.hasOwnProperty(prop)) {
			$log().debug(prop + ":" + classDef[prop]);
			var propSpecs = classDef[prop];
			
			if(!propSpecs.hasOwnProperty("rel")) {
				propSpecs.rel = Relationship.ownsA;
			}
			
			if(!propSpecs.hasOwnProperty("type")) {
				propSpecs.type = Type.String;
			} else {
				var clazz = propSpecs.type;
				//Check if clazz is a PropType, or a user defined class
				if (!Type.hasOwnProperty(clazz)) {
					//if it's user defined, replace the function reference with a string
					propSpecs.type = $type(clazz);
					propSpecs.clazz = clazz;
				}
			}
			
			if (!propSpecs.hasOwnProperty("unique")) {
				propSpecs.unique = false;
			}
			
			if (!propSpecs.hasOwnProperty("index")) {
				propSpecs.index = false;
			}

		}}
		$om().addStorable(this, classDef);
	}
};

/*
	Func: onValidate
	Returns : see <validate>
	Intended to be overidden by the storable object.  This method is run just prior to validating the objet.
*/
Storable.prototype.onValidate = function() {
	//We expect the model objects to overide this
	return undefined;
};

/*
	Func: validate
	Validate an object against it's classDef patterns.  If a property is undefined, it will not be checked unless it is required.
	
	Returns:
	An object hash containing propertyName keys and errorMessage values
	
	Example:
	> {
	>	name:"Name is a required field and can't be over 40 characters in length and may contain letters, numbers, spaces and .'-_",
	>	password:"Password must be at least 6 characters long."
	> }
*/
Storable.prototype.validate = function() {
	var classDef = $om().getClassDef($type(this));
	var result = this.onValidate();//result will contain names of properties that did not pass inspection, with values of the error text
	for (prop in classDef) {if (classDef.hasOwnProperty(prop)) {
		var propSpec = classDef[prop];
		
		if (propSpec.required && this[prop] == undefined && prop != "uuid") {
			if (result == undefined) result = {};
			result[prop] = "required";
		} else if (propSpec.hasOwnProperty("pattern") && this[prop] != undefined) {
			if (!propSpec.pattern.test(this[prop])) {
				if (result == undefined) result = {};
				result[prop] = propSpec.error;
			}
		}		
	}}
	
	return result;
};

/*
	Func: equals
	Check for equality by comparing id's
	
	Parameters:
		storable - the storable to compare this object with
		
	Returns:
	True is the objects are equal
*/
Storable.prototype.equals = function(s) {
	if (s == undefined || s == null) return false;
	var result = (this.id.equals(s.id));
	return result;
};

/*
	Func: save
	Save the object in storage
	
	Returns:
	The saved object
*/
Storable.prototype.save = function(txnContext) {
	if (this.uuid == undefined) {
		$log().debug("Generating uuid...");
		this.uuid = $rootScope().uuid();
	}
	return $om().save(this, txnContext);
};

/*
	Func: onSave
	Intended to be overidden by the storable object.  This method is run just prior to saving the object in permanent storage.
*/
Storable.prototype.onSave = function() {
	//We expect the model objects to overide this
};

/* 
	Func: remove
	Remove this object from permanent storage.

	Returns:
	boolean - true if successful
*/
Storable.prototype.remove = function(txnContext) {
	return $om().remove(this, txnContext);
};

/*
	Func: onRemove
	Intended to be overidden by the storable object.  This method is run just prior to removing the object in permanent storage.
*/
Storable.prototype.onRemove = function() {
	//We expect the model objects to overide this
};

/*
	Func: findByProperty
	Find an object in permanent storage by the given property name.  Value to search on should be set in the object itself.
	
	Parameters:
		prop - The property name
		extraClause - Any extra clauses like orderby
		offset - The position to start from (Dependent upon store implementation. orientDB uses id incremented by i.)
		limimt - The maximum number of objects to return.
		txnContext - used in ObjectManager.txn
		
	Returns:
	An array of matching objects
*/
Storable.prototype.findByProperty = function(prop, extraClause, offset, limit, txnContext) {
	return $om().findByProperty(this, prop, extraClause, txnContext);
};


/*
	Func: search
	Find an object in permanent storage by the given qry appended to the path.
	For Example: [jcr:contains(@description, 'The')]
	
	Parameters:
		qry - The query
		offset - The position to start from (Dependent upon store implementation. orientDB uses id incremented by i.)
		limimt - The maximum number of objects to return.
		txnContext - used in ObjectManager.txn

	Returns:
	An array of matching objects
*/
Storable.prototype.search = function(qry, offset, limit, txnContext) {
	return $om().search(this, qry, offset, limit, txnContext);
};

/*
	Func: findById
	Find an object by it's id.  An id is set when the object is saved.  The id to search on should be set in the object itself.
	
	Returns:
	The matching object.
*/
Storable.prototype.findById = function(s) {
	return $om().findById(this, this.id,s);
};

Storable.prototype.lock = function(s, timeout) {
	return $om().lock(this.id, s, timeout);
};

Storable.prototype.unlock = function(s) {
	return $om().lock(this.id, s);
};

//-------------------------------------------------------------------------------------------------
