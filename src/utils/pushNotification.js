const PUBLIC_VAPID_KEY =
  "BHKkZ0uO19Xm9nBu0SlMg-jwZJgnb0NelRw6XBetODFh7yW1vWP6SS9Jjb5c0fwMY6dWbbySGxNEU7CPqaMC7yQ";
let isSubscribing = false;

export async function subscribeUser() {
  if (!("serviceWorker" in navigator)) return;

  if (isSubscribing) return;
  isSubscribing = true;

  try {
    const registration = await navigator.serviceWorker.ready;

    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
      });
    }

    let clientId = localStorage.getItem("push_client_id");
    if (!clientId) {
      clientId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
      localStorage.setItem("push_client_id", clientId);
    }

    const subscriptionData = {
      ...subscription.toJSON(),
      clientId,
    };

    await fetch("http://localhost:5000/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(subscriptionData),
    });

    console.log("Browser subscribed");
  } catch (error) {
    console.error("Subscription failed:", error);
  } finally {
    isSubscribing = false;
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);

  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);

  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}
