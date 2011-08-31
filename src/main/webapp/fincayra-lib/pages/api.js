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
$api({
	defaultAction : function() {
		$log().debug("IN api.js");
		var htmlRegex = /\.[hH][tT][mM][lL]$/;
		var params = $getPageParams(true);
		$log().debug("params:{}",JSON.stringify(params));
		var info = {
			requestURI:$getRequestURI(),
			extraPath:$getExtraPath(),
			currentPage:$getCurrentPage(),
			classDefs:$om().classDefs,
			constructors:$om().constructors,
			htmlRequest:(new String($getRequestURI())).match(htmlRegex) != null,
			requestObject:params,
			method:$getMethod()
		};

		if (info.htmlRequest) info.extraPath = info.extraPath.replace(htmlRegex, "");
		var pathAry = info.extraPath.split("/");
		var result;
		
		//Check for Objects
		if (pathAry.length > 0) {
			var objName = pathAry[0];
			info.objName = objName;
			
			$config().beforeAPI($requestScope());
			
			if (info.classDefs[objName] == undefined) {
				throw new NotStorableException(undefined, objName + " is not a valid object type.");
			} else {
				info.validObject = true;

				var id = (pathAry.length > 1)?pathAry[1]:undefined;
				info.objectId = id; 
				
				var method = info.method;
				//Now check for method
				if (Methods.GET == method) {
					var object = $getInstance(objName);
					//Get the object requested
					if (info.objectId != undefined) {
						object.id = info.objectId;
						result = object.findById();
						if (result == null ) throw new ObjectNotFoundError();
					} else if (params.qry != undefined) {
						var exp=/(insert )|(update )|(grant )|(create )|(delete )/gi;
						if (params.qry.match(exp)) {throw new ForbiddenException("Function unavailable");} 
						var offset = params.offset || 0;
						var limit = params.limit || 200;
						if (limit > 200) limit = 200;					
						
						result = $om().search(object, params.qry, offset, limit);
					} else {
						var offset = params.offset || 0;
						var limit = params.limit || 200;
						if (limit > 200) limit = 200;
						
						result = $om().getAll(object,offset,limit);
					}
				} else if (Methods.PUT == method) {
					ro = info.requestObject;
					if (ro instanceof Array) {
						result = [];
						var tmp = "uuid = '{}'";
						var qry = "";
						$om().txn(function(db) {
							ro.each(function(o,i) {
								var object = $getInstance(objName,o);
								object = object.save(db);
								qry += tmp.tokenize(object.uuid);
								if (i < ro.length-1) qry += " or ";
							});
						});
						result = $getInstance(objName).search(qry + " order by @rid");
					} else {
						//First instantiate the object
						var object = $getInstance(objName,ro);
						result = object.save();
					}
					
				} else if (Methods.POST == method) {
					ro = info.requestObject;
					if (ro instanceof Array) {
						result = [];
						var tmp = "uuid = '{}'";
						var qry = "";
						$om().txn(function(db) {
							ro.each(function(o,i) {
								var object = $getInstance(objName,o);
								object = object.findById(db).extend(object);
								object = object.save(db);
								qry += tmp.tokenize(object.uuid);
								if (i < ro.length-1) qry += " or ";
							});
						});
						result = $getInstance(objName).search(qry + " order by @rid");
					} else {
						//First instantiate the object
						var object = $getInstance(objName,ro);
						object = object.findById().extend(object);
						result = object.save();
					}
				} else if (Methods.DELETE == method) {
					//TODO if objectId contains commas delete a series of objects
					var object = $getInstance(objName,{id:info.objectId});
					$log().debug("Preparing to delete object:{}", object.json());
					result = object.remove();
				}

			}
		}
		$log().debug("info:{}".tokenize(info));
		$log().debug("result:\n{}".tokenize(JSON.stringify(result, null, "   ")));
		
		$config().afterAPI($requestScope(),result);

		if (info.htmlRequest) {
			$isAPI(false);
			$("#json").appendText(JSON.stringify(result, null, "   "));
		} else {
			//Return the result
			$j(result);
		}
	},
	
	search : function() {
		var clazz = $getExtraPath().split("/")[1];

		if ($om().classDefs[clazz] == undefined) {
			throw new NotStorableException(undefined, clazz + " is not a valid object type.");
		} else {
			$config().beforeAPI($requestScope());
			var params = $getPageParams(true);
			
			params.storable = (clazz == undefined)?undefined:$getInstance(clazz);
			$log().debug("params:{}",JSON.stringify(params));
			var result = $sm().search(params);
			$config().afterAPI($requestScope(), result);
			
			$j(result);
		}
	},
	
	config : function() {
		if ($config().dev == true || $getSession().isAdmin == true) {
			$isAPI(false);
			$("#json").appendText(JSON.stringify($config(), null, "   "));
		} else {
			throw new ForbiddenException("Function unavailable");
		}
	},
	
	exportDB : function() {
		if ($config().dev == true || $getSession().isAdmin == true) {
			var start = new Date();
			var file = $om().exportDB();
			var end = new Date();
			$j({file:file, duration:end.getTime()-start.getTime()});
		} else {
			throw new ForbiddenException("Function unavailable");
		}
	},

	importDB : function() {
		if ($config().dev == true || $getSession().isAdmin == true) {
			var file = $getPageParams().file;
			var start = new Date();
			var completed = $om().importDB(file);
			var end = new Date();
			$j({ok:completed, duration:end.getTime()-start.getTime()});
		} else {
			throw new ForbiddenException("Function unavailable");
		}
	},

	keepAlive : function() {
		$log().debug("Keep alive received for session:{}",$getSession().getId());
		$j({ok:true});
	},
	
	isOK : function() {
		$j({ok:true});
	},
	
	host : function() {
		$j({host:$getHostName()});
	},
	
	address : function() {
		$j({address:$getHostAddress()});
	},
	
	net : function() {
		$j($getNetworkInterfaces());
	}
});


