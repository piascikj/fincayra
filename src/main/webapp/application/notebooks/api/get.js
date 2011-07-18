(function() {
	$api({
		entries : function() {
			requireAuth();
			var user = $getSession().user;
			var params = {
				offset : 0,
				limit : undefined,
				topicUUId : undefined
			}.extend($getPageParams());
			
			var topic = new Topic().search('uuid = "{}" and noteBook.owner.uuid = "{}"'.tokenize(params.topicUUId,user.uuid))[0];
			
			if (topic.entries == undefined) {
				var entries = new Entry({topic:topic}).findByProperty("topic");
				
				var sort = [];

				entries.each(function(entry) {
					sort.push(entry.uuid);
				});
				topic.entries = sort;
				topic.save();
			}

			var numEntries = topic.entries && topic.entries.length;
			if (topic && params.offset < numEntries) {
				var uuids = topic.entries.slice(params.offset, params.limit || numEntries);
				var entries = new Entry().search("uuid in ['" + uuids.join("','") + "']");
				
				var map = {};
				entries.each(function(entry) {
					map[entry.uuid] = entry;
				});
				
				var result = [];
				uuids.each(function(uuid) {
					result.push(map[uuid]);
				});
				
				$j({results:result});
			}
				
		},
		
	});

})();
