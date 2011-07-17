(function() {
	$api({
		entries : function() {
			requireAuth();
			var user = $getSession().user;
			var params = {
				offset : 0,
				limit : 20,
				topicUUId : undefined
			}.extend($getPageParams());
			
			var topic = new Topic().search('uuid = "{}" and noteBook.owner.uuid = "{}"'.tokenize(params.topicUUId,user.uuid))[0];

			var numEntries = topic.entries.length;
			if (topic && params.offset < numEntries) {
				var uuids = topic.entries.slice(params.offset, params.limit);
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
