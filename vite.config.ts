import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    proxy: {
      "/api": "http://localhost:3000",
      "/socket.io": {
        target: "ws://localhost:3000",
        ws: true
      }
    }
  },
  build: {
    outDir: "dist",
    sourcemap: true
  },
  resolve: {
    alias: {
      "$src": path.resolve(__dirname, "src")
    }
  }
});

