package org.innobuilt.fincayra;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.RhinoException;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptableObject;
import org.springframework.mail.javamail.MimeMessageHelper;
/*   Copyright 2010 Jesse Piascik
*
*   Licensed under the Apache License, Version 2.0 (the "License");
*   you may not use this file except in compliance with the License.
*   You may obtain a copy of the License at
*
*       http://www.apache.org/licenses/LICENSE-2.0
*
*   Unless required by applicable law or agreed to in writing, software
*   distributed under the License is distributed on an "AS IS" BASIS,
*   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*   See the License for the specific language governing permissions and
*   limitations under the License.
*/
public class FincayraContext {
	private HttpServletRequest request = null;
	private HttpServletResponse response = null;
	private Element Element = null;
	private String json = null;
	private MimeMessageHelper messageHelper = null;
	private ScriptableObject messageData = null;
	private MergeEngine mergeEngine = null;
	private Context rhinoContext = null;
	private String currentPage = null;
	
	public FincayraContext clone() {
		return new FincayraContext(this);
	}
	
	public FincayraContext(FincayraContext context) {
		super();
		this.mergeEngine = context.mergeEngine;
		this.request = context.request;
		this.response = context.response;
		this.messageHelper = context.messageHelper;
		this.messageData = context.messageData;
	}

	public FincayraContext(MergeEngine mergeEngine, HttpServletRequest request, HttpServletResponse response) {
		super();
		this.mergeEngine = mergeEngine;
		this.request = request;
		this.response = response;
	}
	
	public FincayraContext(MergeEngine mergeEngine, MimeMessageHelper messageHelper, ScriptableObject messageData) {
		super();
		this.mergeEngine = mergeEngine;
		this.messageHelper = messageHelper;
		this.messageData = messageData;
	}

	
	public void loadFile(Scriptable scope, String jsFile) throws RhinoException, IOException {
		FincayraScriptable.loadFile(rhinoContext, scope, jsFile);
	}

	public void loadString(Scriptable scope, String js, String name) throws RhinoException {
		FincayraScriptable.loadString(rhinoContext, scope, js, name);
	}

	public HttpServletRequest getRequest() {
		return request;
	}

	public HttpServletResponse getResponse() {
		return response;
	}

	public Element getElement() {
		return Element;
	}

	public void setElement(Element element) {
		Element = element;
	}

	public String getJson() {
		return json;
	}

	public void setJson(String json) {
		this.json = json;
	}
	
	public MimeMessageHelper getMessageHelper() {
		return messageHelper;
	}

	public void setMessageData(ScriptableObject messageData) {
		this.messageData = messageData;
	}

	public ScriptableObject getMessageData() {
		return messageData;
	}

	public MergeEngine getMergeEngine() {
		return mergeEngine;
	}

	public Element merge(String jsPath) throws IOException{
		return mergeEngine.merge(jsPath, this);
	}
	
	public void setRhinoContext(Context cx) {
		this.rhinoContext = cx;
	}

	public Context getRhinoContext() {
		return rhinoContext;
	}

	public void setCurrentPage(String currentPage) {
		this.currentPage = currentPage;
	}

	public String getCurrentPage() {
		return currentPage;
	}

	public void setMessageHelper(MimeMessageHelper messageHelper) {
		this.messageHelper = messageHelper;
	}

	public void setMergeEngine(MergeEngine mergeEngine) {
		this.mergeEngine = mergeEngine;
	}
	
}
