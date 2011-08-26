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
(function() {
var cacheName = "TestCache"	;
var location = "fincayra-cache/";

$("body").append("<h1>Location: {}</h1>".tokenize(location));
//$cm().stop()
//$cm().start();
$cm().defineConfiguration(cacheName, new org.infinispan.config.Configuration().fluent()
  .loaders()
    .shared(false).passivation(false).preload(true)
    .addCacheLoader(
      new org.infinispan.loaders.file.FileCacheStoreConfig()
        .location(location)
        .purgeOnStartup(false)
        .fetchPersistentState(true)
        .streamBufferSize(1800)
        .asyncStore()
        .threadPoolSize(20)
        .ignoreModifications(false)
        .purgeSynchronously(false))
    .addCacheLoader(new org.infinispan.loaders.cluster.ClusterCacheLoaderConfig())
  .build());
var cache = $cm().getCache(cacheName, true);

//$cm().start();
//cache.stop();
//cache.start();

function pre(t) {
	$("body").append("<pre>" + t + "</pre>");
}

function result(name) {
	$log().info("result:{}", cache.get(name));
	pre(JSON.stringify({name:cache.get(name)}));
}

var name = "testString";
cache.put(name, "value");
result(name);

name = "testInt";
cache.put(name, -100000000000000000000000000);
result(name);

name = "testDecimal";
cache.put(name, .000006);
result(name);
})();
