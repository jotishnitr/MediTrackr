import { Preferences } from "@capacitor/preferences";

let cachedToken = null;

// Initialize cached token from localStorage immediately for fast sync access
try {
  cachedToken = localStorage.getItem("authToken");
} catch (e) {
  // ignore
}

export const getAuthToken = async () => {
  if (cachedToken) return cachedToken;
  try {
    const { value } = await Preferences.get({ key: "authToken" });
    if (value) {
      cachedToken = value;
      try {
        localStorage.setItem("authToken", value);
      } catch (e) {}
      return value;
    }
  } catch (err) {
    console.error("Error reading token from Preferences:", err);
  }
  return cachedToken;
};

export const getAuthTokenSync = () => {
  if (cachedToken) return cachedToken;
  try {
    return localStorage.getItem("authToken");
  } catch (e) {
    return null;
  }
};

export const setAuthToken = async (token) => {
  cachedToken = token;
  try {
    localStorage.setItem("authToken", token);
  } catch (e) {}
  try {
    await Preferences.set({ key: "authToken", value: token });
  } catch (err) {
    console.error("Error setting token in Preferences:", err);
  }
};

export const removeAuthToken = async () => {
  cachedToken = null;
  try {
    localStorage.removeItem("authToken");
  } catch (e) {}
  try {
    await Preferences.remove({ key: "authToken" });
  } catch (err) {
    console.error("Error removing token from Preferences:", err);
  }
};
