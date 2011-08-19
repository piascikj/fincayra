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

var orientDB = {};
orientDB.packages = new JavaImporter(
	com.orientechnologies.orient.server,
	com.orientechnologies.orient.core.db.record,
	com.orientechnologies.orient.core.record.impl, 
	com.orientechnologies.orient.core.sql.query,
	com.orientechnologies.orient.core.db.document,
	com.orientechnologies.orient.core.metadata.schema,
	com.orientechnologies.orient.core.id,
	com.orientechnologies.orient.core.command,
	com.orientechnologies.orient.core.db.tool,
	org.innobuilt.fincayra.persistence.orientDB);

orientDB.Type = {};
with(orientDB.packages) {
	orientDB.Type.String=OType.STRING;
	orientDB.Type.Boolean=OType.BOOLEAN;
	orientDB.Type.Date=OType.DATE;
	orientDB.Type.Decimal=OType.FLOAT;
	orientDB.Type.Double=OType.DOUBLE;
	orientDB.Type.Long=OType.LONG;
}

$log().debug(JSON.stringify(orientDB.Type, null, "   "));

function OrientDBObjectManager() {
	var manager = this;
	
	this.url = "local:fincayra-store";
	
	this.server;
	
	this.initDb = function() {
		var path = $app().getRootDir() + "/fincayra-lib/db/config/orientdb-server.xml";
		var conf = new java.io.File(path);
		//First create the Type objects and add them
		with (orientDB.packages) {
			this.server = OServerMain.server();
			if (this.server == null) {
				this.server = OServerMain.create();
				this.server.startup(conf);
			}
			
			com.orientechnologies.orient.core.db.document.ODatabaseDocumentPool.global().setup(50,1000);
			
			var db = this.openDB();
			
			for (clazz in this.classDefs) {
				if (this.classDefs.hasOwnProperty(clazz)) {
					var schema = db.getMetadata().getSchema();
					//Check if the class exists if not create it!
					var oClass;
					if(schema.existsClass(clazz)) {
						$log().debug("Found persistent type:{}", clazz);
						oClass = schema.getClass(clazz);
					} else {
						$log().debug("Creating persistent type:{}", clazz);
						oClass = schema.createClass(clazz);
					}
					
					var classDef = this.classDefs[clazz];
					for(propName in classDef) {
						if (classDef[propName] != undefined && classDef.hasOwnProperty(propName) && typeof classDef[propName] !='function' ) {
							var property = classDef[propName];
							var oProperty;
							if (oClass.existsProperty(propName)) {
								$log().debug("Getting {} property: {}",[clazz, propName]);
								oProperty = oClass.getProperty(propName);
							} else {
								$log().debug("Creating {} property: {}",[clazz, propName]);
								var oPropType = orientDB.Type[property.type];
								var linkedType = undefined;

								if (oPropType == undefined) {
									if (property.rel == Relationship.hasA) {
										oPropType = OType.LINK;
									} else if (property.rel == Relationship.hasMany) {
										oPropType = OType.LINKLIST;
									} else if (property.rel == Relationship.ownsA) {
										oPropType = OType.EMBEDDED;
									}
								}
								
								if (property.rel == Relationship.ownsMany) {
									linkedType = oPropType;
									oPropType = OType.EMBEDDEDLIST;
								}
								
								if (linkedType != undefined) {
									oProperty = oClass.createProperty(propName, oPropType, linkedType);
								} else {	
									oProperty = oClass.createProperty(propName, oPropType);
								}
							}
							
							//Set the index
							if (property.unique) {
								oProperty.createIndex(OProperty.INDEX_TYPE.UNIQUE);
							} else if (property.index) {
								if (property.type == Type.String) {
									oProperty.createIndex(OProperty.INDEX_TYPE.FULLTEXT);
								} else {
									oProperty.createIndex(OProperty.INDEX_TYPE.NOTUNIQUE);
								}
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
		com.orientechnologies.orient.core.db.document.ODatabaseDocumentPool.global().close();
		this.server.shutdown();
	};
	
	this.openDB = function() {
		var dbx = new com.orientechnologies.orient.core.db.document.ODatabaseDocumentTx(this.url);
		var db = null;
		if (!dbx.exists()) {
			db = dbx.create();
		} else {
			db = com.orientechnologies.orient.core.db.document.ODatabaseDocumentPool.global().acquire(this.url,"admin", "admin");
		}
		
		return db;
	};
	
	this.exportDB = function() {
		var dir = $config().store.exportDir;
		var fileName = "fincayra_orientDB_export_{}.gz".tokenize(new Date().format("MMddyyyy.HHmmss"));
		with (orientDB.packages) {
			var db = this.openDB();
			try {
				var listener = new OCommandOutputListener({onMessage:function(msg) {$log().info(msg);}});
				var exporter = new ODatabaseExport(db, "{}/{}".tokenize(dir,fileName), listener); 
				exporter.exportDatabase();
			} finally {
				db.close();
			}
		}
		return fileName;
	}; 		
	
	this.importDB = function(file) {
		var dir = $config().store.exportDir;
		with (orientDB.packages) {
			var db = this.openDB();
			try {
				db["delete"]();
				db = this.openDB();
				var listener = new OCommandOutputListener({onMessage:function(msg) {$log().info(msg);}});
				var importer = new ODatabaseImport(db, "{}/{}".tokenize(dir,file), listener); 
				importer.importDatabase();
				$sm().init();
			} finally {
				db.close();
			}
		}
		return true;
	};
	
	this.txn = function(transact) {
		var db = this.openDB();
		var failed;
		try{
			$log().debug("STARTING TXN...");
			db.begin();
			transact(db);
			db.commit();
		} catch(e){
			$log().error("Rolling Back the transaction");
			db.rollback();
			failed = e;
		} finally{
			db.close();
		}
		
		if (failed != undefined) throw failed;
	}
	
	/*
	 * Save to orientdb
	 */
	this.save = function(obj, deebee) {
		if(!manager.isStorable(obj)) throw new NotStorableException();
		$log().debug("Preparing to save object:{}",obj.json());
		var type = $type(obj);
		var db = deebee || this.openDB();
		var saved;
		try {
			//validate
			var valResult = obj.validate();
			if (valResult != undefined) throw new ValidationException(valResult);

			//save
			var doc = this.saveObject(db,obj,false);
			$log().debug("preparing to save doc:{}", doc.toJSON("indent:6"));
			db.save(doc);
			$log().debug("******************* DONE SAVING DOC*********************");
			$log().debug(doc.toJSON("rid,version,class,indent:6"));
			//saved = this.getFinder().getObject(type,doc);
			saved = obj;
			$log().debug("******************* DONE GETTING OBJECT FROM DOC*********************");
			$log().debug(doc.toJSON("rid,version,class,indent:6"));
			
			
		} catch (e) {
			$log().error("CAUGHT EXCEPTION WHILE TRYING TO SAVE OBJECT");
			//TODO throw a specific exception
			throw e;
		} finally {
			if (deebee == undefined) db.close();
		}

		return saved;

	};
	
	this.saveObject = function(db, obj, isProp) {
		obj.visited = true;
		var doc = null;
		with(orientDB.packages) {
			
			var type = $type(obj);
			var classDef = manager.getClassDef(type);
			var existing = false;

			//First check if this node already exists in repository
			//Every doc has a @rid property
			if (obj.hasOwnProperty("id") && obj.id != null && obj.id != undefined) {
				var rid = new ORecordId(obj.id);
				var results = db.query(OrientDBHelper.createQuery("select from " + type + " where @rid = ?"), rid);
				if (results.size() > 0) {
					if (isProp) {
						return rid;
					} else {
						doc = results.get(0);
						if (doc.containsField("uuid")) existing = true;
					}
					$log().debug("FOUND EXISTING DOC:" + doc.getIdentity());
				}
			}
			
			obj.onSave(db);

			//Looks like we'll have to create a doc
			if (doc == null) {
				doc = new ODocument(db, type);
			}
			
			if (doc != null) {
				//Set the nodes properties
				$log().debug(JSON.stringify(classDef));
				//we only save the properties defined in the classDef
				for (var prop in classDef) {
					if (prop == "uuid" && existing) continue;
					if (classDef.hasOwnProperty(prop) && typeof classDef[prop] != 'function') {
						var propSpec = classDef[prop];
						var rel = propSpec.rel;
						var propType = propSpec.type;
						
						//Throw an exception if the property is undefined but required
						if (propSpec.required && obj[prop] == undefined) throw new RequiredPropertyException(type + "." + prop + " required");
						if (obj[prop] != undefined) {
							$log().debug("SAVING PROPERTY: " + prop + " TYPE: " + $type(obj[prop]) + " REL:" + rel + " PROPTYPE:" + propType + " VALUE: " + obj[prop]);
						
							if (Type[propType]) {
								var val = manager.toJava(obj[prop], propType);
								$log().debug("Saving field:{} in javascript:{} as Java:{}",[prop, obj[prop], val]);
								if (rel == Relationship.ownsMany) {
									$log().debug("Saving as list...");
									doc.field(prop, java.util.Arrays.asList(val), OType.EMBEDDEDLIST);
								} else {
									doc.field(prop, val, orientDB.Type[propType]);
								}
							} else if (rel == Relationship.ownsA || rel == Relationship.hasA) {
								$log().debug("SETTING ownsA or hasA PROPERTY " + prop + "|" + propType);
								var propDoc = manager.saveObject(db, manager.cast(obj[prop],propType), true);
								doc.field(prop, propDoc);
							} else if (rel == Relationship.hasMany || rel == Relationship.ownsMany) {
								var values = java.lang.reflect.Array.newInstance(ODocument, obj[prop].length);
								obj[prop].each(function(val, i) {
									$log().debug("SETTING hasMany or ownsMany PROPERTY " + prop + "|" + propType);
									var propDoc = manager.saveObject(db, manager.cast(val,propType), true);
									values[i] = propDoc;
								});
								doc.field(prop, java.util.Arrays.asList(values));
								
							} else {
								throw new Error("Relationship not defined");
							}
						}
					}
				}
			}
			
		}
		return doc;
		
	};
	
	this.findByProperty = function(storable, prop, clause, offset, limit, txnContext) {
		var finder = new Finder();
		return finder.findByProperty(storable, prop, clause, offset, limit, txnContext);
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
	
	function Finder() {
		//Holds the objects created indexed by node identifier
		//Keeps us from getting in a recursive call
		this.index = {};
		
		this.findById = function(storable, id, deebee) {
			var finder = this;
			$log().debug(JSON.stringify(storable, null, "   "));
			if(!manager.isStorable(storable)) throw new NotStorableException();
			var obj,doc,db;
			var type = $type(storable);
			with(orientDB.packages) {
				try {
					db = deebee || manager.openDB();
					var results = db.query(OrientDBHelper.createQuery("select from " + type + " where @rid = ?"), new ORecordId(id));
					if (results.size() > 0) {
						doc = results.get(0);
						obj = finder.getObject(type, doc);
					}
				} finally {
					if (deebee == undefined) db.close();
				}
			}
			
			return obj;
		};
		
		this.findByProperty = function(storable, prop, clause, offset, limit, deebee) {
			var finder = this;
			if(!manager.isStorable(storable)) throw new NotStorableException();
			var type = $type(storable);
			var propType = manager.classDefs[type][prop].type;
			var db, results;
			var objects = [];
			
			try {
				db = deebee || manager.openDB();
				$log().debug("PROPTYPE: " + propType);
				
				with(orientDB.packages) {
					//If propType is simple use sql, otherwise use reference
					if(Type[propType]) {
						$log().debug("FIND TYPE: " + type + " BY: " + prop);
						var val = storable[prop];
						var qryString = "select from " + type + " where " + prop + " = ?";
						if (clause != undefined) qryString = qryString+ " " + clause;
						$log().debug("Running query: {}",qryString);
						var query = OrientDBHelper.createQuery(qryString);
						if (limit) query.setLimit(limit);
						if (offset)	query.setBeginRange(new ORecordId(offset));
						var jProp = manager.toJava(val,propType);
						$log().debug("? = {}",jProp);
						results = db.query(query,jProp);
					} else {
						var qryString = "select from " + type + " where " + prop + ".@rid = ?";
						if (clause != undefined) qryString = qryString + " " + clause;
						$log().debug("Running query: {}",qryString);
						var query = OrientDBHelper.createQuery(qryString);
						if (limit) query.setLimit(limit);
						if (offset)	query.setBeginRange(new ORecordId(offset));
						results = db.query(query, new ORecordId(storable[prop].id));
					}
				}
				//loop the results and get the objects
				results.toArray().each(function(doc) {
					objects.push(finder.getObject(type, doc));
				});
			} finally {
				if (deebee == undefined && db != undefined) db.close();
			}
			
			$log().debug("Found objects:" + JSON.stringify(objects, null, "   "));
			return objects;
		};

		this.search = function(storable, qry, offset, limit, deebee) {
			var finder = this;
			if(!manager.isStorable(storable)) throw new NotStorableException();
			var type = $type(storable);
			var db;
			var results;
			var objectsTmp = [], objects;
			try {
				db = deebee || manager.openDB();
				with(orientDB.packages) {
					$log().debug("FIND TYPE: " + type + " WHERE " + qry);
					var query = OrientDBHelper.createQuery("select from " + type + " where " + qry);
					if (limit) query.setLimit(limit);
					if (offset)	query.setBeginRange(new ORecordId(offset));
					results = db.query(query);
				}
				
				//loop the results and get the objects
				results.toArray().each(function(doc) {
					objectsTmp.push(finder.getObject(type, doc));
				});
				
				if (offset != undefined && limit != undefined && objectsTmp.length > 0) {
					objects = {
						results: objectsTmp,
						nextOffset: manager.nextOffset(objectsTmp[objectsTmp.length - 1].id),
						limit: limit
					};
				} else {
					objects = objectsTmp;
				}
				
			} finally {
				if (deebee == undefined && db != undefined) db.close();
			}
			return objects;
		};
		
		this.searchSelective = function(opts) {
			var finder = this;
			//TODO allow the caller to defined fields that will be returned
			var defaults = {
				//storable:undefined, 
				//qry:undefined, 
				//offset:undefined,
				//limit:undefined,
				//deebee:undefined,
				//fields:undefined
			};
			opts = opts.extend(defaults);
			
			if(!manager.isStorable(opts.storable)) throw new NotStorableException();
			var type = $type(opts.storable);
			var db;
			var results;
			var objectsTmp = [], objects;
			try {
				db = opts.deebee || manager.openDB();
				with(orientDB.packages) {
					$log().debug("FIND TYPE: " + type + " WHERE " + opts.qry);
					var query = OrientDBHelper.createQuery("select from " + type + " where " + opts.qry);
					if (opts.limit) query.setLimit(opts.limit);
					if (opts.offset)	query.setBeginRange(new ORecordId(opts.offset));
					results = db.query(query);
				}
				
				//loop the results and get the objects
				results.toArray().each(function(doc) {
					objectsTmp.push(finder.getObject(type, doc));
				});
				
				if (opts.offset != undefined && opts.limit != undefined && objectsTmp.length > 0) {
					objects = {
						results: objectsTmp,
						nextOffset: manager.nextOffset(objectsTmp[objectsTmp.length - 1].id),
						limit: opts.limit
					};
				} else {
					objects = objectsTmp;
				}
				
			} finally {
				if (opts.deebee == undefined && db != undefined) db.close();
			}
			return objects;
		};

		this.getAll = function(storable, offset, limit, deebee) {
			var finder = this;
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
				
				if (results.size() > 0) {
					//loop the results and get the objects
					results.toArray().each(function(doc) {
						objects.push(finder.getObject(type, doc));
					});
				}
			} finally {
				if (deebee == undefined && db != undefined) db.close();
			}
			return objects;
		};
		
		this.getObject = function(type, doc) {
			$log().debug("GETTING OBJECT FOR:" + doc.toJSON());
			var finder = this;
			var classDef = manager.getClassDef(type);
			var obj = manager.cast({}, type);
			obj.id = new String(doc.getIdentity().toString()).replace(/^\#/,"");
			
			//If it's in the index, get it there
			if (finder.index[obj.id]) {return finder.index[obj.id];}
			//put the object and the id in the index
			finder.index[obj.id] = obj;
			
			//we only load the properties defined in the classDef
			var prop;
			for (prop in classDef) { 
				$log().debug("LOOKING FOR PROPERTY:" + prop);
				if (classDef.hasOwnProperty(prop) && doc.containsField(prop)) {
					var propSpec = classDef[prop];
					var rel = propSpec.rel;
					var propType = propSpec.type;
					$log().debug("FOUND PROPERTY:({}){} SPEC:{}",[propType, prop, JSON.stringify(propSpec)]);
					if (Type.hasOwnProperty(propType)) {
						//Doesn't matter if the rel is ownsA or hasA, ownsMany or HasMany.  We still use a node property for simple types;
						if (rel == Relationship.ownsMany || rel == Relationship.hasMany) {
							$log().debug("GETTING SIMPLE ownsMany or hasMany PROPERTY " + prop + "|" + propType);
							var field = doc.field(prop, orientDB.Type[propType]);
							var propValues = [];
							if (field != null) {
								var values = field.toArray();
								values.each(function(val) {
									propValues.push(finder.getValue(val, propType));
								});
							}
							obj[prop] = propValues;
						} else { 
							$log().debug("GETTING SIMPLE ownsA or hasA PROPERTY " + prop + "|" + propType);
							obj[prop] = finder.getValue(doc.field(prop, orientDB.Type[propType]), propType);
						}
					} else if (rel == Relationship.ownsA || rel == Relationship.hasA) {
						$log().debug("GETTING ownsA PROPERTY " + prop + "|" + propType);
						var propDoc = doc.field(prop);
						if (propDoc != null) {obj[prop] = finder.getObject(propType,propDoc);}
						
					} else if (rel == Relationship.hasMany || rel == Relationship.ownsMany) {
						$log().debug("GETTING ownsMany or hasMany PROPERTY " + prop + "|" + propType);
						var propValues = [];
						var field = doc.field(prop);
						if (field != null) {
							var values = doc.field(prop).toArray();
							values.each(function(propDoc) {
								if (propDoc != null) {propValues.push(finder.getObject(propType,propDoc));}
							});
						}
						obj[prop] = propValues;
					}
					
				} else {
					$log().debug("{} is not a property.",prop);
				}
			}
			return obj;
		};
		
		//Works for Property and Value
		this.getValue = function(val, type) {
			var finder = this;
			if ($log().isDebugEnabled() && val != null)	$log().debug("Converting Java {} to javascript {}",[val.getClass().getName(), val]);
			
			if (val == null) return undefined;
			
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
					return new Date(val.getTime());
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
				if (results.size() > 0) {
					obj = storable.findById(deebee);
					doc = results.get(0);
					obj.onRemove(db);
					//since delete is a key word we have to do it this way
					doc["delete"]();
				}
			} catch(e) {
				if ($log().isDebugEnabled()) {
					e.printStackTrace();
				}
				throw e;
			} finally {
				if (deebee == undefined && db != undefined) db.close();
			}
		}
		
		return obj;
			
	};
	
	this.getFinder = function() {
		return new Finder();
	};
	
	this.toJavaArray = function(val, javaType, type) {
		var ary = java.lang.reflect.Array.newInstance(javaType, val.length);
		for (i=0; i < val.length;i++) {
			ary[i] = this.toJava(val[i], type);
		}
		return ary;
	}
	
	this.toJava = function(val, type) {
			if (val instanceof Array) {
				var javaType;
				switch (type) {
					case Type.Long:
						javaType = java.lang.Long;
						break;
					case Type.Double:
						javaType = java.lang.Double;
						break;
					case Type.Decimal:
						javaType = java.lang.Float;
						break;
					case Type.Date:
						javaType = java.lang.Date;
						break;
					case Type.Boolean:
						javaType = java.lang.Boolean;
						break;
					default:
					  javaType = java.lang.String;
				}
				return this.toJavaArray(val, javaType, type);
			} else {
				if (val == undefined) return null;
				switch (type) {
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
						if (!val instanceof Date) {
							val = new Date(val); 
						}
						return new java.util.Date(val.getTime());
						break;
					case Type.Boolean:
						return new java.lang.Boolean(val);
						break;
					default:
					  return val.toString();
				}
			}
	}
		
	this.removeAll = function(storable) {
		
	};
}


OrientDBObjectManager.prototype.nextOffset = function(seed) {
	$log().debug("seed:{}", seed);
	var regex = /^(\d+\:)(\d+)$/;
	if (regex.test(seed)) {
		var pieces = regex.exec(seed);
		return pieces[1] + (new Number(pieces[2]) + 1);
	}
	
	return null;
}

OrientDBObjectManager.extend(ObjectManager);
ObjectManager.instance = new OrientDBObjectManager();
