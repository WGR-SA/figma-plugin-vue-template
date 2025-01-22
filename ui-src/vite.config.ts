import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteSingleFile } from "vite-plugin-singlefile";
import path from "path"

// https://vite.dev/config/
export default defineConfig({
  root: "./ui-src",
  plugins: [vue(), viteSingleFile()],
  build: {
    target: "esnext",
    assetsInlineLimit: 100000000,
    chunkSizeWarningLimit: 100000000,
    cssCodeSplit: false,
    outDir: "../dist",
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
      input: {
        index: path.resolve(__dirname, "ui.html"),
      },
    },
  },
})
