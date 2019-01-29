/* eslint-disable */
var CACHE = 'cache-and-update'
var resources = [
  '/index.js'
]
// On install, cache some resources.
self.addEventListener('install', function (evt) {
  caches.keys().then(function(names) {
    for (let name of names) caches.delete(name);
  });

  console.log('The service worker is being installed.')
  // Ask the service worker to keep installing until the returning promise
  // resolves.
  evt.waitUntil(precache())
})

self.addEventListener('fetch', function(event) {
  event.respondWith(
    fetch(event.request).catch(function() {
      return caches.match(event.request);
    })
  );
});

// Open a cache and use `addAll()` with an array of assets to add all of them
// to the cache. Return a promise resolving when all the assets are added.
function precache () {
  return caches.open(CACHE).then(function (cache) {
    return cache.addAll(resources)
  })
}

// Open the cache where the assets were stored and search for the requested
// resource. Notice that in case of no matching, the promise still resolves
// but it does with `undefined` as value.
function fromCache (request) {
  return caches.open(CACHE).then(function (cache) {
    return cache.match(request).then(function (matching) {
      return matching || fetch(event.request)
    })
  })
}

