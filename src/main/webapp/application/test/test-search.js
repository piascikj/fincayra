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
$isAPI(true);
var lucenePackages = new JavaImporter(
	org.apache.lucene.analysis,
	org.apache.lucene.analysis.standard,
	org.apache.lucene.document,
	org.apache.lucene.index,
	org.apache.lucene.store,
	org.apache.lucene.util,
	org.apache.lucene.search,
	org.apache.lucene.queryParser);

var objects = [
	{
		id:"0",
		name:"doc0",
		text:"this is doc0"
	},
	{
		id:"1",
		name:"doc1",
		text:"this is doc1"
	},
	{
		id:"2",
		name:"doc2",
		text:"this is worst doc2"
	},
	{	
		id:"3",
		name:"doc3",
		text:"this is the best doc3"
	},
	{
		id:"4",
		name:"doc4",
		text:"this is the best doc4"
	}
];

with (lucenePackages) {
	
	var dir  = NIOFSDirectory.open(new java.io.File("fincayra-index"));
	var version = Version.LUCENE_32;
	var analyzer = new StandardAnalyzer(version);

	$api({
		createIndex : function() {
			var iwc = new IndexWriterConfig(version, analyzer);
			
			// Create a new index in the directory, removing any
			// previously indexed documents:
			iwc.setOpenMode(IndexWriterConfig.OpenMode.CREATE);
			// Add new documents to an existing index:
			//iwc.setOpenMode(OpenMode.CREATE_OR_APPEND);

			// Optional: for better indexing performance, if you
			// are indexing many documents, increase the RAM
			// buffer.  But if you do this, increase the max heap
			// size to the JVM (eg add -Xmx512m or -Xmx1g):
			//
			// iwc.setRAMBufferSizeMB(256.0);

			var writer = new IndexWriter(dir, iwc);
			objects.each(function(o) {
				
				// make a new, empty document
				var doc = new Document();

				// Add the path of the file as a field named "path".  Use a
				// field that is indexed (i.e. searchable), but don't tokenize 
				// the field into separate words and don't index term frequency
				// or positional information:
				var nameField = new Field("name", o.name, Field.Store.YES, Field.Index.NOT_ANALYZED_NO_NORMS);
				nameField.setOmitTermFreqAndPositions(true);
				doc.add(nameField);

				var idField = new Field("id", o.id, Field.Store.YES, Field.Index.NOT_ANALYZED_NO_NORMS);
				idField.setOmitTermFreqAndPositions(true);
				doc.add(idField);
				
				// Add the last modified date of the file a field named "modified".
				// Use a NumericField that is indexed (i.e. efficiently filterable with
				// NumericRangeFilter).  This indexes to milli-second resolution, which
				// is often too fine.  You could instead create a number based on
				// year/month/day/hour/minutes/seconds, down the resolution you require.
				// For example the long value 2011021714 would mean
				// February 17, 2011, 2-3 PM.
				//var modifiedField = new NumericField("modified");
				//modifiedField.setLongValue(file.lastModified());
				//doc.add(modifiedField);

				// Add the contents of the file to a field named "contents".  Specify a Reader,
				// so that the text of the file is tokenized and indexed, but not stored.
				// Note that FileReader expects the file to be in UTF-8 encoding.
				// If that's not the case searching for special characters will fail.
				doc.add(new Field("text", o.text, Field.Store.NO, Field.Index.ANALYZED));

				// New index, so we just add the document (no old document can be there):
				writer.addDocument(doc);
				// Existing index (an old copy of this document may have been indexed) so 
				// we use updateDocument instead to replace the old one matching the exact 
				// path, if present:
				//writer.updateDocument(new Term("path", file.getPath()), doc);

				// NOTE: if you want to maximize search performance,
				// you can optionally call optimize here.  This can be
				// a costly operation, so generally it's only worth
				// it when your index is relatively static (ie you're
				// done adding documents to it):
				//
				// writer.optimize();
			});
			writer.close();
		},
		
		search : function() {
			var parms = $getPageParams();
			var searcher = new IndexSearcher(dir);
			var parser = new QueryParser(version, "text", analyzer);
			var query = parser.parse(parms.qry);
			 // Collect enough docs to show 5 pages
			//TopDocs results = searcher.search(query, 5 * hitsPerPage);
			var results = searcher.search(query, 100);
			//ScoreDoc[] hits = results.scoreDocs;
			var hits = results.scoreDocs;
			
			var out = {results:{}};
			out.totalHits = results.totalHits
			
			hits.each(function(hit) {
				var doc = searcher.doc(hit.doc);
				var id = doc.get("id");
				out.results[id] = objects[new Number(id)];
			});
			
			searcher.close();
			
			$j(out);
		}
	});
}
