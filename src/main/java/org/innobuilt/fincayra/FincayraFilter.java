package org.innobuilt.fincayra;

import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.jsoup.nodes.Element;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class FincayraFilter implements Filter {

	public FilterConfig config = null;
	private static Logger LOGGER = LoggerFactory.getLogger(FincayraFilter.class);
	private FincayraApplication app;
	private String jsDir = "fincayra-lib";
	private String pageDir = "application";
	
	/*
	 * This is where the entire application is initialized.
	 */
	public void init(FilterConfig config) throws ServletException {
		this.config = config;
		this.app = FincayraApplication.get();
		app.setJsDir(jsDir);
		app.setPageDir(pageDir);
		
		app.setRootDir(config.getServletContext().getRealPath("."));
		app.getMergeEngine().setPageDir(config.getServletContext().getRealPath(app.getPageDir()));
		app.getMergeEngine().setJsDir(config.getServletContext().getRealPath(app.getJsDir()));
		
		try {
			LOGGER.info("Initializing MergeEngine");
			app.getMergeEngine().init(true);
		} catch (Exception e) {
			throw new ServletException(e);
		}
	}

	public void destroy() {
		app.getPersistenceManager().destroy();
	}

	public void doFilter(ServletRequest req, ServletResponse res,
			FilterChain chain) throws IOException, ServletException {
		HttpServletRequest request = (HttpServletRequest) req;
		HttpServletResponse response = (HttpServletResponse) res;

		//Load the file from the html directory with the path after the domain and context root
		//e.g. http://localhost:8080/fincayra/[my/file/path]
		String path = request.getServletPath();
		
		String page = getRequestedPage(path);
		
		String pageJs = page + ".js";
		String pageHtml = page + ".html";
		
		
		LOGGER.debug("--- path = [{}] ---", path);
		LOGGER.debug("--- page = [{}] ---", page);
		LOGGER.debug("--- pageJs = [{}] ---",pageJs);
		LOGGER.debug("--- pageHtml = [{}] ---",pageHtml);
		
		PrintWriter out = new PrintWriter(response.getOutputStream());
		if (isHidden(request.getRequestURL().toString())){ 
			//TODO may want to send a friendlier message, allow for configuration of error page js file
			LOGGER.error("Requested path is hidden:{}",path);
			response.sendError(HttpServletResponse.SC_NOT_FOUND); 
		} else if (isExposed(request.getRequestURL().toString())) {
			forward(path, request, response);
		} else {
			
			//Do the work
			FincayraContext context = new FincayraContext(app.getMergeEngine(),request, response);
			if (app.getMergeEngine().exists(pageJs) || app.getMergeEngine().exists(pageHtml)) {
				context.merge(pageJs);
			} else {
				context.merge(null);
			}
			
			//Check for redirect
			String redirect = (String)request.getAttribute("fincayra.redirect");
			if (redirect != null) {
				LOGGER.debug("Redirecting to:{}", redirect);
				response.sendRedirect(redirect);
				return;
			}
			
			
			//This is the default functionality.  Load the html document and run the js page
			Element el = context.getElement();
			
			//If the Merge produced json it takes priority
			String json = context.getJson();

			if (json != null) {
				out.print(json);
			} else if (el != null) {
				out.print(el.html());
			} 

			if (json != null || el != null) {
				out.flush();
			}
		}
		
	}
	
	private void forward(String path, HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		path = "/" + app.getPageDir() + path;
		LOGGER.debug("Forwarding to static file:{}", path);
		RequestDispatcher dispatcher = request.getRequestDispatcher(path);
		dispatcher.forward(request, response);
	}
	
	private String getRequestedPage(String page) {
		page = page.replaceAll("\\.[hH][tT][mM][lL]$", "");
		if (pageExists(page) && page.endsWith("/")) {
			//an index page exists
			return page + "index";
		} else if (pageExists(page)) {
			//the actual page exists
			return page;
		} else if (new File(config.getServletContext().getRealPath(page)).exists()) {
			//A page exists outside of the pageDir (Enables js, css, etc)
			return "";
		}
		
		LOGGER.debug("Page: {}",page);
		//if (page.matches(this.ignore)) return "";

		//walk back from the end of the path until we find an index.js, index.html, [path component].js or [path component].html
		String newPage;
		if (page.endsWith("/")) {
			newPage = page.replaceAll("(^.*)/$","$1");
		} else {
			newPage = page.replaceAll("(^.*/)(.*)","$1");
		}
			
		return getRequestedPage(newPage);
	}
	
	/**
	 * @param path
	 * @return true if the path ends with a / and index.js or index.html exists for the directory, or if the exact page exists
	 * or if the page.html or page.js exists
	 */
	private boolean pageExists(String path) {
		if (path.endsWith("/")) {
			return (app.getMergeEngine().exists(path + "index.js") || app.getMergeEngine().exists(path + "index.html"));
		} 
		return (app.getMergeEngine().exists(path + ".js") || app.getMergeEngine().exists(path + ".html") || app.getMergeEngine().exists(path)); 
	}
	
	private boolean isHidden(String requestUrl) {
		String url = app.getUrl();
		String sUrl = app.getSecureUrl();
		for(String hp:app.getHiddenPaths()) {
			LOGGER.trace("isHidden: Does {} start with {}?",requestUrl,url + hp);
			if (requestUrl.startsWith(url + hp)) return true;
			LOGGER.trace("isHidden: Does {} start with {}?",requestUrl,sUrl + hp);
			if (sUrl != null && requestUrl.startsWith(sUrl + hp)) return true;
		}
		
		return false;
	}

	private boolean isExposed(String requestUrl) {
		String url = app.getUrl();
		String sUrl = app.getSecureUrl();
		for(String ep:app.getExposedPaths()) {
			LOGGER.trace("isExposed: Does {} start with {}?",requestUrl,url + ep);
			if (requestUrl.startsWith(url + ep)) return true;
			LOGGER.trace("isExposed: Does {} start with {}?",requestUrl,sUrl + ep);
			if (sUrl != null && requestUrl.startsWith(sUrl + ep)) return true;
		}
		
		return false;
	}	
	private void bigDebug() {
		if (LOGGER.isDebugEnabled()) {
			LOGGER.debug("************************--************************");
			LOGGER.debug("************************--************************");
		}
	}

}
