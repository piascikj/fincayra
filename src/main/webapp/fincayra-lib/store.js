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
	Enum: PropType
	The javascript native type mapping to jcr types
	
	String - javax.jcr.PropertyType.STRING
	Long - javax.jcr.PropertyType.LONG
	Double - javax.jcr.PropertyType.DOUBLE
	Decimal - javax.jcr.PropertyType.DECIMAL
	Date - javax.jcr.PropertyType.DATE
	Boolean - javax.jcr.PropertyType.BOOLEAN
*/
var PropType = {
		String:javax.jcr.PropertyType.STRING,
		Long:javax.jcr.PropertyType.LONG,
		Double:javax.jcr.PropertyType.DOUBLE,
		Decimal:javax.jcr.PropertyType.DECIMAL,
		Date:javax.jcr.PropertyType.DATE,
		Boolean:javax.jcr.PropertyType.BOOLEAN,
		Reference:javax.jcr.PropertyType.REFERENCE
};

var JCRPropTyes = {};
JCRPropTyes[javax.jcr.PropertyType.STRING.toString()]="STRING";
JCRPropTyes[javax.jcr.PropertyType.DATE.toString()]="DATE";
JCRPropTyes[javax.jcr.PropertyType.BINARY.toString()]="BINARY";
JCRPropTyes[javax.jcr.PropertyType.DOUBLE.toString()]="DOUBLE";
JCRPropTyes[javax.jcr.PropertyType.DECIMAL.toString()]="DECIMAL";
JCRPropTyes[javax.jcr.PropertyType.LONG.toString()]="LONG";
JCRPropTyes[javax.jcr.PropertyType.BOOLEAN.toString()]="BOOLEAN";
JCRPropTyes[javax.jcr.PropertyType.NAME.toString()]="NAME";
JCRPropTyes[javax.jcr.PropertyType.PATH.toString()]="PATH";
JCRPropTyes[javax.jcr.PropertyType.URI.toString()]="URI";
JCRPropTyes[javax.jcr.PropertyType.REFERENCE.toString()]="REFERENCE";
JCRPropTyes[javax.jcr.PropertyType.WEAKREFERENCE.toString()]="WEAKREFERENCE";
JCRPropTyes[javax.jcr.PropertyType.UNDEFINED.toString()]="UNDEFINED";


