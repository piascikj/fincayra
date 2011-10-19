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

var mongoDB = {};
mongoDB.packages = new JavaImporter(com.mongodb,
									com.mongodb.gridfs,
									com.mongodb.util,
									org.bson,
									org.bson.io,
									org.bson.types,
									org.bson.util);

function MongoDBObjectManager() {
	var manager = this;

	this.initDb = function() {
		
		//First create the Type objects and add them
		with (mongoDB.packages) {
			this.mongo = new Mongo($config().store.location);
			var db = this.openDB();
			
			for (clazz in this.classDefs) {
				if (this.classDefs.hasOwnProperty(clazz)) {
					//get the collection for this clazz
					var collection = db.getCollection(clazz);
					//create the index for uuid
					collection.ensureIndex(new BasicDBObject("uuid", 1),"uuid",true);
					var classDef = this.classDefs[clazz];
					for(propName in classDef) {
						if (classDef[propName] != undefined && classDef.hasOwnProperty(propName) && typeof classDef[propName] !='function' ) {
							var property = classDef[propName];

							//Set the index
							if (property.unique) {
								collection.ensureIndex(new BasicDBObject(propName, 1),propName,true);
							} else if (property.index) {
								collection.ensureIndex(new BasicDBObject(propName, 1),propName,false);
							} 
						}
					}
				}
			}
		}
		
	};
	
	this.destroy = function() {
		this.mongo.close();
	};
	
	this.openDB = function() {
		var db = this.mongo.getDB("fincayra");
		return db;
	};
	
	this.exportDB = function() {
		//TODO implement
	}; 		
	
	this.importDB = function(file) {
		//TODO implement
	};
	
	this.txn = function(transact) {
	/*
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
		*/
	}
	
	/*
	 * Save to orientdb
	 */
	this.save = function(obj, col) {
		if(!manager.isStorable(obj)) throw new NotStorableException();
		$log().debug("Preparing to save object:{}",obj.json());
		var type = $type(obj);
		var collection = col || this.openDB().getCollection(type);
		var saved;
		try {
			//validate
			var valResult = obj.validate();
			if (valResult != undefined) throw new ValidationException(valResult);

			//save
			var doc = this.saveObject(collection,obj,false);
			$log().debug("preparing to save doc:{}", doc.toJSON("indent:6"));
			collection.save(doc);
			$log().debug("******************* DONE SAVING DOC*********************");
			$log().debug(com.mongodb.util.JSON.serialize(doc));
			saved = obj;
			
			
		} catch (e) {
			$log().error("CAUGHT EXCEPTION WHILE TRYING TO SAVE OBJECT");
			//TODO throw a specific exception
			throw e;
		} 

		return saved;

	};
	
	this.saveObject = function(coll, obj, isProp) {
		obj.visited = true;
		var doc = null;
		with(mongoDB.packages) {
			
			var type = $type(obj);
			var classDef = manager.getClassDef(type);
			var existing = false;

			//First check if this node already exists in repository
			//Every doc has a _id property
			if (obj.hasOwnProperty("id") && obj.id != null && obj.id != undefined) {
				var oid = new ObjectId(obj.id);
				var searchById = new BasicDBObject("_id", oid);
				var doc = coll.findOne(searchById);
				if (doc != null) {
					if (isProp) {
						return obj.id;
					} else {
						if (doc.containsField("uuid")) existing = true;
					}
					$log().debug("FOUND EXISTING DOC:" + doc.get("_id"));
				}
			}
			
			obj.onSave(db);

			//Looks like we'll have to create a doc
			if (doc == null) {
				doc = new BasicDBObject();
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
									doc.put(prop, java.util.Arrays.asList(val));
								} else {
									doc.put(prop, val);
								}
							} else if (rel == Relationship.ownsA) {
								$log().debug("SETTING ownsA PROPERTY " + prop + "|" + propType);
								var propDoc = manager.saveObject(coll, manager.cast(obj[prop],propType), true);
								doc.put(prop, propDoc);
							} else if  (rel == Relationship.hasA) {
								$log().debug("SETTING hasA PROPERTY " + prop + "|" + propType);
								//Store as reference, it should have been saved on it's own first, so we only store it's uuid
								doc.put(prop, obj[prop].uuid.toString());
							} else if (rel == Relationship.ownsMany) {
								var values = java.lang.reflect.Array.newInstance(BasicDBObject, obj[prop].length);
								obj[prop].each(function(val, i) {
									$log().debug("SETTING ownsMany PROPERTY " + prop + "|" + propType);
									var propDoc = manager.saveObject(db, manager.cast(val,propType), true);
									values[i] = propDoc;
								});
								doc.put(prop, java.util.Arrays.asList(values));
							} else if (rel == Relationship.hasMany) {
								obj[prop].each(function(val, i) {
									$log().debug("SETTING hasMany PROPERTY " + prop + "|" + propType);
									values[i] = val.uuid;
								});
								doc.put(prop, java.util.Arrays.asList(values));								
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
	
	this.search = function(storable, qry, offset, limit, txnContext, count) {
		var finder = new Finder();
		return finder.search(storable, qry, offset, limit, txnContext, count);	
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
		
		this.findById = function(storable, id, collection) {
			var finder = this;
			$log().debug(JSON.stringify(storable, null, "   "));
			if(!manager.isStorable(storable)) throw new NotStorableException();
			var obj,doc,coll;
			var type = $type(storable);
			with(mongoDB.packages) {
				coll = collection || manager.openDB().getCollection(type);
				var oid = new ObjectId(id);
				searchById = new BasicDBObject("_id", oid);
				doc = coll.findOne(searchById);
				if (doc != null) {
					obj = finder.getObject(type, doc);
				}
			}
			
			return obj;
		};
		
		this.findByProperty = function(storable, prop, clause, offset, limit, collection) {
			var finder = this;
			if(!manager.isStorable(storable)) throw new NotStorableException();
			var type = $type(storable);
			var coll = collection || manager.openDB().getCollection(type);
			var propType = manager.classDefs[type][prop].type;
			var results;
			var objects = [];
			
			$log().debug("PROPTYPE: " + propType);
			
			with(mongoDB.packages) {
				if(Type[propType]) {
					$log().debug("FIND TYPE: " + type + " BY: " + prop);
					var qry = getDBObject({prop:storable[prop]});
					objects = finder.search(storable, qry, offset, limit);
				} else {
					$log().debug("FIND TYPE: " + type + " BY: " + prop);
					var qry = getDBObject({prop:storable[prop].uuid});
					objects = finder.search(storable, qry, offset, limit);
				}
			}
			
			$log().debug("Found objects:" + JSON.stringify(objects, null, "   "));
			return objects;
		};

		this.search = function(storable, qry, offset, limit, collection, count) {
			var finder = this;
			if(!manager.isStorable(storable)) throw new NotStorableException();
			var type = $type(storable);
			var cursor;
			
			var objectsTmp = [], objects;
			var coll = collection || manager.openDB().getCollection(type);
			with(mongoDB.packages) {
				var query = finder.getDBObject(qry);
				cursor = collection.find(query);
			}
			
			if (count) {
				return new Number(cursor.count());
			} else {
				if (limit) cursor.limit(limit);
				if (offset)	cursor.skip(offset);
				//loop the results and get the objects
				cursor.toArray().each(function(doc) {
					objectsTmp.push(finder.getObject(type, doc));
				});

				if (offset != undefined && limit != undefined && objectsTmp.length > 0) {
					objects = {
						results: objectsTmp,
						nextOffset: offset + limit,
						limit: limit
					};
				} else {
					objects = {results:objectsTmp};
				}
			}
			
			return objects;
		};
		
		this.getDBObject = function(obj) {
			return com.mongodb.util.JSON.parse(JSON.stringify(obj));
		}; 

		this.getAll = function(storable, offset, limit, collection) {
			var finder = this;
			if(!manager.isStorable(storable)) throw new NotStorableException();
			var type = $type(storable);
			var coll = collection || manager.openDB().getCollection(type);
			var cursor = coll.find();
			var objects = [];
			cursor.toArray().each(function(doc) {
				objects.push(finder.getObject(type, doc));
			});
			return objects;
		};
		
		this.getObject = function(type, doc) {
			$log().debug("GETTING OBJECT FOR:" + doc.toJSON());
			var finder = this;
			var classDef = manager.getClassDef(type);
			var obj = manager.cast({}, type);
			obj.id = new String(doc.get("_id"));
			
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
							var field = doc.get(prop);
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
							obj[prop] = finder.getValue(doc.get(prop), propType);
						}
					} else if (rel == Relationship.ownsA) {
						$log().debug("GETTING ownsA PROPERTY " + prop + "|" + propType);
						var propDoc = doc.get(prop);
						if (propDoc != null) {obj[prop] = finder.getObject(propType,propDoc);}
					} else if (rel == Relationship.hasA) {
						obj[prop] = manager.cast({uuid:doc.get(prop)},propType).findByUUId();
					} else if (rel == Relationship.ownsMany) {
						$log().debug("GETTING ownsMany PROPERTY " + prop + "|" + propType);
						var propValues = [];
						var field = doc.get(prop);
						if (field != null) {
							var values = field.toArray();
							values.each(function(propDoc) {
								if (propDoc != null) {propValues.push(finder.getObject(propType,propDoc));}
							});
						}
						obj[prop] = propValues;

					} else if (rel == Relationship.hasMany) {
						$log().debug("GETTING hasMany PROPERTY " + prop + "|" + propType);
						var propValues = [];
						var field = doc.field(prop);
						if (field != null) {
							var values = doc.field(prop).toArray();
							values.each(function(uuid) {
								if (uuid != null) {propValues.push(manager.cast({uuid:doc.get(prop)},propType).findByUUId());}
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
	
	this.remove = function(storable, collection) {
		if(!manager.isStorable(storable)) throw new NotStorableException();
		var obj,doc;
		var type = $type(storable);
		with(mongoDB.packages) {
			var coll = collection || manager.openDB().getCollection(type);
			obj = storable.findById(coll);
			obj.onRemove(coll);
			var oid = new ObjectId(obj.id);
			searchById = new BasicDBObject("_id", oid);
			doc = coll.findOne(searchById);
			coll.remove(doc);
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


MongoDBObjectManager.extend(ObjectManager);
ObjectManager.instance = new MongoDBObjectManager();
