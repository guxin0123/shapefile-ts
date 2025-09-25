/** @type {import('vite').UserConfig} */
import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url';

export default defineConfig({
   root: "test",
   mode: 'production',
   resolve: {
      alias: {
         "@": fileURLToPath(new URL("src", import.meta.url)),
      }
   }
})



