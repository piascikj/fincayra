package org.innobuilt.fincayra.persistence.orientDB;

import com.orientechnologies.orient.core.record.impl.ODocument;
import com.orientechnologies.orient.core.sql.query.OSQLSynchQuery;

public class OrientDBHelper {
	public static OSQLSynchQuery<ODocument> createQuery(String qry) {
		return new OSQLSynchQuery<ODocument>(qry);
	}

	public static OSQLSynchQuery<ODocument> createQuery(String qry, int limit) {
		return new OSQLSynchQuery<ODocument>(qry, limit);
	}
}
