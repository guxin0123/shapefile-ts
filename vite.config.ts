/** @type {import('vite').UserConfig} */
import { defineConfig } from 'vite'
import path from "path";

export default defineConfig({
   root: "test",
   mode: 'production',
   resolve: {
      alias: {
         "@": path.resolve(__dirname, "src"),
      }
   }
})