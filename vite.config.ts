
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    exclude: ['jspdf'],
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
  assetsInclude: ['**/*.ttf'],
  // Exclude font JS files from ESM processing
  server: {
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['.'],
    },
  },
}));
