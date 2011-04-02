(function() {
	
	var info = {
		requestURI:$getRequestURI(),
		extraPath:pathAry,
		currentPage:$getCurrentPage(),
		classDefs:$om().classDefs,
		constructors:$om().constructors,
		htmlRequest:(new String($getRequestURI())).match(/\.[hH][tT][mM][lL]$/) != null
	};
	
	var pathAry = $getExtraPath().split("/");
	
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
				if (info.objectId != undefined) {
					var object = $getInstance(objName);
					object.id = info.objectId;
					//TODO check for null and return an error
					//TODO need to set global replacer
					$j(object.findById());
				} else {
					//return up to 200 objects
				}
			} else if (Methods.PUT == method) {
				
			} else if (Methods.POST == method) {
				
			} else if (Methods.DELETE == method) {
			
			}
		}
	}
	
	//Show the default

	$("#json").appendText(JSON.stringify(info, null, "   "));
	
	
})();
