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

var Lucene = {};
Lucene.Packages = new JavaImporter(
	org.apache.lucene.analysis,
	org.apache.lucene.analysis.standard,
	org.apache.lucene.document,
	org.apache.lucene.index,
	org.apache.lucene.store,
	org.apache.lucene.util,
	org.apache.lucene.search,
	org.apache.lucene.queryParser);

Lucene.Index = {};
with (Lucene.Packages) {
	Lucene.Index.ANALYZED=Field.Index.ANALYZED;
	Lucene.Index.ANALYZED_NO_NORMS=Field.Index.ANALYZED_NO_NORMS;
	Lucene.Index.NO=Field.Index.NO;
	Lucene.Index.NOT_ANALYZED=Field.Index.NOT_ANALYZED;
}

Lucene.TermVector = {};
with (Lucene.Packages) {
	Lucene.TermVector.NO = Field.TermVector.NO;
	Lucene.TermVector.WITH_OFFSETS = Field.TermVector.WITH_OFFSETS;
	Lucene.TermVector.WITH_POSITIONS = Field.TermVector.WITH_POSITIONS;
	Lucene.TermVector.WITH_POSITIONS_OFFSETS = Field.TermVector.WITH_POSITIONS_OFFSETS;
	Lucene.TermVector.YES = Field.TermVector.YES;
}
	
