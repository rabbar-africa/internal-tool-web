import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { reloadForNewDeploy } from "./utils/chunk-reload";

// Vite fires this when a modulepreload for a lazy chunk 404s, which happens to
// open tabs after a redeploy replaces the hashed filenames. Don't call
// preventDefault: Vite would then resolve the import with undefined, and the
// route would fail with a TypeError instead of the real chunk error.
window.addEventListener("vite:preloadError", () => {
  reloadForNewDeploy();
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
