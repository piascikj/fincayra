package org.innobuilt.fincayra.cache;

import org.infinispan.notifications.cachelistener.event.Event;

public interface FincayraCacheListener {
	public void handle(Event event);
}