/*
	Enum: Type
	The jcr mapping for javascript native types
	
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
/*
	class: ObjectManager
	Responsible for managing object persistence
	
*/
function ObjectManager() {
	var jcrPackages = new JavaImporter(Packages.javax.jcr);
	var pm = $app().persistenceManager;
	var objectsNodeName = "Objects";
	var namespace = "fincayra";
	var manager = this;
	
	this.pm = pm;
	this.objectsNodeName = objectsNodeName;
	this.namespace = namespace;
	
	
	/*
		Prop: classDefs
		The Storable objects class definitions
	*/
	this.classDefs = {};
	
	/*
		Prop: constructors
		The Storable constructors.  Used to provide the types to this scope.
	*/
	this.constructors = "";
	
	/*
		Prop: sql2Prefix
		The Storable SQL2 prefixes 
	*/
	this.sql2Prefix = {};

	/*
		Prop: xpathPrefix
		The Storable xpath prefixes 
	*/
	this.xpathPrefix = {};

	/*
		Prop: xpathSufix
		The Storable xpath sufixes 
	*/
	this.xpathSufix = {};	
	/*
		Func: getPath
		Get the path in the JCR for the type provided
		
		Parameters:
			type - A string representation of the type
		
		see <$type>
	*/
	this.getPath = function() {
		return objectsNodeName;
	};
	
	this.getQueryPath = function(type) {
		return "element(*,{})".tokenize(this.getNodeType(type));
	};

	/*
		Func: getPath
		Get the path in the JCR for the type provided
		
		Parameters:
			type - A string representation of the type
		
		see <$type>
	*/
	this.getNodeType = function(type) {
		return namespace + ":" + type;
	};

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
	this.addStorable = function(storable, classDef) {
		var type = $type(storable);
		var nodeTypeName = this.getNodeType(type);
		manager.classDefs[type] = classDef;
		
		
		//$log().debug("classDef:{}", JSON.stringify(classDef, null, "   "));
		manager.constructors += storable.constructor.toString();
		
		//Create the sql2 prefix
		manager.sql2Prefix[type] = " SELECT * FROM [{}] AS {}".tokenize(nodeTypeName, type); 
		
		//Create the xpathPrefix
		manager.xpathPrefix[type] = "//element(*," + nodeTypeName + ")";

		manager.xpathSufix[type] = "/(";
		for (var prop in classDef) {
			manager.xpathSufix[type] += "@" + prop + "|";
		};
		manager.xpathSufix[type] = manager.xpathSufix[type].slice(0, -1);
		manager.xpathSufix[type] += ")"; 		
		
		//Now let's make sure we have the types defined
		
		$log().debug("Adding storable NodeType[{}] sql2Prefix {} xpathPrefix {} xpathSufix {}",[nodeTypeName,manager.sql2Prefix[type],manager.xpathPrefix[type],manager.xpathSufix[type]] );
		
		/*
		var session = $om().getSession();
		var workspace = session.getWorkspace();

		var nsReg = workspace.getNamespaceRegistry();
		
		try {
			var uri = nsReg.getURI(namespace);
			$log().debug("Found {} namespace at {}", [namespace, uri]);
		} catch(e) {
			e.printStackTrace();
			$log().info("REGISTERING {} namespace.", namespace); 
			nsReg.registerNamespace(namespace, "http://www.fincayra.org/");
		}
		
		var typeManager = workspace.getNodeTypeManager();

		if ($log().isDebugEnabled()) {
			//Get all nodeTypes and debug
			var it = typeManager.getAllNodeTypes();
			while (it.hasNext()) {
				var nt = it.nextNodeType();
				//$log().debug("Found node type: {}", nt.getName());
			}
		}
		
		
		try {

			$log().info("Registering NodeType [{}] in workspace [{}].", [nodeTypeName, workspace.getName()]);
			var template = typeManager.createNodeTypeTemplate();
			var superTypes = java.lang.reflect.Array.newInstance(java.lang.String, 2);
			superTypes[0] = "nt:unstructured";
			superTypes[1] = "mix:referenceable";
			template.setDeclaredSuperTypeNames(superTypes);
			template.setName(nodeTypeName);
			
			for (var prop in classDef) { 
				if (classDef.hasOwnProperty(prop)) {
					var propSpec = classDef[prop];
					var rel = propSpec.rel;
					var type = propSpec.type;
					var jcrType = PropType[type] || PropType.Reference;
					
					//http://docs.jboss.org/modeshape/latest/manuals/reference/html/jcr.html#d0e8395
					//Check if the type is in the list
					var property = typeManager.createPropertyDefinitionTemplate();
					property.setName(prop);
					property.setRequiredType(jcrType);
					if (rel == Relationship.hasMany || rel == Relationship.ownsMany) {
						property.setMultiple(true);
					} else {
						property.setMultiple(false);
					}
					$log().info("Registering Property [{}] in nodeType [{}].", [prop, nodeTypeName]);
					template.getPropertyDefinitionTemplates().add(property);
				}
			}
			

			// Register the custom node type
			typeManager.registerNodeType(template, true);

			session.save();
		} catch (e) {
			e.printStackTrace();
		} finally {
			$log().debug("Logging out of session for node type creation.");
			session.logout();
		}
		*/
		
	};
	
	this.initDb = function() {
		//First create the Type objects and add them
		with (new JavaImporter(Packages.org.innobuilt.fincayra.persistence)) {
			for (clazz in this.classDefs) {
				if (this.classDefs.hasOwnProperty(clazz)) {
					var type = new Type(clazz);
					$log().debug("Creating persistent type:{}", type.name);
					var classDef = this.classDefs[clazz];
					for(propName in classDef) {
						if (classDef.hasOwnProperty(propName)) {
							var propRel = classDef[propName].rel;
							var propType = classDef[propName].type;

							type.addProperty(new Property(propName, propRel, new Type(propType)));
						}
					}
					
					pm.addType(type);
					
					if ($log().isDebugEnabled()) {
						var props = type.getProperties().iterator();
						while(props.hasNext()) {
							var prop = props.next();
							$log().debug("type-name:{}, prop-name:{}, prop-rel:{}, prop-type:{}", [type.name, prop.name, prop.relationship, prop.type.name]);
						}
					}
				}
			}
		
		}
		
		//Now initialize the db
		$log().debug("namespace:" + pm.namespace);	
		pm.init();
	};
	
	/*
		Func: hasStorable
		Check if a storable is defined in this ObjectManager.
		
		Parameters:
			storable - The storable to check
	*/
	this.hasStorable = function(storable) {
		return manager.classDefs.hasOwnProperty($type(storable));
	};
	
	this.getClassDef = function(type) {
		return manager.classDefs[type];
	};
	
	this.getSession = function() {
		var session = null;
		with (jcrPackages) {
			try {
				session = pm.session;
			} catch (e) {
				$log().error("EXCEPTION GETTING JCR SESSION : " + e);
				throw new SessionUnavailableException(e);
			} 
		}
		
		return session;
	};
	
	this.lock = function(id, session, timeout) {
		var to = timeout || new Number(90);
		var node = session.getNodeByIdentifier(id);
		return session.getWorkspace().getLockManager().lock(node.getPath(), true, true, to, null);
	};
	
	this.unlock = function(id, session) {
		var node = session.getNodeByIdentifier(id);
		session.getWorkspace().getLockManager().unlock(node.getPath());
	};
	
	this.isStorable = function(obj) {
		return manager.classDefs[$type(obj)];
	};
	
	/*
	 * Save to the repository in the following structure
	 * 
	 * For all simple types
	 * /Objects/[type]:[propertyName]=Value  could be a node if not a simple type
	 * /Objects/[type]:[propertyName]=Value[]  could be nodes if not simple types
	 * 
	 * For user defined types
	 * ownsA		/Objects/[type]/[propertyName]=new Node
	 * 
	 * ownsMany		/Objects/[type]:[propertyName]=Node[]
	 * 
	 * hasA			/Objects/[type]:[propertyName]=Node
	 * 
	 * hasMany		/Objects/[type]:[propertyName]=Node[]
	 */
	this.save = function(obj, s) {
		if(!manager.isStorable(obj)) throw new NotStorableException();
		var type = $type(obj);
		var path = manager.getPath();
		var session = s || manager.getSession();
		try {
			//validate
			var valResult = obj.validate();
			if (valResult != undefined) throw new ValidationException(valResult);

			//save
			var node = manager.saveObject(session, obj, path);
			obj.id = new String(node.getIdentifier());
			if ($log().isDebugEnabled()) {
				$log().debug("DUMPING NODE");
				pm.dump(node);
			}
			if (s == undefined) {
				session.save();
				$log().debug("Session saved for node:{}", obj.id);
			}
		} catch (e) {
			if (s == undefined) session.refresh(false);
			$log().error("CAUGHT EXCEPTION WHILE TRYING TO SAVE OBJECT");
			//TODO throw a specific exception
			throw e;
		} finally {
			if (s == undefined) session.logout();
		}

		if (obj.id) {
			obj = manager.findById(obj, obj.id, s); //TODO have to check if id is valid first
		}
		return obj;

	};
	
	this.saveObject = function(session, obj, path, isProp) {
		var node = null;
		obj.visited = true;
		var exc = null;
		with(jcrPackages) {
			
			var type = $type(obj);
			var nodeType = manager.getNodeType(type);
			var qPath = manager.getQueryPath(type);
			var root = null;
			var classDef = manager.getClassDef(type);
			//First check if this node already exists in repository
			//Every node has a uuid property
			if (obj.hasOwnProperty("id") && obj.id != null) {
				node = session.getNodeByIdentifier(obj.id);
				$log().debug("FOUND EXISTING NODE:" + node.getIdentifier());
			}
			
			if (node != null && isProp) {
				$log().debug("{} Node {} already exists.", [type, obj.id]);
				return node;//We don't have to store, it's an existing node, and cascading is not supported
			}
			
			obj.onSave();

			//Looks like we'll have to create a node
			if (node == null) {
				//First make sure no nodes exist with the unique values
				for (var prop in classDef) {
					var propSpec = classDef[prop];
					if (propSpec.unique) {
						$log().debug("SEARCHING FOR EXISTING NODE WITH " + prop + " = " + obj[prop]);
						var result = pm.find(session, "//" + qPath + "[@" + prop + "='" + obj[prop] + "']");
						//var result = pm.find(session, "//*[@" + prop + "='" + obj[prop] + "']");
						var it = result.getNodes();
						//Get out of here...  We have a constraint violation
						if (it.hasNext()) {
							node = it.nextNode();
							$log().debug("FOUND EXISTING NODE WITH " + prop + " = " + obj[prop] + " : " + node.getIdentifier());
							var e = new UniqueValueConstraintException();
							e.field = prop;
							throw e;
						}
					}
				}
				
				if (node == null) {
					//Create the node
					root = session.getRootNode();
					$log().debug("Adding node type:{} at path:{}", [nodeType, path]);
					node = root.addNode(path, nodeType);
					node.addMixin("mix:referenceable");
					node.addMixin("mix:lockable");
				}
			}
			
			$log().debug("SETTING PROPERTIES OF NODE AT:" + node.getPath() + " WITH uuid:" + node.getIdentifier());
			if (node != null) {
				//obj.node = node;
				obj.id = node.getIdentifier();
				//Set the nodes properties
				$log().debug(JSON.stringify(classDef));
				//we only save the properties defined in the classDef
				for (var prop in classDef) { if (classDef.hasOwnProperty(prop)) {
					var propSpec = classDef[prop];
					var rel = propSpec.rel;
					var propType = propSpec.type;
					
					if (propSpec.required && obj[prop] == undefined) throw new RequiredPropertyException(type + "." + prop + " required");
					if (obj[prop] != undefined) {
						$log().debug("SAVING PROPERTY: " + prop + " TYPE: " + $type(obj[prop]) + " REL:" + rel + " PROPTYPE:" + propType + " VALUE: " + obj[prop]);
					
						if (Type[propType]) {
							//Doesn't matter if the rel is ownsA or hasA, ownsMany or HasMany.  We still use a node property for simple types;
							if (obj[prop] instanceof Array) {
								//Create an array of values
								var values = java.lang.reflect.Array.newInstance(javax.jcr.Value, obj[prop].length);;
								obj[prop].each(function(val, i) {
									$log().debug("SETTING SIMPLE ownsMany or hasMany PROPERTY " + prop + "|" + val + "|" + PropType[propType]);
									values[i] = session.getValueFactory().createValue(val);
								});
								node.setProperty(prop, values, PropType[propType]);
							} else {
								$log().debug("SETTING SIMPLE ownsA or hasA PROPERTY " + prop + "|" + obj[prop] + "|" + PropType[propType]);
								node.setProperty(prop, obj[prop], PropType[propType]);
							}
							
						} else if (rel == Relationship.ownsA) {
							//Add a node at this path/prop
							if (!obj[prop].visited) {
								$log().debug("SETTING ownsA PROPERTY " + prop + "|" + propType);
								manager.saveObject(session, obj[prop], path + "/" + prop, true);
							}
						} else if (rel == Relationship.hasA) {
							//Add a node at the top path and store the reference here as a property
							$log().debug("SETTING hasA PROPERTY " + prop + "|" + propType);
							var propNode = manager.saveObject(session, obj[prop], manager.getPath(), true);
							node.setProperty(prop, propNode);
							
						} else if (rel == Relationship.hasMany || rel == Relationship.ownsMany) {
							//Add a nodes at the top path and store the reference here as a property
							var values = java.lang.reflect.Array.newInstance(javax.jcr.Value, obj[prop].length);;
							obj[prop].each(function(val, i) {
								$log().debug("SETTING hasMany PROPERTY " + prop + "|" + propType);
								var propNode = manager.saveObject(session, val, manager.getPath(), true);
								values[i] = session.getValueFactory().createValue(propNode);
							});
							node.setProperty(prop, values);
							
						} else {
							throw new Error("Relationship not defined");
						}
					}
				}
			}}
			
		}
		obj.visited = false;
		return node;
		
	};
	
	this.findByProperty = function(storable, prop) {
		var finder = new Finder();
		return finder.findByProperty(storable, prop);
	};
	
	this.findBySQL2 = function(storable, qry, offset, limit) {
		var finder = new Finder();
		return finder.findBySQL2(storable, qry, offset, limit);	
	}
	
	this.search = function(storable, qry, offset, limit, session) {
		var finder = new Finder();
		return finder.search(storable, qry, offset, limit, session);	
	};

	this.findById = function(storable, id, s) {
		var finder = new Finder();
		return finder.findById(storable, id, s);
	};
	
	this.getAll = function(storable, offset, limit) {
		var finder = new Finder();
		return finder.getAll(storable, offset, limit);
	};
	
	var Finder = function() {
		var finder = this;
		
		//Holds the objects created indexed by node identifier
		//Keeps us from getting in a recursive call
		this.index = {};
		
		this.findById = function(storable, id, s) {
			$log().debug(JSON.stringify(storable, null, "   "));
			if(!manager.isStorable(storable)) throw new NotStorableException();
			var obj;
			var type = $type(storable);
	
			try {
				var session = s || manager.getSession();
				var node = session.getNodeByIdentifier(id);
				obj = finder.getObject(type, node);
				return obj;
			} catch(e) {
				$log().debug("Swallowing Exception from findById:");
				if ($log().isDebugEnabled()) {
					e.printStackTrace();
				}
				//throw new ObjectNotFoundError();
			} finally {
				if (s == undefined) session.logout();
			}
			
			return obj;
		};
		
		this.findByProperty = function(storable, prop) {
			if(!manager.isStorable(storable)) throw new NotStorableException();
			var type = $type(storable);
			var path = manager.getPath();
			var propType = manager.classDefs[type][prop].type;
			$log().debug("PROPTYPE: " + propType);
			
			//If propType is simple use xpath, otherwise use reference
			if(Type[propType]) {
				$log().debug("FIND TYPE: " + type + " BY: " + prop);
				//return finder.search(storable,"[@" + prop + "='" + storable[prop] + "']");
				return finder.findBySQL2(storable,"{} WHERE {}.{}='{}'".tokenize(manager.sql2Prefix[type], type, prop, storable[prop]));
			} else {
				//First get the node of the prop we are searching by
				var objects = [];
				try {
					var session = manager.getSession();
					//TODO throw an exception if property does not have an id
					var node = session.getNodeByIdentifier(storable[prop].id);
					//get the references to this node by property name
					var refs = node.getReferences(prop);
					//now check that they are of the correct type by checking that their paths match
					path = "/" + path;
					$log().debug("Searching for nodes w/path:{} found {} nodes.",path, refs.size);
					while(refs.hasNext()) {
						var node = refs.nextProperty().parent;
						$log().debug("FOUND NODE w/path:{}",node.path);
						if (node.path.replace(path,"").match(/^(\[\d\])?$/)) {
							objects.push(finder.getObject(type, node));
						}
					}
				} catch (e) {
					throw e;
				} finally {
					session.logout();
				}
				
				return objects;
			}
		};

/*		
		this.search = function(storable, qry, offset, limit, s) {
			if(!manager.isStorable(storable)) throw new NotStorableException();
			var type = $type(storable);
			var prefix = manager.xpathPrefix[type];
			var sufix = manager.xpathSufix[type];
			$log().debug("FIND TYPE: " + type + " WITH: " + qry);
			var query = (qry.indexOf("]") > -1)?prefix + qry.replace("]","]"+sufix):prefix + qry + sufix;
			return finder.findByXPath(storable,query, offset, limit, s);
			//return finder.findByXPath(storable,"//" + path + qry, offset, limit, s);
		};
*/

		this.search = function(storable, qry, offset, limit, s) {
			if(!manager.isStorable(storable)) throw new NotStorableException();
			var type = $type(storable);
			var prefix = manager.sql2Prefix[type];
			$log().debug("FIND TYPE: " + type + " WHERE " + qry);
			return finder.findBySQL2(storable,"{} WHERE {}".tokenize(manager.sql2Prefix[type], qry), offset, limit, s);
		};
		

		this.findBySQL2 = function(storable, qry, offset, limit, s) {
			var objects = [];
			var type = $type(storable);
			var session = s || manager.getSession();
			try {
				var result;
				var q = session.getWorkspace().getQueryManager().createQuery(qry, javax.jcr.query.Query.JCR_SQL2);
				if (offset) q.setOffset(offset);
				if (limit) q.setLimit(limit);
				$log().debug(">>>>>>>>>>>>>>>>>>>QUERY WITH SQL2:{} OFFSET:{} LIMIT:{}",[q.getStatement(), offset + "", limit + ""]);
				result = q.execute();
				
				if (result != null) {
					var it = result.getNodes();
					$log().debug("Ran Query!");
					if (it.hasNext()) {
						$log().debug("Found Results!");
						while(it.hasNext()) {
							var node = it.nextNode();
							//Coerce the object into the type
							if ($log().isDebugEnabled()) {
								$log().debug("FOUND NODE:{} PATH:{}", [node.getIdentifier(), node.getPath()]);
								$log().debug("DUMPING NODE");
								pm.dump(node);
							}
							objects.push(finder.getObject(type, node));
						}
					}
					$log().debug("Processed Results!");
				}
			} catch (e) {
				throw e;
			} finally {
				if (s == undefined) session.logout();
			}
			return objects;
		
		};
		
		this.findByXPath = function(storable, qry, offset, limit, s) {
			var objects = [];
			var type = $type(storable);
			var session = s || manager.getSession();
			$log().debug(">>>>>>>>>>>>>>>>>>>QUERY WITH XPATH:{} OFFSET:{} LIMIT:{}",[qry, offset + "", limit + ""]);
			try {
				var result;
				if (offset != undefined && limit != undefined) {
					result = pm.find(session, qry, offset, limit);
				} else {
					result = pm.find(session, qry);
				}
				var it = result.getNodes();
				$log().debug("Ran Query!");
				if (it.hasNext()) {
					$log().debug("Found Results!");
					while(it.hasNext()) {
						var node = it.nextNode();
						//Coerce the object into the type
						if ($log().isDebugEnabled()) {
							$log().debug("FOUND NODE:{} PATH:{}", [node.getIdentifier(), node.getPath()]);
							$log().debug("DUMPING NODE");
							pm.dump(node);
						}
						objects.push(finder.getObject(type, node));
					}
				}
				$log().debug("Processed Results!");
			} catch (e) {
				throw e;
			} finally {
				if (s == undefined) session.logout();
			}
			return objects;
		
		};
		
		this.getAll = function(storable, offset, limit) {
			if(!manager.isStorable(storable)) throw new NotStorableException();
			return finder.findBySQL2(storable,manager.sql2Prefix[$type(storable)], offset, limit);
		};
		
		this.getObject = function(type, node) {
			var classDef = manager.getClassDef(type);
			var js = manager.constructors + "\nnew " + type + "();";
			//$log().debug("EVALUATING JS:{}",js);
			var obj = eval(js);
			obj.id = new String(node.getIdentifier().toString());
			//put the object and the id in the index
			finder.index[obj.id] = obj;
			
			//we only load the properties defined in the classDef
			for (prop in classDef) { if (classDef.hasOwnProperty(prop)) {
				var propSpec = classDef[prop];
				var rel = propSpec.rel;
				var propType = propSpec.type;
				$log().debug("LOOKING FOR PROPERTY:" + prop);
				if (node.hasProperty(prop)) {
					$log().debug("FOUND PROPERTY:" + prop);
					if (Type[propType]) {
						//Doesn't matter if the rel is ownsA or hasA, ownsMany or HasMany.  We still use a node property for simple types;
						if (rel == Relationship.ownsMany || rel == Relationship.hasMany) {
							$log().debug("GETTING SIMPLE ownsMany or hasMany PROPERTY " + prop + "|" + Type[propType]);
							var values = node.getProperty(prop).getValues();
							var propValues = [];
							values.each(function(val) {
								propValues.push(finder.getValue(val, propType));
							});
							obj[prop] = propValues;
						} else { 
							$log().debug("GETTING SIMPLE ownsA or hasA PROPERTY " + prop + "|" + Type[propType]);
							obj[prop] = finder.getValue(node.getProperty(prop), propType);
						}
					} else if (rel == Relationship.ownsA) {
						//Get a node at this path/prop
						$log().debug("GETTING ownsA PROPERTY " + prop + "|" + Type[propType]);
						var propNode = node.getNode(prop);
						if(!finder.nodeVisited(propNode)) {
							obj[prop] = finder.getObject(propType,propNode);
						} else {
							obj[prop] = finder.index[propNode.getIdentifier()];
						}
					} else if (rel == Relationship.hasA) {
						//get the node referenced by the property
						$log().debug("GETTING hasA PROPERTY " + prop + "|" + Type[propType]);
						var propNode = node.getProperty(prop).getNode();
						if (!finder.nodeVisited(propNode)) {
							obj[prop] = finder.getObject(propType, propNode);
						} else {
							obj[prop] = finder.index[propNode.getIdentifier()];
						}
						
					} else if (rel == Relationship.hasMany || rel == Relationship.ownsMany) {
						//get the nodes referenced by the property
						var property = node.getProperty(prop);
						obj[prop] = [];
						$log().debug("GETTING hasMany PROPERTY " + prop + "|" + propType);
						var values = property.getValues();
						values.each(function(value) {
							$log().debug("FOUND hasMany PROPERTY " + prop + "|" + propType);
							var propNode = $om().getSession().getNodeByUUID(value.getString()); 
							if(!finder.nodeVisited(propNode)) {
								$log().debug("Getting objects for property {}", prop);
								obj[prop].push(finder.getObject(propType, propNode));
							} else {
								obj[prop].push(finder.index[propNode.getIdentifier()]);
							}
						});
						
					}
				}				
				
			}}
			return obj;
		};
		
		//Works for Property and Value
		this.getValue = function(property, type) {
			switch (type) {
				case Type.String:
					return new String(property.getString());
					break;
				case Type.Long:
					return new Number(property.getLong());
					break;
				case Type.Double:
					return new Number(property.getDouble());
					break;
				case Type.Decimal:
					return new Number(property.getDecimal());
					break;
				case Type.Date:
					return new Date(property.getDate());
					break;
				case Type.Boolean:
					return new Boolean(property.getBoolean());
					break;
				default:
				  return new String(property.getString());
			}
		
		};
		
		this.nodeVisited = function(propNode) {
			var visited = !(this.index[propNode.getIdentifier()] == undefined);
			$log().debug("Node: {}, Visited: {}", [propNode.getIdentifier(), visited]);
			return visited;
		};
	};
	
	this.remove = function(storable, s) {

		if(storable.id) {
			var session = s || manager.getSession();
			
			try {
				session.getNodeByIdentifier(storable.id).remove();
				storable.onRemove();
				if (s == undefined) session.save();
			} catch (e) {
				e.printStackTrace();
				throw new UnableToDeleteObjectError();
			} finally {
				if (s == undefined) session.logout();
			}
		}
		
		return storable;
			
	};
	
	this.getFinder = function() {
		return new Finder();
	};
	
	this.removeAll = function(storable) {
		
	};
}

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
Storable.prototype.save = function(session) {
	return $om().save(this, session);
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
Storable.prototype.remove = function(session) {
	return $om().remove(this, session);
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
Storable.prototype.findByProperty = function(prop) {
	return $om().findByProperty(this,prop);
};


/*
	Func: search
	Find an object in permanent storage by the given qry appended to the path.
	For Example: [jcr:contains(@description, 'The')]
	
	Returns:
	An array of matching objects
*/
Storable.prototype.search = function(qry, offset, limit, session) {
	return $om().search(this, qry, offset, limit, session);
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
