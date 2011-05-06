package org.innobuilt.fincayra.persistence;

import java.util.ServiceLoader;
import java.util.Set;

import javax.jcr.Repository;
import javax.jcr.RepositoryException;
import javax.jcr.Session;
import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;

import org.innobuilt.fincayra.FincayraApplication;
import org.modeshape.jcr.api.RepositoryFactory;
import org.modeshape.jcr.api.SecurityContextCredentials;
import org.modeshape.web.jcr.ServletSecurityContext;
import org.modeshape.web.jcr.spi.NoSuchRepositoryException;
import org.modeshape.web.jcr.spi.RepositoryProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Repository provider backed by the ModeShape {@link RepositoryFactory} implementation.
 * <p>
 * The provider instantiates a {code JcrEngine} that is configured from the file in the location specified by the servlet context
 * parameter {@code org.modeshape.web.jcr.rest.CONFIG_FILE}. This location must be accessible by the classloader for this class.
 * </p>
 * *
 * <p>
 * This class is thread-safe.
 * </p>
 * 
 * @see RepositoryProvider
 * @see Class#getResourceAsStream(String)
 */
public class FincayraRepositoryProvider implements RepositoryProvider {

	private static Logger LOGGER = LoggerFactory.getLogger(FincayraRepositoryProvider.class);
    public static final String JCR_URL = "org.modeshape.web.jcr.JCR_URL";

    private String jcrUrl;

    public FincayraRepositoryProvider() {
    }

    @Override
    public Set<String> getJcrRepositoryNames() {
        RepositoryFactory factory = factory();
        if (factory == null) return null;

        return factory.getRepositories(jcrUrl).getRepositoryNames();
    }

    private Repository getRepository( String repositoryName ) throws RepositoryException {
        RepositoryFactory factory = factory();
        if (factory == null) return null;

        return factory.getRepositories(jcrUrl).getRepository(repositoryName);
    }

    @Override
    public void startup( ServletContext context ) {
        this.jcrUrl = context.getInitParameter(JCR_URL);
    }

    @Override
    public void shutdown() {
        factory().shutdown();
    }

    private final RepositoryFactory factory() {
        
        for (RepositoryFactory factory : ServiceLoader.load(RepositoryFactory.class)) {
            return factory;
        }
        
        throw new IllegalStateException("No RepositoryFactory implementation on the classpath");
    }

    /**
     * Returns an active session for the given workspace name in the named repository.
     * 
     * @param request the servlet request; may not be null or unauthenticated
     * @param repositoryName the name of the repository in which the session is created
     * @param workspaceName the name of the workspace to which the session should be connected
     * @return an active session with the given workspace in the named repository
     * @throws RepositoryException if any other error occurs
     */
    @Override
    public Session getSession( HttpServletRequest request,
                               String repositoryName,
                               String workspaceName ) throws RepositoryException {

        Repository repository;

        try {
            repository = getRepository(repositoryName);

        } catch (RepositoryException re) {
            throw new NoSuchRepositoryException(re.getMessage(), re);
        }

        LOGGER.debug("Trying to get session...");
        // If there's no authenticated user, try an anonymous login
        Session session = null;
        if (request == null || request.getUserPrincipal() == null) {
        	session = repository.login(workspaceName);
        } else {
        	session = repository.login(new SecurityContextCredentials(new ServletSecurityContext(request)), workspaceName);
        }
        
        return session;

    }
    
}
