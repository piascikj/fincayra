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
UnableToDeleteObjectError.prototype = new Error();

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
ObjectNotFoundError.prototype = new Error();

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
ValidationException.prototype = new Error();

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
SessionUnavailableException.prototype = new Error();

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
NotStorableException.prototype = new Error();
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
UniqueValueConstraintException.prototype = new Error();
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
CascadingException.prototype = new Error();
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
CustomClassException.prototype = new Error();
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
RequiredPropertyException.prototype = new Error();

function ObjectManager() {}

ObjectManager.prototype.txn = function(transact) {
	//transact will be a function that is executed in a transaction
	//The txn implementation should pass the txnContext to the transact function as a parameter like: trasact(txnContext)
	//The txnContext can be any object and must be passed to Storable.save
}

ObjectManager.prototype.addStorable = function(storable, classDef) {
	//Add a storable stpe to the object manager
}

ObjectManager.prototype.initDb = function() {
	//Initializae the db
}

//Load the objectManager impl file
load($config().store);


/*
	class: ObjectManager
	Responsible for managing object persistence
	
*/
ObjectManager.instance = new ObjectManager();

/*
	Function: $om
	Returns the current ObjectManager
*/
function $om() {return ObjectManager.instance;}

/*
	Class: Storable
	The super class of all persistent objects.  You create a storable by extending the Storable object like this.
	>	function User(clone) {
	>		this.extend(new Storable(clone));
	>		this.define({
	>			name:{
	>				pattern:/^([a-zA-Z .'-_]){1,40}$/,
	>				error:"Name is a required field and can't be over 40 characters in length and may contain letters, numbers, spaces and .'-_"
	>			},
	>			
	>			email:{
	>				unique:true,
	>				pattern:/^([a-zA-Z0-9_.-])+@([a-zA-Z0-9_.-])+\.([a-zA-Z])+([a-zA-Z])+/,
	>				error:"Email address is not valid"
	>			}, 
	>			
	>			nickname:{
	>				unique:true,
	>				pattern:/^([a-zA-Z0-9_.-])+$/,
	>				error:"Must be letters, numbers and _ . -"},
	>			
	>			role:{},
	>			
	>			resetTimeStamp:{type:Type.Long},
	>			
	>			resetString:{unique:true},
	>			
	>			password:{
	>				pattern:/^.*(?=.{6,}).*$/,
	>				error:"Password must be at least 6 characters long."
	>			},
	>			
	>			active:{type:Type.Boolean}
	>		});
	>	} new User();
	
		*IMPORTANT* Calling the constructor is a must!!!
	
	Parameters:
		clone - If a raw javascript object is passed, an object of the storable type will be instantiated with the valuse from the raw object.
	
  
 */
function Storable(clone) {
	//make a copy
	if (clone) this.extend(clone);
};

/*
	Func: define
	This is where the application data model is defined.  After the Storable object extends Storable, 
	a call to this.define is made, informing the PersistenceManager of the model.
	
	Parameters:
		classDef - The classDef object has one property for each of the classes properties.
			Each property contains the following attributes.
			
			* rel - The type of relationship.  See <Relationship>.  This is for properties of custom types only.  If the type is in <Type>, we do not need to specify this.
			* type - The Type of the property value.  Default is String, or you can use a custom type, but see <Type> for other valid values.
				If a custom type is used, just specify the function name.  For example if specifying the type in the previous example use...
				>{type:MyObject}
			* unique - (Optional) true if property is unique for all records of this type. Default is false.  If this is set to true, this property can be used as a lookup key in <findByProperty>
			* required - (Optional) true if the property is required.  Default is false.
			* pattern - (Optional) A regualr expression to validate against when <validate> is called
			* error - (Optional) An error message for failed validation
*/
Storable.prototype.define = function(classDef) {
	if (!$om().hasStorable(this)) {
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
		
		if (propSpec.required && this[prop] == undefined) {
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
	
	Returns:
	An array of matching objects
*/
Storable.prototype.findByProperty = function(prop,txnContext) {
	return $om().findByProperty(this,prop,txnContext);
};


/*
	Func: search
	Find an object in permanent storage by the given qry appended to the path.
	For Example: [jcr:contains(@description, 'The')]
	
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
