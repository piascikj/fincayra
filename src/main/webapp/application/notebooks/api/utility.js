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
				var user = getSessionUser();
				user.lastTopicId = path[1];
				$log().debug("Saving last topic for user:{}",JSON.stringify(user));
				user.save();
				$getSession().user = user;
				ok = true;
			}
			
			$j({ok:ok});
		},
		
		fixNoteBooks : function() {
			requireAuth();
			var user = getSessionUser();
			user.fixNoteBooks();
			user.save();
			$getSession().user = user;
			
			$j({ok:true}); 
		},
		
		fixEntries : function() {
			requireAuth();
			var uuid = $getPageParams().topicUUId;
			var topic = new Topic({uuid:uuid}).findByProperty("uuid")[0];
			var entries = new Entry({topic:topic}).findByProperty("topic");
			var sort = [];

			entries.each(function(entry) {
				sort.push(entry.uuid);
			});
			topic.entries = sort;
			topic.save();
			
			$j({ok:true}); 
		}		
		
	});

})();
