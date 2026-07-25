import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
// Deploy trigger: 2026-07-25
import "./index.css";
import App from "./App.jsx";

console.log("MediTrack loaded");
createRoot(document.getElementById("root")).render(
    <GoogleOAuthProvider
        clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
    >
        <App />
    </GoogleOAuthProvider>
);