// Global fetch interceptor to automatically attach JWT auth token from Capacitor Preferences / localStorage
// and include credentials on all API requests (essential for mobile WebViews / Capacitor)
import { getAuthTokenSync, getAuthToken } from "./authStorage";

const originalFetch = window.fetch;

window.fetch = async function (url, options = {}) {
  const apiUrl = import.meta.env.VITE_API_URL;
  const isTargetingApi =
    typeof url === "string" && (url.startsWith(apiUrl) || url.startsWith("/"));

  if (isTargetingApi) {
    options = options || {};
    options.credentials = options.credentials || "include";

    let token = getAuthTokenSync();
    if (!token) {
      token = await getAuthToken();
    }

    if (token) {
      const headers = new Headers(options.headers || {});
      if (!headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      options.headers = headers;
    }
  }

  return originalFetch(url, options);
};

export default window.fetch;
