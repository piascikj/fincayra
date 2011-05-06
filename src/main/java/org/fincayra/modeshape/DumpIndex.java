package org.fincayra.modeshape;
import java.io.File;
import java.io.IOException;
import java.util.List;

import javax.xml.stream.FactoryConfigurationError;
import javax.xml.stream.XMLOutputFactory;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamWriter;

import org.apache.lucene.document.Document;
import org.apache.lucene.document.Field;
import org.apache.lucene.document.Fieldable;
import org.apache.lucene.index.CorruptIndexException;
import org.apache.lucene.index.IndexReader;
import org.apache.lucene.store.FSDirectory;

/**
 * Dumps a Lucene index as XML. Dumps all documents with their fields and
 * values to stdout.
 * 
 * Blog post at http://ktulu.com.ar/blog/2009/10/12/dumping-lucene-indexes-as-xml/
 * 
 * @author Luis Parravicini
 */
public class DumpIndex {

    /**
     * Reads the index from the directory passed as argument or "index" if no
     * arguments are given.
     */
    public static void main(String[] args) throws Exception {
        String index = (args.length > 0 ? args[0] : "index");
        new DumpIndex(index).dump();
    }

    private String dir;

    public DumpIndex(String dir) {
        this.dir = dir;
    }

    public void dump() throws XMLStreamException, FactoryConfigurationError,
            CorruptIndexException, IOException {
        XMLStreamWriter out = XMLOutputFactory.newInstance()
                .createXMLStreamWriter(System.out);

        IndexReader reader = IndexReader.open(FSDirectory.open(new File(dir)),
                true);

        out.writeStartDocument();
        out.writeStartElement("documents");
        for (int i = 0; i < reader.numDocs(); i++)
            dumpDocument(reader.document(i), out);
        out.writeEndElement();
        out.writeEndDocument();

        out.flush();
        reader.close();
    }

    @SuppressWarnings("unchecked")
    private void dumpDocument(Document document, XMLStreamWriter out)
            throws XMLStreamException {
        out.writeStartElement("document");
        for (Fieldable field : (List<Fieldable>) document.getFields()) {
            out.writeStartElement("field");
            out.writeAttribute("name", field.name());
            out.writeAttribute("value", field.stringValue());
            out.writeEndElement();
        }
        out.writeEndElement();
    }
}