(function() {
	$api({
		
		getLastTopic : function() {
			requireAuth();
			var s = $getSession();
			var topic;
			if (s.user.lastTopicId) {
				topic = new Topic({id:s.user.lastTopicId}).findById();
			}
			
			$j({topic:topic});
		},
		
		setLastTopic : function() {
			requireAuth();
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
		},
		
		fixNoteBooks : function() {
			requireAuth();
			var user = $getSession().user;
			user.fixNoteBooks();
			user.save();
			$getSession().user = user;
			
			$j({ok:true}); 
		}
		
	});

})();
