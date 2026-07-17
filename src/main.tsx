import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { reloadForNewDeploy } from "./utils/chunk-reload";

// Vite fires this when a modulepreload for a lazy chunk 404s, which happens to
// open tabs after a redeploy replaces the hashed filenames.
window.addEventListener("vite:preloadError", (event) => {
  event.preventDefault();
  reloadForNewDeploy();
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
