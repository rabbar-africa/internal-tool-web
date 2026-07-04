import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // Backend the dev/preview server proxies `/api` to. Defaults to the local
  // backend; override with VITE_PROXY_TARGET to point at staging, etc.
  const proxyTarget = env.VITE_PROXY_TARGET || "http://localhost:8080";
  // Same-origin proxy: the browser only ever talks to this Vite server, which
  // forwards /api server-side to the backend — so CORS never applies. Works on
  // desktop dev and when testing on a phone via a tunnel.
  const apiProxy = {
    "/api": { target: proxyTarget, changeOrigin: true, secure: false },
  };

  return {
    plugins: [
      react(),
      svgr(),
      // PWA removed. `selfDestroying` keeps emitting a service worker at the
      // same /sw.js URL, but its only job is to unregister any previously
      // installed worker and delete its precached caches, then reload clients
      // with fresh network content. This is what unsticks devices (e.g. iOS
      // Safari/Chrome) that cached the old app shell. Once all clients have
      // loaded this at least once, vite-plugin-pwa can be uninstalled entirely.
      VitePWA({
        selfDestroying: true,
        injectRegister: "auto",
        // No web app manifest — this is no longer an installable PWA.
        manifest: false,
      }),
    ],
    resolve: {
      alias: {
        "@": "/src",
      },
    },
    server: {
      port: 3000,
      // host: true exposes the dev server on your LAN (so phones on the same
      // WiFi can reach it). allowedHosts: true lets tunnel hostnames through.
      host: true,
      allowedHosts: true,
      proxy: apiProxy,
    },
    preview: {
      // `yarn preview` serves the production build WITH the service worker
      // active — this is what you point the iPhone at to test the installed PWA.
      port: 4173,
      host: true,
      allowedHosts: true,
      proxy: apiProxy,
    },
  };
});
