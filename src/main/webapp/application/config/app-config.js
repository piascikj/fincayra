(function() {
/*
*/
		
	$config({
		store:{
			exportDir:"{}/backup/fincayra".tokenize($getProperty("user.home"))
		},

		preInitDb : function() {
			$l("app-root.js");
			$l("notebooks.js");
		},

		onRequest : function(req) {
			req.Templates = new DefaultTemplates(req);
		},
		
		
		beforeAPI : function(request) {
			request.requireAuth();
			var user = request.getSessionUser();
			var params = request.$getPageParams();
			var eMsg = "You are not allowed to perform this operation";
			var action = request.$apiAction();
			
			//Check if it's search
			//TODO Test this with wrong user!!!
			switch (action) {
				case "search" :
					var clazz = request.$apiAction(1);
					if (clazz == "Entry") {
						request.$setPageParams({qry: params.qry + " AND topic.noteBook.owner.uuid:" + user.uuid});
					} else {
						throw new ForbiddenException(eMsg);
					}
					break;
				case "Entry" :
					if (request.$isGET()) {
						request.$setPageParams({qry: "topic.noteBook.owner.uuid = '{}' AND {}".tokenize(user.uuid,params.qry)});
					} else if (request.$isPUT() || request.$isPOST()) {
						var entries = (params instanceof Array)?params:[params];
						entries.each(function(entry) {
							var owner = entry.topic && entry.topic.noteBook && entry.topic.noteBook.owner;
							if ((owner && !(user.equals(owner))) || owner == undefined) {
								throw new ForbiddenException(eMsg);
							}
						});
					} else if (request.$isDELETE()) {
						var id = request.$apiAction(1);
						var entry = new Entry({id:id}).findById();
						if (entry && !(entry.topic.noteBook.owner.equals(user))) {
							throw new ForbiddenException(eMsg);
						}
					}
					
					break;
				case "Topic" :
					$log().debug("In beforeAPI Topic trying to {}",request.$getMethod());
					var id = request.$apiAction(1);
					if (request.$isGET()) {
						request.$setPageParams({qry: "noteBook.owner.uuid = '{}' AND {}".tokenize(user.uuid,params.qry)});
					} else if (request.$isPUT() || request.$isPOST()) {
						var topics = (params instanceof Array)?params:[params];
						topics.each(function(topic) {
							var owner = topic.noteBook && topic.noteBook.owner;
							if ((owner && !(user.equals(owner))) || owner == undefined) {
								throw new ForbiddenException(eMsg);
							}
						});
					} else if (request.$isDELETE()) {
						var id = request.$apiAction(1);
						$log().debug("TRYING TO DELETE TOPIC:{}",id);
						var topic = new Topic({id:id}).findById();
						if (topic && !(topic.noteBook.owner.equals(user))) {
							throw new ForbiddenException(eMsg);
						}
					}
					
					break;
				case "NoteBook" :
					if (request.$isGET()) {
						//Only allow getting all notebooks for a user
						request.$setPageParams({qry: "owner.uuid = '{}'".tokenize(user.uuid,params.qry)});
					} else if (request.$isPUT() || request.$isPOST()) {
						var noteBooks = (params instanceof Array)?params:[params];
						noteBooks.each(function(noteBook) {
							var owner = noteBook.owner;
							if ((owner && !(user.equals(owner))) || owner == undefined) {
								throw new ForbiddenException("You are not allowed to perform this operation");
							}
						});
					} else if (request.$isDELETE()) {
						var id = request.$apiAction(1);
						var noteBook = new NoteBook({id:id}).findById();
						if (noteBook && !(noteBook.owner.equals(user))) {
							throw new ForbiddenException("You are not allowed to perform this operation");
						}
					}
					
					break;
				case "keepAlive" :
					if (user == undefined) {
						throw new ForbiddenException();
					}
					break;
				default :
					throw new ForbiddenException();
					break;
			}
			
		},

		afterAPI : function(request, result) {
			var user = request.getSessionUser();

			switch (request.$apiAction()) {
				case "NoteBook" :
					var id = request.$apiAction(1);
					if (request.$isDELETE() || request.$isPOST() || request.$isPUT) {
						//Make sure the session user has the right notebooks in the list
						request.$getSession().user = user.findById();
						
						if (request.$isPUT()) {
							//We created a new notebook, now add a new topic
							new Topic({name:"New Topic", noteBook:result}).save();
						}
					} else if (request.$isGET() && id) {
						if (!user.equals(result.owner)) {
							throw new ForbiddenException();
						}
					}
					break;
				case "Entry" :
					var id = request.$apiAction(1);
					if (request.$isGET() && id) {
						if (!user.equals(result.topic.noteBook.owner)) {
							throw new ForbiddenException();
						}
					}
					break;  
				case "Topic" :
					var id = request.$apiAction(1);
					if (request.$isGET() && id) {
						if (!user.equals(result.noteBook.owner)) {
							throw new ForbiddenException();
						}
					}
					break;  
			}
		},
		
		name:"LeanNotes",
		
		//dev: false,
		
		//indexOnStartUp:false,
		
		rootLogLevel:$log.Level.INFO,
		
		persistentLoginDuration: 60*60*24*30, //Seconds to stay logged in
		
		resetPasswordTokenTimeout: 1000*60*10, //timeout in miliseconds,
		
		maxInactiveInterval: 60 * 60 //Seconds to keep session active in between access
				
	});

	var etcConfig = "/etc/fincayra/app-config.js";
	if ((new java.io.File(etcConfig)).exists()) {
		$l(etcConfig);
	}

	var userConfig = $getProperty("user.home") + "/.fincayra/app-config.js";
	if ((new java.io.File(userConfig)).exists()) {
		$l(userConfig);
	}

	/*
	if ($getProperty("fincayra.beanstalk") != null) {
		$config({
			url : "http://fincayra.elasticbeanstalk.com/",
			secureUrl: "http://fincayra.elasticbeanstalk.com/"
		});
	}
	*/

})();
