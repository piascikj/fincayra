(function() {
	$requestScope().isAPI = true;
	$log().debug("IN api.js");
	var htmlRegex = /\.[hH][tT][mM][lL]$/;
	var info = {
		requestURI:$getRequestURI(),
		extraPath:$getExtraPath(),
		currentPage:$getCurrentPage(),
		classDefs:$om().classDefs,
		constructors:$om().constructors,
		htmlRequest:(new String($getRequestURI())).match(htmlRegex) != null,
		requestObject:$getPageParams(true)
	};

	if (info.htmlRequest) info.extraPath = info.extraPath.replace(htmlRegex, "");
	var pathAry = info.extraPath.split("/");
	var result;
	
	//Check for Objects
	if (pathAry.length > 0) {
		var objName = pathAry[0];
		info.objName = objName;
		
		if (info.classDefs[objName] == undefined) {
			info.validObject = false;
		} else {
			info.validObject = true;

			var id = (pathAry.length > 1)?pathAry[1]:undefined;
			info.objectId = id; 
			
			var method = $getMethod();
			//Now check for method
			if (Methods.GET == method) {
				//Get the object requested
				if (info.objectId != undefined) {
					var object = $getInstance(objName);
					object.id = info.objectId;
					result = object.findById();
					if (result == null ) throw new ObjectNotFoundError();
				} else {
					//TODO return up to 200 objects
				}
			} else if (Methods.PUT == method) {
				//First instantiate the object
				result = info.requestObject;
				var object = $getInstance(objName,info.requestObject);
				result = object.save();
				
			} else if (Methods.POST == method) {
				//First instantiate the object
				result = info.requestObject;
				var object = $getInstance(objName,info.requestObject);
				object = object.findById().extend(object);
				result = object.save();
			} else if (Methods.DELETE == method) {
				var object = $getInstance(objName,{id:info.objectId});
				result = object.remove();
			}

		}
	}
	$log().debug("info:{}".tokenize(info));
	$log().debug("result:{}".tokenize(result));
	//Show the default
	if (result == undefined) result = info;
	if (info.htmlRequest) {
		$("#json").appendText(JSON.stringify(result, null, "   "));
	} else {
		//TODO need to set global replacer
		$j(result)
	}
})();
