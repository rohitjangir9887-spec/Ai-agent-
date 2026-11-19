import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { markDesktopShell } from "./desktop";
import { applyLang } from "./i18n";
import { StoreProvider } from "./store";
import { applyTheme } from "./theme";
import "./index.css";

function hasPrivatePairing(): boolean {
  try {
    return Boolean(localStorage.getItem("nanomuse_token")) ||
      /(?:^|&)token=/.test(window.location.hash.slice(1));
  } catch {
    return /(?:^|&)token=/.test(window.location.hash.slice(1));
  }
}

// Guests get the isolated chat without an access-token screen. The original
// React agent app is reserved for privately paired devices.
if (!hasPrivatePairing()) {
  const guestScript = document.createElement("script");
  guestScript.src = "/nim-guest.js";
  document.body.appendChild(guestScript);
} else {

applyLang();
applyTheme();
markDesktopShell();
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </React.StrictMode>,
);

}
