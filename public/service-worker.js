self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  console.log("Push event fired");

  let data;
  try {
    data = event.data ? event.data.json() : {};
  } catch (err) {
    data = {
      title: "💊 Medicine Reminder",
      body: event.data ? event.data.text() : "Time to take your medicine.",
    };
  }

  const title = data.title || "💊 Medicine Reminder";
  const body = data.body || "Time to take your medicine.";

  const notificationPromise = self.registration.showNotification(title, {
    body: body,
    icon: "./icon.png",
    badge: "./icon.png",
    vibrate: [200, 100, 200],
    requireInteraction: true,
    tag: "medicine-reminder",
  });

  const messagePromise = self.clients
    .matchAll({
      includeUncontrolled: true,
      type: "window",
    })
    .then((clients) => {
      console.log("Clients found:", clients.length);
      clients.forEach((client) => {
        console.log("Sending sound play message to client");
        client.postMessage({
          type: "PLAY_NOTIFICATION_SOUND",
        });
      });
    })
    .catch((err) => {
      console.error("Failed to notify clients:", err);
    });

  event.waitUntil(Promise.all([notificationPromise, messagePromise]));
});

// A basic fetch listener to satisfy Chrome PWA installability requirements
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});

