//Assign number to our cache version
let CURRENT_CACHES = {
	offline: 'offline-v1'
}

const OFFLINE_URL = 'index.html';
console.log("file added");

//first event of service worker lifecycle
self.addEventListener('install', event => {
  event.waitUntil(
    //make a call to offline page while ensuring the url is unique through createCacheBustedRequest
    fetch(createCacheBustedRequest(OFFLINE_URL)).then(function(response) {
      return caches.open(CURRENT_CACHES.offline).then(function(cache) {
        return cache.put(OFFLINE_URL, response);
      });
    })
  );
  
//this way we can update our offline page with a new version later
function createCacheBustedRequest(url) {
  let request = new Request(url, {cache: 'reload'});
  if ('cache' in request) {
    return request;
  }
  let bustedUrl = new URL(url, self.location.href);
  bustedUrl.search += (bustedUrl.search ? '&' : '') + 'cachebust=' + Date.now();
  return new Request(bustedUrl);
}
});

//deletes oudated/unused caches because a sw can only be activated if all tabs of an earlier version are closed
self.addEventListener('activate', event => {
  let expectedCacheNames = Object.keys(CURRENT_CACHES).map(function(key) {
    return CURRENT_CACHES[key];
  });
  //confirms whether all required assets are already cached or not
  //the service worker will only be installed when all files are cached
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (expectedCacheNames.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

//fetch events after sw is installed and user navigates to different page or refreshes
self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate' ||
      (event.request.method === 'GET' &&
       event.request.headers.get('accept').includes('text/html'))) {
    event.respondWith(
      fetch(event.request).catch(error => {
        return caches.match(OFFLINE_URL);
      })
    );
  }
});