function SearchManager() {
	var $this = this;
	$this.init = function() {
		with (Lucene.Packages) {
			$this.directory = dir  = NIOFSDirectory.open(new java.io.File("fincayra-index"));
			$this.version = Version.LUCENE_32;
			$this.analyzer = new PerFieldAnalyzerWrapper(new StandardAnalyzer($this.version));
			
			var classDefs = $om().classDefs;
			for (clazz in classDefs) {if (classDefs.hasOwnProperty(clazz)) {
				//Set up the analyzers per field for uuid fields
				$this.addAnalyzers(undefined, clazz);
			}}

			$this.createWriterConfig = new IndexWriterConfig($this.version, $this.analyzer);
			$this.createWriterConfig.setOpenMode(IndexWriterConfig.OpenMode.CREATE);

			if ($config().indexOnStartUp) {
				// Optional: for better indexing performance, if you
				// are indexing many documents, increase the RAM
				// buffer.  But if you do this, increase the max heap
				// size to the JVM (eg add -Xmx512m or -Xmx1g):
				//
				// iwc.setRAMBufferSizeMB(256.0);

				var writer = new IndexWriter($this.directory, $this.createWriterConfig);

				for (clazz in classDefs) {if (classDefs.hasOwnProperty(clazz)) {
					var instance = $getInstance(clazz);
					//$log().debug("const:{}", instance.constructor);
					var allObjects = $om().getAll(instance);
					//$log().debug("{}:{}", [clazz, JSON.stringify(allObjects, null, "   ")]);
					
					allObjects.each(function(obj) {
						var doc = $this.getDoc(obj);
						$log().debug("adding object to index:{}", obj.json());
						writer.addDocument(doc);

					});
				}}
				
				writer.close();
			//End indexOnStartUp
			}
			
			//This needs to be recreated if index is updated, maybe every user should have one, or we have a pool???
			$this.searcher = new IndexSearcher($this.directory);
		
		
		}
	};
	
	$this.destroy = function() {
		$this.searcher.close();
	};
	
	$this.addAnalyzers = function(prefix, clazz) {
		prefix = prefix || "";
		var classDef = $om().getClassDef(clazz);
		$log().debug("Adding analyzers for object type:{}", clazz);
		with (Lucene.Packages) {
			for (prop in classDef) {if (classDef.hasOwnProperty(prop)) {
				var propDef = classDef[prop];
				if (propDef.search) {
					var fieldName = prefix + prop;
					if (Type[propDef.type] != undefined) {
						if (prop == "uuid") {
							$log().debug("Adding Keyword analyzer for field:{}", fieldName);
							$this.analyzer.addAnalyzer(fieldName, new KeywordAnalyzer());
						}
					} else {
						$this.addAnalyzers(fieldName + ".", propDef.type);
					}
				}
			}}
		}
	
	};

	$this.update = function(obj) {
		with (Lucene.Packages) {
			var updateWriterConfig = new IndexWriterConfig($this.version, $this.analyzer);
			updateWriterConfig.setOpenMode(IndexWriterConfig.OpenMode.CREATE_OR_APPEND);

			var writer = new IndexWriter($this.directory, updateWriterConfig);

			var doc = $this.getDoc(obj);
			writer.updateDocument(new Term("uuid", obj.uuid), doc);

			writer.close();
		}
	};
	
	$this.remove = function(obj) {
		with (Lucene.Packages) {
			var updateWriterConfig = new IndexWriterConfig($this.version, $this.analyzer);
			updateWriterConfig.setOpenMode(IndexWriterConfig.OpenMode.CREATE_OR_APPEND);

			var writer = new IndexWriter($this.directory, updateWriterConfig);
			var query = new TermQuery(new Term("uuid", obj.uuid));
			var searcher = new IndexSearcher($this.directory);
			
			var hits = searcher.search(query, 100).scoreDocs;
			$log().debug("Found " + hits.length + " documents to delete with uuid:" + obj.uuid);
			writer.deleteDocuments(new Term("uuid", obj.uuid));

			writer.close();
		}
	};
	
	$this.addFields = function(prefix, obj, doc) {
		prefix = prefix || "";
		var clazz = $type(obj);
		var classDef = $om().getClassDef(clazz);
		$log().debug("Adding fields to document for object type:{}", clazz);
		with (Lucene.Packages) {
			for (prop in classDef) {if (classDef.hasOwnProperty(prop)) {
				var propDef = classDef[prop];
				if (propDef.search) {
					var fieldName = prefix + prop;
					var store = propDef.search.store?Field.Store.YES:Field.Store.NO;
					var index = Lucene.Index[propDef.search.index];
					var termVector = Lucene.TermVector[propDef.search.termVector];
					
					$log().debug("{}.{} store={} index={}:{} termVector:{}:{}",[clazz, prop, store, propDef.search.index, index, propDef.search.termVector, termVector]);
					
					//Add the field to the doc
					if (Type[propDef.type]) {
						if (propDef.rel == Relationship.ownsMany) {
							obj[prop].each(function(val) {
								var field = new Field(fieldName, val, store, index, termVector);
								doc.add(field);
							});
						} else {
							var field = new Field(fieldName, obj[prop], store, index, termVector);
							doc.add(field);
						}
					} else {
						if (propDef.rel == Relationship.ownsMany || propDef.rel == Relationship.hasMany) {
							obj[prop].each(function(val) {
								$this.addFields(fieldName + ".", val, doc);
							});
						} else {
							$this.addFields(fieldName + ".", obj[prop], doc);
						}
					}

					//TODO need to make allowance for numeric fields
				}
			}}
		}
	};
	
	$this.getDoc = function(obj) {
		var clazz = $type(obj);
		var classDef = $om().getClassDef(clazz);
		with (Lucene.Packages) {

			var doc = new Document();
			
			//Add the id field
			var idField = new Field("id", obj.id, Field.Store.YES, Lucene.Index.NOT_ANALYZED, Field.TermVector.NO);
			doc.add(idField);
			
			//Add the clazz field
			var clazzField = new Field("clazz", clazz, Field.Store.YES, Lucene.Index.ANALYZED, Field.TermVector.NO);
			doc.add(clazzField);
			
			$this.addFields(undefined, obj, doc);
			
			if ($log().isDebugEnabled()) {
				$log().debug("Adding Doc:", doc.toString());
				doc.getFields().toArray().each(function(field) {
					$log().debug(field.name() + " = " + field.stringValue());
				});
			}


			return doc;

		}
		
	}

	
	$this.search = function(options) {
		var defaults = {
			defaultField:"clazz", //This is just a placeholder since we know the field is stored
			storable:undefined,
			qry:"a*",
			offset: 0,
			limit: 250
		}
		
		options = defaults.extend(options);
		with (Lucene.Packages) {
			var analyzer = $this.analyzer;
			//var searcher = $this.searcher;
			var searcher = new IndexSearcher($this.directory);
			try {
				var parser = new QueryParser($this.version, options.defaultField, analyzer);
				if (options.storable != undefined) options.qry = options.qry + " AND clazz:" + $type(options.storable);
				var query = parser.parse(options.qry);
				var end = options.offset + options.limit;
				$log().debug("qry={}",options.qry);
				var results = searcher.search(query, end);
				var hits = results.scoreDocs;
				
				var out = [];
				$log().debug("hits={}, offest={}", [hits.length, options.offset]);
				for (i = options.offset;i < end && i < hits.length;i++) {
					
					var hit = hits[i];
					var doc = searcher.doc(hit.doc);
					var uuid = doc.get("uuid");
					var clazz = doc.get("clazz");
					if ($log().isDebugEnabled()) {
						$log().debug("Found Doc:", doc.toString());
						doc.getFields().toArray().each(function(field) {
							$log().debug(field.name() + " = " + field.stringValue());
						});
					}
					var obj = $getInstance(clazz);
					obj.uuid = uuid;
					
					out.push(obj.findByUUId());
				}
			} finally {
				searcher.close();
			}
			
		}
		return out;
	}
	
	$this.init();
}

SearchManager.instance = new SearchManager();

/*
	Function: $sm
	Returns the current SearchManager
*/
function $sm() {
	return SearchManager.instance;
}


