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
(function() {
	Templates.simple( {
		title : "JCR-TEST"
	});


	var params = $getPageParams();

	//This is where we put some things
	var content = $("#content");
	var p = function(str) {
		return content.append("<p>" + str + "</p>");
	};

	var h2 = function(str) {
		return content.append("<h2>" + str + "</h2>");
	};

	var jcrPackages = new JavaImporter(Packages.javax.jcr);
	var pm = $om().pm;
	var repo = pm.repository;
	
	var s;
	
	with (jcrPackages) {
		function getProperty(nodeTypeManager, name, type, multiple) {
			var property = null;
			try {
				property = nodeTypeManager.createPropertyDefinitionTemplate();
				property.setName(name);
				property.setMultiple(false);
				property.setRequiredType(type);
			} catch (e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			} 

			return property;
		
		}

		try {
			s = repo.login() ;
			var workspace = s.getWorkspace();
			
			var nsReg = workspace.getNamespaceRegistry();
			var namespace = "fincayra";
			
			try {
				var uri = nsReg.getURI(namespace);
				$log().debug("Found {} namespace at {}", [namespace, uri]);
			} catch(e) {
				e.printStackTrace();
				$log().info("REGISTERING {} namespace.", namespace); 
				nsReg.registerNamespace(namespace, "http://www.fincayra.org/");
			}
			// Obtain the ModeShape-specific node type manager ...
			var nodeTypeManager = workspace.getNodeTypeManager();

			// Declare a mixin node type named "searchable" (with no namespace)
			var nodeType = nodeTypeManager.createNodeTypeTemplate();
			var superTypes = java.lang.reflect.Array.newInstance(java.lang.String, 2);
			superTypes[0] = "nt:unstructured";
			superTypes[1] = "mix:referenceable";
			nodeType.setDeclaredSuperTypeNames(superTypes);
			nodeType.setName("fincayra:Person");
			
			nodeType.getPropertyDefinitionTemplates().add(getProperty(nodeTypeManager, "name", PropertyType.STRING, false));
			nodeType.getPropertyDefinitionTemplates().add(getProperty(nodeTypeManager, "email", PropertyType.STRING, false));
			nodeType.getPropertyDefinitionTemplates().add(getProperty(nodeTypeManager, "active", PropertyType.BOOLEAN, false));

			// Register the custom node type
			nodeTypeManager.registerNodeType(nodeType,true);
			s.save();
		} catch (e) {
			s.refresh(false);
			e.printStackTrace();
		} finally {
			s.logout();
		}
		
		try {
			s = repo.login();
			var root = s.getRootNode();
			var node = root.addNode("Person", "fincayra:Person");
			node.addMixin("mix:referenceable");
			node.addMixin("mix:lockable");
			
			node.setProperty("name", "test1");
			node.setProperty("email", "test1@test.com");
			node.setProperty("active", true);
			s.save();
			p("Saved node");
		} catch (e) {
			s.refesh(false);
			e.printStackTrace();
		} finally {
			s.logout();
		}
		
		try {
			s = repo.login();
			var q = s.getWorkspace().getQueryManager().createQuery("SELECT * FROM [fincayra:Person] as user WHERE user.active=cast('true' as boolean)", javax.jcr.query.Query.JCR_SQL2);
			var r = q.execute();
			var ni = r.getNodes();
			
			while (ni.hasNext()) {
				var node = ni.nextNode();
				p("found node: " + node.getIdentifier());
			}
		} catch (e) {
			e.printStackTrace();
		} finally {
			s.logout();
		}
		
		pm.init();
	}

})();
