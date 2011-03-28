this.includes = true;load("includes.js");

//Hide the config folder
$hide(["config"]);

Object.prototype.extend = function(oSuper) { 
	for (sProperty in oSuper) {
		if (typeof this[sProperty] == "object") {
			this[sProperty].extend(oSuper[sProperty]);
		} else {
			this[sProperty] = oSuper[sProperty]; 
		}
	}
	
	return this;
};

var config = {};
var opt = {
	preInit:function(){},
	postInit:function(){},
	url:"http://localhost:8080/",
	secureUrl:"https://localhost:4443/",
	name:"Fincayra",
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
//Only set if tcp cluster is used
$setProperty("java.net.preferIPv4Stack","true");

	
//Include the application config overides
load("../application/config/app-config.js");

opt.extend(config);
logger().debug("Using Config:{}", JSON.stringify(opt, function(key, val) { return key == "password" ? "*****":val;}, "   "));

//Set some system properties that are needed for xml config files
$setProperty("fincayra.home", $app().getRootDir());
logger().info("fincayra.home={}", $app().getRootDir());

//Run the pre init callback
logger().info("Running config.preInit");
opt.preInit();

$app().setPersistenceManager(new org.innobuilt.fincayra.persistence.PersistenceManager());
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

logger().info("Initializing PersistenceManager");
//TODO get this out of Java and into js
try {
	$app().getPersistenceManager().init();
} catch (e) {
	e.printStackTrace();
}


logger().info("Initializing MailManager");
$app().getMailManager().init();
logger().info("Done Initializing MailManager");

//Run the post init callback
logger().info("Running config.postInit");
opt.postInit();
