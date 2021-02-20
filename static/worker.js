/* eslint-disable */
var resources = ['/index.js']
var CACHE = 'network-or-cache'

// On install, cache some resources.
self.addEventListener('install', function (evt) {
  evt.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          return caches.delete(cacheName)
        })
      )
    })
  )
  console.log('The service worker is being installed.')
  evt.waitUntil(precache())
})

self.addEventListener('fetch', function (evt) {
  console.log('The service worker is serving the asset.')

  evt.respondWith(
    fromNetwork(evt.request).catch(function () {
      return fromCache(evt.request)
    })
  )
})

function precache() {
  return caches.open(CACHE).then(function (cache) {
    return cache.addAll(resources)
  })
}

function fromNetwork(request, timeout) {
  return new Promise(function (fulfill, reject) {
    fetch(request).then(function (response) {
      fulfill(response)
    }, reject)
  })
}

function fromCache(request) {
  return caches.open(CACHE).then(function (cache) {
    return cache.match(request).then(function (matching) {
      return matching || Promise.reject('no-match')
    })
  })
}
