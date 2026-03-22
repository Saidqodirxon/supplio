# How to make Supplio Installable (PWA) on Mobile

Supplio is built to be a professional PWA (Progressive Web Application), allowing users to install it on their home screens like a native app.

## 1. Requirements

To trigger the "Install" prompt on mobile:

- The site MUST be served over **HTTPS**.
- A `manifest.json` file must be present.
- A **Service Worker** must be registered.

## 2. Implementation Steps for Dashboard (Vite)

### Step A: Install the PWA Plugin

```bash
npm install -D vite-plugin-pwa
```

### Step B: Update `vite.config.ts`

```typescript
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Supplio Dashboard",
        short_name: "Supplio",
        description: "B2B Distribution & Credit Control",
        theme_color: "#020617",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
});
```

## 3. How Users Install It

- **iOS (Safari)**: Tap the "Share" button and select **"Add to Home Screen"**.
- **Android (Chrome)**: Tap the three dots and select **"Install App"**.

## 4. Why PWA?

- **Offline Access**: Essential for deliverers in low-signal areas.
- **Push Notifications**: Notify managers of late payments.
- **No App Store needed**: Deploy updates instantly.
