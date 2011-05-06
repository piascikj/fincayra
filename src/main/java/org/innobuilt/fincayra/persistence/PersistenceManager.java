package org.innobuilt.fincayra.persistence;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import javax.jcr.LoginException;
import javax.jcr.NamespaceRegistry;
import javax.jcr.Node;
import javax.jcr.NodeIterator;
import javax.jcr.Property;
import javax.jcr.PropertyIterator;
import javax.jcr.PropertyType;
import javax.jcr.RepositoryException;
import javax.jcr.Session;
import javax.jcr.UnsupportedRepositoryOperationException;
import javax.jcr.Value;
import javax.jcr.Workspace;
import javax.jcr.nodetype.NodeTypeManager;
import javax.jcr.nodetype.NodeTypeTemplate;
import javax.jcr.nodetype.PropertyDefinitionTemplate;
import javax.jcr.query.Query;
import javax.jcr.query.QueryResult;
import javax.servlet.http.HttpServletRequest;

import org.innobuilt.fincayra.FincayraRepositoryFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class PersistenceManager {
	private static Logger LOGGER = LoggerFactory.getLogger(PersistenceManager.class);
	private List<Type> types = new ArrayList<Type>();
	private String namespace = "fincayra";
	private String uri = "http://www.fincayra.org/";
	public static final String REPOSITORY_NAME = "fincayra-repository";
	public static final String WORKSPACE_NAME = "objects";

	public PersistenceManager addType(Type type) {
		types.add(type);
		return this;
	}
	
	public void init() {
		Session session = null;
		try {
			session = getSession();
			LOGGER.debug("Session is:{}",session);
			Workspace workspace = session.getWorkspace();
			
			NamespaceRegistry nsReg = workspace.getNamespaceRegistry();
			
			try {
				String uri = nsReg.getURI(getNamespace());
				LOGGER.debug("Found namespace at " + uri);
			} catch(Exception e) {
				nsReg.registerNamespace(getNamespace(), getUri());
			}

			// Obtain the ModeShape-specific node type manager ...
			NodeTypeManager nodeTypeManager = workspace.getNodeTypeManager();

			Iterator<Type> it = types.iterator();
			
			while (it.hasNext()) {
				Type type = it.next();
				//TODO throw exception if type is native
				NodeTypeTemplate nodeType = nodeTypeManager.createNodeTypeTemplate();
				//nodeType.setDeclaredSuperTypeNames(new String[] {"nt:unstructured","mix:referenceable"});
				nodeType.setDeclaredSuperTypeNames(new String[] {"mix:referenceable"});
				nodeType.setName(getNamespace() + ":" + type.getName());
				
				Iterator<org.innobuilt.fincayra.persistence.Property> properties = type.getProperties().iterator();
				
				while(properties.hasNext()) {
					org.innobuilt.fincayra.persistence.Property property = properties.next();
					String name = property.getName();
					String rel = property.getRelationship();
					Boolean multiple = rel.equals("hasMany") || rel.equals("ownsMany")?true:false;
					Type propType = property.getType();
					Integer jcrType = (Type.NATIVE_TYPES.get(propType.getName()) == null)?PropertyType.REFERENCE:Type.NATIVE_TYPES.get(propType.getName());
					
					LOGGER.debug("Registering property:" + name + ", type:" + propType.getName() + ", jcrType:" + jcrType + ", multiple:" + multiple);
					nodeType.getPropertyDefinitionTemplates().add(getProperty(nodeTypeManager, name, jcrType, multiple));
				}

				// Register the custom node type
				nodeTypeManager.registerNodeType(nodeType,true);
			}
			session.save();
		} catch (LoginException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (RepositoryException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} finally {
			session.logout();
		}
		
	}
	
	PropertyDefinitionTemplate getProperty(NodeTypeManager nodeTypeManager, String name, int type, boolean multiple) {
		PropertyDefinitionTemplate property = null;
		try {
			property = nodeTypeManager.createPropertyDefinitionTemplate();
			property.setName(name);
			property.setMultiple(false);
			property.setRequiredType(type);
		} catch (UnsupportedRepositoryOperationException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (RepositoryException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		return property;
	}	
	
	public QueryResult find(Session session, String qryString) throws RepositoryException {
		LOGGER.debug("EXECUTING XPATH QUERY : {}", qryString);
		return session.getWorkspace().getQueryManager().createQuery(qryString, Query.XPATH).execute();
	}
	
	public QueryResult find(Session session, String qryString, long offset, long limit) throws RepositoryException {
		LOGGER.debug("EXECUTING XPATH QUERY : {}", qryString);
		Query qry = session.getWorkspace().getQueryManager().createQuery(qryString, Query.XPATH);
		qry.setOffset(offset);
		qry.setLimit(limit);
		return qry.execute();
	}
	
	public Session getSession() throws RepositoryException {
		LOGGER.debug("GETTING SESSION.....");
		return FincayraRepositoryFactory.getSession(null, REPOSITORY_NAME, WORKSPACE_NAME);
	}

	public String getNamespace() {
		return namespace;
	}

	public String getUri() {
		return uri;
	}

    /** Recursively outputs the contents of the given node. */
    public void dump(Node node) throws RepositoryException {
        // First output the node path
        System.out.println(node.getPath());
        // Skip the virtual (and large!) jcr:system subtree
        if (node.getName().equals("jcr:system")) {
            return;
        }

        // Then output the properties
        PropertyIterator properties = node.getProperties();
        while (properties.hasNext()) {
            Property property = properties.nextProperty();
            if (property.getDefinition().isMultiple()) {
                // A multi-valued property, print all values
                Value[] values = property.getValues();
                for (int i = 0; i < values.length; i++) {
                    System.out.println(
                        property.getPath() + " = " + values[i].getString());
                }
            } else {
                // A single-valued property
                System.out.println(
                    property.getPath() + " = " + property.getString());
            }
        }

        // Finally output all the child nodes recursively
        NodeIterator nodes = node.getNodes();
        while (nodes.hasNext()) {
            dump(nodes.nextNode());
        }
    }
	
}
