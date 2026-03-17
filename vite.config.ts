import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import eslint from "vite-plugin-eslint";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // 在测试环境中禁用 React Refresh
      jsxRuntime: "automatic",
      fastRefresh: process.env.VITEST ? false : true,
    }),
    eslint(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      // 高德地图 API 代理
      '/amap-api': {
        target: 'https://restapi.amap.com',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/amap-api/, ''),
      },
      // Nominatim API 代理
      '/nominatim-api': {
        target: 'https://nominatim.openstreetmap.org',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/nominatim-api/, ''),
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/tests/setup.ts",
    css: true, // 启用 CSS 处理
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/tests/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/mockData",
        "**/*.test.{ts,tsx}",
      ],
    },
  },
});
