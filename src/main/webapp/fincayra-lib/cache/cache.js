/*   Copyright 2010 Jesse Piascik
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

function CacheManager() {
	this.packages = new JavaImporter(
		org.infinispan.manager.DefaultCacheManager
	);
	if ($config().cache.configFile) {
		this.iCacheManager = new org.infinispan.manager.DefaultCacheManager($config().cache.configFile);
	} else {
		this.iCacheManager = new org.infinispan.manager.DefaultCacheManager();
	}
}

CacheManager.instance;

CacheManager.prototype.clusteringEnabled = function() {
	return $config().cache.clustered == true;
}

CacheManager.prototype.getCache = function(cacheName, createIfAbsent) {
	createIfAbsent = createIfAbsent || false;
	return new Cache(this.iCacheManager.getCache(cacheName, createIfAbsent));
}

CacheManager.prototype.stop = function() {
	return this.iCacheManager.stop();
}

CacheManager.prototype.start = function() {
	return this.iCacheManager.start();
}

CacheManager.prototype.cacheExists = function(name) {
	return this.iCacheManager.cacheExists(name);
}

CacheManager.prototype.defineConfiguration = function(cacheName, configOverride) {
	return this.iCacheManager.defineConfiguration(cacheName, configOverride);
}

/*
	Function: $cm
	Returns the current CacheManager
*/
function $cm() {
	if (!CacheManager.instance) {
		CacheManager.instance = new CacheManager();
	}
	return CacheManager.instance;
}

function Cache(iCache) {
	this.iCache = iCache;
};

Cache.prototype.put = function(key, value, lifespan, lifespanUnit, maxIdleTime, maxIdleTimeUnit) {
	key = key.toString();
	value = Cache.marshallObject(value);
	
	if (maxIdleTimeUnit) {
		this.iCache.put(key, value, lifespan, lifespanUnit, maxIdleTime, maxIdleTimeUnit);
	} else if (lifespanUnit) {
		this.iCache.put(key, value, lifespan, lifespanUnit, maxIdleTime, maxIdleTimeUnit);
	} else if (value) {
		this.iCache.put(key, value);
	}
};

Cache.marshallObject = function(obj) {
	var sObject = obj;
	if (!obj.getClass) {
		sObject = JSON.stringify(obj);
	}
		
	return sObject.toString();
}

Cache.unmarshallObject = function(sObject) {
	var object = sObject;
	//TODO first make sure this is a string!!!
	try {
		object = JSON.parse(new String(sObject));
	} catch (e){
		$log().error("Exception type:{}", typeof e);
		$log().error("Unable to unmarshall object from cache.  Returning raw object.");
	}
	return object;
}

Cache.prototype.get = function(key) {
	var val = this.iCache.get(key.toString());
	if (val != null) {
		val = Cache.unmarshallObject(val);
	}
	return val;
};

Cache.prototype.remove = function(key) {
	return this.iCache.remove(key);
};

