import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api/auth": "http://localhost:3000",
      "/api/v1": "http://localhost:3000",
      "/uploads": "http://localhost:3000",
    },
  },
});
