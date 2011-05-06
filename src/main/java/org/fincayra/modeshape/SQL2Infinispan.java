package org.fincayra.modeshape;

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.util.concurrent.TimeUnit;

import javax.jcr.ItemExistsException;
import javax.jcr.LoginException;
import javax.jcr.NamespaceRegistry;
import javax.jcr.Node;
import javax.jcr.NodeIterator;
import javax.jcr.PathNotFoundException;
import javax.jcr.PropertyType;
import javax.jcr.Repository;
import javax.jcr.RepositoryException;
import javax.jcr.Session;
import javax.jcr.UnsupportedRepositoryOperationException;
import javax.jcr.Workspace;
import javax.jcr.lock.LockException;
import javax.jcr.nodetype.ConstraintViolationException;
import javax.jcr.nodetype.InvalidNodeTypeDefinitionException;
import javax.jcr.nodetype.NoSuchNodeTypeException;
import javax.jcr.nodetype.NodeTypeExistsException;
import javax.jcr.nodetype.NodeTypeManager;
import javax.jcr.nodetype.NodeTypeTemplate;
import javax.jcr.nodetype.PropertyDefinitionTemplate;
import javax.jcr.query.InvalidQueryException;
import javax.jcr.query.Query;
import javax.jcr.query.QueryResult;
import javax.jcr.version.VersionException;

import org.modeshape.common.collection.Problem;
import org.modeshape.jcr.JcrConfiguration;
import org.modeshape.jcr.JcrEngine;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.xml.sax.SAXException;

public class SQL2Infinispan {
	private SQL2Infinispan() {
		super();
		this.destroy();
	}
	
	private Repository repository;
	private JcrEngine engine;
	private static Logger LOGGER = LoggerFactory.getLogger(SQL2Infinispan.class);
	private static final SQL2Infinispan instance = new SQL2Infinispan();
	
	public static final SQL2Infinispan getInstance() {
		return instance;
	}

	/**
	 * @param args
	 */
	public static void main(String[] args) {
		SQL2Infinispan testApp = getInstance();
		testApp.runTest();
	}

	public void destroy() {
		this.stop();
		File file = new File("fincayra-store");
		file.delete();
		
	}

	public void runTest() {
		start();
		
		//Now lets add some types and properties
		configTypes();
	
		//Now add some data
		addData();
		
		//Run query
		runQuery();
		
		//Shutdown the engine
		stop();
		
		//Restart the engine
        start();		

        //Run a query
        runQuery();
        
        stop();
	}
	
	public void start() {
		// Load the configuration from a file, as provided by the user interface ...
        JcrConfiguration configuration = new JcrConfiguration();
        try {
			configuration.loadFrom(this.getClass().getClassLoader().getResourceAsStream("configRepository.xml"));
		} catch (MalformedURLException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		} catch (IOException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		} catch (SAXException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}

        // Now create the JCR engine ...
        engine = configuration.build();
        engine.start();
        
        if (engine.getProblems().hasProblems()) {
            for (Problem problem : engine.getProblems()) {
                System.err.println(problem.getMessageString());
            }
            throw new RuntimeException("Could not start due to problems");
        }
		
        try {
			repository = engine.getRepository("fincayra-repository");
		} catch (RepositoryException e1) {
			LOGGER.error("Unable to start fincayra-repository");
			e1.printStackTrace();
		}
		
	}
	
	public void stop() {
        if (engine == null) return;
        try {
            // Tell the engine to shut down, and then wait up to 5 seconds for it to complete...
            engine.shutdown();
            engine.awaitTermination(20, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
			// TODO Auto-generated catch block
			LOGGER.error("Unable to shutdown repository!");
			e.printStackTrace();
		} finally {
            engine = null;
        }
	}
	
	QueryResult runQuery() {
		Session session = null;
		QueryResult r = null;
		try {
			session = repository.login();
			Query q = session.getWorkspace().getQueryManager().createQuery("SELECT * FROM [fincayra:User] as user WHERE user.active=cast('true' as boolean)", Query.JCR_SQL2);
			r = q.execute();
			NodeIterator ni = r.getNodes();
			
			while (ni.hasNext()) {
				Node node = ni.nextNode();
				LOGGER.debug("found node: " + node.getIdentifier());
			}
		} catch (LoginException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (InvalidQueryException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (RepositoryException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} finally {
			session.logout();
		}
		
		return r;
		
	}
	
	void addData() {
		Session session = null;
		try {
			session = repository.login() ;
			Node root = session.getRootNode();
			Node node = root.addNode("User", "fincayra:User");
			node.addMixin("mix:referenceable");
			node.addMixin("mix:lockable");
			
			node.setProperty("name", "test1");
			node.setProperty("email", "test1@test.com");
			node.setProperty("active", true);
			session.save();
			
		} catch (LoginException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (ItemExistsException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (PathNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (NoSuchNodeTypeException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (LockException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (VersionException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (ConstraintViolationException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (RepositoryException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} finally {
			session.logout();
		}
	}
	void configTypes() {
		Session session = null;
		try {
			session = repository.login() ;
			Workspace workspace = session.getWorkspace();
			
			NamespaceRegistry nsReg = workspace.getNamespaceRegistry();
			
			try {
				String uri = nsReg.getURI("fincayra");
				LOGGER.debug("Found namespace at " + uri);
			} catch(Exception e) {
				nsReg.registerNamespace("fincayra", "http://www.fincayra.org/");
			}

			// Obtain the ModeShape-specific node type manager ...
			NodeTypeManager nodeTypeManager = workspace.getNodeTypeManager();

			// Declare a mixin node type named "searchable" (with no namespace)
			NodeTypeTemplate nodeType = nodeTypeManager.createNodeTypeTemplate();
			nodeType.setDeclaredSuperTypeNames(new String[] {"nt:unstructured","mix:referenceable"});
			nodeType.setName("fincayra:User");
			
			nodeType.getPropertyDefinitionTemplates().add(getProperty(nodeTypeManager, "name", PropertyType.STRING, false));
			nodeType.getPropertyDefinitionTemplates().add(getProperty(nodeTypeManager, "email", PropertyType.STRING, false));
			nodeType.getPropertyDefinitionTemplates().add(getProperty(nodeTypeManager, "active", PropertyType.BOOLEAN, false));

			// Register the custom node type
			nodeTypeManager.registerNodeType(nodeType,true);
			session.save();
		} catch (LoginException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (UnsupportedRepositoryOperationException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (ConstraintViolationException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (InvalidNodeTypeDefinitionException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (NodeTypeExistsException e) {
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

}
