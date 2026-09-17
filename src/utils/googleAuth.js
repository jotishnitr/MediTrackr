import { Capacitor } from "@capacitor/core";
import { GoogleSignIn } from "@capawesome/capacitor-google-sign-in";

const CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "770843042549-a23osvk5au9hdavm1ere0heehatv409v.apps.googleusercontent.com";

let isNativeInitialized = false;

/**
 * Performs Google Sign In natively on Android (via Google Play Services / Credential Manager)
 * or returns null on Web to allow standard Web OAuth flow.
 */
export const performNativeGoogleSignIn = async () => {
  if (!Capacitor.isNativePlatform()) {
    return null;
  }

  try {
    if (!isNativeInitialized) {
      await GoogleSignIn.initialize({
        clientId: CLIENT_ID,
      });
      isNativeInitialized = true;
    }

    const result = await GoogleSignIn.signIn();
    return {
      credential: result.idToken,
      accessToken: result.accessToken,
      email: result.email,
      name: result.displayName,
      picture: result.imageUrl,
    };
  } catch (error) {
    console.error("Native Google Sign-In Error:", error);
    const msg = error?.message || String(error || "");
    
    // Check if user dismissed or canceled
    if (
      msg.includes("canceled") ||
      msg.includes("cancelled") ||
      msg.includes("SIGN_IN_CANCELED") ||
      msg.includes("12501") ||
      msg.includes("USER_CANCEL")
    ) {
      const cancelError = new Error("SIGN_IN_CANCELED");
      cancelError.code = "SIGN_IN_CANCELED";
      throw cancelError;
    }

    // Friendly error for SHA-1 / configuration mismatch
    if (msg.includes("[16]") || msg.includes("reauth failed") || msg.includes("10:")) {
      const configError = new Error(
        "Google Sign-In configuration error: Please ensure the Android SHA-1 fingerprint is registered in Google Cloud Console."
      );
      configError.originalMessage = msg;
      throw configError;
    }

    throw error;
  }
};
