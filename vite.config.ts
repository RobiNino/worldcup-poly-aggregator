import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "/worldcup-poly-aggregator/",
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/polymarket-api": {
        target: "https://gamma-api.polymarket.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/polymarket-api/, ""),
      },
    },
  },
});
