import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

// Old links used "#" addresses (melibee.art/#/contacto). Turn them into the
// clean address (melibee.art/contacto) before the app starts, so links that
// were already shared or printed keep working.
if (window.location.hash.startsWith("#/")) {
  window.history.replaceState(null, "", window.location.hash.slice(1));
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
