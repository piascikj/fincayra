package org.innobuilt.fincayra.persistence;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.jcr.PropertyType;

public class Type {
	private String name;
	private List<Property> properties = new ArrayList<Property>();

	public static Map<String, Integer> NATIVE_TYPES = new HashMap<String, Integer>();
	
	public static final Type STRING = new Type("String");
	public static final Type LONG = new Type("Long");	
	public static final Type DOUBLE = new Type("Double");	
	public static final Type DECIMAL = new Type("Decimal");	
	public static final Type DATE = new Type("Date");	
	public static final Type BOOLEAN = new Type("Boolean");
	
	static {
		NATIVE_TYPES.put(STRING.getName(), PropertyType.STRING);
		NATIVE_TYPES.put(LONG.getName(), PropertyType.LONG);
		NATIVE_TYPES.put(DOUBLE.getName(), PropertyType.DOUBLE);
		NATIVE_TYPES.put(DECIMAL.getName(), PropertyType.DECIMAL);
		NATIVE_TYPES.put(DATE.getName(), PropertyType.DATE);
		NATIVE_TYPES.put(BOOLEAN.getName(), PropertyType.BOOLEAN);
	}
	
	public Type(String name) {
		this.name = name;
	}
	
	public Type addProperty(Property property) {
		this.properties.add(property);
		return this;
	}

	@Override
	public boolean equals(Object type) {
		// TODO Auto-generated method stub
		return this.name.equals(((Type)type).getName());
	}

	public String getName() {
		return name;
	}

	public List<Property> getProperties() {
		return properties;
	}
	
	
}
