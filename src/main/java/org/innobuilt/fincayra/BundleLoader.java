package org.innobuilt.fincayra;

import java.io.File;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLClassLoader;

public class BundleLoader extends URLClassLoader {
	public BundleLoader(URL[] urls) {
		super(urls);
		// TODO Auto-generated constructor stub
	}

	public URL findResource(String name) {
		File f = new File(name);

		try {
			return f.toURI().toURL();
		} catch (MalformedURLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return super.findResource(name);
	}
}
