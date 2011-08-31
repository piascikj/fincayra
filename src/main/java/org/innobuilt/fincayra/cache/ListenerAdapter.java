package org.innobuilt.fincayra.cache;

import org.infinispan.Cache;
import org.infinispan.notifications.Listener;
import org.infinispan.notifications.cachelistener.annotation.CacheEntryCreated;
import org.infinispan.notifications.cachelistener.annotation.CacheEntryModified;
import org.infinispan.notifications.cachelistener.annotation.CacheEntryRemoved;
import org.infinispan.notifications.cachelistener.event.Event;

public class ListenerAdapter {
	public ListenerAdapter addCacheEntryCreatedListener(Cache cache, FincayraCacheListener listener, boolean async) {
		if (async) {
			cache.addListener(new CacheEntryCreatedASync(listener));
		} else {
			cache.addListener(new CacheEntryCreatedSync(listener));
		}
		
		return this;
	}
	
	@Listener
	public class CacheEntryCreatedSync {
		private FincayraCacheListener listener;
		
		public CacheEntryCreatedSync(FincayraCacheListener listener) {
			super();
			this.listener = listener;
		}

		@CacheEntryCreated
		public void handle(Event event) {
			this.listener.handle(event);
		}
	}

	@Listener (sync = false)
	public class CacheEntryCreatedASync {
		private FincayraCacheListener listener;
		
		public CacheEntryCreatedASync(FincayraCacheListener listener) {
			super();
			this.listener = listener;
		}

		@CacheEntryCreated
		public void handle(Event event) {
			this.listener.handle(event);
		}
	}

	public ListenerAdapter addCacheEntryModifiedListener(Cache cache, FincayraCacheListener listener, boolean async) {
		if (async) {
			cache.addListener(new CacheEntryModifiedASync(listener));
		} else {
			cache.addListener(new CacheEntryModifiedSync(listener));
		}
		
		return this;
	}
	
	@Listener
	public class CacheEntryModifiedSync {
		private FincayraCacheListener listener;
		
		public CacheEntryModifiedSync(FincayraCacheListener listener) {
			super();
			this.listener = listener;
		}

		@CacheEntryModified
		public void handle(Event event) {
			this.listener.handle(event);
		}
	}

	@Listener (sync = false)
	public class CacheEntryModifiedASync {
		private FincayraCacheListener listener;
		
		public CacheEntryModifiedASync(FincayraCacheListener listener) {
			super();
			this.listener = listener;
		}

		@CacheEntryModified
		public void handle(Event event) {
			this.listener.handle(event);
		}
	}

	public ListenerAdapter addCacheEntryRemovedListener(Cache cache, FincayraCacheListener listener, boolean async) {
		if (async) {
			cache.addListener(new CacheEntryRemovedASync(listener));
		} else {
			cache.addListener(new CacheEntryRemovedSync(listener));
		}
		
		return this;
	}
	
	@Listener
	public class CacheEntryRemovedSync {
		private FincayraCacheListener listener;
		
		public CacheEntryRemovedSync(FincayraCacheListener listener) {
			super();
			this.listener = listener;
		}

		@CacheEntryRemoved
		public void handle(Event event) {
			this.listener.handle(event);
		}
	}

	@Listener (sync = false)
	public class CacheEntryRemovedASync {
		private FincayraCacheListener listener;
		
		public CacheEntryRemovedASync(FincayraCacheListener listener) {
			super();
			this.listener = listener;
		}

		@CacheEntryRemoved
		public void handle(Event event) {
			this.listener.handle(event);
		}
	}

}
