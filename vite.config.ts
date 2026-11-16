import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  build: {
    target: "es2022",
    minify: "oxc",
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react/") || id.includes("react-dom/") || id.includes("scheduler/")) {
              return "vendor-react";
            }
            if (id.includes("@tanstack/react-router") || id.includes("@tanstack/react-query")) {
              return "vendor-tanstack";
            }
            if (id.includes("@radix-ui/")) {
              return "vendor-radix";
            }
            if (id.includes("lucide-react/")) {
              return "vendor-icons";
            }
          }
        },
      },
    },
  },
  plugins: [
    tailwindcss(),
    tanstackStart({
      server: { entry: "server" },
    }),
    viteReact(),
    nitro({
      compressPublicAssets: true,
    }),
  ],
});
