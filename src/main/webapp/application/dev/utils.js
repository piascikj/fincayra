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
			title : "Utilities"
	});

	var params = $getPageParams();

	//This is where we put some things
	var alerts = $("#alerts");
	var records = $("#utils_records");
	var controls = $("#utils_controls");

	var div = function(el, str) {
		return el.append("<div id='this-div'>" + str + "</div>").select("#this-div").removeAttr("id");
	};

	var p = function(el, str) {
			return el.append("<p>" + str + "</p>");
	};
	
	var span = function(el, str) {
			return el.append("<span>" + str + "</span>");
	};
	
	var h2 = function(el, str) {
			return el.append("<h2>" + str + "</h2>");
	};
	
	var a = function(el, str) {
		return el.append('<a name="' + str + '"/>');
	};

	var actions = {
			remove : function(id, type) {
					var obj = $getInstance(type);
					obj.id = id;
					if (obj.remove()) p(records, "Removed " + type +" with id:" + id);
			}
	};

	//Run the action
	if (params.action && params.id && params.type && actions[params.action]) {
			actions[params.action](params.id, params.type);
	} else if (params.init) {
		$init();
		//MMM d, yyyy @ H:m a
		p(alerts, "Root scope reloaded : " + (new Date()).format("MMM d, yyyy @ H:m:ss a"));
	} else if (params.invalidate) {
		$getHttpSession().invalidate();
		p(alerts, "Session Invalidated : " + (new Date()).format("MMM d, yyyy @ H:m:ss a"));
	} else if (params.clearFileCache) {
		FileCache.clear();
		p(alerts, "FileCache cleared : " + (new Date()).format("MMM d, yyyy @ H:m:ss a"));
	} else if (params.toggleLog) {
		//Logging.enable(!Logging.enable());
	} else if (params.toggleCache) {
		FileCache.enable(!FileCache.enable());
	}
	
	//var logging = Logging.enable()?"enabled":"disabled";
	//p(alerts, "JavaScript Logging is " + logging);

	var caching = FileCache.enable()?"enabled":"disabled";
	$('#file-cache').html(caching);
	var select = $('#log-level');
	for (i in $log.Level) {
		var selected=(new String($getLogLevel().toString()) == i)?' selected="yes"':'';
		if ($log.Level.hasOwnProperty(i)) select.append('<option val="{}"{}>{}</option>'.tokenize(i,selected,i));
	}

	//Add a link to reload root scope
	controls.append("<a href='?init=true'>Reload root scope</a>");
	controls.append(" | <a href='?invalidate=true'>Invalidate Session</a>");
	controls.append(" | <a href='?clearFileCache=true'>Clear FileCache</a>");
	controls.append(" | <a href='?toggleCache=true'>Toggle File Caching</a>");
	controls.append("<hr/>");
	controls.append("<a href='test'>Test Page</a>");
	controls.append("<hr/>");

	//Add a button to delete each type
	for (type in $om().classDefs) {
			if (!{}[type]) {
					var instance = $getInstance(type);
					var objects = $om().getAll(instance);
					a(records, type);
					h2(records, type + ' records');
					controls.append('<a href="#' + type + '">' + type + ' records</a> | ');
					objects.each(function(i) {
						p(records, "<a href='?type={}&action=remove&id={}'>remove {} </a><pre>{}</pre>".tokenize(type,i.id,type,JSON.stringify(i, null, "   ")));
					});
			}
	}
	$source();
})();
