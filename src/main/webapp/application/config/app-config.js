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
		
		beforeAPI : function(request, clazz) {
			//TODO Need a global flag for perf testing
			
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
					if (request.$isGET()) request.$setPageParams({qry: "topic.noteBook.owner.uuid = '{}' AND {}".tokenize(user.uuid,params.qry)});
					
					break;
				case "Topic" :
					if (request.$isGET()) request.$setPageParams({qry: "noteBook.owner.uuid = '{}' AND {}".tokenize(user.uuid,params.qry)});
					
					break;
				case "NoteBook" :
					if (request.$isGET()) request.$setPageParams({qry: "owner.uuid = '{}'".tokenize(user.uuid,params.qry)});
					
					break;
			}
			
		},
		
		name:"Fincayraa",
		
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
