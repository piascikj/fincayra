function PostMarkMailManager() {
	var $this = this;
	var httpClientPackages = new JavaImporter(
		org.apache.http.client.methods,
		org.apache.http.entity,
		org.apache.http.impl.client);
		
	var url = "http://api.postmarkapp.com/email";
	var apiKeyHeader = "X-Postmark-Server-Token";
	var mailTemplate = {
	  //"Headers" : [{ "Name" : "CUSTOM-HEADER", "Value" : "value" }],
	  "From" : "sender@example.com",
	  "To" : "receiver@example.com",
	  //"Cc" : "copied@example.com",
	  //"Bcc": "blank-copied@example.com",
	  "Subject" : "Test",
	  "Tag" : "Invitation",
	  "HtmlBody" : "<b>Hello</b>",
	  "TextBody" : "Hello",
	  //"ReplyTo" : "reply@example.com"
	};
	
	this.config = {};
	this.init = function(config) {
		this.config = config;
	};
	
	this.getMailTemplate = function(msg) {
		msg = $extend($extend(mailTemplate,{From:$this.config.senderSignature}), msg);
		return msg;
	}
	
	this.send = function(msg) {
		with (httpClientPackages) {
			msg = this.getMailTemplate(msg);
			$log().info("MAIL:{}", JSON.stringify(msg, null, "   "));
			//TODO this should be processed by the queue
			//TODO this should cacth and log exceptions
			var client = new DefaultHttpClient();
			var post = new HttpPost(url); 
			post.setHeader("Content-Type", "application/json"); 
			post.setHeader("Accept", "application/json");
			post.setHeader(apiKeyHeader, $this.config.apiKey);
			post.setEntity(new StringEntity(JSON.stringify(msg),"UTF-8")); 

			var responseHandler = new BasicResponseHandler(); 
			var response = client.execute(post,responseHandler); 
			$log().info("Mail response:{}", response);
		}
	}
}

PostMarkMailManager.extend(MailManager);
MailManager.instance = new PostMarkMailManager();
