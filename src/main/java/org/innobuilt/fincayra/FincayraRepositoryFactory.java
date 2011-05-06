package org.innobuilt.fincayra;


import java.util.Collection;
import javax.jcr.RepositoryException;
import javax.jcr.Session;
import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;
import org.modeshape.common.annotation.ThreadSafe;
import org.modeshape.common.util.CheckArg;
import org.modeshape.web.jcr.spi.RepositoryProvider;

/**
 * Factory that provides implementations of the {@link RepositoryProvider repository provider SPI} by wrapping a
 * {@link RepositoryProvider}.
 * <p>
 * The repository factory implements a lifecycle for the repository providers. It is first {@link #initialize(ServletContext)
 * initialized} by {@link ModeShapeJcrDeployer}, a servlet context listener that must be configured in the ModeShape JCR REST web
 * configuration (web.xml). The repository factory looks in the context for a parameter with the name of {@link #PROVIDER_KEY}.
 * This is assumed to be the FQN of the {@link RepositoryProvider repository provider}, which the factory will then instantiate.
 * </p>
 * <p>
 * The repository factory is then able to respond to multiple requests to {@link #getJcrRepositoryNames() list the repository
 * names} and {@link #getSession(HttpServletRequest, String, String) return active JCR sessions} until the {@link #shutdown()
 * shutdown method} is called.
 * </p>
 * <p>
 * The {@link #shutdown() shutdown method} is a simple proxy to the {@link RepositoryProvider#shutdown()} repository provider's
 * shutdown method}.
 * </p>
 */
@ThreadSafe
public class FincayraRepositoryFactory {

    /** The FQN of the repository provider class. Currently set to {@value} . */
    public static final String PROVIDER_KEY = "org.modeshape.web.jcr.REPOSITORY_PROVIDER";

    private static RepositoryProvider provider;

    private FincayraRepositoryFactory() {

    }

    /**
     * Initializes the repository factory. For more details, please see the {@link RepositoryFactory class-level documentation}.
     * 
     * @param context the servlet context; may not be null
     * @see RepositoryFactory
     */
    static void initialize( ServletContext context ) {
        CheckArg.isNotNull(context, "context");
        String className = context.getInitParameter(PROVIDER_KEY);

        try {
            Class<? extends RepositoryProvider> providerClass = Class.forName(className).asSubclass(RepositoryProvider.class);
            provider = providerClass.newInstance();

        } catch (Exception ex) {
            throw new IllegalStateException(ex);
        }

        provider.startup(context);
    }

    public static Session getSession( HttpServletRequest request,
                                      String repositoryName,
                                      String workspaceName ) throws RepositoryException {
        return provider.getSession(request, repositoryName, workspaceName);
    }

    public static Collection<String> getJcrRepositoryNames() {
        return provider.getJcrRepositoryNames();
    }

    static void shutdown() {
        provider.shutdown();
    }
}
