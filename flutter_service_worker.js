'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';

const RESOURCES = {"version.json": "304c060da638f78d0869eebeb274b3ca",
"splash/img/light-2x.png": "6bcddf1a71fabb9aa4d3cae4f59a3401",
"splash/img/dark-4x.png": "b446a4bc527fd51a2c4e7ba497e1636e",
"splash/img/light-3x.png": "8976b6b4bc6bf8f7c5608dce39c223bb",
"splash/img/dark-3x.png": "8976b6b4bc6bf8f7c5608dce39c223bb",
"splash/img/light-4x.png": "b446a4bc527fd51a2c4e7ba497e1636e",
"splash/img/dark-2x.png": "6bcddf1a71fabb9aa4d3cae4f59a3401",
"splash/img/dark-1x.png": "929af6f9b25e640b2f85f3b00d03cd31",
"splash/img/light-1x.png": "929af6f9b25e640b2f85f3b00d03cd31",
"splash/splash.js": "123c400b58bea74c1305ca3ac966748d",
"splash/style.css": "249185e31e1e57d75d4a7e471cd51a88",
"favicon.ico": "ff1965b3e519252da1b34b0f2bc80e13",
"index.html": "dc05d69a423d51624f5b6e551b02c2da",
"/": "dc05d69a423d51624f5b6e551b02c2da",
"main.dart.js": "2e6191c1d23963fa25d06bdaf8af8627",
"flutter.js": "6fef97aeca90b426343ba6c5c9dc5d4a",
"icons/Icon-192.png": "db57601cd7d6db20999ae71a820a3653",
"icons/Icon-maskable-192.png": "517710ddfae76370c7d7f2372ddee242",
"icons/Icon-maskable-512.png": "b318eaa642711d3d2ce892a29fd82eb4",
"icons/Icon-512.png": "47463c8e906374b2de8cd41bdcc2d3b5",
"manifest.json": "d40c47d1c161f94dbcb13094d37f1f55",
"assets/AssetManifest.json": "774d427bb87e66035289d72c3c15afa7",
"assets/NOTICES": "34f70046ce41ba087e6090ab17351c4b",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "57d849d738900cfd590e9adc7e208250",
"assets/shaders/ink_sparkle.frag": "f8b80e740d33eb157090be4e995febdf",
"assets/AssetManifest.bin": "3e5657c770b00c0f8d4c47b1bf467c8a",
"assets/fonts/MaterialIcons-Regular.otf": "269df22697f4ec88a4aab91076f51e72",
"assets/assets/icons/github.svg": "f8769962c24f0d595867134bced89a8b",
"assets/assets/icons/mail.svg": "40940aa2d9b2a7fff5eedef60acd41a4",
"assets/assets/icons/dark.svg": "84325f00dab3b517332caf6c69ca905a",
"assets/assets/icons/icons8-x-50.svg": "12da5e447397c84ade09963aa57337c3",
"assets/assets/icons/telegram.svg": "5c91f3d0af3afc7fd0cd56dd9896ac36",
"assets/assets/icons/whatsapp.svg": "d2a2c27cb5c6747d6a69b0d7bc98822d",
"assets/assets/icons/linkedin.svg": "8bf9badc1c107322abd9ceb9e1ca4100",
"assets/assets/icons/twitter.svg": "12da5e447397c84ade09963aa57337c3",
"assets/assets/icons/messenger.svg": "df73efc950bb496e63694d336679b7ec",
"assets/assets/icons/logo.svg": "54a5eded21dcb5c94f3d369ec873d98d",
"assets/assets/icons/light.svg": "53bd71bc5674a74c32690806cfac49b4",
"canvaskit/skwasm.js": "1df4d741f441fa1a4d10530ced463ef8",
"canvaskit/skwasm.wasm": "6711032e17bf49924b2b001cef0d3ea3",
"canvaskit/chromium/canvaskit.js": "8c8392ce4a4364cbb240aa09b5652e05",
"canvaskit/chromium/canvaskit.wasm": "fc18c3010856029414b70cae1afc5cd9",
"canvaskit/canvaskit.js": "76f7d822f42397160c5dfc69cbc9b2de",
"canvaskit/canvaskit.wasm": "f48eaf57cada79163ec6dec7929486ea",
"canvaskit/skwasm.worker.js": "19659053a277272607529ef87acf9d8a"};
// The application shell files that are downloaded before a service worker can
// start.
const CORE = ["main.dart.js",
"index.html",
"assets/AssetManifest.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});
// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        // Claim client to enable caching on first launch
        self.clients.claim();
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      // Claim client to enable caching on first launch
      self.clients.claim();
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});
// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});
self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});
// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}
// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
