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
	class: ObjectManager
	Responsible for managing object persistence
	
*/
var orientDB = {};
orientDB.packages = new JavaImporter(
	com.orientechnologies.orient.server,
	com.orientechnologies.orient.core.record.impl, 
	com.orientechnologies.orient.core.sql.query,
	com.orientechnologies.orient.core.db.document,
	com.orientechnologies.orient.core.metadata.schema,
	com.orientechnologies.orient.core.id,
	org.innobuilt.fincayra.persistence.orientDB);

orientDB.Type = {};
with(orientDB.packages) {
	orientDB.Type.String = OType.STRING;
	orientDB.Type.Boolean=OType.BOOLEAN;
	orientDB.Type.Date=OType.DATE;
	orientDB.Type.Decimal=OType.FLOAT;
	orientDB.Type.Double=OType.DOUBLE;
	orientDB.Type.Long=OType.LONG;
}

function ObjectManager() {
	var manager = this;
	
	this.server;
	
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
		manager.classDefs[type] = classDef;
		
		
		//$log().debug("classDef:{}", JSON.stringify(classDef, null, "   "));
		manager.constructors += storable.constructor.toString();
		
		//Create the sql2 prefix
		//manager.sql2Prefix[type] = " SELECT * FROM [{}] AS {}".tokenize(nodeTypeName, type); 
	};
	
	this.cast = function(obj, type) {
		var js = manager.constructors + "\nnew " + type + "();";
		//$log().debug("EVALUATING JS:{}",js);
		obj = eval(js).extend(obj);
		
		return obj;
	}
	
	this.initDb = function() {
		var path = $app().getRootDir() + "/fincayra-lib/db/config/orientdb-server.xml";
		var conf = new java.io.File(path);
		//First create the Type objects and add them
		with (orientDB.packages) {
			this.server = OServerMain.create();
			this.server.startup(conf);
			
			db = this.openDB();
			
			for (clazz in this.classDefs) {
				if (this.classDefs.hasOwnProperty(clazz)) {
					var schema = db.getMetadata().getSchema();
					//Check if the class exists if not create it!
					var oClass;
					if(schema.existsClass(clazz)) {
						$log().info("Found persistent type:{}", clazz);
						oClass = schema.getClass(clazz);
					} else {
						$log().info("Creating persistent type:{}", clazz);
						oClass = schema.createClass(clazz);
					}
					
					var classDef = this.classDefs[clazz];
					for(propName in classDef) {
						if (classDef[propName] != undefined && classDef.hasOwnProperty(propName)) {
							var property = classDef[propName];
							var oProperty;
							if (oClass.existsProperty(propName)) {
								$log().info("Getting {} property: {}",[clazz, propName]);
								oProperty = oClass.getProperty(propName);
							} else {
								$log().info("Creating {} property: {}",[clazz, propName]);
								var oPropType = orientDB.Type[property.type];
								if (oPropType == undefined) {
									if (property.rel == Relationship.hasA) {
										oPropType = OType.LINK;
									} else if (property.rel == Relationship.hasMany) {
										oPropType = OType.LINKLIST;
									} else if (property.rel == Relationship.ownsA) {
										oPropType = OType.EMBEDDED;
									} else if (property.rel == Relationship.ownsMany) {
										oPropType = OType.EMBEDDEDLIST;
									}
								}
								oProperty = oClass.createProperty(propName, oPropType);
							}
							
							//TODO allow for other indexes through index attribute on classdef
							if (property.unique) {
								oProperty.createIndex(OProperty.INDEX_TYPE.UNIQUE);
							}
							
							if (property.required) {
								oProperty.setMandatory(true).setNotNull(true);
							}

						}
					}
					
					schema.save();
				}
			}
			
			db.close();
		}
		
	};
	
	this.destroy = function() {
		this.server.shutdown();
	};
	
	this.openDB = function() {
		var db = new com.orientechnologies.orient.core.db.document.ODatabaseDocumentTx("local:fincayra-store");
		if (!db.exists()) {
			db = db.create();
			
		} else {
			db = db.open("admin", "admin");
		}
		
		return db;
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

	this.isStorable = function(obj) {
		return manager.classDefs[$type(obj)];
	};
	
	this.txn = function(transact) {
		var db = this.openDB();
		try{
			db.begin();
			transact(db);
			db.commit();
		}catch(e){
			db.rollback();
			throw e;
		} finally{
			db.close();
		}
	}
	
	/*
	 * Save to orientdb
	 */
	this.save = function(obj, deebee) {
		if(!manager.isStorable(obj)) throw new NotStorableException();
		var type = $type(obj);
		var db = deebee || this.openDB();
		try {
			//validate
			var valResult = obj.validate();
			if (valResult != undefined) throw new ValidationException(valResult);

			//save
			var doc = this.saveObject(db,obj,false);
			doc.save();
			obj.id = doc.getIdentity().toString();
		} catch (e) {
			$log().error("CAUGHT EXCEPTION WHILE TRYING TO SAVE OBJECT");
			//TODO throw a specific exception
			throw e;
		} finally {
			if (deebee == undefined) db.close();
		}

		return obj.findById();

	};
	
	this.saveObject = function(db, obj, isProp) {
		obj.visited = true;
		var doc = null;
		with(orientDB.packages) {
			
			var type = $type(obj);
			var classDef = manager.getClassDef(type);

			//First check if this node already exists in repository
			//Every doc has a @rid property
			if (obj.hasOwnProperty("id") && obj.id != null && obj.id != undefined) {
				var results = db.query(OrientDBHelper.createQuery("select from " + type + " where @rid = ?"), new ORecordId(obj.id));
				if (results.size() > 0) doc = results.get(0);
				$log().debug("FOUND EXISTING DOC:" + doc.getIdentity());
			}
			
			if (doc != null && isProp) {
				$log().debug("{} doc {} already exists.", [type, obj.id]);
				return doc;//We don't have to store, it's an existing node, and cascading is not supported
			}
			
			obj.onSave();

			//Looks like we'll have to create a doc
			if (doc == null) {
				doc = new ODocument(db, type);
			}
			
			if (doc != null) {
				//Set the nodes properties
				$log().debug(JSON.stringify(classDef));
				//we only save the properties defined in the classDef
				for (var prop in classDef) { if (classDef.hasOwnProperty(prop)) {
					var propSpec = classDef[prop];
					var rel = propSpec.rel;
					var propType = propSpec.type;
					
					//Throw an exception if the property is undefined but required
					if (propSpec.required && obj[prop] == undefined) throw new RequiredPropertyException(type + "." + prop + " required");
					if (obj[prop] != undefined) {
						$log().debug("SAVING PROPERTY: " + prop + " TYPE: " + $type(obj[prop]) + " REL:" + rel + " PROPTYPE:" + propType + " VALUE: " + obj[prop]);
					
						if (Type[propType]) {
							doc.field(prop, manager.toJava(obj[prop], type));
						} else if (rel == Relationship.ownsA || rel == Relationship.hasA) {
							$log().debug("SETTING ownsA or hasA PROPERTY " + prop + "|" + propType);
							doc.field(prop, manager.saveObject(db, manager.cast(obj[prop],propType), true));
						} else if (rel == Relationship.hasMany || rel == Relationship.ownsMany) {
							var values = java.lang.reflect.Array.newInstance(ODocument, obj[prop].length);;
							obj[prop].each(function(val, i) {
								$log().debug("SETTING hasMany or ownsMany PROPERTY " + prop + "|" + propType);
								var propDoc = manager.saveObject(db, manager.cast(val,propType), true);
								values[i] = propDoc;
							});
							doc.field(prop, values);
							
						} else {
							throw new Error("Relationship not defined");
						}
					}
				}
			}}
			
		}
		return doc;
		
	};
	
	this.findByProperty = function(storable, prop) {
		var finder = new Finder();
		return finder.findByProperty(storable, prop);
	};
	
	this.search = function(storable, qry, offset, limit, txnContext) {
		var finder = new Finder();
		return finder.search(storable, qry, offset, limit, txnContext);	
	};

	this.findById = function(storable, id, txnContext) {
		var finder = new Finder();
		return finder.findById(storable, id, txnContext);
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
		
		this.findById = function(storable, id, deebee) {
			$log().debug(JSON.stringify(storable, null, "   "));
			if(!manager.isStorable(storable)) throw new NotStorableException();
			var obj,doc,db;
			var type = $type(storable);
			with(orientDB.packages) {
				try {
					db = deebee || manager.openDB();
					var results = db.query(OrientDBHelper.createQuery("select from " + type + " where @rid = ?"), new ORecordId(id));
					if (results.size() > 0) doc = results.get(0);
					obj = finder.getObject(type, doc);
					return obj;
				} catch(e) {
					$log().debug("Swallowing Exception from findById:");
					if ($log().isDebugEnabled()) {
						e.printStackTrace();
					}
					//throw new ObjectNotFoundError();
				} finally {
					if (deebee == undefined) db.close();
				}
			}
			
			return obj;
		};
		
		this.findByProperty = function(storable, prop, deebee) {
			if(!manager.isStorable(storable)) throw new NotStorableException();
			var type = $type(storable);
			var propType = manager.classDefs[type][prop].type;
			var db;
			var results;
			var objects = [];
			
			try {
				db = deebee || manager.openDB();
				$log().debug("PROPTYPE: " + propType);
				
				with(orientDB.packages) {
					//If propType is simple use sql, otherwise use reference
					if(Type[propType]) {
						$log().debug("FIND TYPE: " + type + " BY: " + prop);
						var val = storable[prop];
						results = db.query(OrientDBHelper.createQuery("select from " + type + " where " + prop + " = ?"),manager.toJava(val,propType));
					} else {
						results = db.query(OrientDBHelper.createQuery("select from " + type + " where " + prop + ".@rid = ?"), new ORecordId(storable[prop].id));
					}
				}
				//loop the results and get the objects
				results.toArray().each(function(doc) {
					objects.push(finder.getObject(type, doc));
				});
			} finally {
				if (deebee == undefined) db.close();
			}
			
			return objects;
		};

		this.search = function(storable, qry, offset, limit, deebee) {
			if(!manager.isStorable(storable)) throw new NotStorableException();
			var type = $type(storable);
			var db;
			var results;
			var objects = [];
			try {
				db = deebee || manager.openDB();
				with(orientDB.packages) {
					$log().debug("FIND TYPE: " + type + " WHERE " + qry);
					var query = OrientDBHelper.createQuery("select from " + type + " where " + qry);
					if (limit) query.setLimit(limit);
					if (offset) query.setBeginRange(new ORecordId(offset));
					results = db.query(query);
				}
				
				//loop the results and get the objects
				results.toArray().each(function(doc) {
					objects.push(finder.getObject(type, doc));
				});
			} finally {
				if (deebee == undefined) db.close();
			}
			return objects;
		};
		
		this.getAll = function(storable, offset, limit, deebee) {
			if(!manager.isStorable(storable)) throw new NotStorableException();
			var type = $type(storable);
			var db;
			var results;
			var objects = [];
			try {
				db = deebee || manager.openDB();
				with(orientDB.packages) {
					$log().debug("FIND TYPE: " + type);
					var query = OrientDBHelper.createQuery("select from " + type);
					if (limit) query.setLimit(limit);
					if (offset) query.setBeginRange(new ORecordId(offset));
					results = db.query(query);
				}
				
				//loop the results and get the objects
				results.toArray().each(function(doc) {
					objects.push(finder.getObject(type, doc));
				});
			} finally {
				if (deebee == undefined) db.close();
			}
			return objects;
		};
		
		this.getObject = function(type, doc) {
			var classDef = manager.getClassDef(type);
			var js = manager.constructors + "\nnew " + type + "();";
			//$log().debug("EVALUATING JS:{}",js);
			var obj = eval(js);
			obj.id = new String(doc.getIdentity().toString()).replace(/^\#/,"");
			//put the object and the id in the index
			finder.index[obj.id] = obj;
			
			//we only load the properties defined in the classDef
			for (prop in classDef) { if (classDef.hasOwnProperty(prop)) {
				var propSpec = classDef[prop];
				var rel = propSpec.rel;
				var propType = propSpec.type;
				$log().debug("LOOKING FOR PROPERTY:" + prop);
				if (doc.containsField(prop)) {
					$log().debug("FOUND PROPERTY:" + prop);
					if (Type[propType]) {
						//Doesn't matter if the rel is ownsA or hasA, ownsMany or HasMany.  We still use a node property for simple types;
						if (rel == Relationship.ownsMany || rel == Relationship.hasMany) {
							$log().debug("GETTING SIMPLE ownsMany or hasMany PROPERTY " + prop + "|" + Type[propType]);
							var values = doc.field(prop).toArray();
							var propValues = [];
							values.each(function(val) {
								propValues.push(finder.getValue(val, propType));
							});
							obj[prop] = propValues;
						} else { 
							$log().debug("GETTING SIMPLE ownsA or hasA PROPERTY " + prop + "|" + Type[propType]);
							obj[prop] = finder.getValue(doc.field(prop), propType);
						}
					} else if (rel == Relationship.ownsA || rel == Relationship.hasA) {
						$log().debug("GETTING ownsA PROPERTY " + prop + "|" + propType);
						var propDoc = doc.field(prop);
						if (propDoc != null) obj[prop] = finder.getObject(propType,propDoc);
					} else if (rel == Relationship.hasMany || rel == Relationship.ownsMany) {
						$log().debug("GETTING ownsMany or hasMany PROPERTY " + prop + "|" + propType);
						var values = doc.field(prop).toArray();
						var propValues = [];
						values.each(function(propDoc) {
							if (propDoc != null) propValues.push(finder.getObject(propType,propDoc));
						});
						obj[prop] = propValues;
					}
				}				
				
			}}
			return obj;
		};
		
		//Works for Property and Value
		this.getValue = function(val, type) {
			switch (type) {
				case Type.String:
					return new String(val);
					break;
				case Type.Long:
					return new Number(val);
					break;
				case Type.Double:
					return new Number(val);
					break;
				case Type.Decimal:
					return new Number(val);
					break;
				case Type.Date:
					return new Date(val);
					break;
				case Type.Boolean:
					return new Boolean(val);
					break;
				default:
				  return new String(val);
			}
		
		};

	};
	
	this.remove = function(storable, deebee) {
		if(!manager.isStorable(storable)) throw new NotStorableException();
		var obj,doc,db;
		var type = $type(storable);
		with(orientDB.packages) {
			try {
				db = deebee || manager.openDB();
				var results = db.query(OrientDBHelper.createQuery("select from " + type + " where @rid = ?"), new ORecordId(storable.id));
				if (results.size() > 0) doc = results.get(0);
				doc["delete"]();
			} catch(e) {
				$log().debug("Swallowing Exception from findById:");
				if ($log().isDebugEnabled()) {
					e.printStackTrace();
				}
				//throw new ObjectNotFoundError();
			} finally {
				if (deebee == undefined) db.close();
			}
		}
		
		return storable;
			
	};
	
	this.getFinder = function() {
		return new Finder();
	};
	
	this.toJava = function(val, type) {
		switch (type) {
			case Type.String:
				return val.toString();
				break;
			case Type.Long:
				return new java.lang.Long(val);
				break;
			case Type.Double:
				return new java.lang.Double(val);
				break;
			case Type.Decimal:
				return new java.lang.Float(val);
				break;
			case Type.Date:
				return new Date(val);
				break;
			case Type.Boolean:
				return new Boolean(val);
				break;
			default:
			  return val.toString();
		}
	
	}
		
	this.removeAll = function(storable) {
		
	};
}
