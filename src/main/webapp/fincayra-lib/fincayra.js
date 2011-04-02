var fincayra = {};
this.includes = true;load("includes.js");

//Hide the config folder
$hide(["config"]);

function extend(object, oSuper) { 
	for (sProperty in oSuper) {
		if (typeof object[sProperty] == "object") {
			extend(object[sProperty],oSuper[sProperty]);
		} else {
			object[sProperty] = oSuper[sProperty]; 
		}
	}
	
	return object;
};

var opt = {
	preInit:function(){},
	postInit:function(){},
	url:"http://localhost:8080/",
	secureUrl:"https://localhost:4443/",
	name:"Fincayra",
	errorPage:"/error",
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
}

function $config(config) {
	fincayra.config = extend(opt,config);
}

//Include the application config overides
load("../application/config/app-config.js");

$log().debug("Using Config:{}", JSON.stringify(opt, function(key, val) { return key == "password" ? "*****":val;}, "   "));


//Set some system properties that are needed for xml config files
$setProperty("fincayra.home", $app().getRootDir());
$log().info("fincayra.home={}", $app().getRootDir());

//Run the pre init callback
$log().info("Running config.preInit");
opt.preInit();

$app().setUrl(opt.url);
$app().setSecureUrl(opt.secureUrl);
$app().setName(opt.name);

var mailSender = new org.springframework.mail.javamail.JavaMailSenderImpl();
mailSender.setHost(opt.mailSender.host);
mailSender.setPort(opt.mailSender.port);
mailSender.setUsername(opt.mailSender.userName);
mailSender.setPassword(opt.mailSender.password);
var props = new java.util.Properties();
props.setProperty("mail.smtp.auth", opt.mailSender.auth);
props.setProperty("mail.smtp.starttls.enable", opt.mailSender.starttls);
props.setProperty("mail.smtp.timeout", opt.mailSender.timeout);
mailSender.setJavaMailProperties(props);

var mailManager = new  org.innobuilt.fincayra.mail.MailManager();
mailManager.setMailSender(mailSender);
mailManager.setFromEmail(opt.mailSender.fromEmail);
mailManager.setTemplateDir(opt.mailSender.templateDir);

$app().setMailManager(mailManager);

$log().info("Initializing PersistenceManager");
//TODO get this out of Java and into js
try {
	if (!$app().getPersistenceManager().isUp()) $app().getPersistenceManager().init();
} catch (e) {
	e.printStackTrace();
}


$log().info("Initializing MailManager");
$app().getMailManager().init();
$log().info("Done Initializing MailManager");

//Run the post init callback
$log().info("Running config.postInit");
opt.postInit();
