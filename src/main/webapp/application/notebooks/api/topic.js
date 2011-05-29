(function() {

	$api({
		
		getLastTopic : function() {
			var s = $getSession();
			var topic;
			if (s.user.lastTopicId) {
				topic = new Topic({id:s.user.lastTopicId}).findById();
				$log().debug(JSON.stringify(topic.getClassDef(), null, "   "));
			}
			
			$j({topic:topic});
		},
		
		setLastTopic : function() {
			var path = $getExtraPath().split("/");
			var ok = false;
			if (path.length > 1) {
				var user = $getSession().user;
				user.lastTopicId = path[1];
				$log().debug("Saving last topic for user:{}",user.json());
				user.save();
				$getSession().user = user;
				ok = true;
			}
			
			$j({ok:ok});
		}
	});

})();
