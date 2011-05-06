package org.innobuilt.fincayra.persistence;

public class Property {
	private String name;
	private String relationship;
	private Type type;

	public Property(String name, String relationship, Type type) {
		this.name = name;
		this.relationship = relationship;
		this.type = type;
	}
	
	public String getName() {
		return name;
	}
	public String getRelationship() {
		return relationship;
	}
	public Type getType() {
		return type;
	}
}
