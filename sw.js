//Assign number to our cache version
let CURRENT_CACHES = {
	offline: 'offline-v1'
}

const OFFLINE_URL = 'index.html';


//first event of service worker lifecycle
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CURRENT_CACHES.offline).then(function(cache) {
      return cache.addAll([
        '/',
          './index.html',
          './restaurant.html',
          './css/styles.css',
          './js/dbhelper.js',
          './js/main.js',
          './js/restaurant_info.js',
          './data/restaurants.json',
          './img/1.jpg',
          './img/2.jpg',
          './img/3.jpg',
          './img/4.jpg',
          './img/5.jpg',
          './img/6.jpg',
          './img/7.jpg',
          './img/8.jpg',
          './img/9.jpg',
          './img/10.jpg',
      ]);
    })
  );
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
  if (event.request.mode === 'navigate' 
    || (event.request.method === 'GET' && event.request.headers.get('accept').includes('text/html'))
    )
  {
      event.respondWith(
        fetch(event.request).catch(error => {
          return caches.match(event.request);
        })
      );
  }
});