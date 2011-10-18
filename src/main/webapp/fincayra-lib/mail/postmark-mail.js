function PostMarkMailManager() {
	var $this = this;
	var httpClientPackages = new JavaImporter(
		org.apache.http.util,		
		org.apache.http.client,
		org.apache.http.client.methods,
		org.apache.http.entity,
		org.apache.http.impl.client);
		
	var url = "http://api.postmarkapp.com/email";
	var apiKeyHeader = "X-Postmark-Server-Token";
	var mailTemplate = {
	  //"Headers" : [{ "Name" : "CUSTOM-HEADER", "Value" : "value" }],
	  "From":$config().mail.senderSignature,
	  "ReplyTo" : $config().mail.from,
	  "To" : "receiver@example.com",
	  //"Cc" : "copied@example.com",
	  //"Bcc": "blank-copied@example.com",
	  "Subject" : "Test",
	  "Tag" : "Invitation",
	  "HtmlBody" : "<b>Hello</b>",
	  //"TextBody" : "Hello",
	  //"ReplyTo" : "reply@example.com"
	};
	
	this.config = {
		apiKey:"POSTMARK_API_TEST", //You must register your own at http://postmarkapp.com
		senderSignature:"", //You must register your own at http://postmarkapp.com
		//generic values
		templateDir:"mail",
		senders:1,
		pollingInterval:5000
	};

	this.senders = [];
	this.q = new Queue();
	this.init = function(config) {
		this.config = $extend(this.config, config);
		$log().info("Initializing PostmarkMailManager with config:{}", JSON.stringify(this.config, null, "   "));
		//Create the MessageSenders
		for(i = 0; i < this.config.senders; i++) {
			$log().info("Adding message sender");
			var sender = new MessageSender(this.q);
			this.senders.push(sender);
			setInterval(sender.run, this.config.pollingInterval);
		}
	};
	
	var getMailTemplate = function(msg) {
		var msgTemplate = $extend({},mailTemplate);
		$log().debug("postmark-mail.js.getMailTemplate messageTemplate:{}", JSON.stringify(msgTemplate, null, "   "));
		newMsg = msgTemplate.extend(msg);
		$log().debug("postmark-mail.js.getMailTemplate msg:{}", JSON.stringify(newMsg, null, "   "));
		return newMsg;
	}
	
	this.send = function(msg) {
		$log().debug("postmark-mail.js.send msg:{}", JSON.stringify(msg, null, "   "));
		this.q.enqueue(getMailTemplate(msg));
	};
	
	function MessageSender(queue) {	
		var q = queue;
		var running = false;
		var client = new org.apache.http.impl.client.DefaultHttpClient();
		this.run = function() {
			$log().debug("Running messageSender");
			if (!running) {
				running = true;
				var msg;
				try {
					while(!q.isEmpty()) {
						msg = q.dequeue();
						$log().debug("Mail:{}", JSON.stringify(msg, null, "   "));
						//TODO this should cacth and log exceptions
						with (httpClientPackages) {
							var post = new HttpPost(url); 
							post.setHeader("Content-Type", "application/json"); 
							post.setHeader("Accept", "application/json");
							post.setHeader(apiKeyHeader, $this.config.apiKey);
							post.setEntity(new StringEntity(JSON.stringify(msg),"UTF-8")); 

							var responseHandler = new JavaAdapter(org.apache.http.client.ResponseHandler,{
							    handleResponse : function(response) {
									var statusLine = response.getStatusLine();
									if (statusLine.getStatusCode() >= 300) {
										$log().error("Error sending Mail response:{}", response);
									}
									var entity = response.getEntity();
									return entity == null ? null : EntityUtils.toString(entity);
								}	
							}); 
							var response = client.execute(post,responseHandler); 
						}
						$log().debug("Mail response:{}", response);
					}
				} catch (e) {
					$log().error(e);
					$log().error(JSON.stringify(msg));
					e.printStackTrace();
				}

				running = false;
			}
		}
	}
}

PostMarkMailManager.extend(MailManager);
MailManager.instance = new PostMarkMailManager();
