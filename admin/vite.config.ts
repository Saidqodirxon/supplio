import { defineConfig } from "vite";

export default defineConfig({
  server: {
    allowedHosts: [
      "localhost",
      "127.0.0.1",
      "admin.supplio.uz",
      "www.admin.supplio.uz",
    ],
    port: 5001,
  },
  preview: {
    allowedHosts: [
      "localhost",
      "127.0.0.1",
      "admin.supplio.uz",
      "www.admin.supplio.uz",
    ],
  },
  build: {
    outDir: "dist",
  },
});
