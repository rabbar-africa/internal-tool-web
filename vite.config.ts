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
      VitePWA({
        // New builds are fetched in the background and applied on the next full
        // app reopen — no store, no prompt, no manual update step for users.
        registerType: "autoUpdate",
        // Plugin injects the service-worker registration for us; no extra code.
        injectRegister: "auto",
        includeAssets: ["favicon.ico", "apple-touch-icon.png"],
        manifest: {
          name: "Rabbar Africa Internal Tool",
          short_name: "Rabbar",
          description:
            "Rabbar Africa internal business dashboard — invoicing, inspection reports, and overview.",
          theme_color: "#013064",
          background_color: "#ffffff",
          display: "standalone",
          orientation: "portrait",
          start_url: "/",
          scope: "/",
          icons: [
            {
              src: "pwa-192x192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "pwa-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "maskable-icon-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
        },
        workbox: {
          // Precache the built app shell so the app launches instantly and is
          // installable. API calls live on a different origin (VITE_API_BASE_URL)
          // and are intentionally NOT cached — every request hits the network,
          // exactly like today, so there is no stale-data or offline-token risk.
          globPatterns: ["**/*.{js,css,html,svg,png,ico,woff,woff2}"],
          // Serve index.html for client-side routes in standalone mode.
          navigateFallback: "index.html",
          // Don't hijack cross-origin API requests with the SPA fallback.
          navigateFallbackDenylist: [/^\/api/],
          cleanupOutdatedCaches: true,
        },
        devOptions: {
          // Keep the SW disabled in `yarn dev` to avoid caching surprises while
          // developing; it activates in the production build/preview.
          enabled: false,
        },
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
