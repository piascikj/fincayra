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
	
function SearchManager() {
	var $this = this;
	
	with (Lucene.Packages) {
		$this.directory = dir  = NIOFSDirectory.open(new java.io.File("fincayra-index"));
		$this.version = Version.LUCENE_32;
		$this.analyzer = new StandardAnalyzer($this.version);
		$this.indexWriterConfig = new IndexWriterConfig($this.version, $this.analyzer);

		if ($config().indexOnStartUp) {
			$this.indexWriterConfig.setOpenMode(IndexWriterConfig.OpenMode.CREATE);
			// Add new documents to an existing index:
			//iwc.setOpenMode(OpenMode.CREATE_OR_APPEND);

			// Optional: for better indexing performance, if you
			// are indexing many documents, increase the RAM
			// buffer.  But if you do this, increase the max heap
			// size to the JVM (eg add -Xmx512m or -Xmx1g):
			//
			// iwc.setRAMBufferSizeMB(256.0);

			var writer = new IndexWriter($this.directory, $this.indexWriterConfig);

			var classDefs = $om().classDefs;
			
			for (clazz in classDefs) {if (classDefs.hasOwnProperty(clazz)) {
				var classDef = classDefs[clazz];
				var instance = $getInstance(clazz);
				//$log().debug("const:{}", instance.constructor);
				var allObjects = $om().getAll(instance);
				$log().debug("{}:{}", [clazz, JSON.stringify(allObjects, null, "   ")]);

				for (prop in classDef) {if (classDef.hasOwnProperty(prop)) {
					var propDef = classDef[prop];
					if (propDef.search) {
						var store = propDef.search.store?Field.Store.YES:Field.Store.NO;
						var index = Lucene.Index[propDef.search.index];
						$log().debug("{}.{} store={} index={}:{}",[clazz, prop, store, propDef.search.index, index]);
						//Get an instance of the object
					}
				}}
			}}
			
			writer.close();
		//End indexOnStartUp
		}
	
	
	}
}

SearchManager.instance = new SearchManager();

/*
	Function: $sm
	Returns the current SearchManager
*/
function $sm() {
	return SearchManager.instance;
}


