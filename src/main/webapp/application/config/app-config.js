(function() {
/*

This is the default config

$config({
	preInit:function(){},
	postInit:function(){},
	preInitDb:function(){},
	onRequest:function(){},
	dev:true,
	fileCache:false,
	allowAPIAccess:function(){return true;},
	url:"http://localhost:8080/",
	secureUrl:"https://localhost:4443/",
	name:"Fincayra",
	errorPage:"/error",
	store:"db/orientDB-store.js",
	expose:["css","images","js"],
	mailSender: {
		host:"smtp.gmail.com",
		port:587,
		userName:"someUser",
		password:"somePassword",
		fromEmail:"jesse@piascik.net",
		templateDir:"mail",
		auth:true,
		starttls:true,
		timeout:25000
	}
});
*/
		
	$config({

		preInitDb : function() {
			$l("app-root.js");
			$l("notebooks.js");
		},

		onRequest : function(req) {
			req.Templates = new DefaultTemplates(req);
		},
		
		
		beforeAPI : function(request) {
			request.requireAuth();
			var user = request.$getSession().user;
			var params = request.$getPageParams();

			//Check if it's search
			switch (request.$apiAction()) {
				case "search" :
					var clazz = request.$apiAction(1);
					if (clazz == "Entry") {
						request.$setPageParams({qry: params.qry + " AND topic.noteBook.owner.uuid:" + user.uuid});
					} else {
						throw new ForbiddenException();
					}
					break;
				case "Entry" :
					if (request.$isGET()) {
						request.$setPageParams({qry: "topic.noteBook.owner.uuid = '{}' AND {}".tokenize(user.uuid,params.qry)});
					} else if (request.$isPUT || request.$isPOST) {
						
					}
					
					break;
				case "Topic" :
					var id = request.$apiAction(1);
					if (request.$isGET()) {
						request.$setPageParams({qry: "noteBook.owner.uuid = '{}' AND {}".tokenize(user.uuid,params.qry)});
					} else if (request.$isPUT || request.$isPOST) {
						
					} else if (request.$isDELETE()) {
					
					}
					
					break;
				case "NoteBook" :
					if (request.$isGET()) {
						//Only allow getting all notebooks for a user
						request.$setPageParams({qry: "owner.uuid = '{}'".tokenize(user.uuid,params.qry)});
					} else if (request.$isPUT || request.$isPOST) {
						var noteBook = request.$getPageParams(true);
						if (noteBook.owner && !(noteBook.owner.uuid == user.uuid && noteBook.owner.id == user.id)) {
							throw new ForbiddenException("You are not allowed to perform this operation");
						}
					} else if (request.$isDELETE()) {
						var id = request.$apiAction(1);
						var noteBook = new NoteBook({id:id}).findById();
						if (noteBook && !(noteBook.owner.uuid == user.uuid && noteBook.owner.id == user.id)) {
							throw new ForbiddenException("You are not allowed to perform this operation");
						}
					}
					
					break;
				default :
					throw new ForbiddenException();
					break;
			}
			
		},

		afterAPI : function(request, result) {
			var user = request.$getSession().user;

			switch (request.$apiAction()) {
				case "NoteBook" :
					if (request.$isDELETE() || request.$isPOST() || request.$isPUT) {
						request.$getSession().user = user.findById();
					}
					break;
				case "Topic" :
					var id = request.$apiAction(1);
					if (request.$isGET() && id) {
						if (result.noteBook.owner.id != user.id) {
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
		
		resetPasswordTokenTimeout: 1000*60*10 //timeout in miliseconds,
				
	});

	var etcConfig = "/etc/fincayra/app-config.js";
	if ((new java.io.File(etcConfig)).exists()) {
		$l(etcConfig);
	}

	var userConfig = $getProperty("user.home") + "/.fincayra/app-config.js";
	if ((new java.io.File(userConfig)).exists()) {
		$l(userConfig);
	}

	if ($getProperty("fincayra.beanstalk") != null) {
		$config({
			url : "http://fincayra.elasticbeanstalk.com/",
			secureUrl: "http://fincayra.elasticbeanstalk.com/"
		});
	}

})();
